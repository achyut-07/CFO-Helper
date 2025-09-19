export interface SimulationInputs {
  employees: number;
  marketingSpend: number;
  productPrice: number;
  miscExpenses: number;
  currentFunds: number;
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