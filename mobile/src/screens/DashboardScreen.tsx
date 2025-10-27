import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation, route }: Props) {
  // TODO: Get user data from context or props
  const userName = 'User'; // This will come from auth context

  const handleNavigate = (screen: keyof RootStackParamList) => {
    // navigation.navigate(screen);
    console.log(`Navigate to ${screen}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A1F44', '#1a3d6b']}
        style={styles.gradient}
      >
        <ScrollView style={styles.content}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              Welcome, {userName}! 👋
            </Text>
            <Text style={styles.subtitle}>
              Let's begin your journey to stronger relationships
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Get Started</Text>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleNavigate('AICoach')}
            >
              <LinearGradient
                colors={['#D4AF37', '#F5DE80']}
                style={styles.actionCardGradient}
              >
                <Text style={styles.actionEmoji}>🤖</Text>
                <Text style={styles.actionTitle}>AI Coach</Text>
                <Text style={styles.actionDescription}>
                  Get personalized relationship guidance
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleNavigate('Courses')}
            >
              <View style={styles.actionCardInner}>
                <Text style={styles.actionEmoji}>📚</Text>
                <Text style={styles.actionTitle}>Courses</Text>
                <Text style={styles.actionDescription}>
                  Learn about love languages and more
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleNavigate('Games')}
            >
              <View style={styles.actionCardInner}>
                <Text style={styles.actionEmoji}>🎮</Text>
                <Text style={styles.actionTitle}>Connection Games</Text>
                <Text style={styles.actionDescription}>
                  Fun activities to strengthen bonds
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Progress Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Progress</Text>

            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Days Active</Text>
                <Text style={styles.progressValue}>3</Text>
              </View>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Courses Completed</Text>
                <Text style={styles.progressValue}>0</Text>
              </View>
            </View>
          </View>

          {/* Featured Content */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured</Text>

            <TouchableOpacity style={styles.featuredCard}>
              <Text style={styles.featuredEmoji}>💕</Text>
              <View style={styles.featuredText}>
                <Text style={styles.featuredTitle}>
                  Discover Your Love Language
                </Text>
                <Text style={styles.featuredDescription}>
                  Learn how you and your partner express love
                </Text>
              </View>
            </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: 24,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  actionCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionCardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  actionCardInner: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  actionEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  featuredCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  featuredEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  featuredText: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

