import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogIn, User, UserCog, Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast.error('Selecione um tipo de conta');
      return;
    }

    const success = login(email, password, selectedRole);
    
    if (success) {
      toast.success('Login realizado com sucesso!');
      switch (selectedRole) {
        case 'client':
          navigate('/dashboard');
          break;
        case 'agent':
          navigate('/agent');
          break;
        case 'admin':
          navigate('/admin');
          break;
      }
    } else {
      toast.error('Email, senha ou tipo de conta incorretos');
    }
  };

  const roles = [
    { value: 'client' as UserRole, label: 'Cliente', icon: User, description: 'Acesse sua conta' },
    { value: 'agent' as UserRole, label: 'Agente Financeiro', icon: UserCog, description: 'Gerencie empréstimos' },
    { value: 'admin' as UserRole, label: 'Administrador', icon: Shield, description: 'Administre usuários' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center gradient-primary p-4">
      <Card className="w-full max-w-md p-8 shadow-purple animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
            <LogIn className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Bem-vindo</h1>
          <p className="text-muted-foreground mt-2">Faça login na sua conta</p>
        </div>

        {!selectedRole ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-center mb-4">Selecione o tipo de conta:</p>
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className="w-full p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-accent transition-smooth text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
                    <role.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{role.label}</p>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {roles.find(r => r.value === selectedRole)?.icon && (
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    {(() => {
                      const Icon = roles.find(r => r.value === selectedRole)!.icon;
                      return <Icon className="w-5 h-5 text-primary-foreground" />;
                    })()}
                  </div>
                )}
                <span className="font-semibold text-sm">{roles.find(r => r.value === selectedRole)?.label}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRole(null)}
              >
                Trocar
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Senha</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full gradient-primary text-primary-foreground shadow-purple">
              Entrar
            </Button>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 font-semibold">Contas de demonstração:</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• Cliente: joao@email.com</p>
                <p>• Agente: ana@email.com</p>
                <p>• Admin: admin@email.com</p>
                <p className="mt-2 italic">Senha: qualquer valor</p>
              </div>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default Login;
