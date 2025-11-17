import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext.jsx";
import { useAccounts } from "./AccountsContext.jsx";
import api from "../services/api";

const TransactionsContext = createContext();

// Tipos de transação
export const TRANSACTION_TYPES = {
  INCOME: "income", // Receita
  EXPENSE: "expense", // Despesa
};

// Categorias predefinidas
export const CATEGORIES = {
  // Receitas
  INCOME: {
    SALARY: { id: "salary", name: "Salário", icon: "💼", color: "#2ecc71" },
    FREELANCE: {
      id: "freelance",
      name: "Freelance",
      icon: "💻",
      color: "#3498db",
    },
    INVESTMENT: {
      id: "investment",
      name: "Investimentos",
      icon: "📈",
      color: "#9b59b6",
    },
    GIFT: { id: "gift", name: "Presente", icon: "🎁", color: "#e74c3c" },
    OTHER_INCOME: {
      id: "other_income",
      name: "Outros",
      icon: "💰",
      color: "#95a5a6",
    },
  },
  // Despesas
  EXPENSE: {
    FOOD: { id: "food", name: "Alimentação", icon: "🍽️", color: "#e67e22" },
    TRANSPORT: {
      id: "transport",
      name: "Transporte",
      icon: "🚗",
      color: "#3498db",
    },
    HEALTH: { id: "health", name: "Saúde", icon: "🏥", color: "#e74c3c" },
    EDUCATION: {
      id: "education",
      name: "Educação",
      icon: "📚",
      color: "#9b59b6",
    },
    ENTERTAINMENT: {
      id: "entertainment",
      name: "Lazer",
      icon: "🎬",
      color: "#f39c12",
    },
    SHOPPING: { id: "shopping", name: "Compras", icon: "🛍️", color: "#e91e63" },
    BILLS: { id: "bills", name: "Contas", icon: "📄", color: "#34495e" },
    RENT: { id: "rent", name: "Aluguel", icon: "🏠", color: "#16a085" },
    OTHER_EXPENSE: {
      id: "other_expense",
      name: "Outros",
      icon: "💸",
      color: "#95a5a6",
    },
  },
};

// Status de transação
export const TRANSACTION_STATUS = {
  COMPLETED: "completed",
  PENDING: "pending",
  CANCELLED: "cancelled",
};

// Ações do reducer
const TRANSACTIONS_ACTIONS = {
  LOAD_TRANSACTIONS: "LOAD_TRANSACTIONS",
  ADD_TRANSACTION: "ADD_TRANSACTION",
  UPDATE_TRANSACTION: "UPDATE_TRANSACTION",
  DELETE_TRANSACTION: "DELETE_TRANSACTION",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Estado inicial
const initialState = {
  transactions: [],
  isLoading: false,
  error: null,
};

// Reducer para gerenciar transações
function transactionsReducer(state, action) {
  switch (action.type) {
    case TRANSACTIONS_ACTIONS.LOAD_TRANSACTIONS:
      return {
        ...state,
        transactions: action.payload,
        isLoading: false,
        error: null,
      };

    case TRANSACTIONS_ACTIONS.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        isLoading: false,
        error: null,
      };

    case TRANSACTIONS_ACTIONS.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload.id ? action.payload : transaction
        ),
        isLoading: false,
        error: null,
      };

    case TRANSACTIONS_ACTIONS.DELETE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.filter(
          (transaction) => transaction.id !== action.payload
        ),
        isLoading: false,
        error: null,
      };

    case TRANSACTIONS_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case TRANSACTIONS_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case TRANSACTIONS_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Helper para extrair mensagem de erro da API
const getErrorMessage = (error) => {
  if (error?.response?.data?.mensagem) return error.response.data.mensagem;
  if (error?.response?.data?.message) return error.response.data.message;
  return error?.message || "Erro ao processar a requisição.";
};

// Provider do contexto
export function TransactionsProvider({ children }) {
  const [state, dispatch] = useReducer(transactionsReducer, initialState);
  const { user } = useAuth();
  const { loadAccounts } = useAccounts();

  // Carregar transações do backend
  const loadTransactions = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    dispatch({ type: TRANSACTIONS_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await api.get("/transacoes");
      const raw = response.data.dados || [];

      // 🔢 garantir amount numérico
      const transactions = raw.map((t) => ({
        ...t,
        amount: Number(t.amount) || 0,
      }));

      dispatch({
        type: TRANSACTIONS_ACTIONS.LOAD_TRANSACTIONS,
        payload: transactions,
      });
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      dispatch({
        type: TRANSACTIONS_ACTIONS.SET_ERROR,
        payload: getErrorMessage(error),
      });
    }
  }, [user?.id]);

  // Carrega transações quando o usuário muda
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Adicionar transação
  const addTransaction = useCallback(
    async (transactionData) => {
      try {
        dispatch({ type: TRANSACTIONS_ACTIONS.SET_LOADING, payload: true });

        const response = await api.post("/transacoes", transactionData);
        const newTransaction = response.data.dados;
        const normalizedNew = {
          ...newTransaction,
          amount: Number(newTransaction.amount) || 0,
        };
        loadAccounts();
        dispatch({
          type: TRANSACTIONS_ACTIONS.ADD_TRANSACTION,
          payload: normalizedNew,
        });
        return normalizedNew;
      } catch (error) {
        const mensagem = getErrorMessage(error);
        dispatch({
          type: TRANSACTIONS_ACTIONS.SET_ERROR,
          payload: mensagem,
        });
        throw new Error(mensagem);
      }
    },
    [loadAccounts]
  );

  // Atualizar transação
  const updateTransaction = useCallback(
    async (transactionId, updates) => {
      try {
        dispatch({ type: TRANSACTIONS_ACTIONS.SET_LOADING, payload: true });

        const response = await api.put(`/transacoes/${transactionId}`, updates);
        const updatedTransaction = response.data.dados;
        const normalizedUpdated = {
          ...updatedTransaction,
          amount: Number(updatedTransaction.amount) || 0,
        };
        loadAccounts();
        dispatch({
          type: TRANSACTIONS_ACTIONS.UPDATE_TRANSACTION,
          payload: normalizedUpdated,
        });
        return normalizedUpdated;
      } catch (error) {
        const mensagem = getErrorMessage(error);
        dispatch({
          type: TRANSACTIONS_ACTIONS.SET_ERROR,
          payload: mensagem,
        });
        throw new Error(mensagem);
      }
    },
    [loadAccounts]
  );

  // Deletar transação
  const deleteTransaction = useCallback(
    async (transactionId) => {
      try {
        dispatch({ type: TRANSACTIONS_ACTIONS.SET_LOADING, payload: true });

        await api.delete(`/transacoes/${transactionId}`);

        // Backend já cuida do saldo; recarregamos as contas
        loadAccounts();

        dispatch({
          type: TRANSACTIONS_ACTIONS.DELETE_TRANSACTION,
          payload: transactionId,
        });
      } catch (error) {
        const mensagem = getErrorMessage(error);
        dispatch({
          type: TRANSACTIONS_ACTIONS.SET_ERROR,
          payload: mensagem,
        });
        throw new Error(mensagem);
      }
    },
    [loadAccounts]
  );

  // Transações por período
  const getTransactionsByPeriod = useCallback(
    (startDate, endDate) => {
      if (!startDate || !endDate) return state.transactions;

      return state.transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    },
    [state.transactions]
  );

  // Transações por categoria
  const getTransactionsByCategory = useCallback(
    (categoryId) => {
      return state.transactions.filter(
        (transaction) => transaction.category.id === categoryId
      );
    },
    [state.transactions]
  );

  // Transações por conta
  const getTransactionsByAccount = useCallback(
    (accountId) => {
      return state.transactions.filter(
        (transaction) => transaction.accountId === accountId
      );
    },
    [state.transactions]
  );

  // Total de receitas
  const getTotalIncome = (startDate, endDate) => {
    const transactions =
      startDate && endDate
        ? getTransactionsByPeriod(startDate, endDate)
        : state.transactions;

    return transactions
      .filter(
        (t) =>
          t.type === TRANSACTION_TYPES.INCOME &&
          t.status === TRANSACTION_STATUS.COMPLETED
      )
      .reduce((total, t) => total + (Number(t.amount) || 0), 0);
  };

  // Total de despesas
  const getTotalExpenses = (startDate, endDate) => {
    const transactions =
      startDate && endDate
        ? getTransactionsByPeriod(startDate, endDate)
        : state.transactions;

    return transactions
      .filter(
        (t) =>
          t.type === TRANSACTION_TYPES.EXPENSE &&
          t.status === TRANSACTION_STATUS.COMPLETED
      )
      .reduce((total, t) => total + (Number(t.amount) || 0), 0);
  };

  // Limpar erros
  const clearError = useCallback(() => {
    dispatch({ type: TRANSACTIONS_ACTIONS.CLEAR_ERROR });
  }, []);

  // Valor do contexto
  const value = {
    ...state,
    loadTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByPeriod,
    getTransactionsByCategory,
    getTransactionsByAccount,
    getTotalIncome,
    getTotalExpenses,
    clearError,
    TRANSACTION_TYPES,
    CATEGORIES,
    TRANSACTION_STATUS,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export function useTransactions() {
  const context = useContext(TransactionsContext);

  if (!context) {
    throw new Error(
      "useTransactions deve ser usado dentro de um TransactionsProvider"
    );
  }

  return context;
}

export default TransactionsContext;
