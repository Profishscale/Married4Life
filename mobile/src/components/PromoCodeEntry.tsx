import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';

interface Props {
  onRedeem: (code: string) => Promise<void>;
  disabled?: boolean;
}

export default function PromoCodeEntry({ onRedeem, disabled }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    setLoading(true);
    try {
      await onRedeem(code.toUpperCase());
      setCode('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to redeem promo code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Have a promo code?</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter promo code"
          placeholderTextColor="rgba(0, 0, 0, 0.5)"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          editable={!disabled && !loading}
        />
        
        <TouchableOpacity
          style={[styles.button, (disabled || loading) && styles.buttonDisabled]}
          onPress={handleRedeem}
          disabled={disabled || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Redeem</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        Enter your promo code to unlock premium features
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A1F44',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  button: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

