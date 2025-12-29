import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
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
  Loader2
} from 'lucide-react';

const ClientDashboard = () => {
  const { user, profile, account, role, transactions, signOut, addTransaction, requestLoan, loading } = useAuth();
  const navigate = useNavigate();
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDescription, setTransferDescription] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanTerm, setLoanTerm] = useState('12');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || role !== 'client')) {
      navigate('/login');
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile || !account) {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleTransfer = async (type: 'pix' | 'transfer' | 'payment' | 'deposit') => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Valor inválido');
      return;
    }
    
    const isDebit = type !== 'deposit';
    if (isDebit && amount > account.balance) {
      toast.error('Saldo insuficiente');
      return;
    }

    await addTransaction({
      type,
      amount: isDebit ? -amount : amount,
      description: transferDescription || (type === 'deposit' ? 'Depósito' : 'Transferência'),
      category: type === 'deposit' ? 'Recebimento' : 'Transferência'
    });

    toast.success(type === 'deposit' ? 'Depósito realizado!' : 'Transferência realizada!');
    setTransferAmount('');
    setTransferDescription('');
    setDialogOpen(false);
  };

  const handleLoanRequest = async () => {
    const amount = parseFloat(loanAmount);
    const term = parseInt(loanTerm);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Valor inválido');
      return;
    }

    await requestLoan(amount, term);
    toast.success('Solicitação de empréstimo enviada!');
    setLoanAmount('');
  };

  const quickActions = [
    { icon: Send, label: 'Pix', color: 'text-primary', type: 'pix' as const },
    { icon: ArrowUpRight, label: 'Transferir', color: 'text-blue-600', type: 'transfer' as const },
    { icon: Receipt, label: 'Pagar', color: 'text-orange-600', type: 'payment' as const },
    { icon: Wallet, label: 'Depositar', color: 'text-success', type: 'deposit' as const }
  ];

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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Olá, {profile.name.split(' ')[0]}! 👋</h1>
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
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm font-medium">Saldo disponível</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex items-center gap-4 pt-4 border-t border-primary-foreground/20">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <div>
                  <p className="text-xs text-primary-foreground/80">Limite do cartão</p>
                  <p className="font-semibold">R$ {account.credit_limit?.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {quickActions.map((action, index) => (
            <Dialog key={index} open={dialogOpen} onOpenChange={setDialogOpen}>
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
                  <Input
                    type="number"
                    placeholder="Valor"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                  />
                  <Input
                    placeholder="Descrição"
                    value={transferDescription}
                    onChange={(e) => setTransferDescription(e.target.value)}
                  />
                  <Button onClick={() => handleTransfer(action.type)} className="w-full">
                    Confirmar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Spending Chart */}
          <Card className="p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
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
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Nenhuma transação ainda</p>
            ) : (
              transactions.slice(0, 5).map((transaction) => (
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
                        {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold ${transaction.amount > 0 ? 'text-success' : 'text-foreground'}`}>
                    {transaction.amount > 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
