import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle, XCircle, LogOut, UserCog, Clock, DollarSign, Calendar, Loader2 } from 'lucide-react';

const AgentDashboard = () => {
  const { user, profile, role, allLoans, signOut, updateLoanStatus, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || role !== 'agent')) {
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

  if (!user || !profile) {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleApprove = async (loanId: string) => {
    await updateLoanStatus(loanId, 'approved');
    toast.success('Empréstimo aprovado!');
  };

  const handleReject = async (loanId: string) => {
    await updateLoanStatus(loanId, 'rejected');
    toast.error('Empréstimo recusado');
  };

  const pendingLoans = allLoans.filter(loan => loan.status === 'pending');
  const processedLoans = allLoans.filter(loan => loan.status !== 'pending');

  const stats = [
    { label: 'Solicitações Pendentes', value: pendingLoans.length, icon: Clock, color: 'text-orange-600' },
    { label: 'Aprovados', value: allLoans.filter(l => l.status === 'approved').length, icon: CheckCircle, color: 'text-success' },
    { label: 'Recusados', value: allLoans.filter(l => l.status === 'rejected').length, icon: XCircle, color: 'text-destructive' }
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <UserCog className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Agente Financeiro</h1>
                <p className="text-muted-foreground">{profile.name}</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 animate-slide-up">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pending Loans */}
        <Card className="p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Solicitações Pendentes
          </h2>
          {pendingLoans.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma solicitação pendente</p>
          ) : (
            <div className="space-y-4">
              {pendingLoans.map((loan) => (
                <div key={loan.id} className="p-4 rounded-xl border-2 border-border hover:border-primary transition-smooth">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{loan.profiles?.name || 'Cliente'}</h3>
                        <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                          Pendente
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Valor:</span>
                          <span className="font-semibold">R$ {loan.amount.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Prazo:</span>
                          <span className="font-semibold">{loan.term} meses</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Solicitado em {new Date(loan.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(loan.id)}
                        className="bg-success hover:bg-success/90 text-success-foreground gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprovar
                      </Button>
                      <Button
                        onClick={() => handleReject(loan.id)}
                        variant="destructive"
                        className="gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Recusar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Processed Loans */}
        {processedLoans.length > 0 && (
          <Card className="p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-bold mb-6">Histórico de Solicitações</h2>
            <div className="space-y-3">
              {processedLoans.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div>
                    <p className="font-semibold">{loan.profiles?.name || 'Cliente'}</p>
                    <p className="text-sm text-muted-foreground">
                      R$ {loan.amount.toLocaleString('pt-BR')} • {loan.term} meses
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    loan.status === 'approved' 
                      ? 'bg-success/20 text-success' 
                      : 'bg-destructive/20 text-destructive'
                  }`}>
                    {loan.status === 'approved' ? 'Aprovado' : 'Recusado'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
