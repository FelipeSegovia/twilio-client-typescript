import { useEffect, useState } from 'react'
import './lobby.style.css'
import { SubmitHandler, useForm } from 'react-hook-form'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { useNavigate } from 'react-router-dom'
export const Lobby = () => {
  const [deviceAudioDefault, setDeviceAudioDefault] =
    useState<MediaDeviceInfo>()
  const [deviceVideoDefault, setDeviceVideoDefault] =
    useState<MediaDeviceInfo>()
  const navigate = useNavigate()
  const { handleSubmit, register } = useForm({
    defaultValues: {
      username: '',
    },
  })

  useEffect(() => {
    //* Visualizar Dispositivos por default
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices: MediaDeviceInfo[]) => {
        const videoDeviceFind = devices.find(
          (device) => device.kind === 'videoinput'
        )

        const audioDeviceFind = devices.find(
          (device) => device.kind === 'audioinput'
        )

        if (videoDeviceFind) setDeviceVideoDefault(videoDeviceFind)
        if (audioDeviceFind) setDeviceAudioDefault(audioDeviceFind)
      })
  }, [])

  const onSubmit: SubmitHandler<{ username: string }> = async (data) => {
    console.log('data', data)
    await axios
      .post('https://twilio-video-api.vercel.app/api/users/', {
        identity: data.username,
        room: 'Test Metlife',
      })
      .then((response: AxiosResponse<{ token: string }>) =>
        // console.log('response', response.data.token)
        navigate(`/room/${response.data.token}`)
      )
      .catch((error: AxiosError) =>
        console.log('Error Get Token =>', error.message)
      )
  }

  return (
    <main>
      <h1>Ingresar a la sala</h1>
      <p>Prepara tu configuración</p>
      {/* Preview del video */}
      {/* Seleccionar dispositivos */}
      <p>
        Dispositivo de video: <strong>{deviceVideoDefault?.label}</strong>{' '}
      </p>
      <p>
        Dispositivo de audio: <strong>{deviceAudioDefault?.label}</strong>{' '}
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          placeholder="Nombre"
          {...register('username', { required: true })}
        />
        <button type="submit">Ingresar</button>
      </form>
    </main>
  )
}
