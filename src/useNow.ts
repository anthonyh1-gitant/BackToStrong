import { useEffect, useState } from 'react'

export function useNow(interval = 60000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const id = window.setInterval(() => setNow(new Date()), interval); return () => clearInterval(id) }, [interval])
  return now
}
