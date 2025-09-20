-- =====================================================
-- CFO Helper - Supabase Database Schema
-- =====================================================
-- Run these queries in Supabase SQL Editor one by one

-- 1. Enable Row Level Security (RLS) extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  industry TEXT,
  organization_type TEXT, -- 'startup', 'enterprise', 'event', etc.
  team_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Financial Data table - stores current financial state
CREATE TABLE public.financial_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  current_funds DECIMAL(15,2) DEFAULT 0,
  monthly_revenue DECIMAL(15,2) DEFAULT 0,
  monthly_expenses DECIMAL(15,2) DEFAULT 0,
  employees INTEGER DEFAULT 0,
  marketing_spend DECIMAL(15,2) DEFAULT 0,
  product_price DECIMAL(15,2) DEFAULT 0,
  misc_expenses DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Simulations table - stores financial simulation results
CREATE TABLE public.simulations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  inputs JSONB NOT NULL, -- Store simulation input parameters
  results JSONB NOT NULL, -- Store calculated results
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Transactions table - track financial transactions and fund changes
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'investment', 'withdrawal')),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  category TEXT, -- 'marketing', 'salary', 'equipment', etc.
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Monthly Reports table - store monthly financial summaries
CREATE TABLE public.monthly_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  total_revenue DECIMAL(15,2) DEFAULT 0,
  total_expenses DECIMAL(15,2) DEFAULT 0,
  net_profit DECIMAL(15,2) DEFAULT 0,
  cash_flow JSONB, -- Store monthly cash flow data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- 7. AI Chat History table - store AI conversation history
CREATE TABLE public.ai_chat_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  financial_context JSONB, -- Store financial context at time of message
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Financial data policies
CREATE POLICY "Users can view own financial data" ON public.financial_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own financial data" ON public.financial_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own financial data" ON public.financial_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own financial data" ON public.financial_data FOR DELETE USING (auth.uid() = user_id);

-- Simulations policies
CREATE POLICY "Users can view own simulations" ON public.simulations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own simulations" ON public.simulations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own simulations" ON public.simulations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own simulations" ON public.simulations FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- Monthly reports policies
CREATE POLICY "Users can view own reports" ON public.monthly_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reports" ON public.monthly_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reports" ON public.monthly_reports FOR UPDATE USING (auth.uid() = user_id);

-- AI chat history policies
CREATE POLICY "Users can view own chat history" ON public.ai_chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages" ON public.ai_chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_data_updated_at BEFORE UPDATE ON public.financial_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert new user with enhanced metadata from Clerk
  INSERT INTO public.users (
    id, 
    email, 
    full_name,
    company_name,
    industry,
    organization_type,
    team_size
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'industry', ''),
    COALESCE(NEW.raw_user_meta_data->>'organization_type', 'other'),
    COALESCE((NEW.raw_user_meta_data->>'team_size')::integer, 1)
  );
  
  -- Create initial financial data record for new user
  INSERT INTO public.financial_data (
    user_id,
    current_funds,
    monthly_revenue,
    monthly_expenses,
    employees
  )
  VALUES (
    NEW.id,
    0,
    0,
    0,
    COALESCE((NEW.raw_user_meta_data->>'team_size')::integer, 1)
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Performance indexes
CREATE INDEX idx_financial_data_user_id ON public.financial_data(user_id);
CREATE INDEX idx_simulations_user_id ON public.simulations(user_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_monthly_reports_user_month_year ON public.monthly_reports(user_id, year, month);
CREATE INDEX idx_ai_chat_session ON public.ai_chat_history(session_id);

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================

-- You can uncomment and run this after setting up a test user
/*
-- Insert sample financial data (replace with actual user_id after user registration)
INSERT INTO public.financial_data (user_id, current_funds, monthly_revenue, monthly_expenses, employees) 
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
  5000000, 
  150000, 
  120000, 
  10
);
*/