import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isEliteTier, isPremiumTier } from '@/lib/ai/modelConfig';

interface AIContextValue {
  subscriptionTier: string;
  isElite: boolean;
  isPremium: boolean;
  userApiKey: string;
  setUserApiKey: (key: string) => void;
  isAIReady: boolean;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const AIContext = createContext<AIContextValue>({
  subscriptionTier: 'free',
  isElite: false,
  isPremium: false,
  userApiKey: '',
  setUserApiKey: () => {},
  isAIReady: false,
  currentPage: '',
  setCurrentPage: () => {},
});

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [userApiKey, setUserApiKeyState] = useState('');
  const [isAIReady, setIsAIReady] = useState(false);
  const [currentPage, setCurrentPage] = useState('');

  useEffect(() => {
    const storedKey = localStorage.getItem('margdarshak_user_key') || '';
    setUserApiKeyState(storedKey);

    const checkPuter = () => {
      if (window.puter) {
        setIsAIReady(true);
      } else {
        setTimeout(checkPuter, 500);
      }
    };
    checkPuter();

    const fetchTier = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();
        if (data?.subscription_tier) {
          setSubscriptionTier(data.subscription_tier);
        }
      }
    };
    fetchTier();
  }, []);

  const setUserApiKey = useCallback((key: string) => {
    setUserApiKeyState(key);
    localStorage.setItem('margdarshak_user_key', key);
  }, []);

  return (
    <AIContext.Provider
      value={{
        subscriptionTier,
        isElite: isEliteTier(subscriptionTier),
        isPremium: isPremiumTier(subscriptionTier),
        userApiKey,
        setUserApiKey,
        isAIReady,
        currentPage,
        setCurrentPage,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => useContext(AIContext);

export default AIContext;
