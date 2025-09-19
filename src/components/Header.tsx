import { motion } from 'framer-motion';
import { Calculator } from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';

const Header: React.FC = () => {
  const { user } = useUser();
  const organizationData = user?.unsafeMetadata?.organizationData as any;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-emerald-50 to-teal-50 shadow-lg border-b border-emerald-200"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-md border border-emerald-100">
                          <img 
              src="/CFO Helper-logo.svg?v=2" 
              alt="CFO Helper Logo" 
              className="w-10 h-10 object-contain"
              onError={(e) => {
                // Fallback to icon if logo fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
              <Calculator className="w-7 h-7 text-emerald-600 hidden" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">CFO Helper</h1>
              <p className="text-sm text-emerald-700 font-medium">
                {organizationData?.companyName ?
                  `Financial Planning for ${organizationData.companyName}` :
                  'Financial Planning & Business Forecasting for India'
                }
              </p>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="flex items-center space-x-4">
            {organizationData && (
              <div className="hidden md:flex items-center space-x-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-emerald-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-900">{organizationData.companyName}</p>
                  <p className="text-xs text-emerald-600">{organizationData.teamSize} team members</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-xl border-2 border-emerald-200 shadow-md",
                    userButtonPopoverCard: "shadow-2xl border border-emerald-200",
                    userButtonPopoverActions: "bg-emerald-50"
                  }
                }}
                afterSignOutUrl="/"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;