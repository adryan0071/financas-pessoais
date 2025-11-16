import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext.jsx'
import api from '../services/api'

const GoalsContext = createContext()

// Tipos de meta
export const GOAL_TYPES = {
  SAVINGS: 'savings',           // Economia/Poupança
  DEBT_PAYMENT: 'debt_payment', // Pagamento de dívida
  PURCHASE: 'purchase',         // Compra específica
  INVESTMENT: 'investment',     // Investimento
  EMERGENCY: 'emergency'        // Reserva de emergência
}

// Status da meta
export const GOAL_STATUS = {
  ACTIVE: 'active',       // Meta ativa
  COMPLETED: 'completed', // Meta concluída
  PAUSED: 'paused',      // Meta pausada
  CANCELLED: 'cancelled'  // Meta cancelada
}

// Ações do reducer
const GOALS_ACTIONS = {
  LOAD_GOALS: 'LOAD_GOALS',
  ADD_GOAL: 'ADD_GOAL',
  UPDATE_GOAL: 'UPDATE_GOAL',
  DELETE_GOAL: 'DELETE_GOAL',
  ADD_CONTRIBUTION: 'ADD_CONTRIBUTION',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// Estado inicial
const initialState = {
  goals: [],
  isLoading: false,
  error: null
}

// Reducer para gerenciar metas
function goalsReducer(state, action) {
  switch (action.type) {
    case GOALS_ACTIONS.LOAD_GOALS:
      return {
        ...state,
        goals: action.payload,
        isLoading: false,
        error: null
      }

    case GOALS_ACTIONS.ADD_GOAL:
      return {
        ...state,
        goals: [...state.goals, action.payload],
        isLoading: false,
        error: null
      }

    case GOALS_ACTIONS.UPDATE_GOAL:
      return {
        ...state,
        goals: state.goals.map(goal =>
          goal.id === action.payload.id ? action.payload : goal
        ),
        isLoading: false,
        error: null
      }

    case GOALS_ACTIONS.DELETE_GOAL:
      return {
        ...state,
        goals: state.goals.filter(goal => goal.id !== action.payload),
        isLoading: false,
        error: null
      }

    case GOALS_ACTIONS.ADD_CONTRIBUTION:
      return {
        ...state,
        goals: state.goals.map(goal =>
          goal.id === action.payload.goalId
            ? {
                ...goal,
                currentAmount: goal.currentAmount + action.payload.amount,
                contributions: [...goal.contributions, action.payload],
                updatedAt: new Date().toISOString()
              }
            : goal
        ),
        isLoading: false,
        error: null
      }

    case GOALS_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      }

    case GOALS_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }

    case GOALS_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }

    default:
      return state
  }
}

// Funções utilitárias para localStorage
const getStorageKey = (userId) => `financas_goals_${userId}`

const loadGoalsFromStorage = (userId) => {
  try {
    const stored = localStorage.getItem(getStorageKey(userId))
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Erro ao carregar metas do localStorage:', error)
    return []
  }
}

const saveGoalsToStorage = (userId, goals) => {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(goals))
  } catch (error) {
    console.error('Erro ao salvar metas no localStorage:', error)
  }
}



// Provider do contexto
export function GoalsProvider({ children }) {
  const [state, dispatch] = useReducer(goalsReducer, initialState)
  const { user } = useAuth()

  // Função para carregar metas (usada no useEffect)
  const loadGoals = useCallback(async () => {
    if (user?.id) {
      dispatch({ type: GOALS_ACTIONS.SET_LOADING, payload: true })
      
      try {
        const response = await api.get('/metas')
        const goals = response.data.dados
        dispatch({ type: GOALS_ACTIONS.LOAD_GOALS, payload: goals })
      } catch (error) {
        console.error('Erro ao carregar metas:', error)
        dispatch({ type: GOALS_ACTIONS.SET_ERROR, payload: error.message })
      }
    }
  }, [user?.id])

  // Carrega metas quando o usuário muda
  useEffect(() => {
    loadGoals()
  }, [user?.id])

  // Função para adicionar meta
  const addGoal = async (goalData) => {
    try {
      dispatch({ type: GOALS_ACTIONS.SET_LOADING, payload: true })
      
      const response = await api.post('/metas', goalData)
      const newGoal = response.data.dados
      
      dispatch({ type: GOALS_ACTIONS.ADD_GOAL, payload: newGoal })
      return newGoal
    } catch (error) {
      const mensagem = error.message
      dispatch({ type: GOALS_ACTIONS.SET_ERROR, payload: mensagem })
      throw new Error(mensagem)
    }
  }

  // Função para atualizar meta
  const updateGoal = async (goalId, updates) => {
    try {
      dispatch({ type: GOALS_ACTIONS.SET_LOADING, payload: true })
      
      const response = await api.put(`/metas/${goalId}`, updates)
      const updatedGoal = response.data.dados
      
      dispatch({ type: GOALS_ACTIONS.UPDATE_GOAL, payload: updatedGoal })
      return updatedGoal
    } catch (error) {
      const mensagem = error.message
      dispatch({ type: GOALS_ACTIONS.SET_ERROR, payload: mensagem })
      throw new Error(mensagem)
    }
  }

  // Função para deletar meta
  const deleteGoal = async (goalId) => {
    try {
      dispatch({ type: GOALS_ACTIONS.SET_LOADING, payload: true })
      
      await api.delete(`/metas/${goalId}`)
      
      dispatch({ type: GOALS_ACTIONS.DELETE_GOAL, payload: goalId })
    } catch (error) {
      const mensagem = error.message
      dispatch({ type: GOALS_ACTIONS.SET_ERROR, payload: mensagem })
      throw new Error(mensagem)
    }
  }

  // Função para adicionar contribuição
  const addContribution = async (goalId, contributionData) => {
    try {
      dispatch({ type: GOALS_ACTIONS.SET_LOADING, payload: true })
      
      const response = await api.post(`/metas/${goalId}/adicionar-valor`, contributionData)
      const updatedGoal = response.data.dados
      
      // O backend retorna a meta atualizada, então atualizamos o estado
      dispatch({ type: GOALS_ACTIONS.UPDATE_GOAL, payload: updatedGoal })
      
      return updatedGoal
    } catch (error) {
      const mensagem = error.message
      dispatch({ type: GOALS_ACTIONS.SET_ERROR, payload: mensagem })
      throw new Error(mensagem)
    }
  }

  // Função para obter progresso da meta
  const getGoalProgress = (goal) => {
    const percentage = (goal.currentAmount / goal.targetAmount) * 100
    const remaining = goal.targetAmount - goal.currentAmount
    const daysLeft = goal.targetDate 
      ? Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24))
      : null
    
    return {
      percentage: Math.min(percentage, 100),
      remaining: Math.max(remaining, 0),
      daysLeft,
      isCompleted: goal.currentAmount >= goal.targetAmount,
      isOverdue: daysLeft !== null && daysLeft < 0 && goal.status === GOAL_STATUS.ACTIVE
    }
  }

  // Função para obter metas com progresso
  const getGoalsWithProgress = () => {
    return state.goals.map(goal => ({
      ...goal,
      progress: getGoalProgress(goal)
    }))
  }

  // Função para obter total economizado
  const getTotalSaved = () => {
    return state.goals
      .filter(goal => goal.status === GOAL_STATUS.ACTIVE)
      .reduce((total, goal) => total + goal.currentAmount, 0)
  }

  // Função para obter total de metas
  const getTotalTargeted = () => {
    return state.goals
      .filter(goal => goal.status === GOAL_STATUS.ACTIVE)
      .reduce((total, goal) => total + goal.targetAmount, 0)
  }

  // Função para limpar erros
  const clearError = () => {
    dispatch({ type: GOALS_ACTIONS.CLEAR_ERROR })
  }

  // Valor do contexto
  const value = {
    ...state,
    addGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    getGoalProgress,
    getGoalsWithProgress,
    getTotalSaved,
    getTotalTargeted,
    clearError,
    GOAL_TYPES,
    GOAL_STATUS
  }

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  )
}

// Hook personalizado para usar o contexto
export function useGoals() {
  const context = useContext(GoalsContext)
  
  if (!context) {
    throw new Error('useGoals deve ser usado dentro de um GoalsProvider')
  }
  
  return context
}

export default GoalsContext
