import receptionistRepo from './receptionist.repo.js';

class ReceptionistController {
  getTodayAppointments = async (req, res) => {
    const accountId = req.account.id;
    const branch = await receptionistRepo.getReceptionistBranch(accountId);
    if (!branch) {
      return res.status(400).json({ error: 'Branch not found for receptionist' });
    }
    const appointments = await receptionistRepo.getTodayAppointments(branch.id);
    return res.json({ data: appointments });
  };

  getBranchAppointments = async (req, res) => {
    const accountId = req.account.id;
    const { date } = req.query;
    const branch = await receptionistRepo.getReceptionistBranch(accountId);
    if (!branch) {
      return res.status(400).json({ error: 'Branch not found for receptionist' });
    }
    const appointments = await receptionistRepo.getBranchAppointments(branch.id, date);
    return res.json({ data: appointments });
  };

  checkinAppointment = async (req, res) => {
    const { id } = req.params;
    const result = await receptionistRepo.checkinAppointment(id);
    if (!result) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    return res.json({ data: result });
  };

  searchCustomers = async (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ data: [] });
    }
    const customers = await receptionistRepo.searchCustomers(q);
    return res.json({ data: customers });
  };

  getCustomerPets = async (req, res) => {
    const { customerId } = req.params;
    const pets = await receptionistRepo.getCustomerPets(customerId);
    return res.json({ data: pets });
  };

  getAvailableDoctors = async (req, res) => {
    const accountId = req.account.id;
    const branch = await receptionistRepo.getReceptionistBranch(accountId);
    if (!branch) {
      return res.status(400).json({ error: 'Branch not found' });
    }
    const doctors = await receptionistRepo.getAvailableDoctors(branch.id);
    return res.json({ data: doctors });
  };

  getMyBranch = async (req, res) => {
    const accountId = req.account.id;
    const branch = await receptionistRepo.getReceptionistBranch(accountId);
    return res.json({ data: branch });
  };
}

export default new ReceptionistController();
