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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Results Summary */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-emerald-900">Forecast Results</h2>
          <motion.button
            onClick={handleExport}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!results}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </motion.button>
        </div>

        {results ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {metricCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`p-4 rounded-xl ${card.bgColor} border-l-4 ${card.color === 'text-emerald-600' ? 'border-emerald-500' :
                    card.color === 'text-red-600' ? 'border-red-500' : 'border-yellow-500'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{card.title}</p>
                    <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                  </div>
                  <card.icon className={`w-8 h-8 ${card.color}`} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <div className="text-emerald-300 mb-2">
              <TrendingUp className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-emerald-700 text-lg font-medium">Run a simulation to see your results</p>
            <p className="text-emerald-500 text-sm mt-2">Adjust the parameters and click "Run Simulation"</p>
          </div>
        )}
      </div>

      {/* Historical Data Chart */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200 hover:shadow-2xl transition-all duration-300">
        <h3 className="text-lg font-semibold text-emerald-900 mb-6">Historical Performance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
              <XAxis dataKey="month" stroke="#047857" fontSize={12} />
              <YAxis stroke="#047857" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#059669"
                strokeWidth={4}
                name="Revenue"
                dot={{ fill: '#059669', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#059669', strokeWidth: 3 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#dc2626"
                strokeWidth={4}
                name="Expenses"
                dot={{ fill: '#dc2626', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#dc2626', strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue vs Expenses Bar Chart */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200 hover:shadow-2xl transition-all duration-300">
        <h3 className="text-lg font-semibold text-emerald-900 mb-6">Revenue vs Expenses</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
              <XAxis dataKey="month" stroke="#047857" fontSize={12} />
              <YAxis stroke="#047857" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Bar dataKey="revenue" fill="#059669" name="Revenue" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" fill="#dc2626" name="Expenses" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsPanel;