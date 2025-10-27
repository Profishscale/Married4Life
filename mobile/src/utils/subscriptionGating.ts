/**
 * Subscription and Premium Access Gating
 * 
 * This utility helps gate premium features based on subscription tier or promo code access.
 */

export type SubscriptionTier = 'free' | 'plus' | 'pro' | 'pro_max';
export type PromoAccess = {
  hasAccess: boolean;
  planType?: SubscriptionTier;
  expiresAt?: Date;
};

/**
 * Check if user has access to a feature based on their subscription tier
 */
export function hasFeatureAccess(
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean {
  const tierOrder: Record<SubscriptionTier, number> = {
    free: 0,
    plus: 1,
    pro: 2,
    pro_max: 3,
  };

  return tierOrder[userTier] >= tierOrder[requiredTier];
}

/**
 * Check if user has premium access (any paid tier or promo)
 */
export function hasPremiumAccess(
  userTier: SubscriptionTier,
  promoAccess?: PromoAccess
): boolean {
  // Check promo access first
  if (promoAccess?.hasAccess) {
    return true;
  }

  // Check subscription tier
  return userTier !== 'free';
}

/**
 * Check if content is locked for user
 */
export function isContentLocked(
  requiredTier: SubscriptionTier,
  userTier: SubscriptionTier,
  promoAccess?: PromoAccess
): boolean {
  // If promo gives access, unlock
  if (promoAccess?.hasAccess && promoAccess.planType) {
    return !hasFeatureAccess(promoAccess.planType, requiredTier);
  }

  // Check subscription tier
  return !hasFeatureAccess(userTier, requiredTier);
}

/**
 * Get upgrade message for locked content
 */
export function getUpgradeMessage(requiredTier: SubscriptionTier): string {
  const messages: Record<SubscriptionTier, string> = {
    free: 'Sign up to access this feature',
    plus: 'Upgrade to Plus to access',
    pro: 'Upgrade to Pro to access',
    pro_max: 'Upgrade to Pro Max to access',
  };

  return messages[requiredTier] || 'This feature requires a premium subscription';
}

/**
 * Check promo code expiration
 */
export function isPromoExpired(promoAccess?: PromoAccess): boolean {
  if (!promoAccess?.hasAccess || !promoAccess.expiresAt) {
    return false;
  }

  return new Date(promoAccess.expiresAt) < new Date();
}

/**
 * Get subscription tier display name
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  const names: Record<SubscriptionTier, string> = {
    free: 'Free',
    plus: 'Plus',
    pro: 'Pro',
    pro_max: 'Pro Max',
  };

  return names[tier];
}

