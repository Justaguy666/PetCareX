import vaccineRepo from './vaccine.repo.js';

const vaccineService = {
  getAllVaccines: async () => {
    return await vaccineRepo.getAllVaccines();
  },
};

export default vaccineService;
