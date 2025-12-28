import inventoryRepo from './inventory.repo.js';

// Helper to format inventory items
const formatInventoryItem = (item) => ({
  itemId: item.item_id,
  quantity: item.quantity,
});

const inventoryService = {
  getAllBranchInventory: async () => {
    const [productInventory, vaccineInventory, packageInventory] = await Promise.all([
      inventoryRepo.getProductInventory(),
      inventoryRepo.getVaccineInventory(),
      inventoryRepo.getPackageInventory(),
    ]);

    const inventoryByBranch = {};

    const processInventory = (inventory, type) => {
      inventory.forEach(item => {
        const branchId = item.branch_id;
        if (!inventoryByBranch[branchId]) {
          inventoryByBranch[branchId] = {
            branchId,
            products: [],
            vaccines: [],
            vaccinePackages: [],
            lastUpdated: item.updated_at, // Initialize with the first item's update time
          };
        }
        // Use the latest update time for the branch
        if (new Date(item.updated_at) > new Date(inventoryByBranch[branchId].lastUpdated)) {
            inventoryByBranch[branchId].lastUpdated = item.updated_at;
        }
        inventoryByBranch[branchId][type].push(formatInventoryItem(item));
      });
    };

    processInventory(productInventory, 'products');
    processInventory(vaccineInventory, 'vaccines');
    processInventory(packageInventory, 'vaccinePackages');

    return Object.values(inventoryByBranch);
  },
};

export default inventoryService;
