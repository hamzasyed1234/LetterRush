import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';

import LandingPage from './screens/LandingPage';
import CreateAccount from './screens/Createaccount';
import Login from './screens/Login';

// Placeholder until Game screen is built
function GameScreen() {
  return (
    <View style={styles.game}>
      <Text style={styles.gameText}>🎮 Game Coming Soon!</Text>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingPage} />
        <Stack.Screen name="CreateAccount" component={CreateAccount} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Game" component={GameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  game: {
    flex: 1,
    backgroundColor: '#08001a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
});