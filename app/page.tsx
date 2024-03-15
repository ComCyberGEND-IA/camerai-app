'use client'
import { useState, useEffect } from 'react'
import * as fal from "@fal-ai/serverless-client"
import Image from 'next/image'

fal.config({
  proxyUrl: "/api/fal/proxy",
})

const seed = Math.floor(Math.random() * 100000)
const baseArgs = {
  sync_mode: true,
  strength: .99,
  seed
}

export default function Home() {
  const [input, setInput] = useState('masterpiece, best quality, A cinematic shot of a baby raccoon wearing an intricate Italian priest robe')
  const [image, setImage] = useState(null)
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false)

  useEffect(() => { setIsClient(true) }, [])

  useEffect(() => {
    if (isClient && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const video = videoRef;
      if (video) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then((stream) => {
            video.srcObject = stream;
            video.play();
          })
          .catch((err) => {
            console.error("Error accessing the camera:", err);
          });
      }
    }
  }, [videoRef, isClient]);

  const { send } = fal.realtime.connect('110602490-sdxl-turbo-realtime', {
    connectionKey: 'realtime-nextjs-app',
    onResult(result) {
      if (result.error) return
      setImage(result.images[0].url)
    }
  })

  return (
    <main className="p-12">
      <p className="text-xl mb-2">Fal SDXL Turbo</p>
      <input
        className='border rounded-lg p-2 w-full mb-2'
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          // Here you would handle sending the new input value, perhaps with new image data from the webcam.
        }}
      />
      <div className='flex'>
        <div className="w-[550px] h-[550px] bg-black">
          {
            isClient && (
              <video ref={(ref) => setVideoRef(ref)} width="550" height="550" autoPlay muted playsInline></video>
            )
          }
        </div>
        {
          image && (
            <Image
              src={image}
              width={550}
              height={550}
              alt='fal image'
            />
          )
        }
      </div>
    </main>
  )
}
