import vaccinePackageService from './vaccine-package.service.js';

const vaccinePackageController = {
  getAllVaccinePackages: async (req, res, next) => {
    try {
      const packages = await vaccinePackageService.getAllVaccinePackages();
      res.status(200).json(packages);
    } catch (error) {
      next(error);
    }
  },
};

export default vaccinePackageController;
