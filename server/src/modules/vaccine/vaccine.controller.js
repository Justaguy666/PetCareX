import vaccineService from './vaccine.service.js';

const vaccineController = {
  getAllVaccines: async (req, res, next) => {
    try {
      const vaccines = await vaccineService.getAllVaccines();
      res.status(200).json(vaccines);
    } catch (error) {
      next(error);
    }
  },
};

export default vaccineController;
