import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, DollarSign, ShoppingCart, CreditCard, Play, BarChart3, Plus, X, TrendingUp, TrendingDown, Target, Settings } from 'lucide-react';
import { SimulationInputs, CustomParameter } from '../types/financial';

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
  const [showAddParameter, setShowAddParameter] = useState(false);
  const [newParameter, setNewParameter] = useState<Partial<CustomParameter>>({
    label: '',
    value: 0,
    min: 0,
    max: 1000000,
    step: 1000,
    category: 'expense'
  });

  const handleInputChange = (field: keyof SimulationInputs, value: number) => {
    onInputChange({ ...inputs, [field]: value });
  };

  const handleCustomParameterChange = (id: string, value: number) => {
    const updatedCustomParameters = inputs.customParameters.map(param =>
      param.id === id ? { ...param, value } : param
    );
    onInputChange({ ...inputs, customParameters: updatedCustomParameters });
  };

  const addCustomParameter = () => {
    if (!newParameter.label?.trim()) return;
    
    const customParam: CustomParameter = {
      id: Date.now().toString(),
      label: newParameter.label,
      value: newParameter.value || 0,
      min: newParameter.min || 0,
      max: newParameter.max || 1000000,
      step: newParameter.step || 1000,
      category: newParameter.category || 'expense'
    };

    onInputChange({
      ...inputs,
      customParameters: [...inputs.customParameters, customParam]
    });

    setNewParameter({
      label: '',
      value: 0,
      min: 0,
      max: 1000000,
      step: 1000,
      category: 'expense'
    });
    setShowAddParameter(false);
  };

  const removeCustomParameter = (id: string) => {
    const updatedCustomParameters = inputs.customParameters.filter(param => param.id !== id);
    onInputChange({ ...inputs, customParameters: updatedCustomParameters });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'income': return TrendingUp;
      case 'expense': return TrendingDown;
      case 'investment': return Target;
      default: return Settings;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'income': return 'text-green-600';
      case 'expense': return 'text-red-600';
      case 'investment': return 'text-blue-600';
      default: return 'text-gray-600';
    }
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
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center text-sm font-medium text-emerald-800">
                  <field.icon className="w-4 h-4 mr-2 text-emerald-600" />
                  {field.label}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={field.value}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value >= field.min && value <= field.max) {
                        handleInputChange(field.key, value);
                      }
                    }}
                    className="w-32 px-3 py-1 text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-right font-medium"
                  />
                </div>
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
                <div className="flex justify-between text-xs text-emerald-600 mt-1">
                  <span>{field.format(field.min)}</span>
                  <span>{field.format(field.max)}</span>
                </div>
                <style>{`
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

          {/* Custom Parameters Section */}
          {inputs.customParameters.length > 0 && (
            <>
              <div className="pt-6 border-t border-emerald-200">
                <h3 className="text-lg font-medium text-emerald-800 mb-4 flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-emerald-600" />
                  Custom Business Parameters
                </h3>
                <div className="space-y-6">
                  <AnimatePresence>
                    {inputs.customParameters.map((param, index) => {
                      const IconComponent = getCategoryIcon(param.category);
                      return (
                        <motion.div
                          key={param.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center text-sm font-medium text-emerald-800">
                              <IconComponent className={`w-4 h-4 mr-2 ${getCategoryColor(param.category)}`} />
                              {param.label}
                              <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white/50 text-emerald-700 capitalize">
                                {param.category}
                              </span>
                            </label>
                            <button
                              onClick={() => removeCustomParameter(param.id)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                              title="Remove parameter"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right text-emerald-700 font-semibold">
                            ₹{param.value.toLocaleString('en-IN')}
                          </div>
                          <div className="relative">
                            <input
                              type="range"
                              min={param.min}
                              max={param.max}
                              step={param.step}
                              value={param.value}
                              onChange={(e) => handleCustomParameterChange(param.id, Number(e.target.value))}
                              className="w-full h-3 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </>
          )}

          {/* Add Custom Parameter Button */}
          <div className="pt-4 border-t border-emerald-200">
            {!showAddParameter ? (
              <button
                onClick={() => setShowAddParameter(true)}
                className="w-full p-4 border-2 border-dashed border-emerald-300 rounded-xl text-emerald-600 hover:text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add Custom Business Parameter</span>
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-emerald-800">Add New Parameter</h4>
                  <button
                    onClick={() => setShowAddParameter(false)}
                    className="p-1 text-gray-500 hover:text-gray-700 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-2">Parameter Name</label>
                    <input
                      type="text"
                      value={newParameter.label || ''}
                      onChange={(e) => setNewParameter({...newParameter, label: e.target.value})}
                      placeholder="e.g., R&D Expenses, Office Rent"
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-2">Category</label>
                    <select
                      value={newParameter.category || 'expense'}
                      onChange={(e) => setNewParameter({...newParameter, category: e.target.value as CustomParameter['category']})}
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                      <option value="investment">Investment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-2">Initial Value</label>
                    <input
                      type="number"
                      value={newParameter.value || 0}
                      onChange={(e) => setNewParameter({...newParameter, value: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-2">Maximum Value</label>
                    <input
                      type="number"
                      value={newParameter.max || 1000000}
                      onChange={(e) => setNewParameter({...newParameter, max: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={addCustomParameter}
                    disabled={!newParameter.label?.trim()}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 px-4 rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Add Parameter
                  </button>
                  <button
                    onClick={() => setShowAddParameter(false)}
                    className="px-4 py-2 text-emerald-600 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </div>
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