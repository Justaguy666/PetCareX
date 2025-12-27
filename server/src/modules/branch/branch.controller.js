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
};

export default new BranchController();