import axios from 'axios';

// URL base da API
// Assume que a variável de ambiente VITE_API_URL está configurada no .env do frontend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('financas_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratamento de erro 401 (Não autorizado) - Expira token e redireciona
    if (error.response?.status === 401) {
      localStorage.removeItem('financas_token');
      localStorage.removeItem('financas_user');
      // Redirecionamento deve ser tratado pelo frontend, mas limpamos o storage
      // window.location.href = '/login'; 
    }
    
    // Retorna o erro com a mensagem do backend, se disponível
    const errorMessage = error.response?.data?.mensagem || error.message;
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
