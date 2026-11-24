const CDN_URL =
  'https://jsdelivr.net';

// Built-in offline fallback data in case the Android Emulator has no internet
const FALLBACK_BLOCKS = [
  { id: 1, name: 'stone', displayName: 'Stone', hardness: 1.5, stackSize: 64, diggable: true },
  { id: 4, name: 'cobblestone', displayName: 'Cobblestone', hardness: 2, stackSize: 64, diggable: true },
  { id: 5, name: 'oak_planks', displayName: 'Oak Planks', hardness: 2, stackSize: 64, diggable: true },
  { id: 17, name: 'oak_log', displayName: 'Oak Log', hardness: 2, stackSize: 64, diggable: true },
  { id: 58, name: 'crafting_table', displayName: 'Crafting Table', hardness: 2.5, stackSize: 64, diggable: true },
  { id: 61, name: 'furnace', displayName: 'Furnace', hardness: 3.5, stackSize: 64, diggable: true },
  { id: 50, name: 'torch', displayName: 'Torch', hardness: 0, stackSize: 64, diggable: true },
  { id: 54, name: 'chest', displayName: 'Chest', hardness: 2.5, stackSize: 64, diggable: true },
  { id: 331, name: 'redstone', displayName: 'Redstone Dust', hardness: 0, stackSize: 64, diggable: true },
  { id: 29, name: 'sticky_piston', displayName: 'Sticky Piston', hardness: 1.5, stackSize: 64, diggable: true },
  { id: 33, name: 'piston', displayName: 'Piston', hardness: 1.5, stackSize: 64, diggable: true },
  { id: 46, name: 'tnt', displayName: 'TNT', hardness: 0, stackSize: 64, diggable: true },
  { id: 49, name: 'obsidian', displayName: 'Obsidian', hardness: 50, stackSize: 64, diggable: true },
  { id: 56, name: 'diamond_ore', displayName: 'Diamond Ore', hardness: 3, stackSize: 64, diggable: true },
  { id: 15, name: 'iron_ore', displayName: 'Iron Ore', hardness: 3, stackSize: 64, diggable: true },
];

const FALLBACK_ITEMS = {
  1: 'Stone',
  4: 'Cobblestone',
  5: 'Oak Planks',
  17: 'Oak Log',
  58: 'Crafting Table',
  61: 'Furnace',
  263: 'Coal',
  280: 'Stick',
  331: 'Redstone',
  341: 'Slimeball',
};

const FALLBACK_RECIPES = {
  5: [{ ingredients: [17] }],
  58: [{ inShape: [[5, 5], [5, 5]] }],
  61: [{ inShape: [[4, 4, 4], [4, null, 4], [4, 4, 4]] }],
  50: [{ inShape: [[263], [280]] }],
  54: [{ inShape: [[5, 5, 5], [5, null, 5], [5, 5, 5]] }],
  29: [{ inShape: [[341], [33]] }],
};

export const fetchMinecraftBlocks = async () => {
  try {
    const response = await fetch(`${CDN_URL}/blocks.json`);
    if (!response.ok) throw new Error('Network error');
    return await response.json();
  } catch (err) {
    console.warn('Using offline fallback blocks:', err.message);
    return FALLBACK_BLOCKS;
  }
};

export const fetchMinecraftRecipes = async () => {
  try {
    const response = await fetch(`${CDN_URL}/recipes.json`);
    if (!response.ok) throw new Error('Network error');
    return await response.json();
  } catch (err) {
    console.warn('Using offline fallback recipes:', err.message);
    return FALLBACK_RECIPES;
  }
};

export const fetchMinecraftItems = async () => {
  try {
    const response = await fetch(`${CDN_URL}/items.json`);
    if (!response.ok) throw new Error('Network error');
    const itemsArray = await response.json();

    const itemMap = {};
    itemsArray.forEach(item => {
      itemMap[item.id] = item.displayName;
    });
    return itemMap;
  } catch (err) {
    console.warn('Using offline fallback items:', err.message);
    return FALLBACK_ITEMS;
  }
};
