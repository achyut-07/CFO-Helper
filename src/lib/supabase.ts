import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database table names
export const TABLES = {
  USERS: 'users',
  FINANCIAL_DATA: 'financial_data', 
  SIMULATIONS: 'simulations',
  TRANSACTIONS: 'transactions',
  MONTHLY_REPORTS: 'monthly_reports',
  AI_CHAT_HISTORY: 'ai_chat_history'
} as const;

// Database types
export interface DatabaseUser {
  id: string;
  email: string;
  full_name?: string;
  company_name?: string;
  industry?: string;
  organization_type?: 'startup' | 'enterprise' | 'event' | 'other';
  team_size?: number;
  created_at: string;
  updated_at: string;
}

export interface FinancialData {
  id: string;
  user_id: string;
  current_funds: number;
  monthly_revenue: number;
  monthly_expenses: number;
  employees: number;
  marketing_spend: number;
  product_price: number;
  misc_expenses: number;
  created_at: string;
  updated_at: string;
}

export interface Simulation {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense' | 'investment' | 'withdrawal';
  amount: number;
  description?: string;
  category?: string;
  date: string;
  created_at: string;
}

export interface MonthlyReport {
  id: string;
  user_id: string;
  month: number;
  year: number;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  cash_flow?: Record<string, any>;
  created_at: string;
}

export interface AiChatMessage {
  id: string;
  user_id: string;
  session_id: string;
  message: string;
  is_user: boolean;
  financial_context?: Record<string, any>;
  created_at: string;
}

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch {
    return false;
  }
};

export default supabase;