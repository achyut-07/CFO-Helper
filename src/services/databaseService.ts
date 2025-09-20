import { supabase, TABLES, type FinancialData, type Simulation, type Transaction, type DatabaseUser } from '../lib/supabase';

// =====================================================
// User Management Service
// =====================================================
export const userService = {
  // Get or create user profile
  async getOrCreateProfile(userId: string, email: string, metadata?: any) {
    try {
      // First try to get existing profile
      const { data: existingUser, error: fetchError } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', userId)
        .single();

      if (existingUser && !fetchError) {
        return existingUser;
      }

      // Create new user profile
      const newUser: Partial<DatabaseUser> = {
        id: userId,
        email,
        full_name: metadata?.full_name || metadata?.name,
        company_name: metadata?.organizationData?.companyName,
        industry: metadata?.organizationData?.industry,
        organization_type: metadata?.organizationData?.organizationType,
        team_size: metadata?.organizationData?.teamSize
      };

      const { data, error } = await supabase
        .from(TABLES.USERS)
        .insert(newUser)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in getOrCreateProfile:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<DatabaseUser>) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};

// =====================================================
// Financial Data Service
// =====================================================
export const financialService = {
  // Get user's financial data
  async getFinancialData(userId: string): Promise<FinancialData | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.FINANCIAL_DATA)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      return data;
    } catch (error) {
      console.error('Error getting financial data:', error);
      return null;
    }
  },

  // Save/Update financial data
  async saveFinancialData(userId: string, financialData: Omit<FinancialData, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    try {
      const existingData = await this.getFinancialData(userId);
      
      if (existingData) {
        // Update existing record
        const { data, error } = await supabase
          .from(TABLES.FINANCIAL_DATA)
          .update({
            ...financialData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new record
        const { data, error } = await supabase
          .from(TABLES.FINANCIAL_DATA)
          .insert({
            user_id: userId,
            ...financialData
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error saving financial data:', error);
      throw error;
    }
  }
};

// =====================================================
// Simulation Service
// =====================================================
export const simulationService = {
  // Get all simulations for user
  async getSimulations(userId: string): Promise<Simulation[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SIMULATIONS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting simulations:', error);
      return [];
    }
  },

  // Save new simulation
  async saveSimulation(userId: string, simulation: {
    name: string;
    description?: string;
    inputs: Record<string, any>;
    results: Record<string, any>;
  }): Promise<Simulation> {
    try {
      const { data, error } = await supabase
        .from(TABLES.SIMULATIONS)
        .insert({
          user_id: userId,
          ...simulation
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving simulation:', error);
      throw error;
    }
  },

  // Delete simulation
  async deleteSimulation(simulationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLES.SIMULATIONS)
        .delete()
        .eq('id', simulationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting simulation:', error);
      throw error;
    }
  }
};

// =====================================================
// Transaction Service
// =====================================================
export const transactionService = {
  // Get transactions for user
  async getTransactions(userId: string, limit = 50): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  },

  // Add new transaction
  async addTransaction(userId: string, transaction: {
    type: 'income' | 'expense' | 'investment' | 'withdrawal';
    amount: number;
    description?: string;
    category?: string;
    date: string;
  }): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .insert({
          user_id: userId,
          ...transaction
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  // Update transaction
  async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .update(updates)
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  // Delete transaction
  async deleteTransaction(transactionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .delete()
        .eq('id', transactionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  // Get transactions by date range
  async getTransactionsByDateRange(userId: string, startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.TRANSACTIONS)
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting transactions by date range:', error);
      return [];
    }
  }
};

// =====================================================
// AI Chat Service
// =====================================================
export const chatService = {
  // Save chat message to history
  async saveChatMessage(userId: string, sessionId: string, message: string, isUser: boolean, financialContext?: Record<string, any>) {
    try {
      const { data, error } = await supabase
        .from(TABLES.AI_CHAT_HISTORY)
        .insert({
          user_id: userId,
          session_id: sessionId,
          message,
          is_user: isUser,
          financial_context: financialContext
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  },

  // Get chat history for session
  async getChatHistory(userId: string, sessionId: string) {
    try {
      const { data, error } = await supabase
        .from(TABLES.AI_CHAT_HISTORY)
        .select('*')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }
};

// =====================================================
// Analytics Service
// =====================================================
export const analyticsService = {
  // Get financial summary for dashboard
  async getFinancialSummary(userId: string) {
    try {
      const [financialData, transactions, simulations] = await Promise.all([
        financialService.getFinancialData(userId),
        transactionService.getTransactions(userId, 10),
        simulationService.getSimulations(userId)
      ]);

      // Calculate recent cash flow
      const recentTransactions = transactions.slice(0, 10);
      const totalIncome = recentTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = recentTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        financialData,
        recentTransactions,
        simulationCount: simulations.length,
        cashFlowSummary: {
          totalIncome,
          totalExpenses,
          netCashFlow: totalIncome - totalExpenses
        }
      };
    } catch (error) {
      console.error('Error getting financial summary:', error);
      throw error;
    }
  }
};