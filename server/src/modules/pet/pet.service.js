import petRepo from './pet.repo.js';

class PetService {
  getPets = async (options = {}) => {
    const { rows, total } = await petRepo.fetchPets(options);
    return {
      data: rows,
      meta: {
        total,
        page: options.page || 1,
        pageSize: options.pageSize || 10,
        totalPages: Math.ceil(total / (options.pageSize || 10))
      }
    };
  };

  getPetById = async (petId) => {
    const result = await petRepo.fetchPetById(petId);
    return result;
  };
};

export default new PetService();