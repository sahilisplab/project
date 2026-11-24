import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Icon name="cube-outline" size={80} color="#4CAF50" />
      <Text variant="headlineMedium" style={styles.title}>
        Minecraft Guide
      </Text>
      <ActivityIndicator animating={true} color="#4CAF50" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E' },
  title: { color: '#FFFFFF', marginTop: 16, fontWeight: 'bold' },
  loader: { marginTop: 24 },
});
