import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog.jsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.jsx'
import {
  useTransactions,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
} from '../../contexts/TransactionsContext.jsx'
import { useAccounts } from '../../contexts/AccountsContext.jsx'
import { TransactionForm } from './TransactionForm.jsx'

export function TransactionsList() {
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [deletingTransaction, setDeletingTransaction] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterAccount, setFilterAccount] = useState('all')
  const [showAmounts, setShowAmounts] = useState(true)

  const {
    transactions,
    deleteTransaction,
    getTotalIncome,
    getTotalExpenses,
    isLoading,
  } = useTransactions()

  const { accounts, getAccountById } = useAccounts()

  // Filtrar e ordenar transações
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((transaction) => {
        const tags = transaction.tags || []
        return (
          transaction.description.toLowerCase().includes(term) ||
          transaction.category.name.toLowerCase().includes(term) ||
          tags.some((tag) => tag.toLowerCase().includes(term))
        )
      })
    }

    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter((transaction) => transaction.type === filterType)
    }

    // Filtro por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(
        (transaction) => transaction.status === filterStatus
      )
    }

    // Filtro por conta
    if (filterAccount !== 'all') {
      filtered = filtered.filter(
        (transaction) => transaction.accountId === filterAccount
      )
    }

    // Ordenar por data (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))

    return filtered
  }, [transactions, searchTerm, filterType, filterStatus, filterAccount])

  // Calcular totais do período atual (mês atual)
  const currentMonth = new Date()
  const startOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  )
  const endOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  )

  const monthlyIncome = getTotalIncome(startOfMonth, endOfMonth)
  const monthlyExpenses = getTotalExpenses(startOfMonth, endOfMonth)
  const monthlyBalance = monthlyIncome - monthlyExpenses

  const handleAddTransaction = () => {
    setEditingTransaction(null)
    setShowForm(true)
  }

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleDeleteTransaction = async () => {
    if (deletingTransaction) {
      try {
        await deleteTransaction(deletingTransaction.id)
        setDeletingTransaction(null)
      } catch (error) {
        console.error('Erro ao deletar transação:', error)
      }
    }
  }

  const handleFormSave = () => {
    setShowForm(false)
    setEditingTransaction(null)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTransaction(null)
  }

  const formatCurrency = (amount) => {
    if (!showAmounts) return '••••'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      [TRANSACTION_STATUS.COMPLETED]: {
        label: 'Concluída',
        variant: 'default',
      },
      [TRANSACTION_STATUS.PENDING]: {
        label: 'Pendente',
        variant: 'secondary',
      },
      [TRANSACTION_STATUS.CANCELLED]: {
        label: 'Cancelada',
        variant: 'destructive',
      },
    }

    const config =
      statusConfig[status] || statusConfig[TRANSACTION_STATUS.COMPLETED]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getTransactionIcon = (type) => {
    return type === TRANSACTION_TYPES.INCOME ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transações</h2>
          <p className="text-muted-foreground">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowAmounts(!showAmounts)}
            title={showAmounts ? 'Ocultar valores' : 'Mostrar valores'}
          >
            {showAmounts ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            onClick={handleAddTransaction}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Transação</span>
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receitas do Mês
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(monthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Despesas do Mês
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(monthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(monthlyBalance)}
            </div>
            <p className="text-xs text-muted-foreground">Receitas - Despesas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Busca */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Descrição, categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value={TRANSACTION_TYPES.INCOME}>
                    Receitas
                  </SelectItem>
                  <SelectItem value={TRANSACTION_TYPES.EXPENSE}>
                    Despesas
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value={TRANSACTION_STATUS.COMPLETED}>
                    Concluídas
                  </SelectItem>
                  <SelectItem value={TRANSACTION_STATUS.PENDING}>
                    Pendentes
                  </SelectItem>
                  <SelectItem value={TRANSACTION_STATUS.CANCELLED}>
                    Canceladas
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conta */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Conta</label>
              <Select value={filterAccount} onValueChange={setFilterAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Limpar filtros */}
            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setFilterType('all')
                  setFilterStatus('all')
                  setFilterAccount('all')
                }}
                className="w-full"
              >
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de transações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transações ({filteredTransactions.length})</span>
            {isLoading && (
              <span className="text-xs text-muted-foreground">
                Atualizando...
              </span>
            )}
          </CardTitle>
          <CardDescription>
            {filteredTransactions.length > 0 &&
              'Lista das suas movimentações filtradas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💸</div>
              <h3 className="text-lg font-semibold mb-2">
                Nenhuma transação encontrada
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ||
                filterType !== 'all' ||
                filterStatus !== 'all' ||
                filterAccount !== 'all'
                  ? 'Tente ajustar os filtros ou adicione uma nova transação'
                  : 'Adicione sua primeira transação para começar'}
              </p>
              <Button onClick={handleAddTransaction}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Transação
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((transaction) => {
                const account = getAccountById(transaction.accountId)
                const tags = transaction.tags || []

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Ícone e indicador */}
                      <div className="flex items-center space-x-2">
                        {getTransactionIcon(transaction.type)}
                        <div
                          className="w-1 h-8 rounded-full"
                          style={{ backgroundColor: transaction.category.color }}
                        />
                      </div>

                      {/* Informações principais */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">
                            {transaction.description}
                          </p>
                          {getStatusBadge(transaction.status)}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{transaction.category.icon}</span>
                          <span>{transaction.category.name}</span>
                          <span>•</span>
                          <span>{account?.name}</span>
                          <span>•</span>
                          <span>
                            {format(
                              new Date(transaction.date),
                              'dd/MM/yyyy'
                            )}
                          </span>
                        </div>
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Valor e ações */}
                    <div className="flex items-center space-x-4">
                      <div
                        className={`text-lg font-semibold ${
                          transaction.type === TRANSACTION_TYPES.INCOME
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === TRANSACTION_TYPES.INCOME
                          ? '+'
                          : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>

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
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeletingTransaction(transaction)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
          if (!open) {
            setEditingTransaction(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Título/descrição “escondidos” para acessibilidade do Radix */}
          <DialogTitle className="sr-only">
            {editingTransaction ? 'Editar transação' : 'Nova transação'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Formulário para cadastrar ou editar transações financeiras.
          </DialogDescription>

          <TransactionForm
            transaction={editingTransaction}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para exclusão */}
      <AlertDialog
        open={!!deletingTransaction}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingTransaction(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a transação "
              {deletingTransaction?.description}"?
              <span className="block mt-2 text-sm">
                Valor:{' '}
                {deletingTransaction &&
                  formatCurrency(deletingTransaction.amount)}
              </span>
              <span className="block text-sm text-muted-foreground">
                Esta ação não pode ser desfeita e afetará o saldo da conta.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
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
