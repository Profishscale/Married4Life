import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { getApiBaseUrl } from '../utils/api';

type Props = NativeStackScreenProps<RootStackParamList, 'AICoach'>;

interface CoachSession {
  id: string;
  userId: string;
  messageTitle: string;
  messageBody: string;
  callToAction: string;
  createdAt: Date;
}

export default function AICoachScreen({ navigation }: Props) {
  const [currentGuidance, setCurrentGuidance] = useState<CoachSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<CoachSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Load session history on mount
    loadSessionHistory();
  }, []);

  const loadSessionHistory = async () => {
    // TODO: Get userId from auth context
    const userId = '1'; // Placeholder
    try {
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/ai-coach/sessions/${userId}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setCurrentGuidance(data.data[0]); // Most recent guidance
        setSessionHistory(data.data);
      }
    } catch (error) {
      console.error('Error loading session history:', error);
    }
  };

  const handleNewGuidance = async () => {
    setLoading(true);
    try {
      const userId = '1'; // TODO: Get from auth context
      const API_BASE_URL = getApiBaseUrl();

      const response = await fetch(`${API_BASE_URL}/api/ai-coach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          relationshipStatus: 'dating', // TODO: Get from user profile
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newGuidance: CoachSession = {
          id: Date.now().toString(),
          userId,
          messageTitle: data.data.title,
          messageBody: data.data.body,
          callToAction: data.data.callToAction,
          createdAt: new Date(),
        };

        // Animate new guidance
        fadeAnim.setValue(0);
        setCurrentGuidance(newGuidance);
        setSessionHistory([newGuidance, ...sessionHistory]);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error('Error getting new guidance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A1F44', '#1a3d6b', '#2a1f44']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>AI Coach 🤖</Text>
            <Text style={styles.headerSubtitle}>Your relationship guide</Text>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {currentGuidance ? (
            <Animated.View style={[styles.guidanceCard, { opacity: fadeAnim }]}>
              <LinearGradient
                colors={['#D4AF37', '#F5DE80']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardGradient}
              >
                <Text style={styles.cardTitle}>{currentGuidance.messageTitle}</Text>
              </LinearGradient>

              <View style={styles.cardBody}>
                <Text style={styles.cardText}>{currentGuidance.messageBody}</Text>
              </View>

              <View style={styles.callToActionContainer}>
                <Text style={styles.callToActionLabel}>💭 Reflection</Text>
                <Text style={styles.callToAction}>{currentGuidance.callToAction}</Text>
              </View>
            </Animated.View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>✨</Text>
              <Text style={styles.emptyStateText}>
                Tap "New Guidance" to receive personalized relationship advice
              </Text>
            </View>
          )}

          {/* Session History */}
          {sessionHistory.length > 1 && (
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>Recent Sessions</Text>
              {sessionHistory.slice(1).map((session, index) => (
                <TouchableOpacity
                  key={session.id}
                  style={styles.historyCard}
                  onPress={() => setCurrentGuidance(session)}
                >
                  <Text style={styles.historyTitle}>{session.messageTitle}</Text>
                  <Text style={styles.historyDate}>
                    {session.createdAt.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Fixed Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleNewGuidance}
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
                <Text style={styles.buttonText}>✨ New Guidance</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
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
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  guidanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  cardGradient: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0A1F44',
    textAlign: 'center',
  },
  cardBody: {
    padding: 24,
  },
  cardText: {
    fontSize: 17,
    lineHeight: 28,
    color: '#1a1a1a',
    textAlign: 'left',
  },
  callToActionContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.3)',
  },
  callToActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 8,
  },
  callToAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1F44',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 28,
  },
  historySection: {
    marginTop: 32,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  historyDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 31, 68, 0.95)',
  },
  button: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A1F44',
  },
});

