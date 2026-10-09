package com.rbew.rrn_official

import android.app.PendingIntent
import android.content.Intent
import androidx.annotation.OptIn
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.DefaultMediaNotificationProvider
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService

@OptIn(UnstableApi::class)
class RrnMediaService : MediaSessionService() {
    private lateinit var player: ExoPlayer
    private var mediaSession: MediaSession? = null

    override fun onCreate() {
        super.onCreate()

        val audioAttributes = AudioAttributes.Builder()
            .setUsage(C.USAGE_MEDIA)
            .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
            .build()

        player = ExoPlayer.Builder(this).build().apply {
            setAudioAttributes(audioAttributes, true)
            setHandleAudioBecomingNoisy(true)
            setWakeMode(C.WAKE_MODE_LOCAL)
        }

        val activityIntent = packageManager.getLaunchIntentForPackage(packageName)
        val sessionActivity = activityIntent?.let {
            PendingIntent.getActivity(
                this,
                2015,
                it.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
        }

        val builder = MediaSession.Builder(this, player)
        if (sessionActivity != null) builder.setSessionActivity(sessionActivity)
        mediaSession = builder.build()

        val notificationProvider = DefaultMediaNotificationProvider.Builder(this)
            .setChannelId("rrn_media3_playback")
            .setChannelName(R.string.rrn_playback_channel_name)
            .setNotificationId(2015)
            .build()
        notificationProvider.setSmallIcon(R.drawable.ic_stat_rrn)
        setMediaNotificationProvider(notificationProvider)
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? = mediaSession

    override fun onTaskRemoved(rootIntent: Intent?) {
        // Keep the MediaSessionService alive while playback is active. Media3
        // stops the foreground service itself when the player is stopped/idle.
        super.onTaskRemoved(rootIntent)
    }

    override fun onDestroy() {
        mediaSession?.run {
            player.release()
            release()
        }
        mediaSession = null
        super.onDestroy()
    }
}
