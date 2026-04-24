import type { ILogin, IUser } from '~/interfaces/Ilogin'

const SESSION_KEY = 'session'

export const useAuth = () => {
  const token = useState<string | null>('auth:token', () => null)
  const user = useState<IUser | null>('auth:user', () => null)

  const isAuthenticated = computed(() => !!token.value)

  const saveSession = (data: ILogin) => {
    token.value = data.token
    user.value = data.user
    if (import.meta.client) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(data))
    }
  }

  const clearSession = () => {
    token.value = null
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem(SESSION_KEY)
    }
  }

  const initSession = () => {
    if (!import.meta.client) return
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return
    try {
      const data = JSON.parse(raw) as ILogin
      token.value = data.token
      user.value = data.user
    } catch {
      clearSession()
    }
  }

  return {
    token: readonly(token),
    user: readonly(user),
    isAuthenticated,
    saveSession,
    clearSession,
    initSession
  }
}
