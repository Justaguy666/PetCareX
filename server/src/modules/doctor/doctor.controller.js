import doctorService from './doctor.service.js';

class DoctorController {
    getAssignedPets = async (req, res, next) => {
        try {
            const accountId = req.account.id;
            const pets = await doctorService.getAssignedPets(accountId);
            res.json({ data: pets });
        } catch (error) {
            next(error);
        }
    };

    getTodayAppointments = async (req, res, next) => {
        try {
            const accountId = req.account.id;
            const appointments = await doctorService.getTodayAppointments(accountId);
            res.json({ data: appointments });
        } catch (error) {
            next(error);
        }
    };

    createExamRecord = async (req, res, next) => {
        try {
            const { pet_id, diagnosis, conclusion, appointment_date, prescriptions } = req.body;
            const accountId = req.account.id; // From authMiddleware

            const result = await doctorService.createExamRecordWithPrescriptions({
                pet_id,
                diagnosis,
                conclusion,
                appointment_date
            }, accountId, prescriptions);

            res.status(201).json({
                message: 'Medical examination record created successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    getMedicines = async (req, res, next) => {
        try {
            const medicines = await doctorService.getMedicines();
            res.json({ data: medicines });
        } catch (error) {
            next(error);
        }
    };

    getVaccineInventory = async (req, res, next) => {
        try {
            const accountId = req.account.id;
            const vaccines = await doctorService.getVaccineInventory(accountId);
            res.json({ data: vaccines });
        } catch (error) {
            next(error);
        }
    };

    getPackageInventory = async (req, res, next) => {
        try {
            const accountId = req.account.id;
            const packages = await doctorService.getPackageInventory(accountId);
            res.json({ data: packages });
        } catch (error) {
            next(error);
        }
    };

    createSingleInjection = async (req, res, next) => {
        try {
            const { pet_id, vaccine_id, dosage, notes } = req.body;
            const accountId = req.account.id;

            const result = await doctorService.createSingleInjection({
                pet_id,
                vaccine_id,
                dosage,
                notes
            }, accountId);

            res.status(201).json({
                message: 'Single injection recorded successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    createPackageInjection = async (req, res, next) => {
        try {
            const { pet_id, package_id, cycle_stage, notes } = req.body;
            const accountId = req.account.id;

            const result = await doctorService.createPackageInjection({
                pet_id,
                package_id,
                cycle_stage,
                notes
            }, accountId);

            res.status(201).json({
                message: 'Package injection recorded successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    confirmAppointment = async (req, res, next) => {
        try {
            const { id } = req.params;
            const accountId = req.account.id;
            const result = await doctorService.confirmAppointment(id, accountId);
            res.json({
                message: 'Appointment confirmed successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    cancelAppointment = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const accountId = req.account.id;
            const result = await doctorService.cancelAppointment(id, accountId, reason);
            res.json({
                message: 'Appointment cancelled successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    getPendingCount = async (req, res, next) => {
        try {
            const accountId = req.account.id;
            const count = await doctorService.getPendingAppointmentsCount(accountId);
            res.json({ data: { count } });
        } catch (error) {
            next(error);
        }
    };

    getMedicalRecordsByPet = async (req, res, next) => {
        try {
            const { petId } = req.params;
            const records = await doctorService.getMedicalRecordsByPet(petId);
            res.json({ data: records });
        } catch (error) {
            next(error);
        }
    };

    getPetsByAppointmentType = async (req, res, next) => {
        try {
            const { serviceType } = req.params;
            const accountId = req.account.id;
            const pets = await doctorService.getPetsByAppointmentType(accountId, serviceType);
            res.json({ data: pets });
        } catch (error) {
            next(error);
        }
    };

    getPetFullHistory = async (req, res, next) => {
        try {
            const { petId } = req.params;
            const history = await doctorService.getPetFullHistory(petId);
            res.json({ data: history });
        } catch (error) {
            next(error);
        }
    };
}

export default new DoctorController();
