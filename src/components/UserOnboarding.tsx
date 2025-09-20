import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Building2, Users, Briefcase, Sparkles } from 'lucide-react';

interface UserOnboardingProps {
  onComplete: () => void;
}

export interface UserProfile {
  fullName: string;
  companyName: string;
  industry: string;
  organizationType: 'startup' | 'enterprise' | 'event' | 'freelance' | 'other';
  teamSize: number;
}

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Marketing',
  'Real Estate',
  'Non-profit',
  'Other'
];

const ORGANIZATION_TYPES = [
  { value: 'startup', label: 'Startup', icon: Sparkles },
  { value: 'enterprise', label: 'Enterprise', icon: Building2 },
  { value: 'event', label: 'Event/Project', icon: Briefcase },
  { value: 'freelance', label: 'Freelance', icon: Users },
  { value: 'other', label: 'Other', icon: Building2 },
];

const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete }) => {
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfile>({
    fullName: user?.fullName || '',
    companyName: '',
    industry: '',
    organizationType: 'startup',
    teamSize: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update Clerk user metadata
      await user?.update({
        unsafeMetadata: {
          company_name: profile.companyName,
          industry: profile.industry,
          organization_type: profile.organizationType,
          team_size: profile.teamSize,
          onboarded: true,
        }
      });

      // The Supabase trigger will automatically create the user record
      // with this metadata when the user record is created
      
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (error) {
      console.error('Error updating user profile:', error);
      setIsSubmitting(false);
    }
  };

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4"
          >
            <Sparkles className="text-white" size={32} />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to CFO Helper!</h1>
          <p className="text-gray-600">Let's set up your financial dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              value={profile.fullName}
              onChange={(e) => updateProfile('fullName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="Enter your full name"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Company/Organization Name
            </label>
            <input
              type="text"
              required
              value={profile.companyName}
              onChange={(e) => updateProfile('companyName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="Enter your company name"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Industry
            </label>
            <select
              required
              value={profile.industry}
              onChange={(e) => updateProfile('industry', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="">Select your industry</option>
              {INDUSTRIES.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          {/* Organization Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Organization Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ORGANIZATION_TYPES.map(({ value, label, icon: Icon }) => (
                <motion.button
                  key={value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateProfile('organizationType', value)}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center space-x-3 ${
                    profile.organizationType === value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Team Size */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Team Size
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              required
              value={profile.teamSize}
              onChange={(e) => updateProfile('teamSize', parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="Number of employees/team members"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Setting up your dashboard...</span>
              </div>
            ) : (
              'Complete Setup'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default UserOnboarding;