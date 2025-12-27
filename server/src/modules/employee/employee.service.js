import employeeRepo from './employee.repo.js';

class EmployeeService {
    createAppointment = async (appointmentData) => {
        const result = await employeeRepo.insertAppointment(appointmentData);
        
        return result;
    };

    getPetById = async (petId) => {
        const result = await employeeRepo.fetchPetById(petId);
        
        return result;
    };
};

export default new EmployeeService();