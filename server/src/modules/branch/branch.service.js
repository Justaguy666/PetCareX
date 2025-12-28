import branchRepo from './branch.repo.js';

class BranchService {
    getBranches = async () => {
        const result = await branchRepo.fetchAllBranches();

        return result;
    };

    getBranchById = async (id) => {
        const result = await branchRepo.fetchBranchById(id);

        return result;
    };

    createBranch = async (branchData) => {
        const result = await branchRepo.createBranch(branchData);

        return result;
    };

    updateBranch = async (id, branchData) => {
        const result = await branchRepo.updateBranch(id, branchData);

        return result;
    };

    deleteBranch = async (id) => {
        await branchRepo.deleteBranch(id);
    };
};

export default new BranchService();