# Explicação Detalhada do Código - Aplicativo de Finanças Pessoais

**Autor:** Manus AI  
**Data:** Outubro de 2025  
**Versão:** 1.0.0

## Sumário

Este documento fornece uma explicação detalhada e didática de como o código do aplicativo de finanças pessoais foi implementado, incluindo conceitos técnicos, padrões de desenvolvimento e decisões arquiteturais.

## Arquitetura Geral do Sistema

### Estrutura de Componentes React

O aplicativo segue uma **arquitetura baseada em componentes** onde cada funcionalidade é encapsulada em componentes reutilizáveis e especializados.

```javascript
// Exemplo de componente funcional moderno
import { useState, useEffect } from 'react'

function ComponenteExemplo({ propriedade1, propriedade2 }) {
  // Estado local do componente
  const [estado, setEstado] = useState(valorInicial)
  
  // Efeito colateral (lifecycle)
  useEffect(() => {
    // Lógica executada quando o componente monta ou atualiza
    return () => {
      // Cleanup quando o componente desmonta
    }
  }, [dependencias])
  
  // Renderização do componente
  return (
    <div className="classes-tailwind">
      {/* JSX do componente */}
    </div>
  )
}
```

### Gerenciamento de Estado com Context API

O sistema utiliza a **Context API** do React para gerenciar estado global, evitando prop drilling e centralizando a lógica de negócio.

```javascript
// Exemplo: AuthContext.jsx
import { createContext, useContext, useReducer } from 'react'

// 1. Criação do contexto
const AuthContext = createContext()

// 2. Reducer para gerenciar ações
function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false
      }
    default:
      return state
  }
}

// 3. Provider que encapsula a lógica
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  
  // Funções que manipulam o estado
  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const user = await authenticateUser(credentials)
      dispatch({ type: 'LOGIN_SUCCESS', payload: user })
      localStorage.setItem('user', JSON.stringify(user))
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message })
    }
  }
  
  // Valor fornecido aos componentes filhos
  const value = {
    ...state,
    login,
    logout: () => dispatch({ type: 'LOGOUT' })
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 4. Hook customizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
```

## Sistema de Autenticação

### Implementação do Login

O sistema de autenticação utiliza **React Hook Form** para validação e **localStorage** para persistência.

```javascript
// LoginForm.jsx
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext.jsx'

export function LoginForm({ onSuccess }) {
  const { login, isLoading, error } = useAuth()
  
  // Configuração do formulário com validação
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  })
  
  // Função de submissão do formulário
  const onSubmit = async (data) => {
    try {
      await login(data)
      onSuccess?.() // Callback opcional de sucesso
    } catch (err) {
      // Erro já tratado no contexto
      console.error('Erro no login:', err)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Campo de email com validação */}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email', {
            required: 'Email é obrigatório',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email inválido'
            }
          })}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>
      
      {/* Campo de senha */}
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          {...register('password', {
            required: 'Senha é obrigatória',
            minLength: {
              value: 6,
              message: 'Senha deve ter pelo menos 6 caracteres'
            }
          })}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>
      
      {/* Exibição de erro */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Botão de submissão */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </Button>
    </form>
  )
}
```

### Proteção de Rotas

O componente `ProtectedRoute` garante que apenas usuários autenticados acessem certas páginas.

```javascript
// ProtectedRoute.jsx
import { useAuth } from '../../contexts/AuthContext.jsx'
import { AuthPage } from './AuthPage.jsx'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  
  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  
  // Redireciona para login se não autenticado
  if (!isAuthenticated) {
    return <AuthPage />
  }
  
  // Renderiza o conteúdo protegido
  return children
}
```

## Sistema de Transações

### Contexto de Transações

O `TransactionsContext` gerencia todas as operações CRUD de transações.

```javascript
// TransactionsContext.jsx
import { createContext, useContext, useReducer, useMemo } from 'react'

// Tipos de transação
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
}

// Categorias pré-definidas
export const CATEGORIES = {
  INCOME: {
    SALARY: { id: 'salary', name: 'Salário', icon: '💼', color: '#10b981' },
    FREELANCE: { id: 'freelance', name: 'Freelance', icon: '💻', color: '#3b82f6' }
  },
  EXPENSE: {
    FOOD: { id: 'food', name: 'Alimentação', icon: '🍽️', color: '#f59e0b' },
    TRANSPORT: { id: 'transport', name: 'Transporte', icon: '🚗', color: '#ef4444' }
  }
}

// Estado inicial
const initialState = {
  transactions: [],
  isLoading: false,
  error: null
}

// Reducer para gerenciar ações
function transactionsReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    
    case 'LOAD_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
        isLoading: false,
        error: null
      }
    
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        isLoading: false,
        error: null
      }
    
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
        isLoading: false,
        error: null
      }
    
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
        isLoading: false,
        error: null
      }
    
    default:
      return state
  }
}

export function TransactionsProvider({ children }) {
  const [state, dispatch] = useReducer(transactionsReducer, initialState)
  
  // Carregar transações do localStorage
  useEffect(() => {
    const loadTransactions = () => {
      try {
        const stored = localStorage.getItem('transactions')
        const transactions = stored ? JSON.parse(stored) : mockTransactions
        dispatch({ type: 'LOAD_TRANSACTIONS', payload: transactions })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar transações' })
      }
    }
    
    loadTransactions()
  }, [])
  
  // Salvar no localStorage sempre que transações mudarem
  useEffect(() => {
    if (state.transactions.length > 0) {
      localStorage.setItem('transactions', JSON.stringify(state.transactions))
    }
  }, [state.transactions])
  
  // Função para adicionar transação
  const addTransaction = async (transactionData) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const newTransaction = {
        id: generateId(),
        ...transactionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction })
      return newTransaction
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      throw error
    }
  }
  
  // Funções de cálculo usando useMemo para otimização
  const getTotalIncome = useMemo(() => {
    return (startDate, endDate) => {
      return state.transactions
        .filter(t => {
          const tDate = new Date(t.date)
          return t.type === TRANSACTION_TYPES.INCOME &&
                 t.status === 'completed' &&
                 tDate >= startDate &&
                 tDate <= endDate
        })
        .reduce((sum, t) => sum + t.amount, 0)
    }
  }, [state.transactions])
  
  const getTotalExpenses = useMemo(() => {
    return (startDate, endDate) => {
      return state.transactions
        .filter(t => {
          const tDate = new Date(t.date)
          return t.type === TRANSACTION_TYPES.EXPENSE &&
                 t.status === 'completed' &&
                 tDate >= startDate &&
                 tDate <= endDate
        })
        .reduce((sum, t) => sum + t.amount, 0)
    }
  }, [state.transactions])
  
  // Valor do contexto
  const value = {
    ...state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTotalIncome,
    getTotalExpenses,
    clearError: () => dispatch({ type: 'SET_ERROR', payload: null })
  }
  
  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  )
}

// Hook customizado
export function useTransactions() {
  const context = useContext(TransactionsContext)
  if (!context) {
    throw new Error('useTransactions deve ser usado dentro de TransactionsProvider')
  }
  return context
}
```

### Formulário de Transação

O formulário utiliza validação avançada e integração com o contexto.

```javascript
// TransactionForm.jsx
import { useForm, Controller } from 'react-hook-form'
import { useTransactions, TRANSACTION_TYPES, CATEGORIES } from '../../contexts/TransactionsContext.jsx'
import { useAccounts } from '../../contexts/AccountsContext.jsx'

export function TransactionForm({ transaction, onSave, onCancel }) {
  const { addTransaction, updateTransaction, isLoading } = useTransactions()
  const { accounts } = useAccounts()
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      description: transaction?.description || '',
      amount: transaction?.amount || '',
      type: transaction?.type || TRANSACTION_TYPES.EXPENSE,
      categoryId: transaction?.category?.id || '',
      accountId: transaction?.accountId || '',
      date: transaction?.date || new Date().toISOString().split('T')[0],
      notes: transaction?.notes || ''
    }
  })
  
  // Observar mudanças no tipo para filtrar categorias
  const watchedType = watch('type')
  const watchedAmount = watch('amount')
  
  // Obter categorias baseadas no tipo
  const getAvailableCategories = () => {
    return watchedType === TRANSACTION_TYPES.INCOME
      ? Object.values(CATEGORIES.INCOME)
      : Object.values(CATEGORIES.EXPENSE)
  }
  
  // Submissão do formulário
  const onSubmit = async (data) => {
    try {
      // Encontrar categoria selecionada
      const selectedCategory = getAvailableCategories()
        .find(cat => cat.id === data.categoryId)
      
      if (!selectedCategory) {
        throw new Error('Categoria não encontrada')
      }
      
      // Preparar dados da transação
      const transactionData = {
        ...data,
        amount: parseFloat(data.amount),
        category: selectedCategory,
        status: 'completed'
      }
      
      // Adicionar ou atualizar
      if (transaction) {
        await updateTransaction(transaction.id, transactionData)
      } else {
        await addTransaction(transactionData)
      }
      
      onSave?.()
    } catch (error) {
      console.error('Erro ao salvar transação:', error)
    }
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {transaction ? 'Editar Transação' : 'Nova Transação'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo de transação */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Transação</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TRANSACTION_TYPES.INCOME}>
                        <div className="flex items-center space-x-2">
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                          <span>Receita</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={TRANSACTION_TYPES.EXPENSE}>
                        <div className="flex items-center space-x-2">
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                          <span>Despesa</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            {/* Valor */}
            <div>
              <Label htmlFor="amount">Valor *</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-muted-foreground">R$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="pl-10"
                  {...register('amount', {
                    required: 'Valor é obrigatório',
                    min: { value: 0.01, message: 'Valor deve ser maior que zero' }
                  })}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount.message}</p>
              )}
              {watchedAmount && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(parseFloat(watchedAmount))}
                </p>
              )}
            </div>
          </div>
          
          {/* Descrição */}
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              placeholder="Ex: Supermercado, Salário, Combustível..."
              {...register('description', {
                required: 'Descrição é obrigatória',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
              })}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
          
          {/* Categoria */}
          <div>
            <Label>Categoria *</Label>
            <Controller
              name="categoryId"
              control={control}
              rules={{ required: 'Categoria é obrigatória' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableCategories().map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-sm text-red-600">{errors.categoryId.message}</p>
            )}
          </div>
          
          {/* Conta */}
          <div>
            <Label>Conta *</Label>
            <Controller
              name="accountId"
              control={control}
              rules={{ required: 'Conta é obrigatória' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: account.color }}
                          />
                          <span>{account.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.accountId && (
              <p className="text-sm text-red-600">{errors.accountId.message}</p>
            )}
          </div>
          
          {/* Data */}
          <div>
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              {...register('date', { required: 'Data é obrigatória' })}
            />
            {errors.date && (
              <p className="text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>
          
          {/* Observações */}
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Informações adicionais sobre a transação..."
              rows={3}
              {...register('notes')}
            />
          </div>
          
          {/* Botões */}
          <div className="flex space-x-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                transaction ? 'Atualizar' : 'Adicionar'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
```

## Sistema de Relatórios com Gráficos

### Implementação de Gráficos com Recharts

O sistema de relatórios utiliza a biblioteca **Recharts** para criar visualizações interativas.

```javascript
// ReportsDashboard.jsx
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ComposedChart
} from 'recharts'

export function ReportsDashboard() {
  // ... outros códigos ...
  
  // Dados processados para gráficos
  const monthlyTrendData = useMemo(() => {
    const months = eachMonthOfInterval({ start: startDate, end: endDate })
    
    return months.map(month => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)
      
      // Filtrar transações do mês
      const monthTransactions = filteredTransactions.filter(t => {
        const tDate = new Date(t.date)
        return tDate >= monthStart && tDate <= monthEnd
      })
      
      // Calcular totais
      const income = monthTransactions
        .filter(t => t.type === TRANSACTION_TYPES.INCOME)
        .reduce((sum, t) => sum + t.amount, 0)
      
      const expenses = monthTransactions
        .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0)
      
      return {
        month: format(month, 'MMM yyyy', { locale: ptBR }),
        receitas: income,
        despesas: expenses,
        saldo: income - expenses
      }
    })
  }, [filteredTransactions, startDate, endDate])
  
  // Gráfico de fluxo de caixa
  const FluxoCaixaChart = () => (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Fluxo de Caixa Mensal</CardTitle>
        <CardDescription>
          Evolução das receitas, despesas e saldo ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyTrendData}>
              {/* Grade de fundo */}
              <CartesianGrid strokeDasharray="3 3" />
              
              {/* Eixos */}
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
              
              {/* Tooltip personalizado */}
              <Tooltip 
                formatter={(value, name) => [formatCurrency(value), name]}
                labelFormatter={(label) => `Período: ${label}`}
              />
              
              {/* Legenda */}
              <Legend />
              
              {/* Áreas para receitas e despesas */}
              <Area 
                type="monotone" 
                dataKey="receitas" 
                stackId="1"
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.3}
                name="Receitas"
              />
              <Area 
                type="monotone" 
                dataKey="despesas" 
                stackId="2"
                stroke="#ef4444" 
                fill="#ef4444" 
                fillOpacity={0.3}
                name="Despesas"
              />
              
              {/* Linha do saldo */}
              <Line 
                type="monotone" 
                dataKey="saldo" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Saldo"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
  
  // Gráfico de pizza para categorias
  const CategoriasChart = () => (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoria</CardTitle>
        <CardDescription>
          Distribuição das despesas por categoria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Gasto']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
  
  return (
    <div className="space-y-6">
      {/* ... outros componentes ... */}
      
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FluxoCaixaChart />
          </div>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <CategoriasChart />
            {/* Lista de categorias */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

## Sistema de Orçamentos

### Lógica de Cálculo de Status

O sistema de orçamentos calcula automaticamente o status baseado no percentual gasto.

```javascript
// BudgetsContext.jsx
export const BUDGET_STATUS = {
  ON_TRACK: 'on_track',      // 0-70%
  WARNING: 'warning',        // 70-100%
  EXCEEDED: 'exceeded'       // >100%
}

export function BudgetsProvider({ children }) {
  // ... outros códigos ...
  
  // Função para calcular orçamentos com gastos
  const getBudgetsWithSpent = useMemo(() => {
    return () => {
      return state.budgets.map(budget => {
        // Calcular gastos da categoria no período do orçamento
        const spent = transactions
          .filter(t => {
            const tDate = new Date(t.date)
            const budgetDate = new Date(budget.year, budget.month - 1)
            const monthStart = startOfMonth(budgetDate)
            const monthEnd = endOfMonth(budgetDate)
            
            return t.type === TRANSACTION_TYPES.EXPENSE &&
                   t.category.id === budget.categoryId &&
                   t.status === 'completed' &&
                   tDate >= monthStart &&
                   tDate <= monthEnd
          })
          .reduce((sum, t) => sum + t.amount, 0)
        
        // Calcular percentual gasto
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
        
        // Determinar status baseado no percentual
        let status = BUDGET_STATUS.ON_TRACK
        if (percentage >= 100) {
          status = BUDGET_STATUS.EXCEEDED
        } else if (percentage >= 70) {
          status = BUDGET_STATUS.WARNING
        }
        
        return {
          ...budget,
          spent,
          percentage: Math.min(percentage, 100), // Limitar a 100% para UI
          actualPercentage: percentage, // Percentual real (pode ser >100%)
          remaining: Math.max(budget.amount - spent, 0),
          status
        }
      })
    }
  }, [state.budgets, transactions])
  
  // ... resto do código ...
}
```

### Componente de Visualização de Orçamentos

```javascript
// BudgetsList.jsx
export function BudgetsList() {
  const { getBudgetsWithSpent } = useBudgets()
  const budgetsWithSpent = getBudgetsWithSpent()
  
  // Função para obter cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case BUDGET_STATUS.ON_TRACK:
        return 'text-green-600'
      case BUDGET_STATUS.WARNING:
        return 'text-yellow-600'
      case BUDGET_STATUS.EXCEEDED:
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }
  
  // Função para obter cor da barra de progresso
  const getProgressColor = (status) => {
    switch (status) {
      case BUDGET_STATUS.ON_TRACK:
        return 'bg-green-500'
      case BUDGET_STATUS.WARNING:
        return 'bg-yellow-500'
      case BUDGET_STATUS.EXCEEDED:
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Orçado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(getTotalBudgeted())}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(getTotalSpent())}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Saldo Restante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(getTotalBudgeted() - getTotalSpent())}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Lista de orçamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Orçamentos por Categoria</CardTitle>
          <CardDescription>
            Acompanhe o progresso de cada categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {budgetsWithSpent.map((budget) => (
              <div key={budget.id} className="space-y-3">
                {/* Header do orçamento */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{budget.category.icon}</span>
                    <div>
                      <h3 className="font-semibold">{budget.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {budget.category.name} • {getMonthName(budget.month)} {budget.year}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getStatusColor(budget.status)}`}>
                      {budget.percentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(budget.spent)} de {formatCurrency(budget.amount)}
                    </div>
                  </div>
                </div>
                
                {/* Barra de progresso */}
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(budget.status)}`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                  
                  {/* Informações adicionais */}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      Restante: {formatCurrency(budget.remaining)}
                    </span>
                    <span>
                      {budget.status === BUDGET_STATUS.EXCEEDED 
                        ? `Excedeu em ${formatCurrency(budget.spent - budget.amount)}`
                        : `${(100 - budget.percentage).toFixed(1)}% disponível`
                      }
                    </span>
                  </div>
                </div>
                
                {/* Status badge */}
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={
                      budget.status === BUDGET_STATUS.ON_TRACK ? 'default' :
                      budget.status === BUDGET_STATUS.WARNING ? 'secondary' : 'destructive'
                    }
                  >
                    {budget.status === BUDGET_STATUS.ON_TRACK && 'No Orçamento'}
                    {budget.status === BUDGET_STATUS.WARNING && 'Atenção'}
                    {budget.status === BUDGET_STATUS.EXCEEDED && 'Ultrapassado'}
                  </Badge>
                  
                  {budget.status === BUDGET_STATUS.WARNING && (
                    <span className="text-sm text-yellow-600">
                      Próximo do limite
                    </span>
                  )}
                  
                  {budget.status === BUDGET_STATUS.EXCEEDED && (
                    <span className="text-sm text-red-600">
                      Limite ultrapassado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

## Otimizações de Performance

### Uso de useMemo e useCallback

O aplicativo utiliza hooks de otimização para evitar recálculos desnecessários.

```javascript
// Exemplo de otimização com useMemo
const expensiveCalculation = useMemo(() => {
  return transactions
    .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
    .reduce((acc, t) => {
      // Cálculo complexo aqui
      return acc + complexCalculation(t)
    }, 0)
}, [transactions]) // Só recalcula quando transactions mudar

// Exemplo de otimização com useCallback
const handleTransactionUpdate = useCallback((id, data) => {
  // Função que será passada para componentes filhos
  updateTransaction(id, data)
}, [updateTransaction]) // Só recria a função quando updateTransaction mudar
```

### Lazy Loading de Componentes

```javascript
// Carregamento lazy de componentes pesados
import { lazy, Suspense } from 'react'

const ReportsDashboard = lazy(() => import('./components/reports/ReportsDashboard.jsx'))

function App() {
  return (
    <Suspense fallback={<div>Carregando relatórios...</div>}>
      <ReportsDashboard />
    </Suspense>
  )
}
```

## Tratamento de Erros

### Error Boundaries

```javascript
// ErrorBoundary.jsx
import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <h2 className="text-lg font-semibold text-red-800">
            Algo deu errado
          </h2>
          <p className="text-red-600">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Recarregar
          </button>
        </div>
      )
    }
    
    return this.props.children
  }
}
```

## Responsividade e Design

### Sistema de Grid Responsivo

O aplicativo utiliza **Tailwind CSS** para criar layouts responsivos.

```javascript
// Exemplo de grid responsivo
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* Em mobile: 1 coluna */}
  {/* Em tablet (md): 2 colunas */}
  {/* Em desktop (lg): 4 colunas */}
  {cards.map(card => (
    <Card key={card.id} className="hover:shadow-lg transition-shadow">
      {/* Conteúdo do card */}
    </Card>
  ))}
</div>
```

### Breakpoints Utilizados

```css
/* Tailwind CSS breakpoints */
sm: '640px'   /* Smartphones grandes */
md: '768px'   /* Tablets */
lg: '1024px'  /* Laptops */
xl: '1280px'  /* Desktops */
2xl: '1536px' /* Telas grandes */
```

## Conclusão

Este código implementa um sistema completo de finanças pessoais utilizando **padrões modernos de desenvolvimento React**. As principais técnicas utilizadas incluem:

1. **Context API** para gerenciamento de estado global
2. **Custom hooks** para reutilização de lógica
3. **React Hook Form** para formulários performáticos
4. **useMemo/useCallback** para otimização
5. **Recharts** para visualizações interativas
6. **Tailwind CSS** para estilização responsiva
7. **Componentes funcionais** com hooks
8. **Tratamento de erros** robusto
9. **Persistência local** com localStorage
10. **Design responsivo** mobile-first

O resultado é uma aplicação moderna, performática e escalável que demonstra as melhores práticas de desenvolvimento frontend com React e JavaScript.

---

**Desenvolvido por:** Manus AI  
**Tecnologias:** React 18, JavaScript ES6+, Tailwind CSS, Recharts  
**Padrões:** Context API, Custom Hooks, Responsive Design  
**Data:** Outubro 2025
