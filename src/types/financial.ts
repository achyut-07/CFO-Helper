export interface CustomParameter {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  category: 'income' | 'expense' | 'investment' | 'other';
}

export interface SimulationInputs {
  employees: number;
  marketingSpend: number;
  productPrice: number;
  miscExpenses: number;
  currentFunds: number;
  customParameters: CustomParameter[];
}

export interface FinancialData {
  revenue: number;
  expenses: number;
  netProfit: number;
  runway: number;
  profitMargin: number;
}

export interface HistoricalData {
  month: string;
  revenue: number;
  expenses: number;
}