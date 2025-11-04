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
import { log } from '../utils/log';
import { register, getApiUrl } from '../utils/api';

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

  // Continue button animation - MUST be at top level (not in renderStep1)
  const continueButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Title fade-in animation
    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const updateField = (field: keyof FormData, value: string) => {
    try {
      setFormData((prev) => ({ ...prev, [field]: value }));
    } catch (error) {
      log.error('Failed to update field', error, { field, value });
    }
  };

  // Valid relationship status values
  const VALID_STATUSES: readonly ('dating' | 'engaged' | 'married')[] = ['dating', 'engaged', 'married'] as const;

  const handleCardPress = (status: 'dating' | 'engaged' | 'married', index: number) => {
    try {
      log.debug('[CardPress] Handling card press', { status, index });

      // Validate status
      if (!VALID_STATUSES.includes(status)) {
        log.error('Invalid relationship status', undefined, { status, index });
        Alert.alert('Error', 'Invalid relationship status selected. Please try again.');
        return;
      }

      // Validate index
      if (typeof index !== 'number' || index < 0 || index >= cardAnimations.length) {
        log.error('Invalid card index', undefined, { index, maxIndex: cardAnimations.length - 1 });
        Alert.alert('Error', 'Invalid card selection. Please try again.');
        return;
      }

      // Validate animation ref exists
      if (!cardAnimations[index]) {
        log.error('Card animation ref missing', undefined, { index });
        // Still allow status update, just skip animation
        updateField('relationshipStatus', status);
        return;
      }

      // Update relationship status
      updateField('relationshipStatus', status);
      log.info('[CardPress] Relationship status updated', { status });

      // Animate card press with error handling
      try {
        const anim = cardAnimations[index];
        if (!anim || !anim.scale || !anim.glow) {
          log.warn('Animation refs incomplete, skipping animation', { index });
          return;
        }

        Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 0.98,
            useNativeDriver: true,
          }),
          Animated.timing(anim.glow, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false, // Glow uses shadow which can't use native driver
          }),
        ]).start((finished) => {
          if (finished && anim.scale) {
            Animated.spring(anim.scale, {
              toValue: 1,
              useNativeDriver: true,
            }).start();
          }
        });
      } catch (animError) {
        log.error('Animation failed', animError, { index });
        // Don't block the status update, just log the error
      }
    } catch (error) {
      log.error('Card press handler failed', error, { status, index });
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleCardPressIn = (index: number) => {
    try {
      if (typeof index !== 'number' || index < 0 || index >= cardAnimations.length) {
        log.warn('Invalid index in handleCardPressIn', { index });
        return;
      }

      const anim = cardAnimations[index];
      if (!anim || !anim.translateY || !anim.scale) {
        log.warn('Animation refs missing in handleCardPressIn', { index });
        return;
      }

      Animated.parallel([
        Animated.spring(anim.translateY, {
          toValue: -4,
          useNativeDriver: true,
        }),
        Animated.spring(anim.scale, {
          toValue: 0.98,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      log.error('handleCardPressIn failed', error, { index });
    }
  };

  const handleCardPressOut = (index: number) => {
    try {
      if (typeof index !== 'number' || index < 0 || index >= cardAnimations.length) {
        log.warn('Invalid index in handleCardPressOut', { index });
        return;
      }

      const anim = cardAnimations[index];
      if (!anim || !anim.translateY || !anim.scale) {
        log.warn('Animation refs missing in handleCardPressOut', { index });
        return;
      }

      Animated.parallel([
        Animated.spring(anim.translateY, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.spring(anim.scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      log.error('handleCardPressOut failed', error, { index });
    }
  };

  const handleNext = () => {
    if (step === 1) {
      // Relationship status is required, always proceed
      log.info('[Onboarding] Moving to step 2', { relationshipStatus: formData.relationshipStatus });
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
    log.info('[Registration] Attempting registration', { email: formData.email });

    try {
      const data = await register({
        firstName: formData.firstName,
        email: formData.email,
        password: formData.password,
        relationshipStatus: formData.relationshipStatus,
        partnerName: formData.partnerName || undefined,
        birthday: formData.birthday || undefined,
      });

      if (data.success && data.data) {
        log.info('[Registration] Registration successful', { userId: data.data.user?.id });
        navigation.replace('Dashboard', { userName: formData.firstName });
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error: any) {
      log.error('[Registration] Registration failed', error);
      
      const errorMessage = error.message || 'Failed to create account. Please try again.';
      
      if (errorMessage.includes('Network Error')) {
        Alert.alert(
          'Connection Error',
          errorMessage,
          [{ text: 'OK', style: 'default' }]
        );
      } else if (errorMessage.includes('Email already registered')) {
        Alert.alert(
          'Email Already Registered',
          'This email is already registered. Please use the Login screen instead.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Go to Login', 
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert(
          'Registration Failed',
          errorMessage
        );
      }
    } finally {
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
    // Note: continueButtonScale is now defined at component top level
    // to comply with Rules of Hooks (hooks cannot be conditional)

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
            try {
              // Validate status object
              if (!status || !status.value || !status.label) {
                log.error('Invalid status object in render', undefined, { index });
                return null;
              }

              // Validate image exists
              if (!status.image) {
                log.error('Status image missing', undefined, { status: status.value, index });
                return null;
              }

              const isSelected = formData.relationshipStatus === status.value;
              const anim = cardAnimations && cardAnimations[index];

              // Safe font family access
              const fontFamily = fontsLoaded === true ? 'Poppins_600SemiBold' : 'System';

              // Render card with animation if available, otherwise without
              const cardContent = (
                <TouchableOpacity
                  style={[
                    styles.statusCard,
                    isSelected && styles.statusCardSelected,
                  ]}
                  onPress={() => {
                    try {
                      handleCardPress(status.value, index);
                    } catch (error) {
                      log.error('Card onPress failed', error, { status: status.value, index });
                    }
                  }}
                  onPressIn={() => {
                    try {
                      if (anim) {
                        handleCardPressIn(index);
                      }
                    } catch (error) {
                      log.error('Card onPressIn failed', error, { index });
                    }
                  }}
                  onPressOut={() => {
                    try {
                      if (anim) {
                        handleCardPressOut(index);
                      }
                    } catch (error) {
                      log.error('Card onPressOut failed', error, { index });
                    }
                  }}
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
                          { fontFamily },
                        ]}
                      >
                        {status.label}
                      </Text>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
              );

              // Render with animation if available
              if (anim && anim.translateY && anim.scale) {
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
                    {cardContent}
                  </Animated.View>
                );
              }

              // Fallback: render without animation
              return (
                <View
                  key={status.value}
                  style={[
                    styles.cardWrapper,
                    {
                      shadowOpacity: isSelected ? 0.6 : 0.4,
                    },
                  ]}
                >
                  {cardContent}
                </View>
              );
            } catch (renderError) {
              log.error('Render error in card', renderError, { index, status: status?.value });
              // Return null to prevent crash, but log the error
              return null;
            }
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
