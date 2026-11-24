import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import {
  Text,
  Card,
  Button,
  IconButton,
  SegmentedButtons,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { saveRecipeToFirestore } from '../config/firebase';

const SMELTING_GUIDES = {
  stone: { input: 'Cobblestone', fuel: 'Coal / Lava / Planks', xp: '0.1 XP' },
  glass: { input: 'Sand or Red Sand', fuel: 'Coal / Lava / Planks', xp: '0.1 XP' },
  iron_ingot: { input: 'Raw Iron / Iron Ore', fuel: 'Coal / Blaze Rod', xp: '0.7 XP' },
  gold_ingot: { input: 'Raw Gold / Gold Ore', fuel: 'Coal / Blaze Rod', xp: '1.0 XP' },
  brick: { input: 'Clay Ball', fuel: 'Coal / Planks', xp: '0.3 XP' },
  charcoal: { input: 'Any Wood Log', fuel: 'Wooden Planks', xp: '0.15 XP' },
  smooth_stone: { input: 'Regular Stone', fuel: 'Coal / Lava', xp: '0.1 XP' },
};

const BREWING_BASICS = [
  {
    potion: 'Awkward Potion (Base)',
    ingredient: 'Nether Wart + Water Bottle',
    effect: 'Required base for almost all functional potions',
  },
  {
    potion: 'Potion of Healing',
    ingredient: 'Glistering Melon Slice + Awkward Potion',
    effect: 'Restores 4 Hearts instantly (8 with Glowstone Dust)',
  },
  {
    potion: 'Potion of Fire Resistance',
    ingredient: 'Magma Cream + Awkward Potion',
    effect: 'Complete immunity to fire and lava for 3:00 (8:00 with Redstone)',
  },
  {
    potion: 'Potion of Swiftness',
    ingredient: 'Sugar + Awkward Potion',
    effect: 'Increases movement speed by 20% for 3:00',
  },
];

export default function DetailScreen({ route }) {
  const {
    block,
    gridItems = Array(9).fill(null),
    outputCount = 1,
  } = route.params;

  const [tab, setTab] = useState('crafting');
  const [craftBatches, setCraftBatches] = useState(1);
  const [saving, setSaving] = useState(false);

  // Calculate total raw materials needed for `craftBatches` crafts
  const materialTotals = useMemo(() => {
    const counts = {};
    gridItems.forEach(item => {
      if (item) {
        counts[item] = (counts[item] || 0) + craftBatches;
      }
    });
    return Object.entries(counts);
  }, [gridItems, craftBatches]);

  const totalYield = craftBatches * outputCount;
  const blockSlug = block?.displayName?.toLowerCase().replace(/\s+/g, '_');
  const specificSmelt = SMELTING_GUIDES[blockSlug];

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveRecipeToFirestore(block);
      Alert.alert(
        'Saved!',
        `${block.displayName} added to your Firestore bookmarks.`,
      );
    } catch (error) {
      Alert.alert('Notice', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}>
      <Card style={styles.card}>
        <Card.Title
          title={block.displayName}
          subtitle={`Hardness: ${block.hardness} | Stack Size: ${block.stackSize} | Diggable: ${
            block.diggable ? 'Yes' : 'No'
          }`}
        />

        <Card.Content>
          {/* Toggle between Crafting Table and Smelting / Brewing */}
          <SegmentedButtons
            value={tab}
            onValueChange={setTab}
            style={styles.segmented}
            buttons={[
              { value: 'crafting', label: 'Crafting Table', icon: 'grid' },
              { value: 'stations', label: 'Smelting & Brewing', icon: 'fire' },
            ]}
          />

          {tab === 'crafting' ? (
            <>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                3x3 Crafting Grid & Output
              </Text>

              {/* 3x3 Grid + Arrow + Output Slot with Yield Badge */}
              <View style={styles.craftingRow}>
                <View style={styles.grid}>
                  {gridItems.map((slot, index) => (
                    <View key={index} style={styles.slot}>
                      <Text numberOfLines={2} style={styles.slotText}>
                        {slot ? slot : ''}
                      </Text>
                    </View>
                  ))}
                </View>

                <Icon
                  name="arrow-right-bold"
                  size={28}
                  color="#4CAF50"
                  style={styles.arrow}
                />

                {/* Output Result Slot */}
                <View style={styles.outputSlot}>
                  <Text numberOfLines={2} style={styles.outputName}>
                    {block.displayName}
                  </Text>
                  <View style={styles.yieldBadge}>
                    <Text style={styles.yieldText}>{outputCount}x</Text>
                  </View>
                </View>
              </View>

              <Divider style={styles.divider} />

              {/* Raw Material / Build Calculator */}
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Raw Material Calculator
              </Text>
              <View style={styles.stepperRow}>
                <IconButton
                  icon="minus-circle"
                  iconColor="#EF5350"
                  size={28}
                  onPress={() => setCraftBatches(prev => Math.max(1, prev - 1))}
                />
                <View style={styles.batchCenter}>
                  <Text variant="titleMedium" style={styles.batchText}>
                    {craftBatches} {craftBatches === 1 ? 'Craft' : 'Crafts'}
                  </Text>
                  <Text variant="bodySmall" style={styles.yieldSub}>
                    Produces {totalYield} {block.displayName}
                  </Text>
                </View>
                <IconButton
                  icon="plus-circle"
                  iconColor="#4CAF50"
                  size={28}
                  onPress={() => setCraftBatches(prev => prev + 1)}
                />
                <Button
                  mode="outlined"
                  compact
                  onPress={() => setCraftBatches(prev => prev + 16)}>
                  +16
                </Button>
                {craftBatches > 1 && (
                  <Button
                    compact
                    textColor="#AAAAAA"
                    onPress={() => setCraftBatches(1)}>
                    Reset
                  </Button>
                )}
              </View>

              {materialTotals.length > 0 ? (
                <View style={styles.materialBox}>
                  {materialTotals.map(([name, qty]) => {
                    const stacks = Math.floor(qty / 64);
                    const rem = qty % 64;
                    const stackLabel =
                      stacks > 0
                        ? ` (${stacks} stack${stacks > 1 ? 's' : ''}${
                            rem > 0 ? ` + ${rem}` : ''
                          })`
                        : '';
                    return (
                      <View key={name} style={styles.materialRow}>
                        <Text style={styles.materialName}>• {name}</Text>
                        <Text style={styles.materialQty}>
                          {qty}x{stackLabel}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.noRecipeText}>
                  No Crafting Table ingredients—this block is gathered naturally
                  or smelted in a Furnace.
                </Text>
              )}
            </>
          ) : (
            <>
              {/* Smelting Section */}
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Furnace Smelting Guide
              </Text>
              <View style={styles.stationBox}>
                {specificSmelt ? (
                  <>
                    <Text style={styles.stationHighlight}>
                      Smelt {specificSmelt.input} ➔ {block.displayName}
                    </Text>
                    <Text style={styles.stationDetail}>
                      Fuel: {specificSmelt.fuel} | Reward: {specificSmelt.xp}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.stationDetail}>
                    {block.displayName} is not created by direct smelting.
                    Common Furnace recipes: Cobblestone ➔ Stone, Sand ➔ Glass,
                    Raw Iron ➔ Iron Ingot, Logs ➔ Charcoal.
                  </Text>
                )}
              </View>

              {/* Brewing Section */}
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Brewing Stand Essentials
              </Text>
              {BREWING_BASICS.map(item => (
                <View key={item.potion} style={styles.potionCard}>
                  <Text style={styles.potionTitle}>{item.potion}</Text>
                  <Text style={styles.potionIng}>
                    Formula: {item.ingredient}
                  </Text>
                  <Text style={styles.potionEffect}>{item.effect}</Text>
                </View>
              ))}
            </>
          )}
        </Card.Content>

        <Card.Actions style={styles.actions}>
          <Button
            mode="contained"
            icon="bookmark-plus"
            buttonColor="#2E7D32"
            loading={saving}
            disabled={saving}
            onPress={handleSave}>
            Save to Firestore
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E1E', padding: 14 },
  scrollContent: { paddingBottom: 30 },
  card: { padding: 4 },
  segmented: { marginVertical: 12 },
  sectionTitle: { marginTop: 10, marginBottom: 10, fontWeight: 'bold' },
  craftingRow: {
    flexDirection: 'row',
    alignItems: 'center',
justifyContent: 'space-between',
marginVertical: 6,
},
grid: {
width: 186,
height: 186,
flexDirection: 'row',
flexWrap: 'wrap',
backgroundColor: '#8B8B8B',
padding: 3,
borderRadius: 4,
},
slot: {
width: 56,
height: 56,
margin: 2,
backgroundColor: '#C6C6C6',
borderWidth: 2,
borderColor: '#373737',
justifyContent: 'center',
alignItems: 'center',
padding: 2,
},
slotText: { fontSize: 9.5, textAlign: 'center', color: '#000', fontWeight: '600' },
arrow: { marginHorizontal: 4 },
outputSlot: {
width: 74,
height: 74,
backgroundColor: '#C6C6C6',
borderWidth: 3,
borderColor: '#2E7D32',
borderRadius: 6,
justifyContent: 'center',
alignItems: 'center',
padding: 4,
},
outputName: {
fontSize: 10,
fontWeight: 'bold',
color: '#000',
textAlign: 'center',
},
yieldBadge: {
position: 'absolute',
bottom: 2,
right: 3,
backgroundColor: '#2E7D32',
borderRadius: 4,
paddingHorizontal: 5,
paddingVertical: 1,
},
yieldText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
divider: { marginVertical: 14 },
stepperRow: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
backgroundColor: '#252525',
borderRadius: 10,
paddingHorizontal: 4,
marginBottom: 10,
},
batchCenter: { alignItems: 'center' },
batchText: { color: '#FFF', fontWeight: 'bold' },
yieldSub: { color: '#81C784' },
materialBox: {
backgroundColor: '#252525',
borderRadius: 8,
padding: 12,
gap: 6,
},
materialRow: {
flexDirection: 'row',
justifyContent: 'space-between',
},
materialName: { color: '#ECEFF1', fontSize: 14 },
materialQty: { color: '#81C784', fontWeight: 'bold', fontSize: 14 },
noRecipeText: { color: '#AAAAAA', fontStyle: 'italic' },
stationBox: {
backgroundColor: '#263238',
padding: 12,
borderRadius: 8,
marginBottom: 8,
},
stationHighlight: { color: '#FFD54F', fontWeight: 'bold', marginBottom: 4 },
stationDetail: { color: '#ECEFF1', lineHeight: 20 },
potionCard: {
backgroundColor: '#252525',
padding: 10,
borderRadius: 8,
marginBottom: 8,
},
potionTitle: { color: '#CE93D8', fontWeight: 'bold' },
potionIng: { color: '#FFFFFF', fontSize: 13, marginTop: 2 },
potionEffect: { color: '#B0BEC5', fontSize: 12, marginTop: 2 },
actions: { justifyContent: 'flex-end', marginTop: 8 },
});