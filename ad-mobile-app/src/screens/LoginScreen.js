import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login, loading, error } = useAuth();
  const [identifier, setIdentifier] = useState('krish@nst.edu');
  const [password, setPassword] = useState('password123');

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>CineCircle</Text>
      <Text style={styles.tagline}>Track shows. Blend tastes with your squad.</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Email or Username</Text>
        <TextInput
          style={styles.input}
          value={identifier}
          onChangeText={setIdentifier}
          placeholder="krish@nst.edu"
          placeholderTextColor={COLORS.textSecondary}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={COLORS.textSecondary}
          secureTextEntry
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => login(identifier, password)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 24
  },
  brand: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center'
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 28
  },
  formCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    backgroundColor: COLORS.background,
    color: COLORS.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  errorText: {
    color: COLORS.primary,
    fontSize: 13,
    marginTop: 10
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16
  }
});
