package com.rbew.rrn_official

import android.content.ComponentName
import android.net.Uri
import android.os.Bundle
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.session.MediaController
import androidx.media3.session.SessionToken
import com.google.common.util.concurrent.ListenableFuture
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import java.util.concurrent.CopyOnWriteArrayList

class MainActivity : FlutterActivity() {
    companion object {
        private const val CHANNEL = "com.rbew.rrn_official/media"
    }

    private var controllerFuture: ListenableFuture<MediaController>? = null
    private var controller: MediaController? = null
    private val pending = CopyOnWriteArrayList<(MediaController) -> Unit>()

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
            .setMethodCallHandler { call, result -> handleMethod(call, result) }
    }

    private fun connect(onReady: ((MediaController) -> Unit)? = null) {
        controller?.let {
            onReady?.invoke(it)
            return
        }
        if (onReady != null) pending.add(onReady)
        if (controllerFuture != null) return

        val token = SessionToken(this, ComponentName(this, RrnMediaService::class.java))
        val future = MediaController.Builder(this, token).buildAsync()
        controllerFuture = future
        future.addListener(
            {
                try {
                    val ready = future.get()
                    controller = ready
                    val callbacks = pending.toList()
                    pending.clear()
                    callbacks.forEach { it(ready) }
                } catch (_: Throwable) {
                    pending.clear()
                    controllerFuture = null
                }
            },
            mainExecutor,
        )
    }

    private fun withController(result: MethodChannel.Result, action: (MediaController) -> Unit) {
        controller?.let {
            try {
                action(it)
            } catch (t: Throwable) {
                result.error("RRN_MEDIA", t.message ?: "Media command failed.", null)
            }
            return
        }
        connect { c ->
            try {
                action(c)
            } catch (t: Throwable) {
                result.error("RRN_MEDIA", t.message ?: "Media command failed.", null)
            }
        }
    }

    private fun handleMethod(call: MethodCall, result: MethodChannel.Result) {
        when (call.method) {
            "connect" -> withController(result) { result.success(stateMap(it)) }
            "getState" -> withController(result) { result.success(stateMap(it)) }
            "setQueue" -> withController(result) { c ->
                val rawItems = call.argument<List<Map<String, Any?>>>("items") ?: emptyList()
                if (rawItems.isEmpty()) {
                    result.error("RRN_QUEUE", "Playback queue is empty.", null)
                    return@withController
                }
                val items = rawItems.map { nativeItem(it) }
                val requested = call.argument<Int>("index") ?: 0
                val index = requested.coerceIn(0, items.lastIndex)
                val autoplay = call.argument<Boolean>("autoplay") ?: true
                val volume = (call.argument<Number>("volume")?.toFloat() ?: 1f).coerceIn(0f, 1f)
                c.setMediaItems(items, index, 0L)
                c.volume = volume
                c.prepare()
                if (autoplay) c.play() else c.pause()
                result.success(true)
            }
            "updateMetadata" -> withController(result) { c ->
                val args = call.arguments as? Map<*, *> ?: emptyMap<Any?, Any?>()
                val index = c.currentMediaItemIndex
                val current = c.currentMediaItem
                if (current != null && index >= 0) {
                    val metadata = metadataFrom(args)
                    c.replaceMediaItem(index, current.buildUpon().setMediaMetadata(metadata).build())
                }
                result.success(true)
            }
            "play" -> withController(result) { it.play(); result.success(true) }
            "pause" -> withController(result) { it.pause(); result.success(true) }
            "stop" -> withController(result) {
                it.stop()
                it.clearMediaItems()
                result.success(true)
            }
            "seek" -> withController(result) {
                val position = call.argument<Number>("positionMs")?.toLong() ?: 0L
                it.seekTo(position.coerceAtLeast(0L))
                result.success(true)
            }
            "next" -> withController(result) {
                if (it.hasNextMediaItem()) it.seekToNextMediaItem()
                result.success(true)
            }
            "previous" -> withController(result) {
                if (it.currentPosition > 5000L) it.seekTo(0L)
                else if (it.hasPreviousMediaItem()) it.seekToPreviousMediaItem()
                result.success(true)
            }
            "skipToIndex" -> withController(result) {
                val index = call.argument<Int>("index") ?: 0
                if (index in 0 until it.mediaItemCount) it.seekToDefaultPosition(index)
                result.success(true)
            }
            "setShuffle" -> withController(result) {
                it.shuffleModeEnabled = call.argument<Boolean>("enabled") ?: false
                result.success(true)
            }
            "setRepeat" -> withController(result) {
                it.repeatMode = when (call.argument<Int>("mode") ?: 0) {
                    1 -> Player.REPEAT_MODE_ONE
                    2 -> Player.REPEAT_MODE_ALL
                    else -> Player.REPEAT_MODE_OFF
                }
                result.success(true)
            }
            "setVolume" -> withController(result) {
                it.volume = (call.argument<Number>("volume")?.toFloat() ?: 1f).coerceIn(0f, 1f)
                result.success(true)
            }
            else -> result.notImplemented()
        }
    }

    private fun nativeItem(row: Map<String, Any?>): MediaItem {
        val id = row["id"]?.toString().orEmpty()
        val url = row["url"]?.toString().orEmpty()
        if (url.isBlank()) throw IllegalArgumentException("RRN media item has no stream URL.")
        return MediaItem.Builder()
            .setMediaId(id)
            .setUri(url)
            .setMediaMetadata(metadataFrom(row))
            .build()
    }

    private fun metadataFrom(row: Map<*, *>): MediaMetadata {
        val artwork = row["artwork"]?.toString().orEmpty()
        val extras = Bundle().apply {
            putBoolean("isLive", row["isLive"] as? Boolean ?: row["id"]?.toString().orEmpty().startsWith("station:"))
            putString("resourceId", row["resourceId"]?.toString().orEmpty())
        }
        return MediaMetadata.Builder()
            .setTitle(row["title"]?.toString().orEmpty())
            .setArtist(row["artist"]?.toString().orEmpty())
            .setAlbumTitle(row["album"]?.toString().orEmpty())
            .setArtworkUri(if (artwork.isBlank()) null else Uri.parse(artwork))
            .setIsPlayable(true)
            .setExtras(extras)
            .build()
    }

    private fun stateMap(c: MediaController): Map<String, Any?> {
        val current = c.currentMediaItem
        val duration = if (c.duration == C.TIME_UNSET || c.duration < 0) 0L else c.duration
        val currentMap = current?.let { mediaMap(it, duration) } ?: emptyMap<String, Any?>()
        val queue = (0 until c.mediaItemCount).map { index ->
            val item = c.getMediaItemAt(index)
            mediaMap(item, if (index == c.currentMediaItemIndex) duration else 0L)
        }
        return mapOf(
            "isPlaying" to c.isPlaying,
            "playWhenReady" to c.playWhenReady,
            "playbackState" to c.playbackState,
            "positionMs" to c.currentPosition.coerceAtLeast(0L),
            "durationMs" to duration,
            "currentIndex" to c.currentMediaItemIndex.coerceAtLeast(0),
            "repeatMode" to c.repeatMode,
            "shuffle" to c.shuffleModeEnabled,
            "volume" to c.volume.toDouble(),
            "current" to currentMap,
            "queue" to queue,
        )
    }

    private fun mediaMap(item: MediaItem, durationMs: Long): Map<String, Any?> {
        val m = item.mediaMetadata
        return mapOf(
            "id" to item.mediaId,
            "title" to (m.title?.toString() ?: ""),
            "artist" to (m.artist?.toString() ?: ""),
            "album" to (m.albumTitle?.toString() ?: ""),
            "artwork" to (m.artworkUri?.toString() ?: ""),
            "durationMs" to durationMs,
            "isLive" to (m.extras?.getBoolean("isLive") ?: item.mediaId.startsWith("station:")),
        )
    }

    override fun onDestroy() {
        controllerFuture?.let { MediaController.releaseFuture(it) }
        controllerFuture = null
        controller = null
        pending.clear()
        super.onDestroy()
    }
}
