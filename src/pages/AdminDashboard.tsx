import { useState, useEffect } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Shield, LogOut, Users, UserCog, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  balance?: number;
}

const AdminDashboard = () => {
  const { user, profile, role, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!loading && (!user || role !== 'admin')) {
      navigate('/login');
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (user && role === 'admin') {
      fetchAllUsers();
    }
  }, [user, role]);

  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      // Fetch profiles with their roles and accounts
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name');

      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const { data: accounts } = await supabase
        .from('accounts')
        .select('user_id, balance');

      if (profiles && roles) {
        const usersWithRoles = profiles.map(p => {
          const userRole = roles.find(r => r.user_id === p.id);
          const userAccount = accounts?.find(a => a.user_id === p.id);
          return {
            id: p.id,
            name: p.name,
            email: '',
            role: (userRole?.role || 'client') as UserRole,
            balance: userAccount?.balance || 0
          };
        });
        setUsers(usersWithRoles);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoadingUsers(false);
  };

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

  const getRoleIcon = (userRole: UserRole) => {
    switch (userRole) {
      case 'client': return User;
      case 'agent': return UserCog;
      case 'admin': return Shield;
    }
  };

  const getRoleLabel = (userRole: UserRole) => {
    switch (userRole) {
      case 'client': return 'Cliente';
      case 'agent': return 'Agente';
      case 'admin': return 'Admin';
    }
  };

  const stats = [
    { label: 'Total de Usuários', value: users.length, icon: Users },
    { label: 'Clientes', value: users.filter(u => u.role === 'client').length, icon: User },
    { label: 'Agentes', value: users.filter(u => u.role === 'agent').length, icon: UserCog }
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Painel Administrativo</h1>
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
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="p-6 animate-slide-up bg-primary/5 border-primary/20" style={{ animationDelay: '0.1s' }}>
          <p className="text-sm text-muted-foreground">
            💡 Os novos usuários devem se cadastrar pela página de login. Cada novo usuário recebe automaticamente R$ 5.000 de saldo inicial e a role de "cliente".
          </p>
        </Card>

        {/* Users List */}
        <Card className="p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-bold mb-6">Usuários Cadastrados</h2>
          {loadingUsers ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum usuário cadastrado</p>
          ) : (
            <div className="space-y-3">
              {users.map((u) => {
                const RoleIcon = getRoleIcon(u.role);
                return (
                  <div key={u.id} className="p-4 rounded-xl border-2 border-border hover:border-primary transition-smooth">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                          <RoleIcon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-bold">{u.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                              {getRoleLabel(u.role)}
                            </span>
                            {u.role === 'client' && u.balance !== undefined && (
                              <span className="text-xs text-muted-foreground">
                                Saldo: R$ {u.balance.toLocaleString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
