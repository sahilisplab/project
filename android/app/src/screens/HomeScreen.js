import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Searchbar, Card, Button, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { collection, onSnapshot } from '@react-native-firebase/firestore';
import { db, firebaseAuth } from '../config/firebase';

const CRAFTING_TIPS = [
  'Place 4 Wooden Planks in a 2x2 grid in your inventory to craft your first Crafting Table.',
  'Always carry a Water Bucket—it saves you from fall damage and turns lava into Obsidian.',
  'Combine 1 Coal and 1 Stick to craft 4 Torches and keep hostile mobs from spawning.',
  'Smelt Cobblestone in a Furnace to get smooth Stone for advanced Redstone components.',
  'Craft a Shield early using 6 Wooden Planks and 1 Iron Ingot to block Creeper blasts.',
];

const CATEGORIES = [
  { label: 'Blocks', filter: 'stone', icon: 'wall', color: '#4CAF50' },
  { label: 'Wood & Tools', filter: 'oak', icon: 'axe', color: '#8BC34A' },
  { label: 'Redstone', filter: 'redstone', icon: 'lightning-bolt', color: '#EF5350' },
  { label: 'Ores & Gems', filter: 'ore', icon: 'diamond-stone', color: '#29B6F6' },
  { label: 'Light & Fire', filter: 'torch', icon: 'fire', color: '#FFA726' },
  { label: 'Storage', filter: 'chest', icon: 'treasure-chest', color: '#AB47BC' },
];

const QUICK_SEARCHES = ['Furnace', 'Chest', 'Torch', 'Piston', 'Obsidian', 'TNT'];

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [savedCount, setSavedCount] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const user = firebaseAuth.currentUser;
  const displayName =
    user?.displayName || user?.email?.split('@') || 'Crafter';

  useEffect(() => {
    if (!user) return;
    const savedRef = collection(db, 'users', user.uid, 'saved_recipes');
    const unsubscribe = onSnapshot(savedRef, snapshot => {
      setSavedCount(snapshot.size);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSearch = () => {
    navigation.navigate('Catalog', {
      filter: null,
      initialSearch: searchQuery,
    });
  };

  const nextTip = () => {
    setTipIndex(prev => (prev + 1) % CRAFTING_TIPS.length);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}>
        {/* Header & Quick Stats */}
        <View style={styles.headerRow}>
          <View>
            <Text variant="labelLarge" style={styles.greeting}>
              Welcome back, {displayName}
            </Text>
            <Text variant="headlineSmall" style={styles.header}>
              Crafting Dashboard
            </Text>
          </View>
          <Card
            style={styles.statBadge}
            onPress={() => navigation.navigate('Saved')}>
            <Card.Content style={styles.statBadgeContent}>
              <Icon name="bookmark-check" size={20} color="#4CAF50" />
              <Text variant="labelLarge" style={styles.statText}>
                {savedCount} Saved
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search blocks & recipes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchbar}
        />

        {/* Quick Craft Chips */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Popular Recipes
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipRow}>
          {QUICK_SEARCHES.map(item => (
            <Chip
              key={item}
              icon="hammer-wrench"
              style={styles.chip}
              textStyle={styles.chipText}
              onPress={() =>
                navigation.navigate('Catalog', {
                  filter: null,
                  initialSearch: item,
                })
              }>
              {item}
            </Chip>
          ))}
        </ScrollView>

        {/* Categories Grid */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Categories
        </Text>
        <View style={styles.grid}>
          {CATEGORIES.map(cat => (
            <Card
              key={cat.label}
              style={styles.catCard}
              onPress={() =>
                navigation.navigate('Catalog', {
                  filter: cat.filter,
                  initialSearch: '',
                })
              }>
              <Card.Content style={styles.catContent}>
                <Icon name={cat.icon} size={30} color={cat.color} />
                <Text variant="labelMedium" style={styles.catText}>
                  {cat.label}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Featured Block */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Featured Block
        </Text>
        <Card style={styles.featuredCard}>
          <Card.Title
            title="Crafting Table"
            subtitle="Essential 3x3 Crafting Station"
            left={props => (
              <Icon {...props} name="grid" size={28} color="#4CAF50" />
            )}
          />
          <Card.Content>
            <Text variant="bodyMedium">
              Hardness: 2.5 | Stack Size: 64 | Crafted using 4 Wooden Planks in
              a 2x2 grid.
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              buttonColor="#2E7D32"
              onPress={() =>
                navigation.navigate('Catalog', {
                  filter: 'craftable',
                  initialSearch: '',
                })
              }>
              Explore All Recipes
            </Button>
          </Card.Actions>
        </Card>

        {/* Pro Crafting Tip */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Survival Tip
        </Text>
        <Card style={styles.tipCard}>
          <Card.Content>
            <View style={styles.tipHeader}>
              <Icon name="lightbulb-on-outline" size={22} color="#FFD54F" />
              <Text variant="titleSmall" style={styles.tipTitle}>
                Did You Know?
              </Text>
            </View>
            <Text variant="bodyMedium" style={styles.tipBody}>
              {CRAFTING_TIPS[tipIndex]}
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button textColor="#81C784" onPress={nextTip}>
              Next Tip
            </Button>
          </Card.Actions>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1E1E1E' },
  container: { flex: 1, paddingHorizontal: 16 },
  scrollContent: { paddingBottom: 28 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  greeting: { color: '#81C784' },
  header: { color: '#FFFFFF', fontWeight: 'bold' },
  statBadge: { backgroundColor: '#2B2B2B', borderRadius: 12 },
  statBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },
  statText: { color: '#FFFFFF' },
  searchbar: { marginBottom: 16 },
  sectionTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 6,
  },
  chipRow: { marginBottom: 14 },
  chip: { marginRight: 8, backgroundColor: '#2C2C2C' },
  chipText: { color: '#FFFFFF' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  catCard: {
    width: '31.5%',
    marginBottom: 10,
    backgroundColor: '#2A252E',
  },
  catContent: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  catText: {
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  featuredCard: { marginBottom: 14 },
  tipCard: { backgroundColor: '#263238' },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tipTitle: { color: '#FFD54F', fontWeight: 'bold' },
  tipBody: { color: '#ECEFF1', lineHeight: 20 },
});
