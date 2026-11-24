import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Switch } from 'react-native-paper';
import { collection, onSnapshot } from '@react-native-firebase/firestore';
import { db, firebaseAuth, logoutUser } from '../config/firebase';

export default function ProfileScreen({ isDarkTheme, toggleTheme }) {
  const user = firebaseAuth.currentUser;
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const savedRecipesRef = collection(db, 'users', user.uid, 'saved_recipes');
    const unsubscribe = onSnapshot(savedRecipesRef, snapshot => {
      setSavedCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Crafter Profile" subtitle={user?.email} />
        <Card.Content>
          <Text variant="bodyLarge" style={styles.stat}>
            Saved Recipes: {savedCount}
          </Text>
          <View style={styles.row}>
            <Text variant="bodyMedium">Dark Mode Theme</Text>
            <Switch value={isDarkTheme} onValueChange={toggleTheme} />
          </View>
        </Card.Content>
        <Card.Actions>
          <Button
            mode="contained"
            buttonColor="#D32F2F"
            onPress={() => logoutUser()}>
            Logout
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    padding: 16,
  },
  card: {
    padding: 8,
  },
  stat: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
});
