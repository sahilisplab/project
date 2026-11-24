import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import {
  Card,
  Text,
  ActivityIndicator,
  Searchbar,
  Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  fetchMinecraftBlocks,
  fetchMinecraftRecipes,
  fetchMinecraftItems,
} from '../services/minecraftApi';

const CATEGORY_KEYWORDS = {
  stone: ['stone', 'cobblestone', 'brick', 'dirt', 'sand', 'obsidian', 'concrete', 'wool', 'glass'],
  oak: ['oak', 'wood', 'plank', 'log', 'stick', 'crafting', 'fence', 'door', 'slab', 'stairs'],
  redstone: ['redstone', 'piston', 'tnt', 'lever', 'button', 'repeater', 'observer', 'hopper', 'dispenser'],
  ore: ['ore', 'diamond', 'iron', 'gold', 'emerald', 'coal', 'copper', 'lapis', 'quartz', 'netherite'],
  torch: ['torch', 'lantern', 'glowstone', 'fire', 'furnace', 'campfire', 'lava', 'lamp'],
  chest: ['chest', 'barrel', 'shulker', 'ender', 'box', 'hopper'],
};

export default function CatalogScreen({ navigation, route }) {
  const [blocks, setBlocks] = useState([]);
  const [recipes, setRecipes] = useState({});
  const [itemMap, setItemMap] = useState({});
  const [nameToRecipeId, setNameToRecipeId] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    if (route.params?.filter) {
      setActiveCategory(route.params.filter);
      setSearch('');
    } else if (route.params?.initialSearch !== undefined) {
      setActiveCategory(null);
      setSearch(route.params.initialSearch);
    } else {
      setActiveCategory(null);
      setSearch('');
    }
  }, [route.params]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setErrorMsg('');
        const [blocksData, recipesData, itemsData] = await Promise.all([
          fetchMinecraftBlocks(),
          fetchMinecraftRecipes(),
          fetchMinecraftItems(),
        ]);

        const safeBlocks = Array.isArray(blocksData) ? blocksData : [];
        const safeRecipes = recipesData || {};
        const safeItems = itemsData || {};

        const reverseItemMap = {};
        Object.entries(safeItems).forEach(([idStr, displayName]) => {
          if (displayName && safeRecipes[idStr]) {
            reverseItemMap[displayName.toLowerCase()] = idStr;
          }
        });

        const blockNames = new Set(
          safeBlocks.map(b => b.displayName?.toLowerCase()),
        );
        const extraCraftableItems = Object.keys(safeRecipes)
          .filter(
            idStr =>
              safeItems[idStr] &&
              !blockNames.has(safeItems[idStr].toLowerCase()),
          )
          .map(idStr => ({
            id: Number(idStr),
            displayName: safeItems[idStr],
            hardness: 'N/A (Item)',
            stackSize: 64,
            diggable: false,
          }));

        setBlocks([...safeBlocks, ...extraCraftableItems]);
        setRecipes(safeRecipes);
        setItemMap(safeItems);
        setNameToRecipeId(reverseItemMap);
      } catch (error) {
        console.error('Failed to load Minecraft API data:', error);
        setErrorMsg(error.message || 'Failed to load blocks data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getRecipesForBlock = block => {
    const byNameId = nameToRecipeId[block?.displayName?.toLowerCase()];
    if (byNameId && recipes[byNameId]) return recipes[byNameId];
    if (recipes[block.id]) return recipes[block.id];
    return null;
  };

  const buildRecipeData = block => {
    const grid = Array(9).fill(null);
    const blockRecipes = getRecipesForBlock(block);
    if (!Array.isArray(blockRecipes) || blockRecipes.length === 0) {
      return { gridItems: grid, outputCount: 1 };
    }

    const firstRecipe = blockRecipes.at(0);
    const outputCount = firstRecipe?.result?.count || 1;

    if (firstRecipe?.inShape) {
      firstRecipe.inShape.forEach((row, rIdx) => {
        if (Array.isArray(row)) {
          row.forEach((cell, cIdx) => {
            const itemId = Array.isArray(cell) ? cell.at(0) : cell;
            if (itemId && rIdx < 3 && cIdx < 3) {
              grid[rIdx * 3 + cIdx] = itemMap[itemId] || `#${itemId}`;
            }
          });
        }
      });
    } else if (Array.isArray(firstRecipe?.ingredients)) {
      firstRecipe.ingredients.forEach((cell, idx) => {
        const itemId = Array.isArray(cell) ? cell.at(0) : cell;
        if (itemId && idx < 9) {
          grid[idx] = itemMap[itemId] || `#${itemId}`;
        }
      });
    }
    return { gridItems: grid, outputCount };
  };

  const filteredBlocks = blocks.filter(b => {
    const name = b?.displayName?.toLowerCase() || '';

    if (activeCategory === 'craftable') {
      const hasRecipe = Array.isArray(getRecipesForBlock(b));
      if (!hasRecipe) return false;
    } else if (activeCategory && CATEGORY_KEYWORDS[activeCategory]) {
      const keywords = CATEGORY_KEYWORDS[activeCategory];
      const matchesCat = keywords.some(kw => name.includes(kw));
      if (!matchesCat) return false;
    }

    if (search.trim() !== '') {
      return name.includes(search.toLowerCase());
    }

    return true;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Minecraft recipes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Searchbar
        placeholder="Filter blocks & recipes..."
        value={search}
        onChangeText={text => {
          setSearch(text);
          if (text && activeCategory !== 'craftable') {
            setActiveCategory(null);
          }
        }}
        style={styles.search}
      />

      {activeCategory && (
        <View style={styles.filterRow}>
          <Chip
            icon={activeCategory === 'craftable' ? 'grid' : 'filter-variant'}
            onClose={() => setActiveCategory(null)}
            style={styles.filterChip}
            textStyle={styles.filterChipText}>
            {activeCategory === 'craftable'
              ? 'CRAFTING TABLE RECIPES'
              : `CATEGORY: ${activeCategory.toUpperCase()}`}
          </Chip>
        </View>
      )}

      {errorMsg ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Error: {errorMsg}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBlocks}
          keyExtractor={item => `${item.id}-${item.displayName}`}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No craftable recipes found.</Text>
          }
          renderItem={({ item }) => {
            const isCraftable = Array.isArray(getRecipesForBlock(item));
            return (
              <Card
                style={styles.card}
                onPress={() => {
                  const { gridItems, outputCount } = buildRecipeData(item);
                  navigation.navigate('Detail', {
                    block: item,
                    gridItems,
                    outputCount,
                  });
                }}>
                <Card.Title
                  title={item.displayName}
                  subtitle={`Hardness: ${item.hardness} | Stack: ${item.stackSize}${
                    isCraftable ? ' | Craftable' : ''
                  }`}
                />
              </Card>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E1E', paddingHorizontal: 12 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  loadingText: { color: '#FFFFFF', marginTop: 12 },
  errorText: { color: '#EF5350', textAlign: 'center', padding: 16 },
  emptyText: { color: '#AAAAAA', textAlign: 'center', marginTop: 24 },
  search: { marginTop: 8, marginBottom: 10 },
  filterRow: { flexDirection: 'row', marginBottom: 10 },
  filterChip: { backgroundColor: '#2E7D32' },
  filterChipText: { color: '#FFFFFF' },
  card: { marginBottom: 10 },
});
