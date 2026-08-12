import { useCallback, useEffect, useState } from 'react'
import { getAccount } from '../services/accountApi'

export function useAccount() {
  const [account, setAccount] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAccount()
      setAccount(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load account')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { account, isLoading, error, reload }
}
