import branchService from './branch.service.js';

class BranchController {
    getBranches = async (req, res) => {
        const result = await branchService.getBranches();

        const metadata = {
          total: result.length,
        };
        
        return res.status(200).json({ 
          data: result,
          metadata: metadata,
        });
    };

    getBranchById = async (req, res) => {
        const { id } = req.params;

        const result = await branchService.getBranchById(id);
        
        return res.status(200).json({ data: result });
    };

    createBranch = async (req, res) => {
        const branchData = req.body;
        const result = await branchService.createBranch(branchData);

        return res.status(201).json({ data: result });
    };

    updateBranch = async (req, res) => {
        const { id } = req.params;
        const branchData = req.body;
        const result = await branchService.updateBranch(id, branchData);

        return res.status(200).json({ data: result });
    };

    deleteBranch = async (req, res) => {
        const { id } = req.params;
        await branchService.deleteBranch(id);

        return res.status(204).send();
    };
};

export default new BranchController();