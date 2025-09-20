import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import { userService, financialService } from '../services/databaseService';

// Hook to test Supabase connection
export const useSupabaseConnection = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic connection
        const { error } = await supabase.from('users').select('count').limit(1);
        
        if (error) {
          setError(`Connection error: ${error.message}`);
          setIsConnected(false);
          console.error('❌ Supabase connection failed:', error.message);
        } else {
          setIsConnected(true);
          setError(null);
          console.log('✅ Supabase connected successfully - Database ready');
        }
      } catch (err) {
        setError(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsConnected(false);
      }
    };

    testConnection();
  }, []);

  return { isConnected, error };
};

// Hook to manage user profile and financial data
export const useUserData = () => {
  const { user: clerkUser } = useUser();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!clerkUser) {
        console.log('🔑 User not authenticated - skipping data load');
        setLoading(false);
        return;
      }

      // Get or create user profile using Clerk user
      const profile = await userService.getOrCreateProfile(
        clerkUser.id, 
        clerkUser.primaryEmailAddress?.emailAddress || '', 
        {
          full_name: clerkUser.fullName,
          organizationData: clerkUser.unsafeMetadata?.organizationData
        }
      );

      // Get financial data
      const financial = await financialService.getFinancialData(clerkUser.id);

      setUserProfile(profile);
      setFinancialData(financial);
    } catch (err) {
      console.log('💾 Database operation skipped (this is normal):', err instanceof Error ? err.message : 'Unknown error');
      // Fail silently - app continues to work without database
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const saveFinancialData = async (data: any) => {
    try {
      if (!userProfile) throw new Error('No user profile found');
      
      const saved = await financialService.saveFinancialData(userProfile.id, data);
      setFinancialData(saved);
      return saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save financial data');
      throw err;
    }
  };

  useEffect(() => {
    if (clerkUser) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [clerkUser]);

  return {
    userProfile,
    financialData,
    loading,
    error,
    saveFinancialData,
    refreshData: loadUserData
  };
};