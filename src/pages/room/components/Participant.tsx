import { useEffect, useRef, useState } from 'react'
import {
  LocalAudioTrack,
  LocalAudioTrackPublication,
  LocalParticipant,
  LocalVideoTrack,
  LocalVideoTrackPublication,
  createLocalAudioTrack,
  createLocalVideoTrack,
} from 'twilio-video'
import { FaMicrophoneSlash, FaMicrophone } from 'react-icons/fa'
import { ImPhoneHangUp } from 'react-icons/im'

type PropsParticipant = {
  localParticipant: LocalParticipant
  handleLogout: () => void
}

export const Participant = ({
  localParticipant,
  handleLogout,
}: PropsParticipant) => {
  const [videoTracks, setVideoTracks] = useState<LocalVideoTrack[]>([])
  const [audioTracks, setAudioTracks] = useState<LocalAudioTrack[]>([])
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>(
    []
  )
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>(
    []
  )
  const [mute, setMute] = useState(false)
  const videoRef = useRef<any>()
  const audioRef = useRef<any>()

  //* Filtra nulls de video
  const trackpubsToTracksVideo = (
    trackMap: Map<string, LocalVideoTrackPublication>
  ) =>
    Array.from(trackMap.values())
      .map((publication) => publication.track)
      .filter((track) => track !== null)

  //* Filtra nulls de audio
  const trackpubsToTracksAudio = (
    trackMap: Map<string, LocalAudioTrackPublication>
  ) =>
    Array.from(trackMap.values())
      .map((publication) => publication.track)
      .filter((track) => track !== null)

  useEffect(() => {
    // console.log('LocalParticipant init', localParticipant)
    setVideoTracks(trackpubsToTracksVideo(localParticipant.videoTracks))
    setAudioTracks(trackpubsToTracksAudio(localParticipant.audioTracks))

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

    localParticipant.on('trackSubscribed', trackSubscribed)
    localParticipant.on('trackUnsubscribed', trackUnsubscribed)

    return () => {
      setVideoTracks([])
      setAudioTracks([])
      localParticipant.removeAllListeners()
    }
  }, [localParticipant])

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices: MediaDeviceInfo[]) => {
        const videoDeviceFind = devices.filter(
          (device) => device.kind === 'videoinput'
        )

        const audioInputDeviceFind = devices.filter(
          (device) => device.kind === 'audioinput'
        )

        setVideoInputDevices(videoDeviceFind)
        setAudioInputDevices(audioInputDeviceFind)
      })
  }, [])

  const handleChangeVideo = async (deviceId: string) => {
    // console.log('Device find =>', devices)
    await createLocalVideoTrack({
      deviceId: { exact: deviceId },
    }).then((localVideoTrack) => {
      localParticipant.videoTracks.forEach((publication) => {
        publication.track.stop()
        localParticipant.unpublishTrack(publication.track)
        publication.track.detach()
      })
      // console.log('VideoTrack => ', localVideoTrack)
      localParticipant.publishTrack(localVideoTrack)

      setVideoTracks([localVideoTrack])
    })
    // .then((newLocalParticipant) => {
    //   console.log('LocalParticipant Ended => ', newLocalParticipant)
    //   // setVideoTracks(trackpubsToTracksVideo(localParticipant.videoTracks))
    // })
  }

  const handleChangeAudioInput = async (deviceId: string) => {
    // console.log('Device find =>', devices)
    await createLocalAudioTrack({
      deviceId: { exact: deviceId },
    }).then((localAudioTrack) => {
      localParticipant.audioTracks.forEach((publication) => {
        publication.track.stop()
        localParticipant.unpublishTrack(publication.track)
        publication.track.detach()
      })
      // console.log('VideoTrack => ', localVideoTrack)
      localParticipant.publishTrack(localAudioTrack)

      setAudioTracks([localAudioTrack])
    })
    // .then((newLocalParticipant) => {
    //   console.log('LocalParticipant Ended => ', newLocalParticipant)
    //   // setVideoTracks(trackpubsToTracksVideo(localParticipant.videoTracks))
    // })
  }

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
      <audio ref={audioRef} muted={mute} />
      {/* <button onClick={() => handleChangeVideo()}>Cambiar video</button> */}
      <div>
        <div>
          <p>Dispositivo de video</p>
          <select
            onChange={(e) =>
              handleChangeVideo(
                videoInputDevices[Number(e.target.value)].deviceId
              )
            }
          >
            {videoInputDevices.map((videoInput, index) => (
              <option key={index} value={index}>
                {videoInput.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p>Dispositivo de audio entrada</p>
          <select
            onChange={(e) =>
              handleChangeAudioInput(
                audioInputDevices[Number(e.target.value)].deviceId
              )
            }
          >
            {audioInputDevices.map((audioInput, index) => (
              <option key={index} value={index}>
                {audioInput.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <button
          onClick={() => setMute(!mute)}
          style={{
            backgroundColor: 'gray',
            borderRadius: 50,
            padding: '5px 15px',
            margin: '0 10px',
          }}
        >
          {mute ? <FaMicrophoneSlash size={24} /> : <FaMicrophone size={24} />}
        </button>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: 'red',
            borderRadius: 50,
            padding: '5px 25px',
          }}
        >
          <ImPhoneHangUp size={24} />
        </button>
      </div>
    </div>
  )
}
