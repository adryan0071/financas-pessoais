import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Target } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select.jsx'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { useBudgets } from '../../contexts/BudgetsContext.jsx'
import { CATEGORIES } from '../../contexts/TransactionsContext.jsx'

export function BudgetForm({ budget, onSave, onCancel }) {
  const { addBudget, updateBudget, isLoading, error, clearError } = useBudgets()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      name: budget?.name || '',
      categoryId: budget?.categoryId || '',
      amount: budget?.amount || '',
      year: budget?.year || new Date().getFullYear(),
      month: budget?.month || new Date().getMonth() + 1,
      description: budget?.description || ''
    }
  })

  const watchedCategoryId = watch('categoryId')
  const watchedAmount = watch('amount')
  const watchedYear = watch('year')
  const watchedMonth = watch('month')
  const isEditMode = !!budget

  useEffect(() => {
    clearError()
  }, [clearError])

  const expenseCategories = Object.values(CATEGORIES.EXPENSE)

  const getSelectedCategory = () => {
    return expenseCategories.find((cat) => cat.id === watchedCategoryId)
  }

  const onSubmit = async (data) => {
    try {
      const selectedCategory = getSelectedCategory()
      if (!selectedCategory) {
        return
      }

      const budgetData = {
        ...data,
        category: selectedCategory,
        amount: parseFloat(data.amount),
        year: parseInt(data.year),
        month: parseInt(data.month)
      }

      if (isEditMode) {
        await updateBudget(budget.id, budgetData)
      } else {
        await addBudget(budgetData)
      }

      onSave?.()
    } catch (err) {
      console.error('Erro ao salvar orçamento:', err)
    }
  }

  const handleCancel = () => {
    reset()
    clearError()
    onCancel?.()
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 3 }, (_, i) => currentYear + i)
  }

  const getMonthOptions = () => {
    return [
      { value: 1, label: 'Janeiro' },
      { value: 2, label: 'Fevereiro' },
      { value: 3, label: 'Março' },
      { value: 4, label: 'Abril' },
      { value: 5, label: 'Maio' },
      { value: 6, label: 'Junho' },
      { value: 7, label: 'Julho' },
      { value: 8, label: 'Agosto' },
      { value: 9, label: 'Setembro' },
      { value: 10, label: 'Outubro' },
      { value: 11, label: 'Novembro' },
      { value: 12, label: 'Dezembro' }
    ]
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>{isEditMode ? 'Editar Orçamento' : 'Novo Orçamento'}</span>
        </CardTitle>
        <CardDescription>
          {isEditMode
            ? 'Atualize as informações do seu orçamento'
            : 'Defina um limite de gastos para uma categoria específica'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Orçamento *</Label>
            <Input
              id="name"
              placeholder="Ex: Alimentação, Transporte, Lazer..."
              {...register('name', {
                required: 'Nome do orçamento é obrigatório',
                minLength: {
                  value: 2,
                  message: 'Nome deve ter pelo menos 2 caracteres'
                },
                maxLength: {
                  value: 50,
                  message: 'Nome deve ter no máximo 50 caracteres'
                }
              })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Categoria *</Label>
            <Select
              value={watchedCategoryId}
              onValueChange={(value) => setValue('categoryId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-destructive">
                Categoria é obrigatória
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor do Orçamento *</Label>
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
                  required: 'Valor do orçamento é obrigatório',
                  min: {
                    value: 0.01,
                    message: 'Valor deve ser maior que zero'
                  },
                  max: {
                    value: 999999.99,
                    message: 'Valor muito alto'
                  }
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Ano *</Label>
              <Select
                value={watchedYear?.toString()}
                onValueChange={(value) => setValue('year', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getYearOptions().map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">Mês *</Label>
              <Select
                value={watchedMonth?.toString()}
                onValueChange={(value) => setValue('month', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getMonthOptions().map((month) => (
                    <SelectItem
                      key={month.value}
                      value={month.value.toString()}
                    >
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva os objetivos deste orçamento..."
              rows={3}
              {...register('description', {
                maxLength: {
                  value: 200,
                  message: 'Descrição deve ter no máximo 200 caracteres'
                }
              })}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {watchedCategoryId && watchedAmount && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">
                      {getSelectedCategory()?.icon}
                    </span>
                    <div>
                      <p className="font-medium">
                        {watch('name') || 'Nome do orçamento'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getSelectedCategory()?.name}
                        {watchedYear && watchedMonth && (
                          <span>
                            {' '}
                            •{' '}
                            {
                              getMonthOptions().find(
                                (m) => m.value === watchedMonth
                              )?.label
                            }{' '}
                            {watchedYear}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-blue-600">
                      {formatCurrency(parseFloat(watchedAmount))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Orçamento mensal
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              💡 Dicas para definir orçamentos
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Analise seus gastos dos últimos meses para definir valores
                realistas
              </li>
              <li>
                • Comece com valores um pouco abaixo da sua média histórica
              </li>
              <li>• Revise e ajuste seus orçamentos mensalmente</li>
              <li>
                • Use a regra 50/30/20: 50% necessidades, 30% desejos, 20%
                poupança
              </li>
            </ul>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Atualizando...' : 'Criando...'}
                </>
              ) : isEditMode ? (
                'Atualizar Orçamento'
              ) : (
                'Criar Orçamento'
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
