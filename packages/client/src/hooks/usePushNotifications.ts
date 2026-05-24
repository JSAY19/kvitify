import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr.buffer as ArrayBuffer
}

export function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported] = useState(() => 'serviceWorker' in navigator && 'PushManager' in window)

  useEffect(() => {
    if (!isSupported) return
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription()
      setIsSubscribed(!!sub)
    })
  }, [isSupported])

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast.error('Push-уведомления не поддерживаются в этом браузере')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('Разрешение на уведомления отклонено')
        return
      }

      const { data } = await api.get('/push/vapid-key')
      if (!data.publicKey) {
        toast.error('VAPID-ключ не настроен на сервере')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      })

      await api.post('/push/subscribe', { subscription })
      setIsSubscribed(true)
      toast.success('Уведомления включены!')
    } catch (err) {
      console.error('Push subscribe error:', err)
      toast.error('Не удалось подписаться на уведомления')
    }
  }, [isSupported])

  return { isSupported, isSubscribed, subscribe }
}
