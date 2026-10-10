package com.rbew.rrn_official

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.support.v4.media.MediaMetadataCompat
import android.support.v4.media.session.MediaSessionCompat
import android.support.v4.media.session.PlaybackStateCompat
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.media.VolumeProviderCompat
import androidx.media.app.NotificationCompat.MediaStyle
import com.ryanheise.audioservice.AudioServiceActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.net.URL
import java.util.concurrent.Executors
import kotlin.math.roundToInt

private const val SYSTEM_MEDIA_CHANNEL = "com.rbew.rrn_official/system_media"
private const val NOTIFICATION_CHANNEL_ID = "rrn_native_media_v1"
private const val NOTIFICATION_CHANNEL_NAME = "RRN Media Controls"
private const val NOTIFICATION_ID = 2015

object RrnNativeMediaBridge {
    @Volatile
    var channel: MethodChannel? = null

    fun emit(method: String, arguments: Any? = null) {
        Handler(Looper.getMainLooper()).post {
            channel?.invokeMethod(method, arguments)
        }
    }
}

class MainActivity : AudioServiceActivity() {
    private var rrnMediaChannel: MethodChannel? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        val channel = MethodChannel(flutterEngine.dartExecutor.binaryMessenger, SYSTEM_MEDIA_CHANNEL)
        rrnMediaChannel = channel
        RrnNativeMediaBridge.channel = channel

        channel.setMethodCallHandler { call, result ->
            when (call.method) {
                "update" -> {
                    val values = call.arguments as? Map<*, *>
                    if (values == null) {
                        result.error("RRN_MEDIA_ARGS", "Missing media state.", null)
                    } else {
                        RrnMediaSurfaceService.publish(this, values)
                        result.success(null)
                    }
                }
                "clear" -> {
                    RrnMediaSurfaceService.clear(this)
                    result.success(null)
                }
                else -> result.notImplemented()
            }
        }
    }

    override fun onDestroy() {
        if (RrnNativeMediaBridge.channel === rrnMediaChannel) {
            RrnNativeMediaBridge.channel = null
        }
        rrnMediaChannel = null
        super.onDestroy()
    }
}

class RrnMediaSurfaceService : Service() {
    private lateinit var session: MediaSessionCompat
    private lateinit var volumeProvider: VolumeProviderCompat
    private val artworkExecutor = Executors.newSingleThreadExecutor()
    private val mainHandler = Handler(Looper.getMainLooper())

    private var title = "Reality Radio Network"
    private var subtitle = ""
    private var album = ""
    private var artworkUrl = ""
    private var currentArtwork: Bitmap? = null
    private var live = false
    private var playing = false
    private var loading = false
    private var canPrevious = false
    private var canNext = false
    private var canSeek = false
    private var positionMs = 0L
    private var durationMs = 0L
    private var sourceId = ""
    private var rrnVolume = 100

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()

        volumeProvider = object : VolumeProviderCompat(
            VolumeProviderCompat.VOLUME_CONTROL_ABSOLUTE,
            100,
            rrnVolume,
        ) {
            override fun onSetVolumeTo(volume: Int) {
                setRrnVolume(volume, emit = true)
            }

            override fun onAdjustVolume(direction: Int) {
                if (direction == 0) return
                setRrnVolume(rrnVolume + if (direction > 0) 5 else -5, emit = true)
            }
        }

        session = MediaSessionCompat(this, "RRNSystemMedia").apply {
            setFlags(
                MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS or
                    MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS,
            )
            setPlaybackToRemote(volumeProvider)
            setCallback(object : MediaSessionCompat.Callback() {
                override fun onPlay() = RrnNativeMediaBridge.emit("play")
                override fun onPause() = RrnNativeMediaBridge.emit("pause")
                override fun onStop() = RrnNativeMediaBridge.emit("stop")
                override fun onSkipToNext() = RrnNativeMediaBridge.emit("next")
                override fun onSkipToPrevious() = RrnNativeMediaBridge.emit("previous")
                override fun onSeekTo(pos: Long) = RrnNativeMediaBridge.emit("seekTo", pos)
            })
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_UPDATE -> {
                readState(intent)
                session.isActive = true
                publishSessionState()
                startForeground(NOTIFICATION_ID, buildNotification())
                maybeLoadArtwork()
            }
            ACTION_PLAY -> RrnNativeMediaBridge.emit("play")
            ACTION_PAUSE -> RrnNativeMediaBridge.emit("pause")
            ACTION_TOGGLE -> RrnNativeMediaBridge.emit("toggle")
            ACTION_PREVIOUS -> RrnNativeMediaBridge.emit("previous")
            ACTION_NEXT -> RrnNativeMediaBridge.emit("next")
            ACTION_VOLUME_DOWN -> setRrnVolume(rrnVolume - 5, emit = true)
            ACTION_VOLUME_UP -> setRrnVolume(rrnVolume + 5, emit = true)
            ACTION_STOP -> RrnNativeMediaBridge.emit("stop")
            ACTION_CLEAR -> removeSurface()
        }
        // Playback is an explicit persistent user-visible foreground task. If
        // Android reclaims the process, request service recreation instead of
        // silently dropping the media surface.
        return START_STICKY
    }

    private fun readState(intent: Intent) {
        val oldArtwork = artworkUrl
        title = intent.getStringExtra(EXTRA_TITLE).orEmpty().ifBlank { "Reality Radio Network" }
        subtitle = intent.getStringExtra(EXTRA_SUBTITLE).orEmpty()
        album = intent.getStringExtra(EXTRA_ALBUM).orEmpty()
        artworkUrl = intent.getStringExtra(EXTRA_ARTWORK).orEmpty()
        live = intent.getBooleanExtra(EXTRA_LIVE, false)
        playing = intent.getBooleanExtra(EXTRA_PLAYING, false)
        loading = intent.getBooleanExtra(EXTRA_LOADING, false)
        canPrevious = intent.getBooleanExtra(EXTRA_CAN_PREVIOUS, false)
        canNext = intent.getBooleanExtra(EXTRA_CAN_NEXT, false)
        canSeek = intent.getBooleanExtra(EXTRA_CAN_SEEK, false)
        positionMs = intent.getLongExtra(EXTRA_POSITION_MS, 0L).coerceAtLeast(0L)
        durationMs = intent.getLongExtra(EXTRA_DURATION_MS, 0L).coerceAtLeast(0L)
        sourceId = intent.getStringExtra(EXTRA_SOURCE_ID).orEmpty()
        rrnVolume = (intent.getDoubleExtra(EXTRA_VOLUME, rrnVolume / 100.0).coerceIn(0.0, 1.0) * 100).roundToInt()
        volumeProvider.setCurrentVolume(rrnVolume)
        if (oldArtwork != artworkUrl) currentArtwork = null
    }

    private fun setRrnVolume(value: Int, emit: Boolean) {
        rrnVolume = value.coerceIn(0, 100)
        volumeProvider.setCurrentVolume(rrnVolume)
        if (emit) RrnNativeMediaBridge.emit("setVolume", rrnVolume / 100.0)
        try {
            getSystemService(NotificationManager::class.java).notify(NOTIFICATION_ID, buildNotification())
        } catch (_: Throwable) {
        }
    }

    private fun publishSessionState() {
        val state = when {
            loading -> PlaybackStateCompat.STATE_BUFFERING
            playing -> PlaybackStateCompat.STATE_PLAYING
            else -> PlaybackStateCompat.STATE_PAUSED
        }
        var actions = PlaybackStateCompat.ACTION_PLAY or
            PlaybackStateCompat.ACTION_PAUSE or
            PlaybackStateCompat.ACTION_PLAY_PAUSE or
            PlaybackStateCompat.ACTION_STOP
        if (canPrevious) actions = actions or PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS
        if (canNext) actions = actions or PlaybackStateCompat.ACTION_SKIP_TO_NEXT
        if (canSeek) actions = actions or PlaybackStateCompat.ACTION_SEEK_TO

        session.setPlaybackState(
            PlaybackStateCompat.Builder()
                .setActions(actions)
                .setState(state, positionMs, if (playing) 1f else 0f)
                .build(),
        )

        val metadata = MediaMetadataCompat.Builder()
            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, title)
            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, subtitle)
            .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, album)
            .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, if (live) -1L else durationMs)
        currentArtwork?.let {
            metadata.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, it)
            metadata.putBitmap(MediaMetadataCompat.METADATA_KEY_ART, it)
        }
        session.setMetadata(metadata.build())
    }

    private fun buildNotification(): Notification {
        val builder = NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentTitle(title)
            .setContentText(subtitle.ifBlank { if (live) "Live on Reality Radio Network" else "Reality Radio Network" })
            .setSubText(album.takeIf { it.isNotBlank() })
            .setCategory(NotificationCompat.CATEGORY_TRANSPORT)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setShowWhen(false)
            .setOngoing(true)
            .setStyle(
                MediaStyle()
                    .setMediaSession(session.sessionToken)
                    .setShowActionsInCompactView(0, 1, 2),
            )

        currentArtwork?.let { builder.setLargeIcon(it) }
        contentIntent()?.let { builder.setContentIntent(it) }

        builder.addAction(
            android.R.drawable.ic_media_previous,
            if (live) "Scan down" else "Previous",
            serviceAction(ACTION_PREVIOUS, 101),
        )
        builder.addAction(
            if (playing) android.R.drawable.ic_media_pause else android.R.drawable.ic_media_play,
            if (playing) "Pause" else "Play",
            serviceAction(if (playing) ACTION_PAUSE else ACTION_PLAY, 102),
        )
        builder.addAction(
            android.R.drawable.ic_media_next,
            if (live) "Scan up" else "Next",
            serviceAction(ACTION_NEXT, 103),
        )
        builder.addAction(
            android.R.drawable.ic_media_rew,
            "Volume down · $rrnVolume%",
            serviceAction(ACTION_VOLUME_DOWN, 104),
        )
        builder.addAction(
            android.R.drawable.ic_media_ff,
            "Volume up · $rrnVolume%",
            serviceAction(ACTION_VOLUME_UP, 105),
        )
        return builder.build()
    }

    private fun serviceAction(action: String, requestCode: Int): PendingIntent {
        val intent = Intent(this, RrnMediaSurfaceService::class.java).setAction(action)
        return PendingIntent.getService(
            this,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    private fun contentIntent(): PendingIntent? {
        val launch = packageManager.getLaunchIntentForPackage(packageName) ?: return null
        launch.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        return PendingIntent.getActivity(
            this,
            106,
            launch,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    private fun maybeLoadArtwork() {
        val requested = artworkUrl
        if (requested.isBlank() || currentArtwork != null || !requested.startsWith("http")) return
        artworkExecutor.execute {
            val bitmap = try {
                URL(requested).openStream().use { BitmapFactory.decodeStream(it) }
            } catch (_: Throwable) {
                null
            }
            if (bitmap != null) {
                mainHandler.post {
                    if (artworkUrl == requested) {
                        currentArtwork = bitmap
                        publishSessionState()
                        try {
                            getSystemService(NotificationManager::class.java).notify(NOTIFICATION_ID, buildNotification())
                        } catch (_: Throwable) {
                        }
                    }
                }
            }
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val channel = NotificationChannel(
            NOTIFICATION_CHANNEL_ID,
            NOTIFICATION_CHANNEL_NAME,
            NotificationManager.IMPORTANCE_LOW,
        ).apply {
            description = "Persistent playback controls for Reality Radio Network"
            setShowBadge(false)
            lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        }
        getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }

    private fun removeSurface() {
        session.isActive = false
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE)
        } else {
            @Suppress("DEPRECATION")
            stopForeground(true)
        }
        stopSelf()
    }

    override fun onDestroy() {
        try {
            getSystemService(NotificationManager::class.java).cancel(NOTIFICATION_ID)
        } catch (_: Throwable) {
        }
        session.isActive = false
        session.release()
        artworkExecutor.shutdownNow()
        super.onDestroy()
    }

    companion object {
        private const val ACTION_UPDATE = "com.rbew.rrn_official.media.UPDATE"
        private const val ACTION_CLEAR = "com.rbew.rrn_official.media.CLEAR"
        private const val ACTION_PLAY = "com.rbew.rrn_official.media.PLAY"
        private const val ACTION_PAUSE = "com.rbew.rrn_official.media.PAUSE"
        private const val ACTION_TOGGLE = "com.rbew.rrn_official.media.TOGGLE"
        private const val ACTION_PREVIOUS = "com.rbew.rrn_official.media.PREVIOUS"
        private const val ACTION_NEXT = "com.rbew.rrn_official.media.NEXT"
        private const val ACTION_VOLUME_DOWN = "com.rbew.rrn_official.media.VOLUME_DOWN"
        private const val ACTION_VOLUME_UP = "com.rbew.rrn_official.media.VOLUME_UP"
        private const val ACTION_STOP = "com.rbew.rrn_official.media.STOP"

        private const val EXTRA_TITLE = "title"
        private const val EXTRA_SUBTITLE = "subtitle"
        private const val EXTRA_ALBUM = "album"
        private const val EXTRA_ARTWORK = "artwork"
        private const val EXTRA_LIVE = "live"
        private const val EXTRA_PLAYING = "playing"
        private const val EXTRA_LOADING = "loading"
        private const val EXTRA_CAN_PREVIOUS = "canPrevious"
        private const val EXTRA_CAN_NEXT = "canNext"
        private const val EXTRA_CAN_SEEK = "canSeek"
        private const val EXTRA_POSITION_MS = "positionMs"
        private const val EXTRA_DURATION_MS = "durationMs"
        private const val EXTRA_SOURCE_ID = "sourceId"
        private const val EXTRA_VOLUME = "volume"

        fun publish(context: Context, values: Map<*, *>) {
            val intent = Intent(context, RrnMediaSurfaceService::class.java)
                .setAction(ACTION_UPDATE)
                .putExtra(EXTRA_TITLE, values[EXTRA_TITLE]?.toString().orEmpty())
                .putExtra(EXTRA_SUBTITLE, values[EXTRA_SUBTITLE]?.toString().orEmpty())
                .putExtra(EXTRA_ALBUM, values[EXTRA_ALBUM]?.toString().orEmpty())
                .putExtra(EXTRA_ARTWORK, values[EXTRA_ARTWORK]?.toString().orEmpty())
                .putExtra(EXTRA_LIVE, values[EXTRA_LIVE] as? Boolean ?: false)
                .putExtra(EXTRA_PLAYING, values[EXTRA_PLAYING] as? Boolean ?: false)
                .putExtra(EXTRA_LOADING, values[EXTRA_LOADING] as? Boolean ?: false)
                .putExtra(EXTRA_CAN_PREVIOUS, values[EXTRA_CAN_PREVIOUS] as? Boolean ?: false)
                .putExtra(EXTRA_CAN_NEXT, values[EXTRA_CAN_NEXT] as? Boolean ?: false)
                .putExtra(EXTRA_CAN_SEEK, values[EXTRA_CAN_SEEK] as? Boolean ?: false)
                .putExtra(EXTRA_POSITION_MS, (values[EXTRA_POSITION_MS] as? Number)?.toLong() ?: 0L)
                .putExtra(EXTRA_DURATION_MS, (values[EXTRA_DURATION_MS] as? Number)?.toLong() ?: 0L)
                .putExtra(EXTRA_SOURCE_ID, values[EXTRA_SOURCE_ID]?.toString().orEmpty())
                .putExtra(EXTRA_VOLUME, (values[EXTRA_VOLUME] as? Number)?.toDouble() ?: 1.0)
            try {
                ContextCompat.startForegroundService(context, intent)
            } catch (_: Throwable) {
                try {
                    context.startService(intent)
                } catch (_: Throwable) {
                }
            }
        }

        fun clear(context: Context) {
            try {
                context.startService(Intent(context, RrnMediaSurfaceService::class.java).setAction(ACTION_CLEAR))
            } catch (_: Throwable) {
                context.stopService(Intent(context, RrnMediaSurfaceService::class.java))
            }
        }
    }
}
