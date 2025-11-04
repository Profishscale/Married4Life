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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { getApiBaseUrl } from '../utils/api';
import ProgressSummaryCard from '../components/ProgressSummaryCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

interface CoachSession {
  id: string;
  userId: string;
  messageTitle: string;
  messageBody: string;
  callToAction: string;
  sessionType?: string;
  createdAt: Date;
}

type FilterType = 'all' | 'daily' | 'weekly';
type TabType = 'overview' | 'progress' | 'insights';

interface ProgressData {
  totalCheckIns: number;
  daysActive: number;
  currentStreak: number;
  longestStreak: number;
  recentActivity: any[];
  weeklyEngagement: { date: string; count: number }[];
  engagementTrend: { date: string; value: number }[];
}

export default function DashboardScreen({ navigation, route }: Props) {
  const userName = route.params?.userName || 'User';
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sessions, setSessions] = useState<CoachSession[]>([]);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadLatestSessions();
    loadProgressData();
  }, [activeFilter]);

  const loadLatestSessions = async () => {
    setLoading(true);
    try {
      const userId = '1'; // TODO: Get from auth context
      const API_BASE_URL = getApiBaseUrl();
      
      const response = await fetch(`${API_BASE_URL}/api/ai-coach/sessions/${userId}`);
      const data = await response.json();

      if (data.success) {
        let filteredSessions = data.data;
        
        // Filter by type
        if (activeFilter === 'daily') {
          filteredSessions = data.data.filter((s: CoachSession) => 
            s.sessionType === 'daily_checkin'
          );
        } else if (activeFilter === 'weekly') {
          filteredSessions = data.data.filter((s: CoachSession) => 
            s.sessionType === 'weekly_reflection'
          );
        }

        setSessions(filteredSessions.slice(0, 5)); // Latest 5
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgressData = async () => {
    try {
      const userId = '1'; // TODO: Get from auth context
      const API_BASE_URL = getApiBaseUrl();
      
      const response = await fetch(`${API_BASE_URL}/api/user-progress/${userId}`);
      const data = await response.json();

      if (data.success) {
        setProgressData(data.data);
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const handleNavigate = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
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
              Welcome back, {userName}! 💛
            </Text>
            <Text style={styles.subtitle}>
              Let's continue your journey to stronger relationships
            </Text>
          </View>

          {/* Progress Summary Card */}
          {progressData && (
            <ProgressSummaryCard
              progress={{
                currentStreak: progressData.currentStreak,
                longestStreak: progressData.longestStreak,
                daysActive: progressData.daysActive,
                totalCheckIns: progressData.totalCheckIns,
              }}
              onViewProgress={() => setActiveTab('progress')}
            />
          )}

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
                Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'progress' && styles.tabActive]}
              onPress={() => setActiveTab('progress')}
            >
              <Text style={[styles.tabText, activeTab === 'progress' && styles.tabTextActive]}>
                My Progress
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'insights' && styles.tabActive]}
              onPress={() => setActiveTab('insights')}
            >
              <Text style={[styles.tabText, activeTab === 'insights' && styles.tabTextActive]}>
                Insights
              </Text>
            </TouchableOpacity>
          </View>

          {/* Latest AI Guidance Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Guidance ✨</Text>
              <TouchableOpacity onPress={() => handleNavigate('AICoach')}>
                <Text style={styles.seeAllText}>See All →</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterTabs}>
              <TouchableOpacity
                style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
                onPress={() => setActiveFilter('all')}
              >
                <Text style={[styles.filterTabText, activeFilter === 'all' && styles.filterTabTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterTab, activeFilter === 'daily' && styles.filterTabActive]}
                onPress={() => setActiveFilter('daily')}
              >
                <Text style={[styles.filterTabText, activeFilter === 'daily' && styles.filterTabTextActive]}>
                  Daily
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterTab, activeFilter === 'weekly' && styles.filterTabActive]}
                onPress={() => setActiveFilter('weekly')}
              >
                <Text style={[styles.filterTabText, activeFilter === 'weekly' && styles.filterTabTextActive]}>
                  Weekly
                </Text>
              </TouchableOpacity>
            </View>

            {/* Latest Messages */}
            {loading ? (
              <ActivityIndicator size="large" color="#D4AF37" />
            ) : sessions.length > 0 ? (
              <Animated.View style={{ opacity: fadeAnim }}>
                {sessions.map((session) => (
                  <TouchableOpacity
                    key={session.id}
                    style={styles.messageCard}
                    onPress={() => handleNavigate('AICoach')}
                  >
                    <View style={styles.messageHeader}>
                      <Text style={styles.messageEmoji}>
                        {session.sessionType === 'daily_checkin' ? '☀️' : 
                         session.sessionType === 'weekly_reflection' ? '💫' : '🤖'}
                      </Text>
                      <Text style={styles.messageType}>
                        {session.sessionType === 'daily_checkin' ? 'Daily' :
                         session.sessionType === 'weekly_reflection' ? 'Weekly' : 'Custom'}
                      </Text>
                    </View>
                    <Text style={styles.messageTitle}>{session.messageTitle}</Text>
                    <Text style={styles.messageBody} numberOfLines={2}>
                      {session.messageBody}
                    </Text>
                    <Text style={styles.messageDate}>
                      {new Date(session.createdAt).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            ) : (
              <View style={styles.emptyMessages}>
                <Text style={styles.emptyMessagesText}>
                  No guidance yet. Tap "AI Coach" to get started! ✨
                </Text>
              </View>
            )}
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
              onPress={() => handleNavigate('GrowthCenter')}
            >
              <View style={styles.actionCardInner}>
                <Text style={styles.actionEmoji}>🎯</Text>
                <Text style={styles.actionTitle}>Growth Center</Text>
                <Text style={styles.actionDescription}>
                  Courses, games, and resources for growth
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

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <TouchableOpacity
              style={styles.settingsCard}
              onPress={() => handleNavigate('Subscription')}
            >
              <Text style={styles.settingsEmoji}>💎</Text>
              <View style={styles.settingsText}>
                <Text style={styles.settingsTitle}>Subscription</Text>
                <Text style={styles.settingsDescription}>
                  Upgrade your plan or redeem promo code
                </Text>
              </View>
              <Text style={styles.settingsArrow}>→</Text>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterTabActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  filterTabText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#0A1F44',
  },
  messageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  messageType: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  messageBody: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 8,
  },
  messageDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  emptyMessages: {
    padding: 32,
    alignItems: 'center',
  },
  emptyMessagesText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#D4AF37',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  tabTextActive: {
    color: '#0A1F44',
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
  settingsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  settingsEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  settingsText: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingsDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  settingsArrow: {
    fontSize: 24,
    color: '#D4AF37',
    fontWeight: 'bold',
  },
});

