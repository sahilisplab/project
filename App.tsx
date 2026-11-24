import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import AppNavigator from './android/app/src/navigation/AppNavigator.js';

export default function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const theme = isDarkTheme ? MD3DarkTheme : MD3LightTheme;

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <AppNavigator
          isDarkTheme={isDarkTheme}
          toggleTheme={() => setIsDarkTheme(!isDarkTheme)}
        />
      </NavigationContainer>
    </PaperProvider>
  );
}
