import { useState } from "react";
import { MoreHorizontal, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu.jsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog.jsx";
import { useAccounts, ACCOUNT_TYPES } from "../../contexts/AccountsContext.jsx";
import { AccountForm } from "./AccountForm.jsx";

// Ícones para cada tipo de conta
const getAccountIcon = (type) => {
  const icons = {
    [ACCOUNT_TYPES.CHECKING]: "💳",
    [ACCOUNT_TYPES.SAVINGS]: "🏦",
    [ACCOUNT_TYPES.CREDIT]: "💳",
    [ACCOUNT_TYPES.CASH]: "💰",
    [ACCOUNT_TYPES.INVESTMENT]: "📈",
  };
  return icons[type] || "💰";
};

// Labels para tipos de conta
const getAccountTypeLabel = (type) => {
  const labels = {
    [ACCOUNT_TYPES.CHECKING]: "Conta Corrente",
    [ACCOUNT_TYPES.SAVINGS]: "Poupança",
    [ACCOUNT_TYPES.CREDIT]: "Cartão de Crédito",
    [ACCOUNT_TYPES.CASH]: "Dinheiro",
    [ACCOUNT_TYPES.INVESTMENT]: "Investimentos",
  };
  return labels[type] || "Conta";
};

export function AccountsList() {
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(null);
  const [showBalances, setShowBalances] = useState(true);

  const {
    accounts,
    deleteAccount,
    getTotalBalance,
    getTotalDebt,
    isLoading,
    error,
  } = useAccounts();

  const handleAddAccount = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleDeleteAccount = async () => {
    if (deletingAccount) {
      try {
        await deleteAccount(deletingAccount.id);
        setDeletingAccount(null);
      } catch (error) {
        console.error("Erro ao deletar conta:", error);
      }
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatBalance = (amount, type) => {
    if (!showBalances) return "••••";

    if (type === ACCOUNT_TYPES.CREDIT && amount < 0) {
      return `${formatCurrency(Math.abs(amount))} (dívida)`;
    }

    return formatCurrency(amount);
  };

  const getBalanceColor = (amount, type) => {
    if (type === ACCOUNT_TYPES.CREDIT) {
      return amount < 0 ? "text-red-600" : "text-green-600";
    }
    return amount >= 0 ? "text-green-600" : "text-red-600";
  };

  const totalBalance = getTotalBalance();
  const totalDebt = getTotalDebt();

  return (
    <div className="space-y-6">
      {/* Header com resumo */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contas</h2>
          <p className="text-muted-foreground">
            Gerencie suas contas e acompanhe seus saldos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowBalances((prev) => !prev)}
            title={showBalances ? "Ocultar saldos" : "Mostrar saldos"}
          >
            {showBalances ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            onClick={handleAddAccount}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Conta</span>
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {showBalances ? formatCurrency(totalBalance) : "••••••"}
            </div>
            <p className="text-xs text-muted-foreground">
              Soma de todas as contas (exceto cartões)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Dívidas
            </CardTitle>
            <span className="text-2xl">💳</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {showBalances ? formatCurrency(totalDebt) : "••••••"}
            </div>
            <p className="text-xs text-muted-foreground">
              Dívidas em cartões de crédito
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Patrimônio Líquido
            </CardTitle>
            <span className="text-2xl">📊</span>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalBalance - totalDebt >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {showBalances
                ? formatCurrency(totalBalance - totalDebt)
                : "••••••"}
            </div>
            <p className="text-xs text-muted-foreground">
              Saldo total menos dívidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de contas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: account.color }}
                  />
                  <div>
                    <CardTitle className="text-base">{account.name}</CardTitle>
                    <CardDescription className="flex items-center space-x-1">
                      <span>{getAccountIcon(account.type)}</span>
                      <span>{getAccountTypeLabel(account.type)}</span>
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleEditAccount(account)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeletingAccount(account)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {/* Saldo */}
                <div>
                  <p className="text-sm text-muted-foreground">Saldo</p>
                  <p
                    className={`text-xl font-bold ${getBalanceColor(
                      account.balance,
                      account.type
                    )}`}
                  >
                    {formatBalance(account.balance, account.type)}
                  </p>
                </div>

                {/* Limite de crédito (se aplicável) */}
                {account.type === ACCOUNT_TYPES.CREDIT &&
                  account.creditLimit && (
                    <div>
                      <p className="text-sm text-muted-foreground">Limite</p>
                      <p className="text-sm font-medium">
                        {showBalances
                          ? formatCurrency(account.creditLimit)
                          : "••••"}
                      </p>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              (Math.abs(account.balance) /
                                account.creditLimit) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {showBalances
                          ? `${(
                              (Math.abs(account.balance) /
                                account.creditLimit) *
                              100
                            ).toFixed(1)}% utilizado`
                          : "••• utilizado"}
                      </p>
                    </div>
                  )}

                {/* Informações adicionais */}
                {account.bank && (
                  <div>
                    <p className="text-sm text-muted-foreground">Banco</p>
                    <p className="text-sm font-medium">{account.bank}</p>
                  </div>
                )}

                {account.accountNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Conta</p>
                    <p className="text-sm font-medium">
                      {account.accountNumber}
                    </p>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between">
                  <Badge variant={account.isActive ? "default" : "secondary"}>
                    {account.isActive ? "Ativa" : "Inativa"}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {new Date(account.updatedAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Card para adicionar nova conta */}
        <Card
          className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer"
          onClick={handleAddAccount}
        >
          <CardContent className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center space-y-2">
              <Plus className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                Adicionar Nova Conta
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mensagem quando não há contas */}
      {accounts.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="text-6xl">💰</div>
              <div>
                <h3 className="text-lg font-semibold">
                  Nenhuma conta encontrada
                </h3>
                <p className="text-muted-foreground">
                  Adicione sua primeira conta para começar a gerenciar suas
                  finanças
                </p>
              </div>
              <Button onClick={handleAddAccount}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeira Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para formulário */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "Editar Conta" : "Nova Conta"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da conta e salve para atualizar sua lista.
            </DialogDescription>
          </DialogHeader>

          <AccountForm
            account={editingAccount}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para exclusão */}
      <AlertDialog
        open={!!deletingAccount}
        onOpenChange={(open) => {
          if (!open) setDeletingAccount(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conta "{deletingAccount?.name}"?
              {deletingAccount?.balance !== 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Atenção: Esta conta possui saldo diferente de zero (
                  {formatCurrency(deletingAccount?.balance || 0)}).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
