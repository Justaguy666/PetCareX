import appointmentService from './appointment.service.js';

class AppointmentController {
  listAppointments = async (req, res) => {
    const { doctor, date } = req.query;
    // Get owner_id from authenticated user if available
    const ownerId = req.account?.user_id || null;
    const appointments = await appointmentService.listAppointments(doctor, date, ownerId);
    res.status(200).json({
      data: appointments
    });
  };

  createAppointment = async (req, res) => {
    const appointmentData = req.body;
    const result = await appointmentService.createAppointment(appointmentData);
    return res.status(201).json({ data: result });
  };

  updateAppointment = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const result = await appointmentService.updateAppointment(id, updateData);
    return res.status(200).json({ data: result });
  };

  cancelAppointment = async (req, res) => {
    const { id } = req.params;
    await appointmentService.cancelAppointment(id);
    return res.status(200).json({ success: true, message: 'Appointment cancelled' });
  };
}

export default new AppointmentController();
