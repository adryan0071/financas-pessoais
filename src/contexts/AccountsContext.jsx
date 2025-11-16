import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext.jsx'
import api from '../services/api'

const AccountsContext = createContext()

// Tipos de conta disponíveis
export const ACCOUNT_TYPES = {
  CHECKING: 'checking', // Conta corrente
  SAVINGS: 'savings',   // Poupança
  CREDIT: 'credit',     // Cartão de crédito
  CASH: 'cash',         // Dinheiro
  INVESTMENT: 'investment' // Investimentos
}

// Ações do reducer
const ACCOUNTS_ACTIONS = {
  LOAD_ACCOUNTS: 'LOAD_ACCOUNTS',
  ADD_ACCOUNT: 'ADD_ACCOUNT',
  UPDATE_ACCOUNT: 'UPDATE_ACCOUNT',
  DELETE_ACCOUNT: 'DELETE_ACCOUNT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// Estado inicial
const initialState = {
  accounts: [],
  isLoading: false,
  error: null
}

// Reducer para gerenciar contas
function accountsReducer(state, action) {
  switch (action.type) {
    case ACCOUNTS_ACTIONS.LOAD_ACCOUNTS:
      return {
        ...state,
        accounts: action.payload,
        isLoading: false,
        error: null
      }

    case ACCOUNTS_ACTIONS.ADD_ACCOUNT:
      return {
        ...state,
        accounts: [...state.accounts, action.payload],
        isLoading: false,
        error: null
      }

    case ACCOUNTS_ACTIONS.UPDATE_ACCOUNT:
      return {
        ...state,
        accounts: state.accounts.map(account =>
          account.id === action.payload.id ? action.payload : account
        ),
        isLoading: false,
        error: null
      }

    case ACCOUNTS_ACTIONS.DELETE_ACCOUNT:
      return {
        ...state,
        accounts: state.accounts.filter(account => account.id !== action.payload),
        isLoading: false,
        error: null
      }

    case ACCOUNTS_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      }

    case ACCOUNTS_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }

    case ACCOUNTS_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }

    default:
      return state
  }
}

// Funções utilitárias para localStorage (mantidas, mas não usadas para carregar contas)
const getStorageKey = (userId) => `financas_accounts_${userId}`

const loadAccountsFromStorage = (userId) => {
  try {
    const stored = localStorage.getItem(getStorageKey(userId))
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Erro ao carregar contas do localStorage:', error)
    return []
  }
}

const saveAccountsToStorage = (userId, accounts) => {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(accounts))
  } catch (error) {
    console.error('Erro ao salvar contas no localStorage:', error)
  }
}

// Provider do contexto
export function AccountsProvider({ children }) {
  const [state, dispatch] = useReducer(accountsReducer, initialState)
  const { user } = useAuth()



  // Função para adicionar conta
  const addAccount = async (accountData) => {
    try {
      dispatch({ type: ACCOUNTS_ACTIONS.SET_LOADING, payload: true })
      
      const response = await api.post('/contas', accountData)
      const newAccount = response.data.dados
      
      dispatch({ type: ACCOUNTS_ACTIONS.ADD_ACCOUNT, payload: newAccount })
      return newAccount
    } catch (error) {
      const mensagem = error.message
      dispatch({ type: ACCOUNTS_ACTIONS.SET_ERROR, payload: mensagem })
      throw new Error(mensagem)
    }
  }

  // Função para atualizar conta
  const updateAccount = async (accountId, updates) => {
    try {
      dispatch({ type: ACCOUNTS_ACTIONS.SET_LOADING, payload: true })
      
      const response = await api.put(`/contas/${accountId}`, updates)
      const updatedAccount = response.data.dados
      
      dispatch({ type: ACCOUNTS_ACTIONS.UPDATE_ACCOUNT, payload: updatedAccount })
      return updatedAccount
    } catch (error) {
      const mensagem = error.message
      dispatch({ type: ACCOUNTS_ACTIONS.SET_ERROR, payload: mensagem })
      throw new Error(mensagem)
    }
  }

  // Função para deletar conta
  const deleteAccount = async (accountId) => {
    try {
      dispatch({ type: ACCOUNTS_ACTIONS.SET_LOADING, payload: true })
      
      await api.delete(`/contas/${accountId}`)
      
      dispatch({ type: ACCOUNTS_ACTIONS.DELETE_ACCOUNT, payload: accountId })
    } catch (error) {
      const mensagem = error.message
      dispatch({ type: ACCOUNTS_ACTIONS.SET_ERROR, payload: mensagem })
      throw new Error(mensagem)
    }
  }

  // Função para obter conta por ID
  const getAccountById = (accountId) => {
    // Retorna a conta ou undefined/null se não encontrar
    return state.accounts.find(account => account.id === accountId)
  }

  // Função para obter contas por tipo
  const getAccountsByType = (type) => {
    return state.accounts.filter(account => account.type === type && account.isActive)
  }

  // Função para calcular saldo total
  const getTotalBalance = () => {
    return state.accounts
      .filter(account => account.isActive && account.type !== ACCOUNT_TYPES.CREDIT)
      .reduce((total, account) => total + account.balance, 0)
  }

  // Função para obter total de dívidas (cartões de crédito)
  const getTotalDebt = () => {
    return Math.abs(
      state.accounts
        .filter(account => account.isActive && account.type === ACCOUNT_TYPES.CREDIT && account.balance < 0)
        .reduce((total, account) => total + account.balance, 0)
    )
  }

  // Função para limpar erros
  const clearError = () => {
    dispatch({ type: ACCOUNTS_ACTIONS.CLEAR_ERROR })
  }

  // Função para carregar contas (exposta para uso externo)
  const loadAccounts = useCallback(async () => {
    if (user?.id) {
      dispatch({ type: ACCOUNTS_ACTIONS.SET_LOADING, payload: true })
      
      try {
        const response = await api.get('/contas')
        const accounts = response.data.dados
        dispatch({ type: ACCOUNTS_ACTIONS.LOAD_ACCOUNTS, payload: accounts })
      } catch (error) {
        console.error('Erro ao carregar contas:', error)
        dispatch({ type: ACCOUNTS_ACTIONS.SET_ERROR, payload: error.message })
      }
    }
  }, [user?.id])

  // Carrega contas quando o usuário muda
  useEffect(() => {
    loadAccounts()
  }, [user?.id])

  // Valor do contexto
  const value = {
    ...state,
    loadAccounts, // Expor a função
    addAccount,
    updateAccount,
    deleteAccount,
    getAccountById,
    getAccountsByType,
    getTotalBalance,
    getTotalDebt,
    clearError,
    ACCOUNT_TYPES
  }

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  )
}

// Hook personalizado para usar o contexto
export function useAccounts() {
  const context = useContext(AccountsContext)
  
  if (!context) {
    throw new Error('useAccounts deve ser usado dentro de um AccountsProvider')
  }
  
  return context
}

export default AccountsContext
