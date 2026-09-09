import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import TransactionReceipt, { ReceiptData } from '@/components/TransactionReceipt';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  DollarSign, 
  LogOut, 
  Send, 
  Wallet,
  TrendingUp,
  Receipt,
  PiggyBank,
  Target,
  PlusCircle,
  Eye,
  EyeOff
} from 'lucide-react';

type ActionType = 'pix' | 'transfer' | 'payment' | 'deposit';

const actionConfig: Record<ActionType, {
  label: string;
  icon: typeof Send;
  color: string;
  recipientLabel: string;
  recipientPlaceholder: string;
  category: string;
}> = {
  pix: {
    label: 'Pix',
    icon: Send,
    color: 'text-primary',
    recipientLabel: 'Chave Pix do destinatário',
    recipientPlaceholder: 'E-mail, CPF ou telefone',
    category: 'Transferência',
  },
  transfer: {
    label: 'Transferir',
    icon: ArrowUpRight,
    color: 'text-blue-600',
    recipientLabel: 'Nome do destinatário',
    recipientPlaceholder: 'Ex: Maria Souza',
    category: 'Transferência',
  },
  payment: {
    label: 'Pagar',
    icon: Receipt,
    color: 'text-orange-600',
    recipientLabel: 'Beneficiário',
    recipientPlaceholder: 'Ex: Companhia de Energia',
    category: 'Contas',
  },
  deposit: {
    label: 'Depositar',
    icon: Wallet,
    color: 'text-success',
    recipientLabel: 'Origem do depósito',
    recipientPlaceholder: 'Ex: Salário',
    category: 'Recebimento',
  },
};

const randomCode = () =>
  Array.from({ length: 4 }, () => Math.random().toString(36).slice(2, 7).toUpperCase()).join('-');

const ClientDashboard = () => {
  const { currentUser, logout, addTransaction, requestLoan, createSavingsGoal } = useAuth();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(false);
  const [openAction, setOpenAction] = useState<ActionType | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDescription, setTransferDescription] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanTerm, setLoanTerm] = useState('12');
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const resetActionForm = () => {
    setTransferAmount('');
    setTransferDescription('');
    setRecipientName('');
  };

  const handleAction = (type: ActionType) => {
    const config = actionConfig[type];
    const amount = parseFloat(transferAmount);

    if (isNaN(amount) || amount <= 0) {
      toast.error('Valor inválido');
      return;
    }
    if (type !== 'deposit' && amount > currentUser.balance) {
      toast.error('Saldo insuficiente');
      return;
    }
    if (!recipientName.trim()) {
      toast.error(`Informe: ${config.recipientLabel.toLowerCase()}`);
      return;
    }

    const signedAmount = type === 'deposit' ? amount : -amount;
    const description =
      transferDescription.trim() || `${config.label} - ${recipientName.trim()}`;

    addTransaction({
      type,
      amount: signedAmount,
      description,
      category: config.category,
    });

    const now = new Date();
    setReceipt({
      id: `${now.getTime()}`,
      authCode: randomCode(),
      type,
      amount: signedAmount,
      date: now,
      description,
      senderName: currentUser.name,
      senderCpf: currentUser.cpf,
      recipient: recipientName.trim(),
    });

    toast.success('Operação realizada com sucesso!');
    setOpenAction(null);
    resetActionForm();
  };

  const handleLoanRequest = () => {
    const amount = parseFloat(loanAmount);
    const term = parseInt(loanTerm);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Valor inválido');
      return;
    }

    requestLoan(amount, term);
    toast.success('Solicitação de empréstimo enviada!');
    setLoanAmount('');
  };

  const handleCreateGoal = () => {
    const targetAmount = parseFloat(goalTarget);
    const currentAmount = parseFloat(goalCurrent);

    if (!goalName.trim() || isNaN(targetAmount) || targetAmount <= 0 || isNaN(currentAmount) || currentAmount < 0) {
      toast.error('Preencha os dados da meta corretamente');
      return;
    }

    createSavingsGoal({
      name: goalName.trim(),
      targetAmount,
      currentAmount,
      deadline: 'Meta personalizada'
    });

    toast.success('Meta de economia criada com sucesso!');
    setGoalName('');
    setGoalTarget('');
    setGoalCurrent('');
  };

  const quickActions = (Object.keys(actionConfig) as ActionType[]).map((type) => ({
    type,
    ...actionConfig[type],
  }));

  const spendingByCategory = [
    { category: 'Alimentação', amount: 450, percentage: 35 },
    { category: 'Transporte', amount: 280, percentage: 22 },
    { category: 'Lazer', amount: 320, percentage: 25 },
    { category: 'Contas', amount: 230, percentage: 18 }
  ];


  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Olá, {currentUser.name.split(' ')[0]}! 👋</h1>
            <p className="text-muted-foreground">Bem-vindo de volta</p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>

        {/* Balance Card */}
        <Card className="gradient-primary p-6 md:p-8 text-primary-foreground shadow-purple animate-slide-up">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Saldo disponível</span>
              </div>
              <button
                type="button"
                onClick={() => setShowBalance((v) => !v)}
                aria-label={showBalance ? 'Esconder saldo' : 'Mostrar saldo'}
                className="p-2 rounded-full hover:bg-primary-foreground/15 transition-smooth"
              >
                {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              {showBalance
                ? `R$ ${currentUser.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : 'R$ ••••••'}
            </h2>
            <div className="flex items-center gap-4 pt-4 border-t border-primary-foreground/20">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <div>
                  <p className="text-xs text-primary-foreground/80">Limite do cartão</p>
                  <p className="font-semibold">
                    {showBalance ? `R$ ${currentUser.creditLimit?.toLocaleString('pt-BR')}` : 'R$ ••••'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {quickActions.map((action) => (
            <Dialog
              key={action.type}
              open={openAction === action.type}
              onOpenChange={(open) => {
                setOpenAction(open ? action.type : null);
                if (!open) resetActionForm();
              }}
            >
              <DialogTrigger asChild>
                <Card className="p-6 cursor-pointer hover:shadow-hover transition-smooth group">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-smooth">
                      <action.icon className={`w-6 h-6 ${action.color}`} />
                    </div>
                    <span className="font-semibold text-sm">{action.label}</span>
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{action.label}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Valor</label>
                    <Input
                      type="number"
                      placeholder="R$ 0,00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{action.recipientLabel}</label>
                    <Input
                      placeholder={action.recipientPlaceholder}
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Descrição (opcional)</label>
                    <Input
                      placeholder="Ex: aluguel de janeiro"
                      value={transferDescription}
                      onChange={(e) => setTransferDescription(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => handleAction(action.type)} className="w-full gradient-primary">
                    Confirmar
                  </Button>
                </div>

              </DialogContent>
            </Dialog>
          ))}
        </div>

        <Card className="p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Metas de Economia</h3>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              {(currentUser.savingsGoals || []).length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Nenhuma meta criada ainda. Defina uma para começar a organizar seus objetivos.
                </div>
              ) : (
                (currentUser.savingsGoals || []).map((goal) => {
                  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

                  return (
                    <div key={goal.id} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{goal.name}</p>
                          <p className="text-sm text-muted-foreground">Prazo: {goal.deadline}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">R$ {goal.currentAmount.toLocaleString('pt-BR')}</p>
                          <p className="text-xs text-muted-foreground">de R$ {goal.targetAmount.toLocaleString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div className="h-full gradient-primary rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{progress.toFixed(0)}% alcançado</span>
                        <span>Faltam R$ {remaining.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="space-y-4 rounded-xl bg-accent/30 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <PlusCircle className="w-4 h-4 text-primary" />
                Nova meta
              </div>
              <Input
                placeholder="Nome da meta"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Valor da meta"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Valor já guardado"
                value={goalCurrent}
                onChange={(e) => setGoalCurrent(e.target.value)}
              />
              <Button onClick={handleCreateGoal} className="w-full gradient-primary">
                Criar meta
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Spending Chart */}
          <Card className="p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Gastos por Categoria</h3>
            </div>
            <div className="space-y-4">
              {spendingByCategory.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.category}</span>
                    <span className="font-semibold">R$ {item.amount}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full gradient-primary rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Loan Request */}
          <Card className="p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-6">
              <PiggyBank className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Solicitar Empréstimo</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Valor desejado</label>
                <Input
                  type="number"
                  placeholder="R$ 0,00"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Prazo (meses)</label>
                <select
                  className="w-full p-2 rounded-lg border border-input bg-background"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                >
                  <option value="12">12 meses</option>
                  <option value="24">24 meses</option>
                  <option value="36">36 meses</option>
                  <option value="48">48 meses</option>
                </select>
              </div>
              <Button onClick={handleLoanRequest} className="w-full gradient-primary">
                Solicitar Empréstimo
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h3 className="font-bold text-lg mb-4">Transações Recentes</h3>
          <div className="space-y-3">
            {currentUser.transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-smooth">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.amount > 0 ? 'bg-success/20' : 'bg-destructive/20'
                  }`}>
                    {transaction.amount > 0 ? (
                      <ArrowDownLeft className={`w-5 h-5 text-success`} />
                    ) : (
                      <ArrowUpRight className={`w-5 h-5 text-destructive`} />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.date.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <span className={`font-bold ${transaction.amount > 0 ? 'text-success' : 'text-foreground'}`}>
                  {transaction.amount > 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <TransactionReceipt receipt={receipt} onClose={() => setReceipt(null)} />
    </div>

  );
};

export default ClientDashboard;
