import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LandingPage({ navigation }) {
  const logoScale = useRef(new Animated.Value(0.05)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoBob = useRef(new Animated.Value(1)).current;

  const btn1TranslateY = useRef(new Animated.Value(150)).current;
  const btn2TranslateY = useRef(new Animated.Value(150)).current;
  const btn3TranslateY = useRef(new Animated.Value(150)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 7,
          tension: 35,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Smooth sine-like bob: 1 → 1.06 → 1 → 0.94 → 1, repeat
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoBob, {
            toValue: 1.06,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(logoBob, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(logoBob, {
            toValue: 0.94,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(logoBob, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    Animated.sequence([
      Animated.delay(1500),
      Animated.parallel([
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.stagger(80, [
          Animated.spring(btn1TranslateY, {
            toValue: 0,
            friction: 8,
            tension: 55,
            useNativeDriver: true,
          }),
          Animated.spring(btn2TranslateY, {
            toValue: 0,
            friction: 8,
            tension: 55,
            useNativeDriver: true,
          }),
          Animated.spring(btn3TranslateY, {
            toValue: 0,
            friction: 8,
            tension: 55,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, []);

  const combinedScale = Animated.multiply(logoScale, logoBob);

  return (
    <LinearGradient
      colors={['#08001a', '#08001a']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#08001a" />

      {/* Cyan burst — bottom left */}
      <LinearGradient
        colors={['#00eeffaa', '#00eeff22', 'transparent']}
        start={{ x: 0, y: 1 }}
        end={{ x: 0.65, y: 0.3 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Magenta/pink burst — bottom right */}
      <LinearGradient
        colors={['#ff00ccaa', '#ff00cc22', 'transparent']}
        start={{ x: 1, y: 1 }}
        end={{ x: 0.35, y: 0.3 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Yellow-green burst — top right */}
      <LinearGradient
        colors={['#bbff0066', '#bbff0022', 'transparent']}
        start={{ x: 1, y: 0.1 }}
        end={{ x: 0.4, y: 0.65 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Purple/violet core — radiates from center-top */}
      <LinearGradient
        colors={['#9900ffbb', '#6600ff44', 'transparent']}
        start={{ x: 0.5, y: 0.2 }}
        end={{ x: 0.5, y: 0.9 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Soft dark vignette to deepen edges */}
      <LinearGradient
        colors={['transparent', '#000000cc']}
        start={{ x: 0.5, y: 0.4 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>

        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [{ scale: combinedScale }],
            },
          ]}
        >
          <Image
            source={require('../assets/iconlol.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={[styles.buttonsWrapper, { opacity: buttonsOpacity }]}>
          <Animated.View style={{ transform: [{ translateY: btn1TranslateY }] }}>
            <TouchableOpacity
              style={[styles.button, styles.buttonPlay]}
              activeOpacity={0.85}
              onPress={() => navigation?.navigate('Game')}
            >
              <Text style={styles.buttonTextPlay}>▶  Play as Guest</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateY: btn2TranslateY }] }}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCreate]}
              activeOpacity={0.85}
              onPress={() => navigation?.navigate('CreateAccount')}
            >
              <Text style={styles.buttonTextCreate}>✦  Create Account</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateY: btn3TranslateY }] }}>
            <TouchableOpacity
              style={[styles.button, styles.buttonLogin]}
              activeOpacity={0.85}
              onPress={() => navigation?.navigate('Login')}
            >
              <Text style={styles.buttonTextLogin}>Log In</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: width * 0.95,
    height: width * 0.95,
  },
  buttonsWrapper: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    width: width - 56,
    paddingVertical: 17,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPlay: {
    backgroundColor: '#3B82F6',
    shadowColor: '#22D3EE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 10,
  },
  buttonTextPlay: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  buttonCreate: {
    backgroundColor: '#7C3AED',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonTextCreate: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonLogin: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  buttonTextLogin: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 16,
    fontWeight: '600',
  },
});