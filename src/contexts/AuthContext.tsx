import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'client' | 'agent' | 'admin';

export interface Profile {
  id: string;
  name: string;
  cpf: string | null;
}

export interface Account {
  id: string;
  user_id: string;
  balance: number;
  credit_limit: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'pix' | 'transfer' | 'payment' | 'deposit';
  amount: number;
  description: string;
  category: string | null;
  created_at: string;
}

export interface Loan {
  id: string;
  user_id: string;
  amount: number;
  term: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles?: Profile;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  account: Account | null;
  role: UserRole | null;
  transactions: Transaction[];
  loans: Loan[];
  allLoans: Loan[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, cpf?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  requestLoan: (amount: number, term: number) => Promise<void>;
  updateLoanStatus: (loanId: string, status: 'approved' | 'rejected') => Promise<void>;
  refreshData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [allLoans, setAllLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileData) setProfile(profileData);

      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (roleData) setRole(roleData.role as UserRole);

      // Fetch account
      const { data: accountData } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (accountData) setAccount(accountData);

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (transactionsData) setTransactions(transactionsData as Transaction[]);

      // Fetch user's loans
      const { data: loansData } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (loansData) setLoans(loansData as Loan[]);

      // If agent or admin, fetch all loans
      if (roleData?.role === 'agent' || roleData?.role === 'admin') {
        const { data: allLoansData } = await supabase
          .from('loans')
          .select(`*, profiles(name)`)
          .order('created_at', { ascending: false });
        
        if (allLoansData) setAllLoans(allLoansData as Loan[]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setAccount(null);
          setRole(null);
          setTransactions([]);
          setLoans([]);
          setAllLoans([]);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string, cpf?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name, cpf }
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { error };
  };

  const refreshData = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user || !account) return;

    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category
      });

    if (error) {
      console.error('Error adding transaction:', error);
      return;
    }

    // Update account balance
    const newBalance = account.balance + transaction.amount;
    await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('user_id', user.id);

    await refreshData();
  };

  const requestLoan = async (amount: number, term: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('loans')
      .insert({
        user_id: user.id,
        amount,
        term,
        status: 'pending'
      });

    if (error) {
      console.error('Error requesting loan:', error);
      return;
    }

    await refreshData();
  };

  const updateLoanStatus = async (loanId: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('loans')
      .update({ status })
      .eq('id', loanId);

    if (error) {
      console.error('Error updating loan status:', error);
      return;
    }

    // If approved, add loan amount to user's account
    if (status === 'approved') {
      const loan = allLoans.find(l => l.id === loanId);
      if (loan) {
        const { data: accountData } = await supabase
          .from('accounts')
          .select('balance')
          .eq('user_id', loan.user_id)
          .single();

        if (accountData) {
          await supabase
            .from('accounts')
            .update({ balance: accountData.balance + loan.amount })
            .eq('user_id', loan.user_id);
        }
      }
    }

    await refreshData();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      account,
      role,
      transactions,
      loans,
      allLoans,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      addTransaction,
      requestLoan,
      updateLoanStatus,
      refreshData
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
