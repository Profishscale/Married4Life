import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AICoachScreen from './src/screens/AICoachScreen';
import GrowthCenterScreen from './src/screens/GrowthCenterScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import AdminPromoScreen from './src/screens/AdminPromoScreen';
import { RootStackParamList } from './src/types/navigation';
import { checkBackendHealth, getApiUrl } from './src/utils/api';
import { log } from './src/utils/log';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  // Health check on app startup
  useEffect(() => {
    const performHealthCheck = async () => {
      const apiUrl = getApiUrl();
      log.info('[App] Starting health check', { apiUrl });
      
      const isHealthy = await checkBackendHealth();
      
      if (isHealthy) {
        log.info('[App] ✅ Backend is reachable', { apiUrl });
      } else {
        log.warn('[App] ❌ Backend is unreachable', { 
          apiUrl,
          message: 'Backend may not be running. Start it with: cd backend && npm run dev'
        });
      }
    };

    // Perform health check after a short delay to allow app to initialize
    const timer = setTimeout(() => {
      performHealthCheck();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Welcome"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0A1F44' }
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="AICoach" component={AICoachScreen} />
          <Stack.Screen name="GrowthCenter" component={GrowthCenterScreen} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          <Stack.Screen name="AdminPromo" component={AdminPromoScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

