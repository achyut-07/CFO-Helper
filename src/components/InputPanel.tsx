import React from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, ShoppingCart, CreditCard, Play, BarChart3 } from 'lucide-react';
import { SimulationInputs } from '../types/financial';

interface InputPanelProps {
  inputs: SimulationInputs;
  onInputChange: (inputs: SimulationInputs) => void;
  onSimulate: () => void;
  usageStats: {
    simulations: number;
    exports: number;
  };
}

const InputPanel: React.FC<InputPanelProps> = ({ inputs, onInputChange, onSimulate, usageStats }) => {
  const handleInputChange = (field: keyof SimulationInputs, value: number) => {
    onInputChange({ ...inputs, [field]: value });
  };

  const inputFields = [
    {
      key: 'employees' as keyof SimulationInputs,
      label: 'Number of Employees',
      icon: Users,
      min: 0,
      max: 100,
      step: 1,
      value: inputs.employees,
      format: (val: number) => `${val} employees`
    },
    {
      key: 'marketingSpend' as keyof SimulationInputs,
      label: 'Monthly Marketing Spend',
      icon: BarChart3,
      min: 0,
      max: 8000000,
      step: 10000,
      value: inputs.marketingSpend,
      format: (val: number) => `₹${val.toLocaleString('en-IN')}`
    },
    {
      key: 'productPrice' as keyof SimulationInputs,
      label: 'Product Price',
      icon: ShoppingCart,
      min: 0,
      max: 50000,
      step: 100,
      value: inputs.productPrice,
      format: (val: number) => `₹${val.toLocaleString('en-IN')}`
    },
    {
      key: 'miscExpenses' as keyof SimulationInputs,
      label: 'Other Monthly Expenses',
      icon: CreditCard,
      min: 0,
      max: 2000000,
      step: 5000,
      value: inputs.miscExpenses,
      format: (val: number) => `₹${val.toLocaleString('en-IN')}`
    },
    {
      key: 'currentFunds' as keyof SimulationInputs,
      label: 'Current Available Funds',
      icon: DollarSign,
      min: 0,
      max: 50000000,
      step: 100000,
      value: inputs.currentFunds,
      format: (val: number) => `₹${val.toLocaleString('en-IN')}`
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="space-y-6"
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200 hover:shadow-2xl transition-all duration-300">
        <h2 className="text-xl font-semibold text-emerald-900 mb-6 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-emerald-600" />
          Financial Parameters
        </h2>
        
        <div className="space-y-8">
          {inputFields.map((field, index) => (
            <motion.div 
              key={field.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm font-medium text-emerald-800">
                  <field.icon className="w-4 h-4 mr-2 text-emerald-600" />
                  {field.label}
                </label>
                <span className="text-sm font-semibold text-emerald-600">
                  {field.format(field.value)}
                </span>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={field.value}
                  onChange={(e) => handleInputChange(field.key, Number(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <style jsx>{`
                  .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 22px;
                    width: 22px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #10b981, #14b8a6);
                    cursor: pointer;
                    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
                    border: 2px solid white;
                  }
                  .slider::-moz-range-thumb {
                    height: 22px;
                    width: 22px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #10b981, #14b8a6);
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
                  }
                `}</style>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.button
          onClick={onSimulate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-2xl transition-all duration-300"
        >
          <Play className="w-5 h-5" />
          <span>Run Simulation</span>
        </motion.button>
      </div>

      {/* Usage Stats */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-emerald-200 hover:shadow-2xl transition-all duration-300"
      >
        <h3 className="text-lg font-semibold text-emerald-900 mb-4">Usage Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-600">{usageStats.simulations}</div>
            <div className="text-sm text-emerald-700 font-medium">Simulations</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200">
            <div className="text-2xl font-bold text-teal-600">{usageStats.exports}</div>
            <div className="text-sm text-teal-700 font-medium">Reports Exported</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InputPanel;