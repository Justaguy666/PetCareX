import salesRepo from './sales.repo.js';

class SalesController {
  getMyBranch = async (req, res) => {
    const accountId = req.account.id;
    const branch = await salesRepo.getSalesBranch(accountId);
    return res.json({ data: branch });
  };

  getBranchInventory = async (req, res) => {
    const accountId = req.account.id;
    const branch = await salesRepo.getSalesBranch(accountId);
    if (!branch) {
      return res.status(400).json({ error: 'Branch not found for sales staff' });
    }
    const inventory = await salesRepo.getBranchInventory(branch.id);
    return res.json({ data: inventory });
  };

  updateStock = async (req, res) => {
    const accountId = req.account.id;
    const { productId, quantity } = req.body;
    const branch = await salesRepo.getSalesBranch(accountId);
    if (!branch) {
      return res.status(400).json({ error: 'Branch not found' });
    }
    const result = await salesRepo.updateStock(branch.id, productId, quantity);
    return res.json({ data: result });
  };

  adjustStock = async (req, res) => {
    const accountId = req.account.id;
    const { productId, adjustment } = req.body;
    const branch = await salesRepo.getSalesBranch(accountId);
    if (!branch) {
      return res.status(400).json({ error: 'Branch not found' });
    }
    const result = await salesRepo.adjustStock(branch.id, productId, adjustment);
    return res.json({ data: result });
  };

  getTodaySales = async (req, res) => {
    const accountId = req.account.id;
    const branch = await salesRepo.getSalesBranch(accountId);
    if (!branch) {
      return res.status(400).json({ error: 'Branch not found' });
    }
    const sales = await salesRepo.getTodaySales(branch.id);
    return res.json({ data: sales });
  };

  getSalesStats = async (req, res) => {
    const accountId = req.account.id;
    const branch = await salesRepo.getSalesBranch(accountId);
    if (!branch) {
      return res.status(400).json({ error: 'Branch not found' });
    }
    const stats = await salesRepo.getSalesStats(branch.id);
    return res.json({ data: stats });
  };

  getPendingServiceInvoices = async (req, res) => {
    const accountId = req.account.id;
    const branch = await salesRepo.getSalesBranch(accountId);
    if (!branch) {
      return res.status(400).json({ error: 'Branch not found' });
    }
    const invoices = await salesRepo.getPendingServiceInvoices(branch.id);
    return res.json({ data: invoices });
  };
}

export default new SalesController();
