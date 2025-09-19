import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, ShoppingCart, CreditCard, Play, BarChart3, Target, Zap, TrendingUp } from 'lucide-react';
import { SimulationInputs } from '../types/financial';

interface AdvancedInputPanelProps {
  inputs: SimulationInputs;
  onInputChange: (inputs: SimulationInputs) => void;
  onSimulate: () => void;
  usageStats: {
    simulations: number;
    exports: number;
  };
}

const CircularSlider: React.FC<{
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  icon: React.ElementType;
  color: string;
}> = ({ value, min, max, onChange, label, icon: Icon, color }) => {
  const [isDragging, setIsDragging] = useState(false);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const percentage = (value - min) / (max - min);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage * circumference);

  return (
    <div className="relative flex flex-col items-center p-6">
      <div className="relative">
        <svg width="140" height="140" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-emerald-200"
          />
          {/* Progress circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300 ease-in-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Icon className={`w-6 h-6 mx-auto mb-1`} style={{ color }} />
            <div className="text-lg font-bold text-emerald-900">{value}</div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-emerald-800">{label}</p>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-2 w-32 h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${percentage * 100}%, #d1fae5 ${percentage * 100}%, #d1fae5 100%)`
          }}
        />
      </div>
    </div>
  );
};

const VerticalSlider: React.FC<{
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  icon: React.ElementType;
  color: string;
  formatter?: (val: number) => string;
}> = ({ value, min, max, onChange, label, icon: Icon, color, formatter }) => {
  const percentage = (value - min) / (max - min);

  return (
    <div className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-emerald-200 h-80">
      <div className="flex items-center space-x-2 mb-4">
        <Icon className="w-5 h-5" style={{ color }} />
        <span className="text-sm font-medium text-emerald-800">{label}</span>
      </div>
      
      <div className="relative flex-1 w-8 bg-emerald-100 rounded-full mx-4">
        <div
          className="absolute bottom-0 w-full rounded-full transition-all duration-300"
          style={{
            height: `${percentage * 100}%`,
            background: `linear-gradient(to top, ${color}, ${color}AA)`
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          orient="vertical"
        />
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-lg font-bold text-emerald-900">
          {formatter ? formatter(value) : value}
        </div>
      </div>
    </div>
  );
};

const ModernButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ElementType;
}> = ({ onClick, children, variant = 'primary', size = 'md', icon: Icon }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-2xl',
    secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 shadow-md hover:shadow-lg',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-2xl',
    warning: 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-2xl'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${variants[variant]} ${sizes[size]} rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 transform hover:translate-y-[-2px]`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{children}</span>
    </motion.button>
  );
};

const AdvancedInputPanel: React.FC<AdvancedInputPanelProps> = ({ 
  inputs, 
  onInputChange, 
  onSimulate, 
  usageStats 
}) => {
  const handleInputChange = (field: keyof SimulationInputs, value: number) => {
    onInputChange({ ...inputs, [field]: value });
  };

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="space-y-8"
    >
      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200">
        <h2 className="text-xl font-semibold text-emerald-900 mb-6 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-emerald-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ModernButton onClick={onSimulate} variant="primary" icon={Play} size="sm">
            Simulate
          </ModernButton>
          <ModernButton onClick={() => {}} variant="secondary" icon={Target} size="sm">
            Goals
          </ModernButton>
          <ModernButton onClick={() => {}} variant="success" icon={TrendingUp} size="sm">
            Forecast
          </ModernButton>
          <ModernButton onClick={() => {}} variant="warning" icon={BarChart3} size="sm">
            Reports
          </ModernButton>
        </div>
      </div>

      {/* Circular Sliders Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200">
        <h3 className="text-lg font-semibold text-emerald-900 mb-6">Team & Pricing</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <CircularSlider
            value={inputs.employees}
            min={1}
            max={100}
            onChange={(value) => handleInputChange('employees', value)}
            label="Team Size"
            icon={Users}
            color="#10b981"
          />
          <CircularSlider
            value={inputs.productPrice}
            min={100}
            max={10000}
            onChange={(value) => handleInputChange('productPrice', value)}
            label="Product Price"
            icon={ShoppingCart}
            color="#14b8a6"
          />
        </div>
      </div>

      {/* Vertical Sliders Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200">
        <h3 className="text-lg font-semibold text-emerald-900 mb-6">Financial Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <VerticalSlider
            value={inputs.marketingSpend}
            min={0}
            max={1000000}
            onChange={(value) => handleInputChange('marketingSpend', value)}
            label="Marketing Budget"
            icon={BarChart3}
            color="#059669"
            formatter={formatCurrency}
          />
          <VerticalSlider
            value={inputs.miscExpenses}
            min={0}
            max={500000}
            onChange={(value) => handleInputChange('miscExpenses', value)}
            label="Other Expenses"
            icon={CreditCard}
            color="#0891b2"
            formatter={formatCurrency}
          />
          <VerticalSlider
            value={inputs.currentFunds}
            min={100000}
            max={10000000}
            onChange={(value) => handleInputChange('currentFunds', value)}
            label="Available Funds"
            icon={DollarSign}
            color="#7c3aed"
            formatter={formatCurrency}
          />
        </div>
      </div>

      {/* Advanced Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200">
        <h3 className="text-lg font-semibold text-emerald-900 mb-6">Advanced Controls</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-emerald-800 mb-3">
              Marketing ROI Expectation: {((inputs.marketingSpend / 100000) * 20).toFixed(1)}%
            </label>
            <div className="relative">
              <input
                type="range"
                min={0}
                max={500000}
                step={10000}
                value={inputs.marketingSpend}
                onChange={(e) => handleInputChange('marketingSpend', Number(e.target.value))}
                className="w-full h-4 bg-gradient-to-r from-emerald-200 via-teal-300 to-cyan-400 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-emerald-600 mt-1">
                <span>Conservative</span>
                <span>Moderate</span>
                <span>Aggressive</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-800 mb-3">
              Growth Target: {Math.round(inputs.employees / 5 * 100)}% team growth
            </label>
            <div className="relative">
              <input
                type="range"
                min={1}
                max={50}
                value={inputs.employees}
                onChange={(e) => handleInputChange('employees', Number(e.target.value))}
                className="w-full h-4 bg-gradient-to-r from-blue-200 via-purple-300 to-pink-400 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-emerald-600 mt-1">
                <span>Startup</span>
                <span>Scale-up</span>
                <span>Enterprise</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200">
        <h3 className="text-lg font-semibold text-emerald-900 mb-4">Performance Analytics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
            <div className="text-3xl font-bold text-emerald-600">{usageStats.simulations}</div>
            <div className="text-sm text-emerald-700 font-medium">Simulations</div>
            <div className="text-xs text-emerald-500 mt-1">+{Math.round(usageStats.simulations * 0.15)} this week</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200">
            <div className="text-3xl font-bold text-teal-600">{usageStats.exports}</div>
            <div className="text-sm text-teal-700 font-medium">Reports</div>
            <div className="text-xs text-teal-500 mt-1">Generated today</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl border border-cyan-200">
            <div className="text-3xl font-bold text-cyan-600">{Math.round((usageStats.simulations + usageStats.exports) * 1.8)}</div>
            <div className="text-sm text-cyan-700 font-medium">Insights</div>
            <div className="text-xs text-cyan-500 mt-1">Total generated</div>
          </div>
        </div>
      </div>

      {/* Main Simulation Button */}
      <div className="text-center">
        <ModernButton onClick={onSimulate} variant="primary" size="lg" icon={Play}>
          Run Advanced Simulation
        </ModernButton>
      </div>
    </motion.div>
  );
};

export default AdvancedInputPanel;