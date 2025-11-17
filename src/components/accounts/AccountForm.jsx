import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Loader2,
  Wallet,
  Building2,
  CreditCard,
  PiggyBank,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button.jsx"
import { Input } from "@/components/ui/input.jsx"
import { Label } from "@/components/ui/label.jsx"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx"
import { Alert, AlertDescription } from "@/components/ui/alert.jsx"
import { useAccounts, ACCOUNT_TYPES } from "../../contexts/AccountsContext.jsx"

// Configurações dos tipos de conta
const ACCOUNT_TYPE_CONFIG = {
  [ACCOUNT_TYPES.CHECKING]: {
    label: "Conta Corrente",
    icon: Wallet,
    color: "#1f77b4",
    description: "Para movimentações do dia a dia",
  },
  [ACCOUNT_TYPES.SAVINGS]: {
    label: "Poupança",
    icon: PiggyBank,
    color: "#2ca02c",
    description: "Para guardar dinheiro",
  },
  [ACCOUNT_TYPES.CREDIT]: {
    label: "Cartão de Crédito",
    icon: CreditCard,
    color: "#8e44ad",
    description: "Para compras a prazo",
  },
  [ACCOUNT_TYPES.CASH]: {
    label: "Dinheiro",
    icon: Wallet,
    color: "#f39c12",
    description: "Dinheiro em espécie",
  },
  [ACCOUNT_TYPES.INVESTMENT]: {
    label: "Investimentos",
    icon: TrendingUp,
    color: "#e74c3c",
    description: "Para aplicações financeiras",
  },
}

// Cores predefinidas para contas
const ACCOUNT_COLORS = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
]

export function AccountForm({ account, onSave, onCancel }) {
  const [selectedColor, setSelectedColor] = useState(
    account?.color || ACCOUNT_COLORS[0]
  )

  const { addAccount, updateAccount, isLoading, error, clearError } =
    useAccounts()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,   // ✅ CORRIGIDO AQUI
    watch,
    reset,
  } = useForm({
    defaultValues: {
      name: account?.name || "",
      type: account?.type || ACCOUNT_TYPES.CHECKING, // pequeno ajuste
      balance: account?.balance ?? 0,
      bank: account?.bank || "",
      accountNumber: account?.accountNumber || "",
      creditLimit: account?.creditLimit ?? 0,
    },
  })

  const watchedType = watch("type")
  const isEditMode = !!account

  useEffect(() => {
    clearError()
  }, [clearError])

  useEffect(() => {
    if (watchedType && ACCOUNT_TYPE_CONFIG[watchedType]) {
      setSelectedColor(ACCOUNT_TYPE_CONFIG[watchedType].color)
    }
  }, [watchedType])

  const onSubmit = async (data) => {
    try {
      const accountData = {
        ...data,
        color: selectedColor,
        balance: parseFloat(data.balance) || 0,
        creditLimit:
          data.type === ACCOUNT_TYPES.CREDIT
            ? parseFloat(data.creditLimit) || 0
            : undefined,
      }

      if (isEditMode) {
        await updateAccount(account.id, accountData)
      } else {
        await addAccount(accountData)
      }

      onSave?.()
    } catch (err) {
      console.error("Erro ao salvar conta:", err)
    }
  }

  const handleCancel = () => {
    reset()
    clearError()
    onCancel?.()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="h-5 w-5" />
          <span>{isEditMode ? "Editar Conta" : "Nova Conta"}</span>
        </CardTitle>
        <CardDescription>
          {isEditMode
            ? "Atualize as informações da sua conta financeira"
            : "Adicione uma nova conta para organizar suas finanças"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nome da Conta */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Conta *</Label>
            <Input
              id="name"
              placeholder="Ex: Conta Corrente Principal"
              {...register("name", {
                required: "Nome da conta é obrigatório",
                minLength: {
                  value: 2,
                  message: "Nome deve ter pelo menos 2 caracteres",
                },
                maxLength: {
                  value: 50,
                  message: "Nome deve ter no máximo 50 caracteres",
                },
              })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Tipo da Conta */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Conta *</Label>
            <Select
              value={watchedType}
              onValueChange={(value) => setValue("type", value)} // ✅ agora funciona
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de conta" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACCOUNT_TYPE_CONFIG).map(([type, config]) => {
                  const Icon = config.icon
                  return (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center space-x-2">
                        <Icon
                          className="h-4 w-4"
                          style={{ color: config.color }}
                        />
                        <div>
                          <div className="font-medium">{config.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {config.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">
                Tipo de conta é obrigatório
              </p>
            )}
          </div>

          {/* Saldo Inicial */}
          <div className="space-y-2">
            <Label htmlFor="balance">
              Saldo {isEditMode ? "Atual" : "Inicial"} *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground">
                R$
              </span>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0,00"
                className="pl-10"
                {...register("balance", {
                  required: "Saldo é obrigatório",
                  min: {
                    value: watchedType === ACCOUNT_TYPES.CREDIT ? -999999 : 0,
                    message:
                      watchedType === ACCOUNT_TYPES.CREDIT
                        ? "Saldo não pode ser menor que -999.999"
                        : "Saldo não pode ser negativo",
                  },
                })}
              />
            </div>
            {errors.balance && (
              <p className="text-sm text-destructive">
                {errors.balance.message}
              </p>
            )}
            {watchedType === ACCOUNT_TYPES.CREDIT && (
              <p className="text-xs text-muted-foreground">
                Para cartões de crédito, use valores negativos para representar
                dívidas
              </p>
            )}
          </div>

          {/* Banco (opcional para dinheiro) */}
          {watchedType !== ACCOUNT_TYPES.CASH && (
            <div className="space-y-2">
              <Label htmlFor="bank">Banco/Instituição</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="bank"
                  placeholder="Ex: Banco do Brasil, Nubank"
                  className="pl-10"
                  {...register("bank")}
                />
              </div>
            </div>
          )}

          {/* Número da Conta */}
          {watchedType !== ACCOUNT_TYPES.CASH && (
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Número da Conta</Label>
              <Input
                id="accountNumber"
                placeholder="Ex: 12345-6, ****1234"
                {...register("accountNumber")}
              />
            </div>
          )}

          {/* Limite de Crédito (apenas para cartões) */}
          {watchedType === ACCOUNT_TYPES.CREDIT && (
            <div className="space-y-2">
              <Label htmlFor="creditLimit">Limite de Crédito</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="creditLimit"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="pl-10"
                  {...register("creditLimit", {
                    min: {
                      value: 0,
                      message: "Limite não pode ser negativo",
                    },
                  })}
                />
              </div>
              {errors.creditLimit && (
                <p className="text-sm text-destructive">
                  {errors.creditLimit.message}
                </p>
              )}
            </div>
          )}

          {/* Seletor de Cor */}
          <div className="space-y-2">
            <Label>Cor da Conta</Label>
            <div className="flex flex-wrap gap-2">
              {ACCOUNT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? "border-foreground scale-110"
                      : "border-muted hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          {/* Preview da Conta */}
          {watchedType && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <div>
                    <p className="font-medium">
                      {watch("name") || "Nome da conta"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {ACCOUNT_TYPE_CONFIG[watchedType]?.label}
                      {watch("bank") && ` • ${watch("bank")}`}
                    </p>
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
                  {isEditMode ? "Atualizando..." : "Criando..."}
                </>
              ) : isEditMode ? (
                "Atualizar Conta"
              ) : (
                "Criar Conta"
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
