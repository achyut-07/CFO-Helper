import React from 'react';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Dashboard from './components/Dashboard';
import OnboardingFlow from './components/OnboardingFlow';
import { Toaster } from 'react-hot-toast';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Publishable Key');
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
        <SignedIn>
          <OnboardingFlow>
            <Dashboard />
          </OnboardingFlow>
        </SignedIn>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#059669',
              color: '#fff',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(5, 150, 105, 0.3)',
            },
          }}
        />
      </div>
    </ClerkProvider>
  );
}

export default App;