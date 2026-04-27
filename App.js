import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import LandingPage from './screens/LandingPage';
import CreateAccount from './screens/Createaccount';
import Login from './screens/Login';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import AchievementsScreen from './screens/AchievementsScreen';

function Placeholder({ title, navigation }) {
  return (
    <View style={ph.container}>
      <Text style={ph.text}>{title}</Text>
      <TouchableOpacity onPress={() => navigation.goBack()} style={ph.btn}>
        <Text style={ph.btnText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}
const ph = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08001a', alignItems: 'center', justifyContent: 'center', gap: 20 },
  text: { color: '#fff', fontSize: 24, fontWeight: '700' },
  btn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  btnText: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
});

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing"        component={LandingPage} />
        <Stack.Screen name="CreateAccount"  component={CreateAccount} />
        <Stack.Screen name="Login"          component={Login} />
        <Stack.Screen name="Home"           component={HomeScreen} />
        <Stack.Screen name="Profile"        component={ProfileScreen} />
        <Stack.Screen name="Game"           children={(p) => <Placeholder title="🎮 Game" {...p} />} />
        <Stack.Screen name="Achievements"   component={AchievementsScreen} />
        <Stack.Screen name="Shop"           children={(p) => <Placeholder title="🛒 Shop" {...p} />} />
        <Stack.Screen name="Settings"       children={(p) => <Placeholder title="⚙️ Settings" {...p} />} />
        <Stack.Screen name="FriendsList"    children={(p) => <Placeholder title="👥 Friends List" {...p} />} />
        <Stack.Screen name="AddFriend"      children={(p) => <Placeholder title="➕ Add Friend" {...p} />} />
        <Stack.Screen name="FriendRequests" children={(p) => <Placeholder title="📬 Friend Requests" {...p} />} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}