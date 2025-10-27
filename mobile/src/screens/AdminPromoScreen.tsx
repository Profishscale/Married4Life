import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminPromo'>;

interface PromoCode {
  id: string;
  code: string;
  description?: string;
  planType: string;
  currentUses: number;
  maxUses?: number;
  isActive: boolean;
  createdAt: Date;
}

export default function AdminPromoScreen({ navigation }: Props) {
  const [newCode, setNewCode] = useState('');
  const [description, setDescription] = useState('');
  const [planType, setPlanType] = useState('pro');
  const [maxUses, setMaxUses] = useState('');
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/promo`);
      const data = await response.json();

      if (data.success) {
        setCodes(data.data);
      }
    } catch (error) {
      console.error('Error loading promo codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newCode.trim()) {
      Alert.alert('Error', 'Please enter a code');
      return;
    }

    setCreating(true);
    try {
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/promo/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode.toUpperCase(),
          description,
          planType,
          maxUses: maxUses ? parseInt(maxUses) : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success!', 'Promo code created');
        setNewCode('');
        setDescription('');
        setMaxUses('');
        loadPromoCodes();
      } else {
        Alert.alert('Error', data.error || 'Failed to create promo code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create promo code');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (codeId: string, code: string) => {
    Alert.alert(
      'Delete Promo Code',
      `Are you sure you want to delete "${code}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
              
              const response = await fetch(`${API_BASE_URL}/api/promo/${codeId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                loadPromoCodes();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete promo code');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A1F44', '#1a3d6b']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            🔧 DEV: Promo Code Manager
          </Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Warning */}
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ DEV/PROTOTYPE ONLY: This screen is for development and testing.
              Remove or secure before production deployment.
            </Text>
          </View>

          {/* Create New */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Create New Promo Code</Text>

            <TextInput
              style={styles.input}
              placeholder="Code (e.g., TEST2024)"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={newCode}
              onChangeText={setNewCode}
              autoCapitalize="characters"
            />

            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Plan Type</Text>
                <TouchableOpacity
                  style={[
                    styles.planButton,
                    planType === 'plus' && styles.planButtonActive,
                  ]}
                  onPress={() => setPlanType('plus')}
                >
                  <Text style={[styles.planText, planType === 'plus' && styles.planTextActive]}>
                    Plus
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.half}>
                <TouchableOpacity
                  style={[
                    styles.planButton,
                    planType === 'pro' && styles.planButtonActive,
                  ]}
                  onPress={() => setPlanType('pro')}
                >
                  <Text style={[styles.planText, planType === 'pro' && styles.planTextActive]}>
                    Pro
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Max uses (optional)"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={maxUses}
              onChangeText={setMaxUses}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreate}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color="#0A1F44" />
              ) : (
                <Text style={styles.createButtonText}>Create Promo Code</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Existing Codes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Existing Codes</Text>

            {loading ? (
              <ActivityIndicator size="large" color="#D4AF37" />
            ) : codes.length === 0 ? (
              <Text style={styles.emptyText}>No promo codes yet</Text>
            ) : (
              codes.map(code => (
                <View key={code.id} style={styles.codeCard}>
                  <View style={styles.codeHeader}>
                    <Text style={styles.codeText}>{code.code}</Text>
                    {code.isActive ? (
                      <View style={styles.activeTag}>
                        <Text style={styles.activeText}>Active</Text>
                      </View>
                    ) : (
                      <View style={styles.inactiveTag}>
                        <Text style={styles.inactiveText}>Inactive</Text>
                      </View>
                    )}
                  </View>

                  {code.description && (
                    <Text style={styles.codeDescription}>{code.description}</Text>
                  )}

                  <View style={styles.codeInfo}>
                    <Text style={styles.codeInfoText}>
                      Plan: <Text style={styles.bold}>{code.planType}</Text>
                    </Text>
                    <Text style={styles.codeInfoText}>
                      Uses: <Text style={styles.bold}>
                        {code.currentUses}{code.maxUses ? `/${code.maxUses}` : ''}
                      </Text>
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(code.id, code.code)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
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
  header: {
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  warningBanner: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  warningText: {
    fontSize: 12,
    color: '#FF9800',
    lineHeight: 18,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  half: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '600',
  },
  planButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  planButtonActive: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  planText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planTextActive: {
    color: '#D4AF37',
  },
  createButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    color: '#0A1F44',
    fontSize: 16,
    fontWeight: 'bold',
  },
  codeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A1F44',
  },
  activeTag: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  inactiveTag: {
    backgroundColor: '#999',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inactiveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  codeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  codeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  codeInfoText: {
    fontSize: 14,
    color: '#666',
  },
  bold: {
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    padding: 20,
  },
});

