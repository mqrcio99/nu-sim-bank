import { useState } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Shield, LogOut, Users, UserCog, User, Trash2, Edit, Plus } from 'lucide-react';

const AdminDashboard = () => {
  const { currentUser, logout, users, addUser, updateUser, deleteUser } = useAuth();
  const navigate = useNavigate();
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    cpf: '',
    role: 'client' as UserRole,
    balance: 0,
    creditLimit: 0
  });

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.cpf) {
      toast.error('Preencha todos os campos');
      return;
    }

    addUser(newUser);
    toast.success('Usuário adicionado com sucesso!');
    setNewUser({
      name: '',
      email: '',
      cpf: '',
      role: 'client',
      balance: 0,
      creditLimit: 0
    });
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    updateUser(editingUser.id, editingUser);
    toast.success('Usuário atualizado com sucesso!');
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
      toast.error('Você não pode deletar sua própria conta');
      return;
    }

    deleteUser(userId);
    toast.success('Usuário removido com sucesso!');
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'client': return User;
      case 'agent': return UserCog;
      case 'admin': return Shield;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
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
                <p className="text-muted-foreground">{currentUser.name}</p>
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

        {/* Add User */}
        <Card className="p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Novo Usuário
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Nome completo"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <Input
              placeholder="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <Input
              placeholder="CPF"
              value={newUser.cpf}
              onChange={(e) => setNewUser({ ...newUser, cpf: e.target.value })}
            />
            <select
              className="w-full p-2 rounded-lg border border-input bg-background"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
            >
              <option value="client">Cliente</option>
              <option value="agent">Agente Financeiro</option>
              <option value="admin">Administrador</option>
            </select>
            {newUser.role === 'client' && (
              <>
                <Input
                  placeholder="Saldo inicial"
                  type="number"
                  value={newUser.balance}
                  onChange={(e) => setNewUser({ ...newUser, balance: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  placeholder="Limite do cartão"
                  type="number"
                  value={newUser.creditLimit}
                  onChange={(e) => setNewUser({ ...newUser, creditLimit: parseFloat(e.target.value) || 0 })}
                />
              </>
            )}
          </div>
          <Button onClick={handleAddUser} className="mt-4 gradient-primary">
            Adicionar Usuário
          </Button>
        </Card>

        {/* Users List */}
        <Card className="p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-bold mb-6">Gerenciar Usuários</h2>
          <div className="space-y-3">
            {users.map((user) => {
              const RoleIcon = getRoleIcon(user.role);
              return (
                <div key={user.id} className="p-4 rounded-xl border-2 border-border hover:border-primary transition-smooth">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                        <RoleIcon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-bold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            {getRoleLabel(user.role)}
                          </span>
                          {user.role === 'client' && (
                            <span className="text-xs text-muted-foreground">
                              Saldo: R$ {user.balance.toLocaleString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Usuário</DialogTitle>
                          </DialogHeader>
                          {editingUser && (
                            <div className="space-y-4">
                              <Input
                                placeholder="Nome"
                                value={editingUser.name}
                                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                              />
                              <Input
                                placeholder="Email"
                                value={editingUser.email}
                                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                              />
                              {editingUser.role === 'client' && (
                                <Input
                                  placeholder="Saldo"
                                  type="number"
                                  value={editingUser.balance}
                                  onChange={(e) => setEditingUser({ ...editingUser, balance: parseFloat(e.target.value) })}
                                />
                              )}
                              <Button onClick={handleUpdateUser} className="w-full">
                                Salvar Alterações
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.id === currentUser.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
