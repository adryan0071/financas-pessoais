import { useState, useMemo } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar
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
  Legend 
} from 'recharts'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu.jsx'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.jsx'
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { useBudgets, BUDGET_STATUS } from '../../contexts/BudgetsContext.jsx'
import { BudgetForm } from './BudgetForm.jsx'

export function BudgetsList() {
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [deletingBudget, setDeletingBudget] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState(
    `${new Date().getFullYear()}-${new Date().getMonth() + 1}`
  )
  
  const { 
    budgets,      // agora usamos o array do contexto
    deleteBudget, 
    isLoading,
  } = useBudgets()



  // Opções de período (últimos 12 meses)
  const periodOptions = useMemo(() => {
    const options = []
    const currentDate = new Date()
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      )
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const label = date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
      })

      options.push({
        value: `${year}-${month}`,
        label: label.charAt(0).toUpperCase() + label.slice(1),
      })
    }

    return options
  }, [])

  const [year, month] = useMemo(
    () => selectedPeriod.split('-').map(Number),
    [selectedPeriod]
  )

  // Orçamentos do período selecionado (com base em startDate)
    const budgetsForPeriod = useMemo(() => {
    if (!budgets || budgets.length === 0) return []

    const result = budgets
      .filter((budget) => {
        if (!budget.startDate) return false
        const d = new Date(budget.startDate)
        return d.getFullYear() === year && d.getMonth() + 1 === month
      })
      .map((budget) => {
        const amount = Number(budget.amount) || 0
        const spent = Number(budget.spent) || 0
        const remaining = amount - spent
        const percentage = amount > 0 ? (spent / amount) * 100 : 0

        return {
          ...budget,
          amount,
          spent,
          remaining,
          percentage: Math.min(Math.max(percentage, 0), 100),
        }
      })

    

    return result
  }, [budgets, year, month])


  // Totais
  const totalBudgeted = budgetsForPeriod.reduce(
    (acc, b) => acc + b.amount,
    0
  )
  const totalSpent = budgetsForPeriod.reduce(
    (acc, b) => acc + b.spent,
    0
  )
  const totalRemaining = totalBudgeted - totalSpent

  const handleAddBudget = () => {
    setEditingBudget(null)
    setShowForm(true)
  }

  const handleEditBudget = (budget) => {
    setEditingBudget(budget)
    setShowForm(true)
  }

  const handleDeleteBudget = async () => {
    if (deletingBudget) {
      try {
        await deleteBudget(deletingBudget.id)
        setDeletingBudget(null)
      } catch (error) {
        console.error('Erro ao deletar orçamento:', error)
      }
    }
  }

  const handleFormSave = () => {
    setShowForm(false)
    setEditingBudget(null)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingBudget(null)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const getStatusConfig = (status) => {
    const configs = {
      [BUDGET_STATUS.ON_TRACK]: {
        label: 'No Orçamento',
        color: 'bg-green-500',
        variant: 'default',
        icon: CheckCircle
      },
      [BUDGET_STATUS.WARNING]: {
        label: 'Atenção',
        color: 'bg-yellow-500',
        variant: 'secondary',
        icon: AlertTriangle
      },
      [BUDGET_STATUS.EXCEEDED]: {
        label: 'Ultrapassado',
        color: 'bg-red-500',
        variant: 'destructive',
        icon: TrendingUp
      }
    }
    return configs[status] || configs[BUDGET_STATUS.ON_TRACK]
  }

  // Dados para o gráfico de pizza
  const pieChartData = budgetsForPeriod.map((budget) => ({
    name: budget.category?.name ?? budget.name,
    value: budget.spent,
    budgeted: budget.amount,
    color: budget.category?.color ?? budget.color ?? '#3b82f6',
  }))

  // Dados para o gráfico de barras
  const barChartData = budgetsForPeriod.map((budget) => ({
    category: budget.category?.name ?? budget.name,
    orçado: budget.amount,
    gasto: budget.spent,
    restante: Math.max(budget.remaining, 0),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orçamentos</h2>
          <p className="text-muted-foreground">
            Controle seus gastos por categoria
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleAddBudget} 
            className="flex items-center space-x-2"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            <span>Novo Orçamento</span>
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orçado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalBudgeted)}
            </div>
            <p className="text-xs text-muted-foreground">
              Soma de todos os orçamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              Gastos realizados no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Restante</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(totalRemaining)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalRemaining >= 0
                ? 'Disponível para gastar'
                : 'Orçamento ultrapassado'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      {budgetsForPeriod.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Gráfico de Pizza */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição dos Gastos</CardTitle>
              <CardDescription>
                Como seus gastos estão distribuídos por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieChartData.map((entry, index) => (
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

          {/* Gráfico de Barras */}
          <Card>
            <CardHeader>
              <CardTitle>Orçado vs Gasto</CardTitle>
              <CardDescription>
                Comparação entre o orçamento planejado e os gastos reais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `R$ ${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        formatCurrency(value),
                        name,
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="orçado" fill="#3b82f6" name="Orçado" />
                    <Bar dataKey="gasto" fill="#ef4444" name="Gasto" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de orçamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Orçamentos por Categoria</CardTitle>
          <CardDescription>
            Acompanhe o progresso de cada categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {budgetsForPeriod.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">
                Nenhum orçamento encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro orçamento para começar a controlar seus gastos
              </p>
              <Button onClick={handleAddBudget} disabled={isLoading}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Orçamento
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {budgetsForPeriod.map((budget) => {
                const statusConfig = getStatusConfig(budget.status)
                const StatusIcon = statusConfig.icon
                const safePercentage = budget.percentage

                return (
                  <div
                    key={budget.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">
                            {budget.category?.icon}
                          </span>
                          <div>
                            <h3 className="font-semibold">{budget.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {budget.category?.name ?? 'Categoria'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={statusConfig.variant}
                          className="flex items-center space-x-1"
                        >
                          <StatusIcon className="h-3 w-3" />
                          <span>{statusConfig.label}</span>
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditBudget(budget)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeletingBudget(budget)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Barra de progresso */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Gasto: {formatCurrency(budget.spent)}</span>
                        <span>Orçamento: {formatCurrency(budget.amount)}</span>
                      </div>
                      <Progress value={safePercentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{safePercentage.toFixed(1)}% utilizado</span>
                        <span>
                          {budget.remaining >= 0
                            ? `${formatCurrency(budget.remaining)} restante`
                            : `${formatCurrency(
                                Math.abs(budget.remaining)
                              )} acima do orçamento`}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para formulário */}
      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open)
          if (!open) setEditingBudget(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
            </DialogTitle>
            <DialogDescription>
              Defina ou atualize o limite de gastos para uma categoria específica.
            </DialogDescription>
          </DialogHeader>

          <BudgetForm
            budget={editingBudget}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para exclusão */}
      <AlertDialog
        open={!!deletingBudget}
        onOpenChange={(open) => {
          if (!open) setDeletingBudget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Orçamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o orçamento "
              {deletingBudget?.name}"?
              <span className="block mt-2 text-sm">
                Valor:{' '}
                {deletingBudget && formatCurrency(deletingBudget.amount)}
              </span>
              <span className="block text-sm text-muted-foreground">
                Esta ação não pode ser desfeita.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBudget}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
