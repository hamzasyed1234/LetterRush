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

export default function Login({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const cleanUsername = username.trim().toLowerCase();

    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', cleanUsername)
      .eq('password', password)
      .single();

    setLoading(false);

    if (fetchError || !data) {
      setError('Invalid username or password.');
    } else {
      navigation?.navigate('Home', { username: cleanUsername });
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
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to LetterRush</Text>

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

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.buttonLogin}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Log In</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonSignUp}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate('CreateAccount')}
          >
            <Text style={styles.buttonSignUpText}>No account? Create one</Text>
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
  buttonLogin: {
    width: width - 56,
    paddingVertical: 17,
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 10,
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  buttonSignUp: {
    width: width - 56,
    paddingVertical: 17,
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  buttonSignUpText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonBack: { marginTop: 4 },
  buttonBackText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
  },
});