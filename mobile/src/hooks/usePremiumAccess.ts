import { useState, useEffect } from 'react';
import { SubscriptionTier, PromoAccess } from '../utils/subscriptionGating';

interface PremiumAccessState {
  isPremium: boolean;
  subscriptionTier: SubscriptionTier;
  promoAccess?: PromoAccess;
  loading: boolean;
}

/**
 * Custom hook to manage premium access state
 * 
 * Checks user's subscription tier and promo code access
 */
export function usePremiumAccess(userId: string): PremiumAccessState {
  const [state, setState] = useState<PremiumAccessState>({
    isPremium: false,
    subscriptionTier: 'free',
    loading: true,
  });

  useEffect(() => {
    checkAccess();
  }, [userId]);

  const checkAccess = async () => {
    try {
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Get user's subscription tier
      // TODO: Implement get user endpoint
      const userTier: SubscriptionTier = 'free'; // Default

      // Check promo access
      const promoResponse = await fetch(`${API_BASE_URL}/api/promo/check/${userId}`);
      const promoData = await promoResponse.json();
      
      const promoAccess: PromoAccess = promoData.success
        ? { hasAccess: promoData.data.hasAccess, ...promoData.data }
        : { hasAccess: false };

      setState({
        isPremium: promoAccess.hasAccess || userTier !== 'free',
        subscriptionTier: promoAccess.planType || userTier,
        promoAccess,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking premium access:', error);
      setState({
        isPremium: false,
        subscriptionTier: 'free',
        loading: false,
      });
    }
  };

  return state;
}

