import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext.jsx";
import { useTransactions, TRANSACTION_TYPES } from "./TransactionsContext.jsx";
import api from "../services/api";

const BudgetsContext = createContext();

// Status do orçamento
export const BUDGET_STATUS = {
  ON_TRACK: "on_track", // Dentro do orçamento
  WARNING: "warning", // Próximo do limite (80-100%)
  EXCEEDED: "exceeded", // Ultrapassou o limite
};

// Ações do reducer
const BUDGETS_ACTIONS = {
  LOAD_BUDGETS: "LOAD_BUDGETS",
  ADD_BUDGET: "ADD_BUDGET",
  UPDATE_BUDGET: "UPDATE_BUDGET",
  DELETE_BUDGET: "DELETE_BUDGET",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Estado inicial
const initialState = {
  budgets: [],
  isLoading: false,
  error: null,
};

// Reducer para gerenciar orçamentos
function budgetsReducer(state, action) {
  switch (action.type) {
    case BUDGETS_ACTIONS.LOAD_BUDGETS:
      return {
        ...state,
        budgets: action.payload,
        isLoading: false,
        error: null,
      };

    case BUDGETS_ACTIONS.ADD_BUDGET:
      return {
        ...state,
        budgets: [...state.budgets, action.payload],
        isLoading: false,
        error: null,
      };

    case BUDGETS_ACTIONS.UPDATE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.map((budget) =>
          budget.id === action.payload.id ? action.payload : budget
        ),
        isLoading: false,
        error: null,
      };

    case BUDGETS_ACTIONS.DELETE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.filter((budget) => budget.id !== action.payload),
        isLoading: false,
        error: null,
      };

    case BUDGETS_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case BUDGETS_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case BUDGETS_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Helper para mensagem de erro da API
const getErrorMessage = (error) => {
  if (error?.response?.data?.mensagem) return error.response.data.mensagem;
  if (error?.response?.data?.message) return error.response.data.message;
  return error?.message || "Erro ao processar a requisição.";
};

// Provider do contexto
export function BudgetsProvider({ children }) {
  const [state, dispatch] = useReducer(budgetsReducer, initialState);
  const { user } = useAuth();
  const { getTransactionsByCategory } = useTransactions();

  // Carregar orçamentos do backend
  const loadBudgets = useCallback(async () => {
    if (user?.id) {
      dispatch({ type: BUDGETS_ACTIONS.SET_LOADING, payload: true });

      try {
        const response = await api.get("/orcamentos");

        const budgets = response.data.dados || [];

        // (por enquanto só despacha do jeito que veio)
        dispatch({ type: BUDGETS_ACTIONS.LOAD_BUDGETS, payload: budgets });

        
      } catch (error) {
        console.error("Erro ao carregar orçamentos:", error);
        dispatch({ type: BUDGETS_ACTIONS.SET_ERROR, payload: error.message });
      }
    }
  }, [user?.id]);

  // Carrega orçamentos quando o usuário muda
  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  // Função para adicionar orçamento
  const addBudget = useCallback(async (budgetData) => {
    try {
      dispatch({ type: BUDGETS_ACTIONS.SET_LOADING, payload: true });

      const response = await api.post("/orcamentos", budgetData);
      const newBudget = response.data.dados;

      dispatch({ type: BUDGETS_ACTIONS.ADD_BUDGET, payload: newBudget });
      return newBudget;
    } catch (error) {
      const mensagem = getErrorMessage(error);
      dispatch({ type: BUDGETS_ACTIONS.SET_ERROR, payload: mensagem });
      throw new Error(mensagem);
    }
  }, []);

  // Função para atualizar orçamento
  const updateBudget = useCallback(async (budgetId, updates) => {
    try {
      dispatch({ type: BUDGETS_ACTIONS.SET_LOADING, payload: true });

      const response = await api.put(`/orcamentos/${budgetId}`, updates);
      const updatedBudget = response.data.dados;

      dispatch({ type: BUDGETS_ACTIONS.UPDATE_BUDGET, payload: updatedBudget });
      return updatedBudget;
    } catch (error) {
      const mensagem = getErrorMessage(error);
      dispatch({ type: BUDGETS_ACTIONS.SET_ERROR, payload: mensagem });
      throw new Error(mensagem);
    }
  }, []);

  // Função para deletar orçamento
  const deleteBudget = useCallback(async (budgetId) => {
    try {
      dispatch({ type: BUDGETS_ACTIONS.SET_LOADING, payload: true });

      await api.delete(`/orcamentos/${budgetId}`);

      dispatch({ type: BUDGETS_ACTIONS.DELETE_BUDGET, payload: budgetId });
    } catch (error) {
      const mensagem = getErrorMessage(error);
      dispatch({ type: BUDGETS_ACTIONS.SET_ERROR, payload: mensagem });
      throw new Error(mensagem);
    }
  }, []);

  // Função para obter gastos de uma categoria no período
  const getCategorySpent = useCallback(
    (categoryId, year, month) => {
      if (!categoryId || !year || !month) {
        return 0;
      }

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const transactions = getTransactionsByCategory(categoryId) || [];

      return transactions
        .filter((transaction) => {
          const transactionDate = new Date(transaction.date);
          return (
            transactionDate >= startDate &&
            transactionDate <= endDate &&
            transaction.type === TRANSACTION_TYPES.EXPENSE // Apenas despesas
          );
        })
        .reduce((total, transaction) => total + transaction.amount, 0);
    },
    [getTransactionsByCategory]
  );

  // Função para obter status do orçamento
  const getBudgetStatus = useCallback(
    (budget) => {
      if (!budget || !budget.amount || budget.amount <= 0) {
        return BUDGET_STATUS.ON_TRACK;
      }

      const spent = getCategorySpent(
        budget.categoryId,
        budget.year,
        budget.month
      );
      const percentage = (spent / budget.amount) * 100;

      if (percentage >= 100) {
        return BUDGET_STATUS.EXCEEDED;
      }
      if (percentage >= 80) {
        return BUDGET_STATUS.WARNING;
      }
      return BUDGET_STATUS.ON_TRACK;
    },
    [getCategorySpent]
  );

  // Função para obter orçamentos com dados de gastos
  const getBudgetsWithSpent = useCallback(() => {
    return state.budgets.map((budget) => {
      const spent = getCategorySpent(
        budget.categoryId,
        budget.year,
        budget.month
      );
      const remaining = budget.amount - spent;
      const percentage =
        budget.amount && budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const status = getBudgetStatus(budget);

      return {
        ...budget,
        spent,
        remaining,
        percentage: Math.min(percentage, 100),
        status,
      };
    });
  }, [state.budgets, getCategorySpent, getBudgetStatus]);

  // Função para obter total orçado
  const getTotalBudgeted = useCallback(
    (year, month) => {
      return state.budgets
        .filter(
          (budget) =>
            budget.year === year && budget.month === month && budget.isActive
        )
        .reduce((total, budget) => total + budget.amount, 0);
    },
    [state.budgets]
  );

  // Função para obter total gasto
  const getTotalSpent = useCallback(
    (year, month) => {
      return state.budgets
        .filter(
          (budget) =>
            budget.year === year && budget.month === month && budget.isActive
        )
        .reduce((total, budget) => {
          const spent = getCategorySpent(
            budget.categoryId,
            budget.year,
            budget.month
          );
          return total + spent;
        }, 0);
    },
    [state.budgets, getCategorySpent]
  );

  // Função para limpar erros
  const clearError = useCallback(() => {
    dispatch({ type: BUDGETS_ACTIONS.CLEAR_ERROR });
  }, []);

  // Valor do contexto
  const value = {
    ...state,
    addBudget,
    updateBudget,
    deleteBudget,
    getCategorySpent,
    getBudgetStatus,
    getBudgetsWithSpent,
    getTotalBudgeted,
    getTotalSpent,
    clearError,
    BUDGET_STATUS,
  };

  return (
    <BudgetsContext.Provider value={value}>{children}</BudgetsContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export function useBudgets() {
  const context = useContext(BudgetsContext);

  if (!context) {
    throw new Error("useBudgets deve ser usado dentro de um BudgetsProvider");
  }

  return context;
}

export default BudgetsContext;
