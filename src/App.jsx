import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  CreditCard, 
  Target,
  BarChart3,
  Bell,
  Settings,
  User,
  Home,
  Plus,
  Wallet,
  LogOut
} from 'lucide-react'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { AccountsProvider } from './contexts/AccountsContext.jsx'
import { TransactionsProvider } from './contexts/TransactionsContext.jsx'
import { BudgetsProvider } from './contexts/BudgetsContext.jsx'
import { GoalsProvider } from './contexts/GoalsContext.jsx'
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx'
import { AccountsList } from './components/accounts/AccountsList.jsx'
import { TransactionsList } from './components/transactions/TransactionsList.jsx'
import { BudgetsList } from './components/budgets/BudgetsList.jsx'
import { ReportsDashboard } from './components/reports/ReportsDashboard.jsx'
import { MainDashboard } from './components/dashboard/MainDashboard.jsx'
import { useAuth } from './contexts/AuthContext.jsx'
import './App.css'

// Componente de Layout Principal
function Layout() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-backdrop-filter:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Finanças Pessoais</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              
              {/* Informações do usuário */}
              <div className="flex items-center space-x-2">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </div>
              
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b bg-card/30">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-transparent h-auto p-0">
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center space-x-2 py-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger 
                value="transacoes" 
                className="flex items-center space-x-2 py-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Transações</span>
              </TabsTrigger>
              <TabsTrigger 
                value="contas" 
                className="flex items-center space-x-2 py-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Contas</span>
              </TabsTrigger>
              <TabsTrigger 
                value="orcamentos" 
                className="flex items-center space-x-2 py-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Orçamentos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="relatorios" 
                className="flex items-center space-x-2 py-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Relatórios</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="dashboard">
            <MainDashboard />
          </TabsContent>
          <TabsContent value="transacoes">
            <Transacoes />
          </TabsContent>
          <TabsContent value="contas">
            <Contas />
          </TabsContent>
          <TabsContent value="orcamentos">
            <Orcamentos />
          </TabsContent>
          <TabsContent value="relatorios">
            <Relatorios />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Componente Dashboard
function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nova Transação</span>
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ 12.450,00</div>
            <p className="text-xs text-muted-foreground">
              +2.5% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ 8.500,00</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ 3.250,00</div>
            <p className="text-xs text-muted-foreground">
              -5% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">R$ 5.250,00</div>
            <p className="text-xs text-muted-foreground">
              Meta: R$ 6.000,00 (87%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transações Recentes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>Suas últimas movimentações financeiras</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { tipo: 'receita', descricao: 'Salário', valor: 'R$ 5.000,00', data: 'Hoje' },
                { tipo: 'despesa', descricao: 'Supermercado', valor: 'R$ 250,00', data: 'Ontem' },
                { tipo: 'despesa', descricao: 'Combustível', valor: 'R$ 120,00', data: '2 dias atrás' },
                { tipo: 'receita', descricao: 'Freelance', valor: 'R$ 800,00', data: '3 dias atrás' }
              ].map((transacao, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      transacao.tipo === 'receita' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium">{transacao.descricao}</p>
                      <p className="text-sm text-muted-foreground">{transacao.data}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transacao.tipo === 'receita' ? '+' : '-'}{transacao.valor}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metas Financeiras</CardTitle>
            <CardDescription>Progresso das suas metas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { meta: 'Reserva de Emergência', atual: 5250, objetivo: 10000, cor: 'bg-blue-500' },
                { meta: 'Viagem de Férias', atual: 2800, objetivo: 5000, cor: 'bg-green-500' },
                { meta: 'Novo Notebook', atual: 1200, objetivo: 3000, cor: 'bg-purple-500' }
              ].map((meta, index) => {
                const progresso = (meta.atual / meta.objetivo) * 100
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{meta.meta}</span>
                      <span className="text-muted-foreground">
                        R$ {meta.atual.toLocaleString()} / R$ {meta.objetivo.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${meta.cor}`}
                        style={{ width: `${Math.min(progresso, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {progresso.toFixed(1)}% concluído
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componentes placeholder para outras seções
function Transacoes() {
  return <TransactionsList />
}

function Contas() {
  return <AccountsList />
}

function Orcamentos() {
  return <BudgetsList />
}

function Relatorios() {
  return <ReportsDashboard />
}

// Componente principal da aplicação
function App() {
  return (
    <AuthProvider>
      <AccountsProvider>
        <TransactionsProvider>
          <BudgetsProvider>
            <GoalsProvider>
              <Router>
                <ProtectedRoute>
                  <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<MainDashboard />} />
                  <Route path="/transacoes" element={<TransactionsList />} />
                  <Route path="/contas" element={<AccountsList />} />
                  <Route path="/orcamentos" element={<BudgetsList />} />
                  <Route path="/relatorios" element={<ReportsDashboard />} />
                </Routes>
                  </Layout>
                </ProtectedRoute>
              </Router>
            </GoalsProvider>
          </BudgetsProvider>
        </TransactionsProvider>
      </AccountsProvider>
    </AuthProvider>
  )
}

export default App
