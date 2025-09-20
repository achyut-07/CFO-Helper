import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { Building2, Users, Calendar, Briefcase, ArrowRight, CheckCircle } from 'lucide-react';

interface OrganizationData {
  organizationType: 'event' | 'enterprise' | 'startup' | 'freelance' | 'other' | '';
  companyName: string;
  teamSize: number;
  industry: string;
  description: string;
}

interface OnboardingFlowProps {
  children: React.ReactNode;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ children }) => {
  const { user } = useUser();
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [organizationData, setOrganizationData] = useState<OrganizationData>({
    organizationType: '',
    companyName: '',
    teamSize: 5,
    industry: '',
    description: ''
  });

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = user?.unsafeMetadata?.onboardingCompleted;
    setIsOnboarding(!hasCompletedOnboarding);
  }, [user]);

  const organizationTypes = [
    {
      id: 'event',
      title: 'Event Organization',
      icon: Calendar,
      description: 'Planning conferences, weddings, or corporate events',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'enterprise',
      title: 'Enterprise/Company',
      icon: Building2,
      description: 'Running an existing business or corporation',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'startup',
      title: 'Startup',
      icon: Briefcase,
      description: 'Early-stage company or new venture',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'freelance',
      title: 'Freelance/Consulting',
      icon: Users,
      description: 'Independent contractor or consulting business',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'other',
      title: 'Other',
      icon: Building2,
      description: 'Non-profit, government, or other organization type',
      color: 'from-gray-500 to-slate-500'
    }
  ];

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail',
    'Manufacturing', 'Real Estate', 'Hospitality', 'Entertainment',
    'Consulting', 'E-commerce', 'Media', 'Transportation', 'Other'
  ];

  const handleComplete = async () => {
    // Save organization data to Clerk user metadata in the format expected by Supabase
    try {
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          onboardingCompleted: true,
          company_name: organizationData.companyName,
          industry: organizationData.industry,
          organization_type: organizationData.organizationType,
          team_size: organizationData.teamSize,
          description: organizationData.description,
          // Keep legacy data for compatibility
          organizationData: organizationData
        }
      });

      // IMPORTANT: Also create the user in Supabase
      // Since Clerk doesn't automatically sync to Supabase auth.users,
      // we need to manually create the Supabase user record
      try {
        const { userService } = await import('../services/databaseService');
        const result = await userService.getOrCreateProfile(
          user!.id,
          user!.primaryEmailAddress?.emailAddress || '',
          {
            full_name: user!.fullName || organizationData.companyName || 'User',
            organizationData: {
              companyName: organizationData.companyName,
              industry: organizationData.industry,
              organizationType: organizationData.organizationType,
              teamSize: organizationData.teamSize
            }
          }
        );
        console.log('✅ User successfully created in Supabase:', result);
      } catch (supabaseError) {
        console.error('❌ Failed to create user in Supabase:', supabaseError);
        // Let's also try a direct approach if the service fails
        try {
          const { supabase } = await import('../lib/supabase');
          const { data, error } = await supabase
            .from('users')
            .insert({
              id: user!.id,
              email: user!.primaryEmailAddress?.emailAddress || '',
              full_name: user!.fullName || organizationData.companyName || 'User',
              company_name: organizationData.companyName,
              industry: organizationData.industry,
              organization_type: organizationData.organizationType,
              team_size: organizationData.teamSize
            })
            .select()
            .single();
          
          if (error) throw error;
          console.log('✅ User created via direct Supabase call:', data);
        } catch (directError) {
          console.error('❌ Direct Supabase call also failed:', directError);
          // Don't block onboarding completion even if both methods fail
        }
      }

      setIsOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const updateData = (field: keyof OrganizationData, value: any) => {
    setOrganizationData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOnboarding) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-emerald-900">Welcome to CFO Helper!</h1>
            <span className="text-sm text-emerald-600 font-medium">Step {currentStep + 1} of 3</span>
          </div>
          <div className="w-full bg-emerald-100 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Organization Type */}
          {currentStep === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-emerald-200"
            >
              <h2 className="text-xl font-semibold text-emerald-900 mb-6">What type of organization are you?</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {organizationTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    onClick={() => updateData('organizationType', type.id)}
                    className={`p-6 rounded-xl border-2 text-left transition-all duration-300 ${organizationData.organizationType === type.id
                        ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${type.color}`}>
                        <type.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{type.title}</h3>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                      {organizationData.organizationType === type.id && (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Company Details */}
          {currentStep === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-emerald-200"
            >
              <h2 className="text-xl font-semibold text-emerald-900 mb-6">Tell us about your organization</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-emerald-800 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={organizationData.companyName}
                    onChange={(e) => updateData('companyName', e.target.value)}
                    className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50"
                    placeholder="Enter your organization name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-800 mb-2">
                    Team Size: {organizationData.teamSize} people
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="500"
                      value={organizationData.teamSize}
                      onChange={(e) => updateData('teamSize', Number(e.target.value))}
                      className="w-full h-3 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-lg appearance-none cursor-pointer team-size-slider"
                    />
                    <style dangerouslySetInnerHTML={{
                      __html: `
                        .team-size-slider::-webkit-slider-thumb {
                          appearance: none;
                          height: 24px;
                          width: 24px;
                          border-radius: 50%;
                          background: linear-gradient(135deg, #10b981, #14b8a6);
                          cursor: pointer;
                          box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
                          border: 3px solid white;
                        }
                      `
                    }} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-800 mb-2">
                    Industry
                  </label>
                  <select
                    value={organizationData.industry}
                    onChange={(e) => updateData('industry', e.target.value)}
                    className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50"
                  >
                    <option value="">Select an industry</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Description */}
          {currentStep === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-emerald-200"
            >
              <h2 className="text-xl font-semibold text-emerald-900 mb-6">Tell us more about your goals</h2>
              <div>
                <label className="block text-sm font-medium text-emerald-800 mb-2">
                  Organization Description (Optional)
                </label>
                <textarea
                  value={organizationData.description}
                  onChange={(e) => updateData('description', e.target.value)}
                  className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 h-32 resize-none"
                  placeholder="Describe your organization, goals, or what you hope to achieve with CFO Helper..."
                />
              </div>

              <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h3 className="font-semibold text-emerald-900 mb-2">Summary</h3>
                <div className="space-y-1 text-sm text-emerald-700">
                  <p><strong>Type:</strong> {organizationTypes.find(t => t.id === organizationData.organizationType)?.title}</p>
                  <p><strong>Name:</strong> {organizationData.companyName}</p>
                  <p><strong>Team Size:</strong> {organizationData.teamSize} people</p>
                  <p><strong>Industry:</strong> {organizationData.industry}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-3 text-emerald-600 font-medium disabled:text-gray-400 disabled:cursor-not-allowed hover:text-emerald-700 transition-colors"
          >
            Back
          </button>

          <button
            onClick={nextStep}
            disabled={
              (currentStep === 0 && !organizationData.organizationType) ||
              (currentStep === 1 && !organizationData.companyName)
            }
            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>{currentStep === 2 ? 'Complete Setup' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingFlow;