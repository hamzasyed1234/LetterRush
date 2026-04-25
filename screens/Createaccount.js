import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');

export default function CreateAccount({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreateAccount() {
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setError('Username can only contain letters, numbers and underscores.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const cleanUsername = username.trim().toLowerCase();

    // Check if username already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', cleanUsername)
      .single();

    if (existing) {
      setError('That username is already taken.');
      setLoading(false);
      return;
    }

    // Insert new user
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ username: cleanUsername, password });

    setLoading(false);

    if (insertError) {
      setError('Something went wrong. Please try again.');
    } else {
      navigation?.navigate('Game');
    }
  }

  return (
    <LinearGradient colors={['#08001a', '#08001a']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#08001a" />

      <LinearGradient
        colors={['#00eeffaa', '#00eeff22', 'transparent']}
        start={{ x: 0, y: 1 }} end={{ x: 0.65, y: 0.3 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['#ff00ccaa', '#ff00cc22', 'transparent']}
        start={{ x: 1, y: 1 }} end={{ x: 0.35, y: 0.3 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['#9900ffbb', '#6600ff44', 'transparent']}
        start={{ x: 0.5, y: 0.2 }} end={{ x: 0.5, y: 0.9 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', '#000000cc']}
        start={{ x: 0.5, y: 0.4 }} end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join LetterRush</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.buttonCreate}
            activeOpacity={0.85}
            onPress={handleCreateAccount}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>✦  Create Account</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonBack}
            activeOpacity={0.7}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.buttonBackText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  title: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    marginBottom: 40,
  },
  form: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  input: {
    width: width - 56,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 16,
  },
  error: {
    color: '#ff4d6d',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonCreate: {
    width: width - 56,
    paddingVertical: 17,
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonBack: { marginTop: 4 },
  buttonBackText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
  },
});