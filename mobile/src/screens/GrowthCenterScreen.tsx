import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'GrowthCenter'>;

interface Content {
  id: string;
  type: 'course' | 'game' | 'resource';
  title: string;
  description: string;
  difficulty?: string;
  duration?: number;
  category?: string;
  thumbnailUrl?: string;
}

type TabType = 'courses' | 'games' | 'resources';

export default function GrowthCenterScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('courses');
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContent();
  }, [activeTab]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
      let endpoint = `/api/content/${activeTab}`;
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();

      if (data.success) {
        setContent(data.data);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContentCard = (item: Content) => {
    const icons = {
      course: '📚',
      game: '🎮',
      resource: '📖',
    };

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.contentCard}
        onPress={() => {
          // TODO: Navigate to content detail
          console.log('Navigate to', item.title);
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>{icons[item.type]}</Text>
          {item.difficulty && (
            <Text style={styles.difficulty}>{item.difficulty}</Text>
          )}
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          {item.duration && (
            <Text style={styles.cardMeta}>
              ⏱️ {item.duration} min
            </Text>
          )}
          {item.category && (
            <Text style={styles.cardCategory}>{item.category}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>
        {activeTab === 'courses' ? '📚' : activeTab === 'games' ? '🎮' : '📖'}
      </Text>
      <Text style={styles.emptyTitle}>
        {activeTab === 'courses' && 'No courses available yet'}
        {activeTab === 'games' && 'No games available yet'}
        {activeTab === 'resources' && 'No resources available yet'}
      </Text>
      <Text style={styles.emptyText}>
        Check back soon for new content!
      </Text>
    </View>
  );

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
            <Text style={styles.headerTitle}>Growth Center ✨</Text>
            <Text style={styles.headerSubtitle}>
              Your journey to deeper connection
            </Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'courses' && styles.tabActive]}
            onPress={() => setActiveTab('courses')}
          >
            <Text style={[styles.tabText, activeTab === 'courses' && styles.tabTextActive]}>
              📚 Courses
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'games' && styles.tabActive]}
            onPress={() => setActiveTab('games')}
          >
            <Text style={[styles.tabText, activeTab === 'games' && styles.tabTextActive]}>
              🎮 Games
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'resources' && styles.tabActive]}
            onPress={() => setActiveTab('resources')}
          >
            <Text style={[styles.tabText, activeTab === 'resources' && styles.tabTextActive]}>
              📖 Resources
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
          </View>
        ) : content.length > 0 ? (
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
          >
            {content.map(renderContentCard)}
          </ScrollView>
        ) : (
          renderEmptyState()
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
    textAlign: 'center',
  },
  headerSubtitle: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  contentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 32,
  },
  difficulty: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A1F44',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMeta: {
    fontSize: 12,
    color: '#999',
  },
  cardCategory: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});

