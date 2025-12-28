import itemRepo from './item.repo.js';

const itemService = {
  getAllItems: async () => {
    return await itemRepo.getAllItems();
  },
};

export default itemService;
