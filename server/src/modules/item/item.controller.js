import itemService from './item.service.js';

const itemController = {
  getAllItems: async (req, res, next) => {
    try {
      const items = await itemService.getAllItems();
      res.status(200).json(items);
    } catch (error) {
      next(error);
    }
  },
};

export default itemController;
