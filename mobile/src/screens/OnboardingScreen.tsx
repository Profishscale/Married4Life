import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

interface FormData {
  firstName: string;
  relationshipStatus: 'single' | 'dating' | 'engaged' | 'married';
  partnerName: string;
  birthday: string;
  email: string;
  password: string;
}

const RELATIONSHIP_STATUSES = [
  { value: 'single', label: 'Single', emoji: '🙋' },
  { value: 'dating', label: 'Dating', emoji: '💕' },
  { value: 'engaged', label: 'Engaged', emoji: '💍' },
  { value: 'married', label: 'Married', emoji: '💑' },
];

export default function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    relationshipStatus: 'dating',
    partnerName: '',
    birthday: '',
    email: '',
    password: '',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
    if (step < 3) {
      if (step === 1 && !formData.firstName) {
        Alert.alert('Required', 'Please enter your name');
        return;
      }
      if (step === 3 && (!formData.email || !formData.password)) {
        Alert.alert('Required', 'Please enter email and password');
        return;
      }
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Call registration API
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          email: formData.email,
          password: formData.password,
          relationshipStatus: formData.relationshipStatus,
          partnerName: formData.partnerName || undefined,
          birthday: formData.birthday || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // TODO: Store token in AsyncStorage for future requests
      // await AsyncStorage.setItem('authToken', data.data.token);
      // await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));

      // Navigate to dashboard
      navigation.replace('Dashboard', { userName: formData.firstName });
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.message || 'Failed to create account. Please try again.'
      );
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={[
            styles.stepDot,
            i === step && styles.stepDotActive,
            i < step && styles.stepDotCompleted,
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.welcomeText}>Welcome! 👋</Text>
      <Text style={styles.subtitle}>
        We'll personalize your relationship guidance
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>What's your first name?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={formData.firstName}
          onChangeText={(text) => updateField('firstName', text)}
          autoFocus
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Your relationship status</Text>
        <View style={styles.optionsContainer}>
          {RELATIONSHIP_STATUSES.map((status) => (
            <TouchableOpacity
              key={status.value}
              style={[
                styles.optionCard,
                formData.relationshipStatus === status.value &&
                  styles.optionCardActive,
              ]}
              onPress={() => updateField('relationshipStatus', status.value)}
            >
              <Text style={styles.optionEmoji}>{status.emoji}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  formData.relationshipStatus === status.value &&
                    styles.optionLabelActive,
                ]}
              >
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Tell us more</Text>

      {formData.relationshipStatus !== 'single' && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Partner's name (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter partner's name"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={formData.partnerName}
            onChangeText={(text) => updateField('partnerName', text)}
          />
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Birthday (for personalized insights)</Text>
        <TextInput
          style={styles.input}
          placeholder="MM/DD/YYYY"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={formData.birthday}
          onChangeText={(text) => updateField('birthday', text)}
        />
        <Text style={styles.hintText}>
          This helps us provide astrology and human design guidance
        </Text>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Create your account</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={formData.email}
          onChangeText={(text) => updateField('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Create a secure password"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={formData.password}
          onChangeText={(text) => updateField('password', text)}
          secureTextEntry
          autoCapitalize="none"
        />
        <Text style={styles.hintText}>
          At least 8 characters
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A1F44', '#1a3d6b']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (step > 1) {
                setStep(step - 1);
              } else {
                navigation.goBack();
              }
            }}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          {renderStepIndicator()}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0A1F44" />
            ) : (
              <LinearGradient
                colors={['#D4AF37', '#F5DE80']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {step === 3 ? 'Complete' : 'Next'}
                </Text>
              </LinearGradient>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Step {step} of 3
          </Text>
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepDotActive: {
    backgroundColor: '#D4AF37',
    width: 24,
  },
  stepDotCompleted: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 32,
    textAlign: 'center',
  },
  stepContainer: {
    flex: 1,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  hintText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
    fontStyle: 'italic',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  optionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCardActive: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  optionEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  optionLabelActive: {
    color: '#D4AF37',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  button: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0A1F44',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});

