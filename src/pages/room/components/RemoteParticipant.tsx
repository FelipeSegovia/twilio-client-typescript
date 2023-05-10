import { useEffect, useRef, useState } from 'react'
import {
  RemoteAudioTrack,
  RemoteAudioTrackPublication,
  RemoteParticipant,
  RemoteVideoTrack,
  RemoteVideoTrackPublication,
} from 'twilio-video'

type PropsParticipant = {
  remoteParticipant: RemoteParticipant
}

export const RemoteParticipantRoom = ({
  remoteParticipant,
}: PropsParticipant) => {
  const [videoTracks, setVideoTracks] = useState<(RemoteVideoTrack | null)[]>(
    []
  )
  const [audioTracks, setAudioTracks] = useState<(RemoteAudioTrack | null)[]>(
    []
  )
  const videoRef = useRef<any>()
  const audioRef = useRef<any>()

  //* Filtra nulls de video
  const trackpubsToTracksVideo = (
    trackMap: Map<string, RemoteVideoTrackPublication>
  ) =>
    Array.from(trackMap.values())
      .map((publication) => publication.track)
      .filter((track) => track !== null)

  //* Filtra nulls de audio
  const trackpubsToTracksAudio = (
    trackMap: Map<string, RemoteAudioTrackPublication>
  ) =>
    Array.from(trackMap.values())
      .map((publication) => publication.track)
      .filter((track) => track !== null)

  useEffect(() => {
    // console.log('LocalParticipant init', localParticipant)
    setVideoTracks(trackpubsToTracksVideo(remoteParticipant.videoTracks))
    setAudioTracks(trackpubsToTracksAudio(remoteParticipant.audioTracks))

    const trackSubscribed = (track: any) => {
      if (track.kind === 'video') {
        setVideoTracks((videoTracks) => [...videoTracks, track])
      } else if (track.kind === 'audio') {
        setAudioTracks((audioTracks) => [...audioTracks, track])
      }
    }

    const trackUnsubscribed = (track: any) => {
      if (track.kind === 'video') {
        setVideoTracks((videoTracks) => videoTracks.filter((v) => v !== track))
      } else if (track.kind === 'audio') {
        setAudioTracks((audioTracks) => audioTracks.filter((a) => a !== track))
      }
    }

    remoteParticipant.on('trackSubscribed', trackSubscribed)
    remoteParticipant.on('trackUnsubscribed', trackUnsubscribed)
    return () => {
      setVideoTracks([])
      setAudioTracks([])
      remoteParticipant.removeAllListeners()
    }
  }, [remoteParticipant])

  //* ----------------------------------------------------------------
  useEffect(() => {
    // console.log('VideoTracks =>', videoTracks)
    const videoTrack = videoTracks[0]
    if (videoTrack && videoRef !== null) {
      videoTrack.attach(videoRef.current)
      return () => {
        videoTrack.detach()
      }
    }
  }, [videoTracks])

  useEffect(() => {
    const audioTrack = audioTracks[0]
    if (audioTrack) {
      audioTrack.attach(audioRef.current)
      return () => {
        audioTrack.detach()
      }
    }
  }, [audioTracks])

  return (
    <div className="participant">
      <video ref={videoRef} autoPlay={true} />
      <audio ref={audioRef} muted={false} />
    </div>
  )
}
