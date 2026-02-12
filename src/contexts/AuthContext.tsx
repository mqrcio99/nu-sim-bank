import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'client' | 'agent' | 'admin';

export interface Transaction {
  id: string;
  type: 'pix' | 'transfer' | 'payment' | 'deposit';
  amount: number;
  description: string;
  date: Date;
  category?: string;
}

export interface Loan {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  term: number;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: UserRole;
  balance: number;
  creditLimit?: number;
  transactions: Transaction[];
  loans: Loan[];
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  loans: Loan[];
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  requestLoan: (amount: number, term: number) => void;
  updateLoanStatus: (loanId: string, status: 'approved' | 'rejected') => void;
  addUser: (user: Omit<User, 'id' | 'transactions' | 'loans'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock initial data
const initialUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    cpf: '123.456.789-00',
    role: 'client',
    balance: 5420.50,
    creditLimit: 10000,
    transactions: [
      {
        id: '1',
        type: 'pix',
        amount: -150.00,
        description: 'Transferência para Maria',
        date: new Date('2025-01-05'),
        category: 'Transferência'
      },
      {
        id: '2',
        type: 'payment',
        amount: -89.90,
        description: 'Conta de luz',
        date: new Date('2025-01-03'),
        category: 'Contas'
      },
      {
        id: '3',
        type: 'deposit',
        amount: 2500.00,
        description: 'Salário',
        date: new Date('2025-01-01'),
        category: 'Recebimento'
      }
    ],
    loans: []
  },
  {
    id: '2',
    name: 'Ana Costa',
    email: 'ana@email.com',
    cpf: '987.654.321-00',
    role: 'agent',
    balance: 0,
    transactions: [],
    loans: []
  },
  {
    id: '3',
    name: 'Carlos Admin',
    email: 'admin@email.com',
    cpf: '111.222.333-44',
    role: 'admin',
    balance: 0,
    transactions: [],
    loans: []
  }
];

const initialLoans: Loan[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'João Silva',
    amount: 15000,
    term: 24,
    status: 'pending',
    requestDate: new Date('2025-01-06')
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loans, setLoans] = useState<Loan[]>(initialLoans);

  const login = (email: string, password: string, role: UserRole): boolean => {
    const user = users.find(u => u.email === email && u.role === role);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    if (!currentUser) return;

    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date()
    };

    const updatedUser = {
      ...currentUser,
      balance: currentUser.balance + transaction.amount,
      transactions: [newTransaction, ...currentUser.transactions]
    };

    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const requestLoan = (amount: number, term: number) => {
    if (!currentUser) return;

    const newLoan: Loan = {
      id: Date.now().toString(),
      clientId: currentUser.id,
      clientName: currentUser.name,
      amount,
      term,
      status: 'pending',
      requestDate: new Date()
    };

    setLoans([...loans, newLoan]);
    
    const updatedUser = {
      ...currentUser,
      loans: [...currentUser.loans, newLoan]
    };
    
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const updateLoanStatus = (loanId: string, status: 'approved' | 'rejected') => {
    setLoans(loans.map(loan => 
      loan.id === loanId ? { ...loan, status } : loan
    ));
    
    setUsers(users.map(user => ({
      ...user,
      loans: user.loans.map(loan => 
        loan.id === loanId ? { ...loan, status } : loan
      )
    })));

    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        loans: currentUser.loans.map(loan => 
          loan.id === loanId ? { ...loan, status } : loan
        )
      });
    }
  };

  const addUser = (user: Omit<User, 'id' | 'transactions' | 'loans'>) => {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      transactions: [],
      loans: []
    };
    setUsers([...users, newUser]);
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      loans,
      login,
      logout,
      addTransaction,
      requestLoan,
      updateLoanStatus,
      addUser,
      updateUser,
      deleteUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
