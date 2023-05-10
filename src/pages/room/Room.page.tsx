import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  LocalTrack,
  RemoteParticipant,
  Room,
  connect,
  createLocalTracks,
} from 'twilio-video'
import { Participant } from './components/Participant'
import { RemoteParticipantRoom } from './components/RemoteParticipant'

export const RoomPage = () => {
  const { token } = useParams()
  const [room, setRoom] = useState<Room | null>(null)
  const [participants, setParticipants] = useState<RemoteParticipant[]>([])
  const navigate = useNavigate()

  //* Conexión a la Sala
  useEffect(() => {
    if (token) {
      createLocalTracks({
        audio: true,
        video: true,
      })
        .then((localTrack: LocalTrack[]) => {
          return connect(token, {
            name: 'Test Metlife',
            tracks: localTrack,
          })
        })
        .then((room: Room) => {
          setRoom(room)
        })
    }
  }, [token])

  useEffect(() => {
    const participantConnected = (newParticipant: RemoteParticipant) => {
      setParticipants([...participants, newParticipant])
    }

    const participantDisconnected = (participant: any) => {
      setParticipants((prevParticipants) =>
        prevParticipants.filter((p) => p !== participant)
      )
    }

    if (room) {
      room.on('participantConnected', participantConnected)
      room.on('participantDisconnected', participantDisconnected)
      room.participants.forEach(participantConnected)
    }
  }, [room])

  const remoteParticipants = participants.map((participant) => (
    <RemoteParticipantRoom
      key={participant.sid}
      remoteParticipant={participant}
    />
  ))

  const handleLogout = () => {
    setRoom((prevRoom: Room | null) => {
      if (prevRoom) {
        prevRoom.localParticipant.tracks.forEach((trackPub: any) => {
          trackPub.track.stop()
        })
        prevRoom.disconnect()
        navigate('/')
      }
      return null
    })
  }
  return (
    <>
      {room && (
        <>
          <Participant
            localParticipant={room.localParticipant}
            handleLogout={handleLogout}
          />
          <h3>Participantes</h3>
          <div className="remote-participants">{remoteParticipants}</div>
        </>
      )}
    </>
  )
}
