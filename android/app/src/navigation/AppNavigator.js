import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import BootSplash from 'react-native-bootsplash';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import CatalogScreen from '../screens/CatalogScreen';
import DetailScreen from '../screens/DetailScreen';
import SavedScreen from '../screens/SavedScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ isDarkTheme, toggleTheme }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size }) => {
          let iconName = 'cube-outline';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Catalog') iconName = 'view-grid';
          else if (route.name === 'Saved') iconName = 'bookmark';
          else if (route.name === 'Profile') iconName = 'account';
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Catalog" component={CatalogScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Profile">
        {(props) => (
          <ProfileScreen
            {...props}
            isDarkTheme={isDarkTheme}
            toggleTheme={toggleTheme}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator({ isDarkTheme, toggleTheme }) {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const authInstance = getAuth();
    const subscriber = onAuthStateChanged(authInstance, (currentUser) => {
      setUser(currentUser);
      if (initializing) {
        setInitializing(false);
      }
    });

    BootSplash.hide({ fade: true }).catch(() => {});
    return subscriber;
  }, []);

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main">
            {(props) => (
              <MainTabs
                {...props}
                isDarkTheme={isDarkTheme}
                toggleTheme={toggleTheme}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="Detail"
            component={DetailScreen}
            options={{ headerShown: true, title: 'Crafting & Details' }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
