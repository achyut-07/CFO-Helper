import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Download, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';
import { FinancialData } from '../types/financial';
import { generatePDFReport } from '../utils/pdfExport';
import toast from 'react-hot-toast';

interface ResultsPanelProps {
  results: FinancialData | null;
  mockData: Array<{ month: string; revenue: number; expenses: number }>;
  onExport: () => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, mockData, onExport }) => {
  const handleExport = async () => {
    if (!results) {
      toast.error('Run a simulation first to generate a report');
      return;
    }

    try {
      await generatePDFReport(results, mockData);
      onExport();
      toast.success('Report exported successfully!');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatRunway = (months: number) => {
    if (months === Infinity) return '∞';
    return `${months} months`;
  };

  const metricCards = results ? [
    {
      title: 'Monthly Revenue',
      value: formatCurrency(results.revenue),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: results.revenue > 1250000 ? 'up' : 'down'
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(results.expenses),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: 'down'
    },
    {
      title: 'Net Profit',
      value: formatCurrency(results.netProfit),
      icon: results.netProfit > 0 ? TrendingUp : TrendingDown,
      color: results.netProfit > 0 ? 'text-emerald-600' : 'text-red-600',
      bgColor: results.netProfit > 0 ? 'bg-emerald-50' : 'bg-red-50',
      trend: results.netProfit > 0 ? 'up' : 'down'
    },
    {
      title: 'Runway',
      value: formatRunway(results.runway),
      icon: Clock,
      color: results.runway > 12 ? 'text-emerald-600' : results.runway > 6 ? 'text-yellow-600' : 'text-red-600',
      bgColor: results.runway > 12 ? 'bg-emerald-50' : results.runway > 6 ? 'bg-yellow-50' : 'bg-red-50',
      trend: results.runway > 12 ? 'up' : 'down'
    }
  ] : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {results && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl text-white"
        >
          <div className="text-center mb-6">
            <motion.h1 
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              className="text-3xl font-bold mb-2"
            >
              🎯 Simulation Results
            </motion.h1>
            <p className="text-emerald-100">Your financial forecast is ready</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <card.icon className="w-6 h-6 text-white" />
                  {card.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-200" />}
                  {card.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-200" />}
                </div>
                <p className="text-sm text-white/80 mb-1">{card.title}</p>
                <p className="text-xl font-bold text-white">{card.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Results Summary */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-emerald-200 hover:shadow-3xl transition-all duration-500">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">Financial Analysis Dashboard</h2>
            <p className="text-emerald-600">Comprehensive insights into your business performance</p>
          </div>
          <motion.button
            onClick={handleExport}
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
            disabled={!results}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Download className="w-5 h-5" />
            <span>Export Report</span>
          </motion.button>
        </div>

        {!results && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-dashed border-emerald-300"
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="text-emerald-400 mb-4"
            >
              <TrendingUp className="w-20 h-20 mx-auto" />
            </motion.div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-3">Ready for Analysis</h3>
            <p className="text-emerald-700 text-lg font-medium mb-2">Run a simulation to unlock powerful insights</p>
            <p className="text-emerald-600 text-sm">Adjust your financial parameters below and click "Run Simulation"</p>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-4 text-emerald-500 text-xs font-medium"
            >
              ↓ Scroll down to configure parameters ↓
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Historical Data Chart */}
      {results && (
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-emerald-200 hover:shadow-3xl transition-all duration-500"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-emerald-900 mb-2">📈 Performance Trends</h3>
              <p className="text-emerald-600">Track your revenue and expenses over time</p>
            </div>
            <div className="flex space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-emerald-500 rounded mr-2"></div>
                <span className="text-emerald-700 font-medium">Revenue</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span className="text-red-700 font-medium">Expenses</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" strokeOpacity={0.6} />
                <XAxis 
                  dataKey="month" 
                  stroke="#047857" 
                  fontSize={12} 
                  fontWeight="500"
                  tick={{ fill: '#047857' }}
                />
                <YAxis 
                  stroke="#047857" 
                  fontSize={12} 
                  fontWeight="500"
                  tick={{ fill: '#047857' }}
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '2px solid #10b981',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    backdropFilter: 'blur(10px)'
                  }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelStyle={{ color: '#065f46', fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={5}
                  name="Revenue"
                  dot={{ fill: '#10b981', strokeWidth: 3, r: 6 }}
                  activeDot={{ r: 10, stroke: '#10b981', strokeWidth: 4, fill: '#ffffff' }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={5}
                  name="Expenses"
                  dot={{ fill: '#ef4444', strokeWidth: 3, r: 6 }}
                  activeDot={{ r: 10, stroke: '#ef4444', strokeWidth: 4, fill: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Revenue vs Expenses Bar Chart */}
      {results && (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-emerald-200 hover:shadow-3xl transition-all duration-500"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-emerald-900 mb-2">📊 Comparative Analysis</h3>
              <p className="text-emerald-600">Monthly breakdown of revenue vs expenses</p>
            </div>
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2 rounded-lg border border-emerald-300"
            >
              <span className="text-sm font-bold text-emerald-700">
                Profit Margin: {results.profitMargin.toFixed(1)}%
              </span>
            </motion.div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" strokeOpacity={0.6} />
                <XAxis 
                  dataKey="month" 
                  stroke="#047857" 
                  fontSize={12} 
                  fontWeight="500"
                  tick={{ fill: '#047857' }}
                />
                <YAxis 
                  stroke="#047857" 
                  fontSize={12} 
                  fontWeight="500"
                  tick={{ fill: '#047857' }}
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '2px solid #10b981',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    backdropFilter: 'blur(10px)'
                  }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelStyle={{ color: '#065f46', fontWeight: 'bold' }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="url(#revenueGradient)" 
                  name="Revenue" 
                  radius={[8, 8, 0, 0]} 
                />
                <Bar 
                  dataKey="expenses" 
                  fill="url(#expensesGradient)" 
                  name="Expenses" 
                  radius={[8, 8, 0, 0]} 
                />
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ResultsPanel;