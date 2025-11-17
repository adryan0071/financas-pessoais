import { useState, useMemo } from 'react'
import { 
  Download,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart3,
  Target,
  Wallet,
  CreditCard
} from 'lucide-react'
import { 
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
  ComposedChart,
  Area,
  Line,
} from 'recharts'
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { useTransactions, TRANSACTION_TYPES } from '../../contexts/TransactionsContext.jsx'
import { useAccounts } from '../../contexts/AccountsContext.jsx'
import { useGoals } from '../../contexts/GoalsContext.jsx'

export function ReportsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const [selectedAccount, setSelectedAccount] = useState('all')
  
  const { 
    transactions, 
    getTotalIncome, 
    getTotalExpenses,
  } = useTransactions()
  
  const { accounts, getTotalBalance } = useAccounts()
  const { getTotalSaved } = useGoals()

  // Datas de início/fim do período, memoizadas
  const { startDate, endDate } = useMemo(() => {
    const end = new Date()
    let start

    switch (selectedPeriod) {
      case '3months':
        start = subMonths(end, 3)
        break
      case '6months':
        start = subMonths(end, 6)
        break
      case '12months':
        start = subMonths(end, 12)
        break
      default:
        start = subMonths(end, 6)
    }

    // Normalizar para início/fim de dia, se quiser deixar mais “redondinho”
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)

    return { startDate: start, endDate: end }
  }, [selectedPeriod])

  // Transações filtradas por período e conta
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      const isInPeriod = transactionDate >= startDate && transactionDate <= endDate
      const isInAccount =
        selectedAccount === 'all' || transaction.accountId === selectedAccount

      return isInPeriod && isInAccount && transaction.status === 'completed'
    })
  }, [transactions, startDate, endDate, selectedAccount])

  // Dados para gráfico de tendência mensal
  const monthlyTrendData = useMemo(() => {
    const months = eachMonthOfInterval({ start: startDate, end: endDate })

    return months.map((month) => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)

      const monthTransactions = filteredTransactions.filter((t) => {
        const tDate = new Date(t.date)
        return tDate >= monthStart && tDate <= monthEnd
      })

      const income = monthTransactions
        .filter((t) => t.type === TRANSACTION_TYPES.INCOME)
        .reduce((sum, t) => sum + t.amount, 0)

      const expenses = monthTransactions
        .filter((t) => t.type === TRANSACTION_TYPES.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        month: format(month, 'MMM yyyy', { locale: ptBR }),
        receitas: income,
        despesas: expenses,
        saldo: income - expenses,
      }
    })
  }, [filteredTransactions, startDate, endDate])

  // Dados para gráfico de categorias (despesas)
  const categoryData = useMemo(() => {
    const categoryTotals = {}

    filteredTransactions
      .filter((t) => t.type === TRANSACTION_TYPES.EXPENSE)
      .forEach((transaction) => {
        const categoryId = transaction.category.id
        if (!categoryTotals[categoryId]) {
          categoryTotals[categoryId] = {
            name: transaction.category.name,
            icon: transaction.category.icon,
            color: transaction.category.color,
            value: 0,
          }
        }
        categoryTotals[categoryId].value += transaction.amount
      })

    return Object.values(categoryTotals)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [filteredTransactions])

  // Análise por conta
  const accountAnalysis = useMemo(() => {
    return accounts
      .map((account) => {
        const accountTransactions = filteredTransactions.filter(
          (t) => t.accountId === account.id
        )

        const income = accountTransactions
          .filter((t) => t.type === TRANSACTION_TYPES.INCOME)
          .reduce((sum, t) => sum + t.amount, 0)

        const expenses = accountTransactions
          .filter((t) => t.type === TRANSACTION_TYPES.EXPENSE)
          .reduce((sum, t) => sum + t.amount, 0)

        return {
          ...account,
          income,
          expenses,
          netFlow: income - expenses,
          transactionCount: accountTransactions.length,
        }
      })
      .sort((a, b) => b.netFlow - a.netFlow)
  }, [accounts, filteredTransactions])

  // Totais do período
  const periodIncome = getTotalIncome(startDate, endDate)
  const periodExpenses = getTotalExpenses(startDate, endDate)
  const periodBalance = periodIncome - periodExpenses
  const totalBalance = getTotalBalance()
  const totalSaved = getTotalSaved()

  const monthsCount = Math.max(monthlyTrendData.length, 1)
  const averageMonthlyIncome = periodIncome / monthsCount
  const averageMonthlyExpenses = periodExpenses / monthsCount
  const savingsRate =
    periodIncome > 0 ? ((periodIncome - periodExpenses) / periodIncome) * 100 : 0

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount || 0)
  }

  const formatPercentage = (value) => {
    if (!Number.isFinite(value)) return '0,0%'
    return `${value.toFixed(1)}%`
  }

  const getCategoryPercentageOfTotal = (value) => {
    if (periodExpenses <= 0) return 0
    return (value / periodExpenses) * 100
  }

  const exportToPDF = () => {
    // Implementação futura para exportação PDF
    console.log('Exportar para PDF')
  }

  const exportToCSV = () => {
    // Implementação futura para exportação CSV
    console.log('Exportar para CSV')
  }

  const mainCategory = categoryData[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-muted-foreground">
            Análise detalhada das suas finanças
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione a conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as contas</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 meses</SelectItem>
              <SelectItem value="6months">6 meses</SelectItem>
              <SelectItem value="12months">12 meses</SelectItem>
            </SelectContent>
          </Select>
          {/* <Button variant="outline" onClick={exportToPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button> */}
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Período</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(periodIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média: {formatCurrency(averageMonthlyIncome)}/mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Período</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(periodExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média: {formatCurrency(averageMonthlyExpenses)}/mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Poupança</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                savingsRate >= 20
                  ? 'text-green-600'
                  : savingsRate >= 10
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {formatPercentage(savingsRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              {savingsRate >= 20
                ? 'Excelente!'
                : savingsRate >= 10
                ? 'Bom progresso'
                : 'Pode melhorar'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patrimônio Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalBalance + totalSaved)}
            </div>
            <p className="text-xs text-muted-foreground">
              Contas + Metas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes visualizações */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="accounts">Contas</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Aba de Tendências */}
        <TabsContent value="trends" className="space-y-4">
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
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      tickFormatter={(value) =>
                        `R$ ${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      formatter={(value, name) => [formatCurrency(value), name]}
                      labelFormatter={(label) => `Período: ${label}`}
                    />
                    <Legend />
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
        </TabsContent>

        {/* Aba de Categorias */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Gráfico de pizza - Distribuição por categoria */}
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
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [
                          formatCurrency(value),
                          'Gasto',
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Lista de categorias */}
            <Card>
              <CardHeader>
                <CardTitle>Ranking de Categorias</CardTitle>
                <CardDescription>
                  Categorias com maiores gastos no período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma despesa registrada no período selecionado.
                    </p>
                  )}

                  {categoryData.map((category, index) => {
                    const percentage = getCategoryPercentageOfTotal(
                      category.value
                    )

                    return (
                      <div
                        key={category.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant="outline"
                            className="w-8 h-8 rounded-full p-0 flex items-center justify-center"
                          >
                            {index + 1}
                          </Badge>
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(category.value)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatPercentage(percentage)} do total
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba de Contas */}
        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise por Conta</CardTitle>
              <CardDescription>
                Performance de cada conta no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accountAnalysis.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma movimentação encontrada para o período selecionado.
                </p>
              ) : (
                <div className="space-y-4">
                  {accountAnalysis.map((account) => (
                    <div key={account.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: account.color }}
                          />
                          <div>
                            <h3 className="font-semibold">{account.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {account.transactionCount} transações
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            account.netFlow >= 0 ? 'default' : 'destructive'
                          }
                        >
                          {account.netFlow >= 0 ? 'Positivo' : 'Negativo'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Receitas</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(account.income)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Despesas</p>
                          <p className="font-semibold text-red-600">
                            {formatCurrency(account.expenses)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Fluxo Líquido</p>
                          <p
                            className={`font-semibold ${
                              account.netFlow >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {formatCurrency(account.netFlow)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Insights */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Insights Financeiros</CardTitle>
                <CardDescription>
                  Análises automáticas dos seus dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">
                    💡 Taxa de Poupança
                  </h4>
                  <p className="text-sm text-blue-800">
                    {savingsRate >= 20
                      ? 'Parabéns! Sua taxa de poupança está excelente.'
                      : savingsRate >= 10
                      ? 'Boa taxa de poupança, mas ainda há espaço para melhorar.'
                      : 'Considere reduzir gastos para aumentar sua poupança.'}
                  </p>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-1">
                    📈 Maior Categoria
                  </h4>
                  <p className="text-sm text-green-800">
                    {mainCategory && periodExpenses > 0 ? (
                      <>
                        {mainCategory.icon} {mainCategory.name} representa{' '}
                        {formatPercentage(
                          getCategoryPercentageOfTotal(mainCategory.value)
                        )}{' '}
                        dos seus gastos.
                      </>
                    ) : (
                      'Nenhuma despesa registrada no período selecionado.'
                    )}
                  </p>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-1">
                    ⚡ Fluxo de Caixa
                  </h4>
                  <p className="text-sm text-yellow-800">
                    {periodBalance >= 0
                      ? `Você teve um saldo positivo de ${formatCurrency(
                          periodBalance
                        )} no período.`
                      : `Atenção: você gastou ${formatCurrency(
                          Math.abs(periodBalance)
                        )} a mais do que recebeu.`}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recomendações</CardTitle>
                <CardDescription>
                  Sugestões para melhorar suas finanças
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Target className="h-4 w-4 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Defina metas claras</p>
                      <p className="text-xs text-muted-foreground">
                        Estabeleça objetivos específicos para suas economias
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <PieChartIcon className="h-4 w-4 text-green-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium">
                        Diversifique investimentos
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Considere diferentes tipos de aplicações financeiras
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <BarChart3 className="h-4 w-4 text-purple-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Monitore orçamentos</p>
                      <p className="text-xs text-muted-foreground">
                        Revise seus orçamentos mensalmente
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <CreditCard className="h-4 w-4 text-red-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Controle cartões</p>
                      <p className="text-xs text-muted-foreground">
                        Mantenha o uso do cartão abaixo de 30% do limite
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
