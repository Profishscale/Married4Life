import React, { useState, useEffect, useRef } from 'react';
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
  ImageBackground,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_MOBILE = SCREEN_WIDTH < 768;

interface FormData {
  firstName: string;
  relationshipStatus: 'dating' | 'engaged' | 'married';
  partnerName: string;
  birthday: string;
  email: string;
  password: string;
}

const RELATIONSHIP_STATUSES = [
  { 
    value: 'dating' as const, 
    label: 'Dating',
    image: require('../../assets/dating-image-1.jpg')
  },
  { 
    value: 'engaged' as const, 
    label: 'Engaged',
    image: require('../../assets/engaged-updated.jpg')
  },
  { 
    value: 'married' as const, 
    label: 'Married',
    image: require('../../assets/married-photo.jpg')
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
    PlayfairDisplay_600SemiBold,
  });

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

  // Animation values for title
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const cardAnimations = useRef(
    RELATIONSHIP_STATUSES.map(() => ({
      scale: new Animated.Value(1),
      translateY: new Animated.Value(0),
      glow: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Title fade-in animation
    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCardPress = (status: 'dating' | 'engaged' | 'married', index: number) => {
    updateField('relationshipStatus', status);
    
    // Animate card press
    Animated.parallel([
      Animated.spring(cardAnimations[index].scale, {
        toValue: 0.98,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnimations[index].glow, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false, // Glow uses shadow which can't use native driver
      }),
    ]).start(() => {
      Animated.spring(cardAnimations[index].scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleCardPressIn = (index: number) => {
    Animated.parallel([
      Animated.spring(cardAnimations[index].translateY, {
        toValue: -4,
        useNativeDriver: true,
      }),
      Animated.spring(cardAnimations[index].scale, {
        toValue: 0.98,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCardPressOut = (index: number) => {
    Animated.parallel([
      Animated.spring(cardAnimations[index].translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(cardAnimations[index].scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (step === 1) {
      // Relationship status is required, always proceed
      setStep(step + 1);
      return;
    }
    if (step < 3) {
      if (step === 2 && !formData.firstName) {
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

  const renderStep1 = () => {
    const continueButtonScale = useRef(new Animated.Value(1)).current;

    const handleContinuePressIn = () => {
      Animated.spring(continueButtonScale, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    };

    const handleContinuePressOut = () => {
      Animated.spring(continueButtonScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <View style={styles.step1Container}>
        {/* Title */}
        <Animated.View style={{ opacity: titleOpacity }}>
          <Text style={[
            styles.step1Title,
            { fontFamily: fontsLoaded ? 'PlayfairDisplay_600SemiBold' : 'serif' }
          ]}>
            Where are you on your journey?
          </Text>
        </Animated.View>

        {/* Relationship Status Cards */}
        <View style={styles.cardsContainer}>
          {RELATIONSHIP_STATUSES.map((status, index) => {
            const isSelected = formData.relationshipStatus === status.value;
            const anim = cardAnimations[index];

            return (
              <Animated.View
                key={status.value}
                style={[
                  styles.cardWrapper,
                  {
                    transform: [
                      { translateY: anim.translateY },
                      { scale: anim.scale },
                    ],
                    shadowOpacity: isSelected ? 0.6 : 0.4,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.statusCard,
                    isSelected && styles.statusCardSelected,
                  ]}
                  onPress={() => handleCardPress(status.value, index)}
                  onPressIn={() => handleCardPressIn(index)}
                  onPressOut={() => handleCardPressOut(index)}
                  activeOpacity={0.9}
                >
                  <ImageBackground
                    source={status.image}
                    style={styles.cardImage}
                    resizeMode="cover"
                  >
                    <LinearGradient
                      colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.25)']}
                      style={styles.cardOverlay}
                    >
                      <Text
                        style={[
                          styles.cardLabel,
                          { fontFamily: fontsLoaded ? 'Poppins_600SemiBold' : 'System' },
                        ]}
                      >
                        {status.label}
                      </Text>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Continue Button */}
        <Animated.View
          style={{ transform: [{ scale: continueButtonScale }] }}
        >
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleNext}
            onPressIn={handleContinuePressIn}
            onPressOut={handleContinuePressOut}
            activeOpacity={0.95}
          >
            <LinearGradient
              colors={['#FFD54F', '#FFCA28']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Tell us more</Text>

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
        <Text style={styles.label}>Partner's name (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter partner's name"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={formData.partnerName}
          onChangeText={(text) => updateField('partnerName', text)}
        />
      </View>

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
        colors={['#1a1a1a', '#3b2a1e']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
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

        {step !== 1 && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleNext}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#00203F" />
              ) : (
                <LinearGradient
                  colors={['#FFD54F', '#FFCA28']}
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
        )}
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  stepDotActive: {
    backgroundColor: '#FFD54F',
    width: 24,
  },
  stepDotCompleted: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: IS_MOBILE ? 24 : 40,
    flexGrow: 1,
  },
  step1Container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: IS_MOBILE ? '10%' : 0,
  },
  step1Title: {
    fontSize: IS_MOBILE ? 28 : 32,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 48,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    // Light gold color option if needed
    // color: '#FFD54F',
  },
  cardsContainer: {
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    gap: 24,
    marginBottom: 40,
  },
  cardWrapper: {
    width: '100%',
    shadowColor: '#FFD54F',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.4,
    elevation: 8,
  },
  statusCard: {
    width: '100%',
    height: IS_MOBILE ? 200 : 240,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statusCardSelected: {
    borderColor: '#FFD54F',
    borderWidth: 2,
  },
  cardImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  cardLabel: {
    fontSize: IS_MOBILE ? 18 : 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  continueButton: {
    width: '100%',
    maxWidth: 600,
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#FFD54F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00203F',
  },
  stepContainer: {
    flex: 1,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 32,
    textAlign: 'center',
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
  hintText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  button: {
    width: '100%',
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#FFD54F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00203F',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
