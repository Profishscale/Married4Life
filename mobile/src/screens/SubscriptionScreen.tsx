import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Subscription'>;

const SUBSCRIPTION_PLANS = [
  {
    tier: 'free',
    name: 'Free',
    price: '$0',
    features: ['Basic AI Coach', 'Limited content access'],
  },
  {
    tier: 'plus',
    name: 'Plus',
    price: '$9.99/mo',
    features: ['Full AI Coach', 'All courses', 'Basic games'],
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: '$19.99/mo',
    features: ['Everything in Plus', 'Advanced courses', 'Priority support'],
  },
  {
    tier: 'pro_max',
    name: 'Pro Max',
    price: '$39.99/mo',
    features: ['Everything in Pro', '1-on-1 sessions', 'Custom coaching'],
  },
];

export default function SubscriptionScreen({ navigation, route }: Props) {
  const [currentPlan, setCurrentPlan] = useState('free');
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<{
    hasAccess?: boolean;
    planType?: string;
    expiresAt?: Date;
  }>({});
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    checkPromoAccess();
  }, []);

  const checkPromoAccess = async () => {
    try {
      const userId = '1'; // TODO: Get from auth context
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/promo/check/${userId}`);
      const data = await response.json();

      if (data.success && data.data.hasAccess) {
        setPromoStatus(data.data);
        setCurrentPlan(data.data.planType || 'free');
      }
    } catch (error) {
      console.error('Error checking promo access:', error);
    }
  };

  const handleRedeemPromo = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    setRedeeming(true);
    try {
      const userId = '1'; // TODO: Get from auth context
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/promo/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode.toUpperCase(),
          userId,
        }),
      });

      const data = await response.json();

      if (data.success && data.data.valid) {
        Alert.alert('Success! ✨', data.data.message || 'Promo code redeemed!');
        setCurrentPlan(data.data.planType || 'free');
        setPromoCode('');
        checkPromoAccess();
      } else {
        Alert.alert('Invalid Code', data.data?.message || 'This promo code is invalid');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to redeem promo code');
    } finally {
      setRedeeming(false);
    }
  };

  const handleUpgrade = (planType: string) => {
    Alert.alert(
      'Upgrade to ' + planType,
      'This will open Stripe checkout',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            // TODO: Implement Stripe checkout
            console.log('Open Stripe checkout for', planType);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A1F44', '#1a3d6b']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Subscription</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Current Plan */}
          <View style={styles.currentPlanCard}>
            <Text style={styles.currentPlanLabel}>Current Plan</Text>
            <Text style={styles.currentPlanName}>
              {SUBSCRIPTION_PLANS.find(p => p.tier === currentPlan)?.name || 'Free'}
            </Text>
            {promoStatus.hasAccess && promoStatus.expiresAt && (
              <Text style={styles.promoExpiry}>
                ⚠️ DEV ONLY: Promo access expires {new Date(promoStatus.expiresAt).toLocaleDateString()}
              </Text>
            )}
          </View>

          {/* Promo Code Section */}
          <View style={styles.promoSection}>
            <Text style={styles.sectionTitle}>
              🔓 DEV/PROTOTYPE: Unlock All Features
            </Text>
            <Text style={styles.promoHint}>
              Enter a promo code to unlock premium features for testing
            </Text>

            <View style={styles.promoInputContainer}>
              <TextInput
                style={styles.promoInput}
                placeholder="Enter promo code"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.redeemButton}
                onPress={handleRedeemPromo}
                disabled={redeeming}
              >
                {redeeming ? (
                  <ActivityIndicator color="#0A1F44" />
                ) : (
                  <Text style={styles.redeemButtonText}>Redeem</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Subscription Plans */}
          <View style={styles.plansSection}>
            <Text style={styles.sectionTitle}>Upgrade Your Plan</Text>

            {SUBSCRIPTION_PLANS.map((plan, index) => {
              const isActive = plan.tier === currentPlan;
              const isAccessible = promoStatus.hasAccess || plan.tier === 'free';

              return (
                <TouchableOpacity
                  key={plan.tier}
                  style={[
                    styles.planCard,
                    isActive && styles.planCardActive,
                    !isAccessible && styles.planCardDisabled,
                  ]}
                  onPress={() => isAccessible && handleUpgrade(plan.tier)}
                  disabled={!isAccessible}
                >
                  {isActive && <View style={styles.activeBadge} />}
                  
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                  </View>

                  <View style={styles.featuresContainer}>
                    {plan.features.map((feature, i) => (
                      <View key={i} style={styles.featureRow}>
                        <Text style={styles.checkmark}>✓</Text>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  {!isAccessible && (
                    <Text style={styles.lockedText}>
                      Locked • Redeem promo to unlock
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Warning Banner */}
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ DEV/PROTOTYPE MODE: Promo codes and unlimited access are for testing only.
              All payment functionality is disabled. Remove before production deployment.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  currentPlanCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  currentPlanLabel: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
    marginBottom: 4,
  },
  currentPlanName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  promoExpiry: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    fontStyle: 'italic',
  },
  promoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  promoHint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  promoInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  promoInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  redeemButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  redeemButtonText: {
    color: '#0A1F44',
    fontWeight: 'bold',
    fontSize: 16,
  },
  plansSection: {
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  planCardActive: {
    borderColor: '#D4AF37',
  },
  planCardDisabled: {
    opacity: 0.5,
  },
  activeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0A1F44',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  featuresContainer: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmark: {
    color: '#4CAF50',
    fontSize: 16,
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
  },
  lockedText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  warningBanner: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  warningText: {
    fontSize: 12,
    color: '#FF9800',
    lineHeight: 18,
    fontWeight: '600',
  },
});

