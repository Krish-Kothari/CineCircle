import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ProfileStatsScreen from '../screens/ProfileStatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function AuthenticatedTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        tabBarIconStyle: { marginBottom: -2 }
      }}
    >
      <Tabs.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? 'compass' : 'compass-outline'} size={23} color={color} /> }}
      />
      <Tabs.Screen
        name="Watchlist"
        component={WatchlistScreen}
        options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="Stats"
        component={ProfileStatsScreen}
        options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={21} color={color} /> }}
      />
      <Tabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? 'settings' : 'settings-outline'} size={21} color={color} /> }}
      />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? <Stack.Screen name="App" component={AuthenticatedTabs} /> : null}
        {!user ? <Stack.Screen name="Login" component={LoginScreen} /> : null}
        {!user ? <Stack.Screen name="Signup" component={SignupScreen} /> : null}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
