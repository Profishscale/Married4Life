import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { log } from '../utils/log';
import { login, getApiUrl } from '../utils/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
    PlayfairDisplay_600SemiBold,
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your email');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Required', 'Please enter your password');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    log.info('[Login] Attempting login', { email });

    try {
      const data = await login(email, password);
      
      if (data.success && data.data) {
        log.info('[Login] Login successful', { userId: data.data.user?.id });
        
        // Store token (you can use AsyncStorage or a context here)
        // For now, we'll just navigate to dashboard
        const userName = data.data.user?.firstName || 'User';
        
        navigation.replace('Dashboard', { userName });
      } else {
        throw new Error(data.error || 'Invalid response from server');
      }
    } catch (error: any) {
      log.error('[Login] Login failed', error);
      
      // Handle network errors
      const errorMessage = error.message || 'Unknown error';
      
      if (errorMessage.includes('Network Error')) {
        Alert.alert(
          'Connection Error',
          errorMessage,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Login Failed',
          errorMessage.includes('Invalid email or password') 
            ? 'Invalid email or password. Please try again.'
            : errorMessage || 'Failed to login. Please check your email and password.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#3b2a1e']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>

              {/* Title */}
              <Text
                style={[
                  styles.title,
                  { fontFamily: fontsLoaded ? 'PlayfairDisplay_600SemiBold' : 'serif' }
                ]}
              >
                Welcome Back
              </Text>

              <Text style={styles.subtitle}>
                Sign in to continue your journey
              </Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!loading}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#FFD54F', '#FFCA28']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#00203F" />
                  ) : (
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <TouchableOpacity
                style={styles.signUpLink}
                onPress={() => navigation.navigate('Onboarding')}
                disabled={loading}
              >
                <Text style={styles.signUpText}>
                  Don't have an account? <Text style={styles.signUpLinkText}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  backButton: {
    marginBottom: 32,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 48,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  loginButton: {
    borderRadius: 50,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#FFD54F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00203F',
  },
  signUpLink: {
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  signUpLinkText: {
    color: '#FFD54F',
    fontWeight: '600',
  },
});

