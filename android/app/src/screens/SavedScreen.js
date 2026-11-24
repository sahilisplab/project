import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import {
  Card,
  Text,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from '@react-native-firebase/firestore';
import { db, firebaseAuth } from '../config/firebase';

export default function SavedScreen() {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = firebaseAuth.currentUser;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const savedRef = collection(db, 'users', user.uid, 'saved_recipes');
    const q = query(savedRef, orderBy('savedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const items = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }));
        setSavedItems(items);
        setLoading(false);
      },
      error => {
        console.error('Error listening to saved recipes:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async docId => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'saved_recipes', docId));
    } catch (error) {
      Alert.alert('Error', 'Could not remove saved recipe.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text variant="headlineSmall" style={styles.header}>
        Saved Recipes ({savedItems.length})
      </Text>

      <FlatList
        data={savedItems}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No Saved Recipes Yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptySub}>
              Open any block in the Catalog and tap "Save to Firestore" to
              bookmark it here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title
              title={item.displayName || 'Unknown Block'}
              subtitle={`Hardness: ${item.hardness ?? 'N/A'} | Stack: ${item.stackSize ?? 64}`}
              right={props => (
                <IconButton
                  {...props}
                  icon="delete-outline"
                  iconColor="#EF5350"
                  onPress={() => handleDelete(item.id)}
                />
              )}
            />
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  header: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    marginBottom: 10,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySub: {
    color: '#AAAAAA',
    textAlign: 'center',
  },
});
