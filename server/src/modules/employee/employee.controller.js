import employeeService from './employee.service.js';

class EmployeeController {
    createAppointment = async (req, res) => {
        const appointmentData = req.body;

        const result = await employeeService.createAppointment(appointmentData);
        
        return res.status(201).json({ data: result });
    };

    getPetById = async (req, res) => {
        const { petId } = req.params;

        const result = await employeeService.getPetById(petId);
        
        return res.status(200).json({ data: result });
    };
}

export default new EmployeeController();