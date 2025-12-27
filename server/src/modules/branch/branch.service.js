import branchRepo from './branch.repo.js';

class BranchService {
    getBranches = async () => {
        const result = await branchRepo.fetchAllBranches();

        return result;
    };

    getBranchById = async (id) => {
        const result = await branchRepo.fetchBranchById(id);

        return result;
    }
};

export default new BranchService();