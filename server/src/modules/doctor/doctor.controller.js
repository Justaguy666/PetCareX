import doctorService from './doctor.service.js';

class DoctorController {
    createExamRecord = async (req, res, next) => {
        try {
            const { pet_id, diagnosis, conclusion, appointment_date, weight, temperature, blood_pressure, symptoms } = req.body;
            const accountId = req.account.id; // From authMiddleware

            const result = await doctorService.createExamRecord({
                pet_id,
                diagnosis,
                conclusion,
                appointment_date,
                weight,
                temperature,
                blood_pressure,
                symptoms
            }, accountId);

            res.status(201).json({
                message: 'Medical examination record created successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };
}

export default new DoctorController();
