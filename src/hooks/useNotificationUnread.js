import { useEffect, useState, useCallback } from 'react'
import { getUnreadCount, connectNotificationStream } from '../services/notificationApi'

export function useNotificationUnread(orgId) {
  const [unread, setUnread] = useState(0)

  const refresh = useCallback(async () => {
    if (!orgId) return
    try {
      const data = await getUnreadCount(orgId)
      setUnread(Number(data?.unread) || 0)
    } catch {
      // keep last known count
    }
  }, [orgId])

  useEffect(() => {
    if (!orgId) return
    let active = true

    const safeRefresh = () => {
      if (active) refresh()
    }

    refresh()
    const stop = connectNotificationStream({ orgId, onNotification: safeRefresh })
    const interval = setInterval(safeRefresh, 60000)

    return () => {
      active = false
      clearInterval(interval)
      stop()
    }
  }, [orgId, refresh])

  return { unread, refresh }
}
