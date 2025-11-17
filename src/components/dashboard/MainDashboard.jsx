import { useState, useMemo } from "react";
import {
  TrendingUp,
  Wallet,
  Target,
  Calendar,
  Plus,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Progress } from "@/components/ui/progress.jsx";
import { Alert, AlertDescription } from "@/components/ui/alert.jsx";
import {
  useTransactions,
  TRANSACTION_TYPES,
} from "../../contexts/TransactionsContext.jsx";
import { useAccounts } from "../../contexts/AccountsContext.jsx";
import { useBudgets, BUDGET_STATUS } from "../../contexts/BudgetsContext.jsx";
import { useGoals } from "../../contexts/GoalsContext.jsx";

export function MainDashboard() {
  const [showNotifications, setShowNotifications] = useState(true);

  const { transactions, getTotalIncome, getTotalExpenses } = useTransactions();

  const { getTotalBalance, getTotalDebt } = useAccounts();

  const { getBudgetsWithSpent, getTotalBudgeted, getTotalSpent } = useBudgets();

  const { getGoalsWithProgress, getTotalSaved, getTotalTargeted } = useGoals();

  // Período atual (mês atual)
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Calcular totais
  const totalBalance = getTotalBalance();
  const totalDebt = getTotalDebt();
  const netWorth = totalBalance - totalDebt;
  const totalSaved = getTotalSaved();
  const totalTargeted = getTotalTargeted();

  const monthlyIncome = getTotalIncome(monthStart, monthEnd);
  const monthlyExpenses = getTotalExpenses(monthStart, monthEnd);
  const monthlyBalance = monthlyIncome - monthlyExpenses;

  const totalBudgeted = getTotalBudgeted(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1
  );
  const totalSpent = getTotalSpent(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1
  );

  // Dados para gráfico de tendência (últimos 7 dias)
  const weeklyTrendData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(currentDate, 6 - i);
      const dayTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return (
          tDate.toDateString() === date.toDateString() &&
          t.status === "completed"
        );
      });

      const income = dayTransactions
        .filter((t) => t.type === TRANSACTION_TYPES.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = dayTransactions
        .filter((t) => t.type === TRANSACTION_TYPES.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        day: format(date, "dd/MM"),
        receitas: income,
        despesas: expenses,
        saldo: income - expenses,
      };
    });

    return days;
  }, [transactions, currentDate]);

  // Orçamentos com status
  const budgetsWithSpent = getBudgetsWithSpent();
  const budgetAlerts = budgetsWithSpent.filter(
    (budget) =>
      budget.status === BUDGET_STATUS.WARNING ||
      budget.status === BUDGET_STATUS.EXCEEDED
  );

  // Metas com progresso
  const goalsWithProgress = getGoalsWithProgress();
  const activeGoals = goalsWithProgress
    .filter((goal) => goal.status === "active")
    .slice(0, 3);

  // Transações recentes (últimas 5)
  const recentTransactions = transactions
    .filter((t) => t.status === "completed")
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Dados para gráfico de distribuição de gastos
  const expenseDistribution = useMemo(() => {
    const categoryTotals = {};

    transactions
      .filter(
        (t) =>
          t.type === TRANSACTION_TYPES.EXPENSE &&
          t.status === "completed" &&
          new Date(t.date) >= monthStart &&
          new Date(t.date) <= monthEnd
      )
      .forEach((transaction) => {
        const categoryId = transaction.category.id;
        if (!categoryTotals[categoryId]) {
          categoryTotals[categoryId] = {
            name: transaction.category.name,
            value: 0,
            color: transaction.category.color,
          };
        }
        categoryTotals[categoryId].value += transaction.amount;
      });

    return Object.values(categoryTotals)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions, monthStart, monthEnd]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case BUDGET_STATUS.ON_TRACK:
        return "text-green-600";
      case BUDGET_STATUS.WARNING:
        return "text-yellow-600";
      case BUDGET_STATUS.EXCEEDED:
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com saudação */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olá! 👋</h1>
          <p className="text-muted-foreground">
            Aqui está um resumo das suas finanças em{" "}
            {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        {/* <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nova Transação</span>
        </Button> */}
      </div>

      {/* Alertas e Notificações */}
      {showNotifications &&
        (budgetAlerts.length > 0 ||
          activeGoals.some((g) => g.progress.isOverdue)) && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Bell className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">
                  Você tem notificações importantes:
                </p>
                {budgetAlerts.length > 0 && (
                  <p className="text-sm">
                    • {budgetAlerts.length} orçamento(s) próximo(s) do limite ou
                    ultrapassado(s)
                  </p>
                )}
                {activeGoals.some((g) => g.progress.isOverdue) && (
                  <p className="text-sm">
                    • {activeGoals.filter((g) => g.progress.isOverdue).length}{" "}
                    meta(s) com prazo vencido
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

      {/* Cards principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Patrimônio Líquido
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                netWorth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(netWorth)}
            </div>
            <p className="text-xs text-muted-foreground">
              Saldo total menos dívidas
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <div className="text-xs text-green-600">
                ↑ {formatCurrency(totalBalance)}
              </div>
              {totalDebt > 0 && (
                <div className="text-xs text-red-600">
                  ↓ {formatCurrency(totalDebt)}
                </div>
              )}
            </div>
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
                monthlyBalance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(monthlyBalance)}
            </div>
            <p className="text-xs text-muted-foreground">Receitas - Despesas</p>
            <div className="flex items-center space-x-2 mt-2">
              <div className="text-xs text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {formatCurrency(monthlyIncome)}
              </div>
              <div className="text-xs text-red-600 flex items-center">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                {formatCurrency(monthlyExpenses)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamento</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalBudgeted > 0
                ? `${((totalSpent / totalBudgeted) * 100).toFixed(1)}%`
                : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalSpent)} de {formatCurrency(totalBudgeted)}
            </p>
            <Progress
              value={totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(totalSaved)}
            </div>
            <p className="text-xs text-muted-foreground">
              de {formatCurrency(totalTargeted)} (meta)
            </p>
            <Progress
              value={totalTargeted > 0 ? (totalSaved / totalTargeted) * 100 : 0}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e análises */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Tendência semanal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tendência da Semana</CardTitle>
            <CardDescription>Fluxo de caixa dos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrendData}>
                  <XAxis dataKey="day" />
                  <YAxis
                    tickFormatter={(value) =>
                      `R$ ${(value / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip
                    formatter={(value, name) => [formatCurrency(value), name]}
                  />
                  <Line
                    type="monotone"
                    dataKey="receitas"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Receitas"
                  />
                  <Line
                    type="monotone"
                    dataKey="despesas"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Despesas"
                  />
                  <Line
                    type="monotone"
                    dataKey="saldo"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Saldo"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição de gastos */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos do Mês</CardTitle>
            <CardDescription>Top 5 categorias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {expenseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Gasto"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seções de detalhes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Transações recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>Suas últimas movimentações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        transaction.type === TRANSACTION_TYPES.INCOME
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.category.icon} {transaction.category.name}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      transaction.type === TRANSACTION_TYPES.INCOME
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === TRANSACTION_TYPES.INCOME ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma transação recente
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metas ativas */}
        <Card>
          <CardHeader>
            <CardTitle>Metas Ativas</CardTitle>
            <CardDescription>Progresso das suas metas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeGoals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{goal.icon}</span>
                      <span className="text-sm font-medium">{goal.name}</span>
                    </div>
                    <Badge
                      variant={
                        goal.progress.isOverdue ? "destructive" : "default"
                      }
                    >
                      {goal.progress.percentage.toFixed(0)}%
                    </Badge>
                  </div>
                  <Progress value={goal.progress.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span>{formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>
              ))}
              {activeGoals.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma meta ativa
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alertas de orçamento */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Orçamentos</CardTitle>
            <CardDescription>Acompanhe seus limites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgetsWithSpent.slice(0, 4).map((budget) => (
                <div
                  key={budget.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{budget.category.icon}</span>
                    <span className="text-sm font-medium">
                      {budget.category.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-medium ${getStatusColor(
                        budget.status
                      )}`}
                    >
                      {budget.percentage.toFixed(0)}%
                    </span>
                    {budget.status === BUDGET_STATUS.ON_TRACK && (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    )}
                    {budget.status === BUDGET_STATUS.WARNING && (
                      <AlertTriangle className="h-3 w-3 text-yellow-600" />
                    )}
                    {budget.status === BUDGET_STATUS.EXCEEDED && (
                      <Clock className="h-3 w-3 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
              {budgetsWithSpent.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum orçamento definido
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
