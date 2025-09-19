import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import AdvancedInputPanel from './AdvancedInputPanel';
import ResultsPanel from './ResultsPanel';
import Header from './Header';
import AIChatBot from './AIChatBot';
import { FinancialData, SimulationInputs } from '../types/financial';
import { FinancialContext } from '../services/aiAdvisor';
import { useUser } from '@clerk/clerk-react';

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const organizationData = user?.unsafeMetadata?.organizationData as any;

  const [inputs, setInputs] = useState<SimulationInputs>({
    employees: organizationData?.teamSize || 5,
    marketingSpend: 200000,
    productPrice: 2999,
    miscExpenses: 150000,
    currentFunds: 5000000
  });

  const [results, setResults] = useState<FinancialData | null>(null);
  const [usageStats, setUsageStats] = useState({
    simulations: 12,
    exports: 5
  });

  const [isChatOpen, setIsChatOpen] = useState(false);

  const [mockData, setMockData] = useState([
    { month: 'Jan', revenue: 1250000, expenses: 875000 },
    { month: 'Feb', revenue: 1300000, expenses: 900000 },
    { month: 'Mar', revenue: 1200000, expenses: 850000 },
    { month: 'Apr', revenue: 1375000, expenses: 950000 },
    { month: 'May', revenue: 1450000, expenses: 1000000 },
    { month: 'Jun', revenue: 1550000, expenses: 1050000 },
    { month: 'Jul', revenue: 1600000, expenses: 1100000 },
    { month: 'Aug', revenue: 1750000, expenses: 1200000 }
  ]);

  // Live data simulation - update every 45 seconds for more realistic intervals
  useEffect(() => {
    const interval = setInterval(() => {
      setMockData(prevData =>
        prevData.map(item => ({
          ...item,
          revenue: Math.max(0, item.revenue + (Math.random() - 0.5) * 125000),
          expenses: Math.max(0, item.expenses + (Math.random() - 0.5) * 75000)
        }))
      );
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  const runSimulation = () => {
    // Enhanced simulation logic based on organization type
    const baseMultiplier = organizationData?.organizationType === 'startup' ? 1.2 :
      organizationData?.organizationType === 'event' ? 0.8 : 1.0;

    const assumedQuantity = Math.floor(100 * baseMultiplier);
    const baseSalary = organizationData?.organizationType === 'startup' ? 70000 : 60000;
    const baseFixedCost = organizationData?.organizationType === 'event' ? 200000 : 300000;

    const revenue = inputs.productPrice * assumedQuantity * baseMultiplier;
    const expenses = baseFixedCost + (baseSalary * inputs.employees) + inputs.marketingSpend + inputs.miscExpenses;
    const netProfit = revenue - expenses;
    const runway = expenses > 0 ? Math.floor(inputs.currentFunds / expenses) : Infinity;

    const newResults: FinancialData = {
      revenue,
      expenses,
      netProfit,
      runway,
      profitMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0
    };

    setResults(newResults);
    setUsageStats(prev => ({ ...prev, simulations: prev.simulations + 1 }));
  };

  const handleExport = () => {
    setUsageStats(prev => ({ ...prev, exports: prev.exports + 1 }));
  };

  // Generate financial context for AI
  const getFinancialContext = (): FinancialContext => {
    const baseMultiplier = organizationData?.organizationType === 'startup' ? 1.2 :
      organizationData?.organizationType === 'event' ? 0.8 : 1.0;
    const assumedQuantity = Math.floor(100 * baseMultiplier);
    const baseSalary = organizationData?.organizationType === 'startup' ? 70000 : 60000;
    const baseFixedCost = organizationData?.organizationType === 'event' ? 200000 : 300000;

    const revenue = inputs.productPrice * assumedQuantity * baseMultiplier;
    const expenses = baseFixedCost + (baseSalary * inputs.employees) + inputs.marketingSpend + inputs.miscExpenses;
    const netProfit = revenue - expenses;
    const currentMonthData = mockData[mockData.length - 1];
    
    return {
      currentRevenue: currentMonthData.revenue,
      projectedRevenue: revenue,
      expenses: expenses,
      growthRate: 15, // Example growth rate
      timeHorizon: 12,
      cashFlow: currentMonthData.revenue - currentMonthData.expenses,
      profitMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Top Row - Results Panel (Graphs at top) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <ResultsPanel
            results={results}
            mockData={mockData}
            onExport={handleExport}
          />
        </motion.div>

        {/* Bottom Row - Advanced Input Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AdvancedInputPanel
            inputs={inputs}
            onInputChange={setInputs}
            onSimulate={runSimulation}
            usageStats={usageStats}
          />
        </motion.div>

        {/* Organization Info Banner */}
        {organizationData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-2xl p-6 border border-emerald-300/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-emerald-900">
                  Financial Planning for {organizationData.companyName}
                </h3>
                <p className="text-sm text-emerald-700">
                  {organizationData.industry} • {organizationData.teamSize} team members • {organizationData.organizationType}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600">{usageStats.simulations + usageStats.exports}</div>
                <div className="text-xs text-emerald-500">Total Actions</div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Floating AI Chat Button */}
      {!isChatOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-4 right-4 w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-xl transition-all duration-200 transform hover:scale-110 z-40"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}

      {/* AI Chat Bot */}
      <AIChatBot
        financialContext={getFinancialContext()}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};

export default Dashboard;