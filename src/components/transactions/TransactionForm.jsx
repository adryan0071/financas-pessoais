import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { CalendarIcon, Loader2, Plus, Minus, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar } from '@/components/ui/calendar.jsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.jsx'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import {
  useTransactions,
  TRANSACTION_TYPES,
  CATEGORIES,
  TRANSACTION_STATUS,
} from '../../contexts/TransactionsContext.jsx'
import { useAccounts } from '../../contexts/AccountsContext.jsx'

export function TransactionForm({ transaction, onSave, onCancel }) {
  const [selectedDate, setSelectedDate] = useState(
    transaction ? new Date(transaction.date) : new Date()
  )
  const [transactionType, setTransactionType] = useState(
    transaction?.type || TRANSACTION_TYPES.EXPENSE
  )
  const [tags, setTags] = useState(transaction?.tags || [])
  const [newTag, setNewTag] = useState('')

  const { addTransaction, updateTransaction, isLoading, error, clearError } =
    useTransactions()
  const { accounts } = useAccounts()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      type: transaction?.type || TRANSACTION_TYPES.EXPENSE,
      amount: transaction?.amount || '',
      description: transaction?.description || '',
      category: transaction?.category?.id || '',
      accountId: transaction?.accountId || '',
      status: transaction?.status || TRANSACTION_STATUS.COMPLETED,
    },
  })

  const watchedCategory = watch('category')
  const watchedAmount = watch('amount')
  const watchedAccountId = watch('accountId')
  const watchedStatus = watch('status')
  const watchedDescription = watch('description')
  const isEditMode = !!transaction

  // Registrar campos controlados (Select) com validação
  useEffect(() => {
    register('category', {
      required: 'Categoria é obrigatória',
    })
    register('accountId', {
      required: 'Conta é obrigatória',
    })
  }, [register])

  useEffect(() => {
    clearError()
  }, [clearError])

  // Categorias disponíveis conforme tipo
  const getAvailableCategories = () => {
    return transactionType === TRANSACTION_TYPES.INCOME
      ? Object.values(CATEGORIES.INCOME)
      : Object.values(CATEGORIES.EXPENSE)
  }

  // Categoria selecionada
  const getSelectedCategory = () => {
    const categories = getAvailableCategories()
    return categories.find((cat) => cat.id === watchedCategory)
  }

  // Adicionar tag
  const addTag = () => {
    const trimmed = newTag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setNewTag('')
    }
  }

  // Remover tag
  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Trocar tipo de transação
  const handleTypeChange = (type) => {
    setTransactionType(type)
    setValue('type', type)
    // Limpa categoria ao mudar tipo pra evitar categoria "incompatível"
    setValue('category', '', { shouldValidate: true })
  }

  const onSubmit = async (data) => {
  try {
    const selectedCategory = getSelectedCategory()
    if (!selectedCategory) {
      return
    }

    const transactionData = {
      // nome que o backend espera
      contaId: data.accountId,          // ✅ mapeia accountId -> contaId
      type: transactionType,            // income / expense
      category: selectedCategory.id,    // ou selectedCategory se for JSON no banco
      amount: parseFloat(data.amount),
      description: data.description,
      date: selectedDate.toISOString(),
      status: data.status,
      isRecurring: false,
      tags: tags
    }

    if (isEditMode) {
      await updateTransaction(transaction.id, transactionData)
    } else {
      await addTransaction(transactionData)
    }

    onSave?.()
  } catch (err) {
    console.error('Erro ao salvar transação:', err)
  }
}


  const handleCancel = () => {
    reset()
    clearError()
    onCancel?.()
  }

  const formatCurrency = (amount) => {
    if (!amount || Number.isNaN(amount)) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)
  }

  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {transactionType === TRANSACTION_TYPES.INCOME ? (
            <Plus className="h-5 w-5 text-green-600" />
          ) : (
            <Minus className="h-5 w-5 text-red-600" />
          )}
          <span>{isEditMode ? 'Editar Transação' : 'Nova Transação'}</span>
        </CardTitle>
        <CardDescription>
          {isEditMode
            ? 'Atualize as informações da transação'
            : 'Registre uma nova receita ou despesa'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo de Transação */}
          <div className="space-y-2">
            <Label>Tipo de Transação</Label>
            <Tabs value={transactionType} onValueChange={handleTypeChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value={TRANSACTION_TYPES.INCOME}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Receita</span>
                </TabsTrigger>
                <TabsTrigger
                  value={TRANSACTION_TYPES.EXPENSE}
                  className="flex items-center space-x-2"
                >
                  <Minus className="h-4 w-4" />
                  <span>Despesa</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor *</Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground">
                R$
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                className="pl-10 text-lg"
                {...register('amount', {
                  required: 'Valor é obrigatório',
                  min: {
                    value: 0.01,
                    message: 'Valor deve ser maior que zero',
                  },
                  max: {
                    value: 999999.99,
                    message: 'Valor muito alto',
                  },
                })}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-destructive">
                {errors.amount.message}
              </p>
            )}
            {watchedAmount && (
              <p className="text-sm text-muted-foreground">
                {formatCurrency(parseFloat(watchedAmount))}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              placeholder="Ex: Supermercado, Salário, Combustível..."
              {...register('description', {
                required: 'Descrição é obrigatória',
                minLength: {
                  value: 2,
                  message: 'Descrição deve ter pelo menos 2 caracteres',
                },
                maxLength: {
                  value: 100,
                  message: 'Descrição deve ter no máximo 100 caracteres',
                },
              })}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={watchedCategory}
              onValueChange={(value) =>
                setValue('category', value, { shouldValidate: true })
              }
            >
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
            {errors.category && (
              <p className="text-sm text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Conta */}
          <div className="space-y-2">
            <Label htmlFor="accountId">Conta *</Label>
            <Select
              value={watchedAccountId}
              onValueChange={(value) =>
                setValue('accountId', value, { shouldValidate: true })
              }
            >
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
                      <span className="text-muted-foreground text-xs">
                        ({formatCurrency(account.balance)})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.accountId && (
              <p className="text-sm text-destructive">
                {errors.accountId.message}
              </p>
            )}
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label>Data da Transação *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, 'PPP', { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={watchedStatus}
              onValueChange={(value) => setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TRANSACTION_STATUS.COMPLETED}>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Concluída</span>
                  </div>
                </SelectItem>
                <SelectItem value={TRANSACTION_STATUS.PENDING}>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>Pendente</span>
                  </div>
                </SelectItem>
                <SelectItem value={TRANSACTION_STATUS.CANCELLED}>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Cancelada</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Adicionar tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Tag className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Preview */}
          {watchedAmount && watchedCategory && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        transactionType === TRANSACTION_TYPES.INCOME
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <div>
                      <p className="font-medium">
                        {watchedDescription || 'Descrição da transação'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getSelectedCategory()?.icon}{' '}
                        {getSelectedCategory()?.name}
                        {selectedDate &&
                          ` • ${format(selectedDate, 'dd/MM/yyyy')}`}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`font-semibold ${
                      transactionType === TRANSACTION_TYPES.INCOME
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transactionType === TRANSACTION_TYPES.INCOME ? '+' : '-'}
                    {formatCurrency(parseFloat(watchedAmount))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Botões */}
          <div className="flex space-x-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Atualizando...' : 'Salvando...'}
                </>
              ) : isEditMode ? (
                'Atualizar Transação'
              ) : (
                'Salvar Transação'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
