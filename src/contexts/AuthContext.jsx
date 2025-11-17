import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import api from '../services/api' // Importa o serviço de API real

const AuthContext = createContext()

// Ações do reducer
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  RESET_PASSWORD_START: 'RESET_PASSWORD_START',
  RESET_PASSWORD_SUCCESS: 'RESET_PASSWORD_SUCCESS',
  RESET_PASSWORD_FAILURE: 'RESET_PASSWORD_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOAD_USER: 'LOAD_USER',
}

// Estado inicial
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// Reducer para gerenciar o estado da autenticação
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.RESET_PASSWORD_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.RESET_PASSWORD_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      }

    case AUTH_ACTIONS.RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
      }

    default:
      return state
  }
}

// Helper para pegar mensagem da API (Axios, etc.)
const getErrorMessage = (error) => {
  if (error?.response?.data?.mensagem) return error.response.data.mensagem
  if (error?.response?.data?.message) return error.response.data.message
  return error?.message || 'Erro ao processar a requisição.'
}

// Provider do contexto de autenticação
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Carrega usuário do localStorage na inicialização
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('financas_user')
      const storedToken = localStorage.getItem('financas_token')

      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser)

        // Configura header Authorization padrão da API
        api.defaults.headers.common.Authorization = `Bearer ${storedToken}`

        dispatch({
          type: AUTH_ACTIONS.LOAD_USER,
          payload: { user },
        })
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER,
          payload: { user: null },
        })
      }
    } catch (error) {
      console.error('Erro ao carregar usuário do localStorage:', error)
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER,
        payload: { user: null },
      })
    }
  }, [])

  // Função de login
  const login = useCallback(async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })

    try {
      const response = await api.post('/auth/login', { email, password })
      const { user, token } = response.data.dados

      // Salva no localStorage
      localStorage.setItem('financas_user', JSON.stringify(user))
      localStorage.setItem('financas_token', token)

      // Configura Authorization da API
      api.defaults.headers.common.Authorization = `Bearer ${token}`

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user },
      })

      return response.data
    } catch (error) {
      const mensagem = getErrorMessage(error)
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: mensagem },
      })
      throw new Error(mensagem)
    }
  }, [])

  // Função de registro
  const register = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START })

    try {
      const response = await api.post('/auth/register', userData)
      const { user, token } = response.data.dados

      // Salva no localStorage
      localStorage.setItem('financas_user', JSON.stringify(user))
      localStorage.setItem('financas_token', token)

      // Configura Authorization da API
      api.defaults.headers.common.Authorization = `Bearer ${token}`

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { user },
      })

      return response.data
    } catch (error) {
      const mensagem = getErrorMessage(error)
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: { error: mensagem },
      })
      throw new Error(mensagem)
    }
  }, [])

  // Função de recuperação de senha
  const resetPassword = useCallback(async (email) => {
    dispatch({ type: AUTH_ACTIONS.RESET_PASSWORD_START })

    try {
      const response = await api.post('/auth/reset-password', { email })

      dispatch({ type: AUTH_ACTIONS.RESET_PASSWORD_SUCCESS })

      return response.data
    } catch (error) {
      const mensagem = getErrorMessage(error)
      dispatch({
        type: AUTH_ACTIONS.RESET_PASSWORD_FAILURE,
        payload: { error: mensagem },
      })
      throw new Error(mensagem)
    }
  }, [])

  // Função de logout
  const logout = useCallback(() => {
    localStorage.removeItem('financas_user')
    localStorage.removeItem('financas_token')

    // Remove Authorization do axios
    if (api.defaults.headers.common.Authorization) {
      delete api.defaults.headers.common.Authorization
    }

    dispatch({ type: AUTH_ACTIONS.LOGOUT })
  }, [])

  // Função para limpar erros
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }, [])

  // Valor do contexto
  const value = {
    ...state,
    login,
    register,
    resetPassword,
    logout,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }

  return context
}

export default AuthContext
