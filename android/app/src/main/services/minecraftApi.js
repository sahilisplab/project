const BASE_URL = 'https://githubusercontent.com';

export const fetchMinecraftBlocks = async () => {
  try {
    const response = await fetch(`${BASE_URL}/blocks.json`);
    const data = await response.json();
    return data.slice(0, 60); // Top 60 blocks for smooth performance
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return [];
  }
};

export const fetchMinecraftItems = async () => {
  try {
    const response = await fetch(`${BASE_URL}/items.json`);
    const data = await response.json();
    // Create a lookup map { id: displayName } for the 3x3 crafting grid
    const itemMap = {};
    data.forEach(item => {
      itemMap[item.id] = item.displayName;
    });
    return itemMap;
  } catch (error) {
    console.error('Error fetching items:', error);
    return {};
  }
};

export const fetchMinecraftRecipes = async () => {
  try {
    const response = await fetch(`${BASE_URL}/recipes.json`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return {};
  }
};
