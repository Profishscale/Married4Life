import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_MOBILE = SCREEN_WIDTH < 768;

export default function WelcomeScreen({ navigation }: Props) {
  // Load fonts
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
  });

  // Animation values
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(10)).current;
  const primaryButtonOpacity = useRef(new Animated.Value(0)).current;
  const primaryButtonTranslateY = useRef(new Animated.Value(10)).current;
  const secondaryButtonOpacity = useRef(new Animated.Value(0)).current;
  const secondaryButtonTranslateY = useRef(new Animated.Value(10)).current;
  const backgroundScale = useRef(new Animated.Value(1)).current;
  const primaryButtonScale = useRef(new Animated.Value(1)).current;
  const secondaryButtonScale = useRef(new Animated.Value(1)).current;
  const quoteOpacity = useRef(new Animated.Value(0)).current;
  const quoteTranslateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    // Background zoom-in animation (starts immediately)
    Animated.timing(backgroundScale, {
      toValue: 1.05,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // Title animation
    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Subtitle animation
    Animated.parallel([
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleTranslateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Primary button animation
    Animated.parallel([
      Animated.timing(primaryButtonOpacity, {
        toValue: 1,
        duration: 800,
        delay: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(primaryButtonTranslateY, {
        toValue: 0,
        duration: 800,
        delay: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // Secondary button animation
    Animated.parallel([
      Animated.timing(secondaryButtonOpacity, {
        toValue: 1,
        duration: 800,
        delay: 1400,
        useNativeDriver: true,
      }),
      Animated.timing(secondaryButtonTranslateY, {
        toValue: 0,
        duration: 800,
        delay: 1400,
        useNativeDriver: true,
      }),
    ]).start();

    // Quote animation
    Animated.parallel([
      Animated.timing(quoteOpacity, {
        toValue: 1,
        duration: 900,
        delay: 1600,
        useNativeDriver: true,
      }),
      Animated.timing(quoteTranslateY, {
        toValue: 0,
        duration: 900,
        delay: 1600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGrowConnection = () => {
    navigation.navigate('Onboarding');
  };

  const handleLogin = () => {
    // TODO: Navigate to login screen when implemented
    navigation.navigate('Dashboard', { userName: 'User' });
  };

  const handlePrimaryPressIn = () => {
    Animated.spring(primaryButtonScale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePrimaryPressOut = () => {
    Animated.spring(primaryButtonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleSecondaryPressIn = () => {
    Animated.spring(secondaryButtonScale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handleSecondaryPressOut = () => {
    Animated.spring(secondaryButtonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background with gradient overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ scale: backgroundScale }] },
        ]}
      >
        <ImageBackground
          source={require('../../assets/homepage-background.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.6)']}
            style={styles.overlay}
          />
        </ImageBackground>
      </Animated.View>

      {/* Foreground content */}
      <View style={styles.content}>
        {/* Title */}
        <Animated.View style={{ opacity: titleOpacity }}>
          <Text style={[styles.appName, { fontFamily: fontsLoaded ? 'PlayfairDisplay_600SemiBold' : 'serif' }]}>Married4Life</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View
          style={{
            opacity: subtitleOpacity,
            transform: [{ translateY: subtitleTranslateY }],
          }}
        >
          <Text style={styles.subtitle}>
            Empowering Relationships Through AI and Heart
          </Text>
        </Animated.View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Primary */}
          <Animated.View
            style={{
              opacity: primaryButtonOpacity,
              transform: [{ translateY: primaryButtonTranslateY }],
            }}
          >
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Onboarding')}
              activeOpacity={0.95}
            >
              <LinearGradient
                colors={['#FFD54F', '#FFCA28']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>Grow Your Connection</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Secondary */}
          <Animated.View
            style={{
              opacity: secondaryButtonOpacity,
              transform: [{ translateY: secondaryButtonTranslateY }],
            }}
          >
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Dashboard', { userName: 'User' })}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>Login</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Romantic quote at bottom */}
        <Animated.View
          style={[
            styles.quoteContainer,
            { opacity: quoteOpacity, transform: [{ translateY: quoteTranslateY }] },
          ]}
        >
          <Text style={styles.quoteText}>
            "In every small act of love, your future is being written."
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: IS_MOBILE ? '5%' : 40,
    paddingVertical: 48,
    zIndex: 1,
    maxWidth: 600,
    width: '100%',
  },
  appName: {
    fontSize: IS_MOBILE ? 34 : 44,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: IS_MOBILE ? 16 : 18,
    color: '#FFD54F',
    textAlign: 'center',
    fontWeight: '300',
    paddingHorizontal: IS_MOBILE ? 20 : 40,
    lineHeight: IS_MOBILE ? 22 : 24,
    marginBottom: 40,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#FFD54F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: IS_MOBILE ? 16 : 18,
    fontWeight: 'bold',
    color: '#00203F',
  },
  secondaryButton: {
    width: '100%',
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#FFD54F',
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: IS_MOBILE ? 15 : 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quoteContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  quoteText: {
    color: 'rgba(255, 213, 79, 0.9)',
    textAlign: 'center',
    fontSize: IS_MOBILE ? 14 : 16,
    fontStyle: 'italic',
    lineHeight: IS_MOBILE ? 20 : 22,
  },
});
