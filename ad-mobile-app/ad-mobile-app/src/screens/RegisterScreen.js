import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView
} from 'react-native';
import { COLORS } from '../constants/theme';
import apiClient from '../services/apiClient';
import { saveAuthSession } from '../utils/storage';

const OTT_OPTIONS = ['Netflix', 'Prime Video', 'Disney+ Hotstar', 'JioCinema', 'Apple TV+'];

export default function RegisterScreen({ onSwitchToLogin, onRegistered }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedOtts, setSelectedOtts] = useState(['Netflix', 'Prime Video']);
  const [errorMsg, setErrorMsg] = useState('');

  function toggleOtt(ott) {
    if (selectedOtts.includes(ott)) {
      setSelectedOtts(selectedOtts.filter((x) => x !== ott));
    } else {
      setSelectedOtts([...selectedOtts, ott]);
    }
  }

  async function handleRegister() {
    try {
      setErrorMsg('');
      const res = await apiClient.post('/tracker/auth/register', {
        name,
        username,
        email,
        password,
        subscribedOTTs: selectedOtts
      });
      const { user, token } = res.data.data;
      await saveAuthSession(token, user);
      if (onRegistered) onRegistered(user);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.brand}>Create CineCircle Account</Text>

      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor={COLORS.textSecondary}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Username (e.g. rahul_nst)"
          placeholderTextColor={COLORS.textSecondary}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor={COLORS.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password (min 6 chars)"
          placeholderTextColor={COLORS.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.subLabel}>Select Your OTT Subscriptions:</Text>
        <View style={styles.ottGrid}>
          {OTT_OPTIONS.map((ott) => (
            <TouchableOpacity
              key={ott}
              style={[
                styles.ottChip,
                selectedOtts.includes(ott) && styles.ottChipSelected
              ]}
              onPress={() => toggleOtt(ott)}
            >
              <Text style={styles.ottChipText}>{ott}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister}>
          <Text style={styles.primaryBtnText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchBtn} onPress={onSwitchToLogin}>
          <Text style={styles.switchText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 24
  },
  brand: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 20
  },
  formCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  input: {
    backgroundColor: COLORS.background,
    color: COLORS.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10
  },
  subLabel: { color: COLORS.textSecondary, fontSize: 13, marginVertical: 8 },
  ottGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  ottChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background
  },
  ottChipSelected: {
    borderColor: COLORS.accent,
    backgroundColor: '#1E293B'
  },
  ottChipText: { color: COLORS.textPrimary, fontSize: 12 },
  errorText: { color: COLORS.primary, fontSize: 12, marginBottom: 10 },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center'
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  switchBtn: { marginTop: 14, alignItems: 'center' },
  switchText: { color: COLORS.accent, fontSize: 13 }
});
