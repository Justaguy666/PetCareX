import inventoryService from './inventory.service.js';

const inventoryController = {
  getAllBranchInventory: async (req, res, next) => {
    try {
      const inventory = await inventoryService.getAllBranchInventory();
      res.status(200).json(inventory);
    } catch (error) {
      next(error);
    }
  },
};

export default inventoryController;
