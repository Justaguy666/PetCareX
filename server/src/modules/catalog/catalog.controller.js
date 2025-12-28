import catalogRepo from "./catalog.repo.js";

class CatalogController {
    async getDoctors(req, res) {
        try {
            const { branchId } = req.query;
            let doctors;
            if (branchId) {
                doctors = await catalogRepo.listDoctorsByBranch(branchId);
            } else {
                doctors = await catalogRepo.listDoctors();
            }
            res.status(200).json({ data: doctors });
        } catch (error) {
            console.error('getDoctors error:', error);
            res.status(500).json({ message: 'Failed to fetch doctors list' });
        }
    }

    async getVaccines(req, res) {
        try {
            const vaccines = await catalogRepo.listVaccines();
            res.status(200).json({ data: vaccines });
        } catch (error) {
            console.error('getVaccines error:', error);
            res.status(500).json({ message: 'Failed to fetch vaccines list' });
        }
    }

    async getVaccinePackages(req, res) {
        try {
            const packages = await catalogRepo.listVaccinePackages();
            res.status(200).json({ data: packages });
        } catch (error) {
            console.error('getVaccinePackages error:', error);
            res.status(500).json({ message: 'Failed to fetch vaccine packages list' });
        }
    }
}

export default new CatalogController();
