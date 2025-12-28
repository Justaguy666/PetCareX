import appointmentRepo from './appointment.repo.js';

class AppointmentService {
  listAppointments = async (doctor, date, ownerId) => {
    return appointmentRepo.listAppointments(doctor, date, ownerId);
  };

  createAppointment = async (appointmentData) => {
    const result = await appointmentRepo.insertAppointment(appointmentData);
    return result;
  };

  updateAppointment = async (id, updateData) => {
    const result = await appointmentRepo.updateAppointment(id, updateData);
    return result;
  };

  cancelAppointment = async (id) => {
    // Update status to 'Đã hủy' (Cancelled)
    await appointmentRepo.updateAppointmentStatus(id, 'Đã hủy');
  };
}

export default new AppointmentService();
