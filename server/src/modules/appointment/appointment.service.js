import appointmentRepo from './appointment.repo.js';

class AppointmentService {
  listAppointments = async (doctor, date, time) => {
    return appointmentRepo.listAppointments(doctor, date, time);
  };

  createAppointment = async (appointmentData) => {
    const result = await appointmentRepo.insertAppointment(appointmentData);
    return result;
  };
}

export default new AppointmentService();
