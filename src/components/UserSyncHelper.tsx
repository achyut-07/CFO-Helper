import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { userService } from '../services/databaseService';

const UserSyncHelper: React.FC = () => {
  const { user } = useUser();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  const syncCurrentUser = async () => {
    if (!user) {
      setSyncStatus('error');
      setSyncMessage('No user logged in');
      return;
    }

    setSyncStatus('syncing');
    setSyncMessage('Syncing user data...');

    try {
      // Get current user metadata
      const userData = {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        full_name: user.fullName || user.firstName || 'Unknown User',
        company_name: user.unsafeMetadata?.company_name as string || '',
        industry: user.unsafeMetadata?.industry as string || '',
        organization_type: user.unsafeMetadata?.organization_type as string || 'other',
        team_size: user.unsafeMetadata?.team_size as number || 1
      };

      console.log('Syncing user data:', userData);

      // Create or update user in Supabase
      const result = await userService.createUser(userData);
      
      if (result) {
        setSyncStatus('success');
        setSyncMessage('User successfully synced to database!');
        
        // Also ensure financial data exists
        try {
          await userService.getUserFinancialData(user.id);
          setSyncMessage('User and financial data successfully synced!');
        } catch (error) {
          console.log('Creating initial financial data...');
          // Financial data doesn't exist, this is expected for existing users
        }
      } else {
        setSyncStatus('error');
        setSyncMessage('Failed to sync user data');
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      setSyncMessage(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const resetSync = () => {
    setSyncStatus('idle');
    setSyncMessage('');
  };

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please log in to sync user data.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="flex items-center space-x-3 mb-4">
        <Users className="text-emerald-600" size={24} />
        <h3 className="text-lg font-semibold text-gray-800">User Data Sync</h3>
      </div>

      <div className="mb-4">
        <p className="text-gray-600 mb-2">Current user: <strong>{user.fullName}</strong></p>
        <p className="text-gray-600 mb-4">Email: <strong>{user.primaryEmailAddress?.emailAddress}</strong></p>
        
        {user.unsafeMetadata?.company_name && (
          <p className="text-gray-600 mb-2">Company: <strong>{String(user.unsafeMetadata.company_name)}</strong></p>
        )}
      </div>

      {syncStatus === 'idle' && (
        <motion.button
          onClick={syncCurrentUser}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <RefreshCw size={18} />
          <span>Sync User to Database</span>
        </motion.button>
      )}

      {syncStatus === 'syncing' && (
        <div className="flex items-center justify-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <RefreshCw className="animate-spin text-blue-600" size={18} />
          <span className="text-blue-800 font-medium">Syncing...</span>
        </div>
      )}

      {syncStatus === 'success' && (
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="text-green-600" size={18} />
            <span className="text-green-800 font-medium">Success!</span>
          </div>
          <button
            onClick={resetSync}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Sync Another User
          </button>
        </div>
      )}

      {syncStatus === 'error' && (
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
            <span className="text-red-800 font-medium">Error: {syncMessage}</span>
          </div>
          <button
            onClick={resetSync}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> This syncs your current user data to the database. 
          Run the SQL script in Supabase to sync all existing users at once.
        </p>
      </div>
    </div>
  );
};

export default UserSyncHelper;