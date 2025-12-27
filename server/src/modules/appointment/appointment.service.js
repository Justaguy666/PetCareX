import appointmentRepo from './appointment.repo.js';

class AppointmentService {
  listAppointments = async (doctor, date, time) => {
    return appointmentRepo.listAppointments(doctor, date, time);
  };
}

export default new AppointmentService();
