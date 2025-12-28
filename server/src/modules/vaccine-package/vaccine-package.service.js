import vaccinePackageRepo from './vaccine-package.repo.js';

const vaccinePackageService = {
  getAllVaccinePackages: async () => {
    return await vaccinePackageRepo.getAllVaccinePackages();
  },
};

export default vaccinePackageService;
