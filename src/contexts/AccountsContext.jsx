import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext.jsx";
import api from "../services/api";

const AccountsContext = createContext();

// Tipos de conta disponíveis
export const ACCOUNT_TYPES = {
  CHECKING: "checking", // Conta corrente
  SAVINGS: "savings", // Poupança
  CREDIT: "credit", // Cartão de crédito
  CASH: "cash", // Dinheiro
  INVESTMENT: "investment", // Investimentos
};

// Ações do reducer
const ACCOUNTS_ACTIONS = {
  LOAD_ACCOUNTS: "LOAD_ACCOUNTS",
  ADD_ACCOUNT: "ADD_ACCOUNT",
  UPDATE_ACCOUNT: "UPDATE_ACCOUNT",
  DELETE_ACCOUNT: "DELETE_ACCOUNT",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Estado inicial
const initialState = {
  accounts: [],
  isLoading: false,
  error: null,
};

// Reducer para gerenciar contas
function accountsReducer(state, action) {
  switch (action.type) {
    case ACCOUNTS_ACTIONS.LOAD_ACCOUNTS:
      return {
        ...state,
        accounts: action.payload,
        isLoading: false,
        error: null,
      };

    case ACCOUNTS_ACTIONS.ADD_ACCOUNT:
      return {
        ...state,
        accounts: [...state.accounts, action.payload],
        isLoading: false,
        error: null,
      };

    case ACCOUNTS_ACTIONS.UPDATE_ACCOUNT:
      return {
        ...state,
        accounts: state.accounts.map((account) =>
          account.id === action.payload.id ? action.payload : account
        ),
        isLoading: false,
        error: null,
      };

    case ACCOUNTS_ACTIONS.DELETE_ACCOUNT:
      return {
        ...state,
        accounts: state.accounts.filter(
          (account) => account.id !== action.payload
        ),
        isLoading: false,
        error: null,
      };

    case ACCOUNTS_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case ACCOUNTS_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case ACCOUNTS_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// (Opcional) helpers de localStorage — mantidos caso queira usar depois
const getStorageKey = (userId) => `financas_accounts_${userId}`;

const loadAccountsFromStorage = (userId) => {
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Erro ao carregar contas do localStorage:", error);
    return [];
  }
};

const saveAccountsToStorage = (userId, accounts) => {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(accounts));
  } catch (error) {
    console.error("Erro ao salvar contas no localStorage:", error);
  }
};

// Provider do contexto
export function AccountsProvider({ children }) {
  const [state, dispatch] = useReducer(accountsReducer, initialState);
  const { user } = useAuth();

  // Helper para extrair mensagem de erro da API (Axios, etc.)
  const getErrorMessage = (error) => {
    if (error?.response?.data?.mensagem) return error.response.data.mensagem;
    if (error?.response?.data?.message) return error.response.data.message;
    return error?.message || "Erro ao processar a operação.";
  };

  // Função para adicionar conta
  // addAccount
  const addAccount = async (accountData) => {
    try {
      dispatch({ type: ACCOUNTS_ACTIONS.SET_LOADING, payload: true });

      const response = await api.post("/contas", accountData);
      const newAccount = response.data.dados;

      const normalized = {
        ...newAccount,
        balance: Number(newAccount.balance) || 0,
        creditLimit:
          newAccount.creditLimit !== undefined &&
          newAccount.creditLimit !== null
            ? Number(newAccount.creditLimit)
            : 0,
      };

      dispatch({
        type: ACCOUNTS_ACTIONS.ADD_ACCOUNT,
        payload: normalized,
      });
      return normalized;
    } catch (error) {
      const mensagem = error.message;
      dispatch({ type: ACCOUNTS_ACTIONS.SET_ERROR, payload: mensagem });
      throw new Error(mensagem);
    }
  };

  // Função para atualizar conta
  // updateAccount
  const updateAccount = async (accountId, updates) => {
    try {
      dispatch({ type: ACCOUNTS_ACTIONS.SET_LOADING, payload: true });

      const response = await api.put(`/contas/${accountId}`, updates);
      const updatedAccount = response.data.dados;

      const normalized = {
        ...updatedAccount,
        balance: Number(updatedAccount.balance) || 0,
        creditLimit:
          updatedAccount.creditLimit !== undefined &&
          updatedAccount.creditLimit !== null
            ? Number(updatedAccount.creditLimit)
            : 0,
      };

      dispatch({
        type: ACCOUNTS_ACTIONS.UPDATE_ACCOUNT,
        payload: normalized,
      });
      return normalized;
    } catch (error) {
      const mensagem = error.message;
      dispatch({ type: ACCOUNTS_ACTIONS.SET_ERROR, payload: mensagem });
      throw new Error(mensagem);
    }
  };

  // Função para deletar conta
  const deleteAccount = useCallback(
    async (accountId) => {
      try {
        dispatch({ type: ACCOUNTS_ACTIONS.SET_LOADING, payload: true });

        await api.delete(`/contas/${accountId}`);

        dispatch({ type: ACCOUNTS_ACTIONS.DELETE_ACCOUNT, payload: accountId });

        if (user?.id) {
          const updatedAccounts = state.accounts.filter(
            (acc) => acc.id !== accountId
          );
          saveAccountsToStorage(user.id, updatedAccounts);
        }
      } catch (error) {
        const mensagem = getErrorMessage(error);
        dispatch({ type: ACCOUNTS_ACTIONS.SET_ERROR, payload: mensagem });
        throw new Error(mensagem);
      }
    },
    [state.accounts, user?.id]
  );

  // Função para obter conta por ID
  const getAccountById = useCallback(
    (accountId) => {
      return state.accounts.find((account) => account.id === accountId);
    },
    [state.accounts]
  );

  // Função para obter contas por tipo
  const getAccountsByType = useCallback(
    (type) => {
      return state.accounts.filter(
        (account) => account.type === type && account.isActive
      );
    },
    [state.accounts]
  );

  // Função para calcular saldo total
  const getTotalBalance = () => {
    return state.accounts
      .filter(
        (account) => account.isActive && account.type !== ACCOUNT_TYPES.CREDIT
      )
      .reduce((total, account) => total + (Number(account.balance) || 0), 0);
  };

  // Função para obter total de dívidas (cartões de crédito)
  const getTotalDebt = () => {
  return Math.abs(
    state.accounts
      .filter(
        (account) =>
          account.isActive &&
          account.type === ACCOUNT_TYPES.CREDIT &&
          Number(account.balance) < 0
      )
      .reduce(
        (total, account) => total + (Number(account.balance) || 0),
        0
      )
  )
}

  // Função para limpar erros
  const clearError = useCallback(() => {
    dispatch({ type: ACCOUNTS_ACTIONS.CLEAR_ERROR });
  }, []);

  // Função para carregar contas (exposta para uso externo)
  const loadAccounts = useCallback(async () => {
    if (!user?.id) {
      // Se não há usuário logado, limpa o estado
      dispatch({ type: ACCOUNTS_ACTIONS.LOAD_ACCOUNTS, payload: [] });
      return;
    }

    dispatch({ type: ACCOUNTS_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await api.get("/contas");
      const raw = response.data.dados || [];

      const accounts = raw.map((acc) => ({
        ...acc,
        balance: Number(acc.balance) || 0,
        // se existir creditLimit no modelo
        creditLimit:
          acc.creditLimit !== undefined && acc.creditLimit !== null
            ? Number(acc.creditLimit)
            : 0,
      }));

      dispatch({
        type: ACCOUNTS_ACTIONS.LOAD_ACCOUNTS,
        payload: accounts,
      });
      saveAccountsToStorage(user.id, accounts);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
      dispatch({
        type: ACCOUNTS_ACTIONS.SET_ERROR,
        payload: getErrorMessage(error),
      });
    }
  }, [user?.id]);

  // Carrega contas sempre que o usuário mudar
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Valor do contexto
  const value = {
    ...state,
    loadAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
    getAccountById,
    getAccountsByType,
    getTotalBalance,
    getTotalDebt,
    clearError,
    ACCOUNT_TYPES,
  };

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export function useAccounts() {
  const context = useContext(AccountsContext);

  if (!context) {
    throw new Error("useAccounts deve ser usado dentro de um AccountsProvider");
  }

  return context;
}

export default AccountsContext;
