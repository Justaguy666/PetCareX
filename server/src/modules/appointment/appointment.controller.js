import appointmentService from './appointment.service.js';

class AppointmentController {
  listAppointments = async (req, res) => {
    const { doctor, date } = req.query;
    const appointments = await appointmentService.listAppointments(doctor, date);
    res.status(200).json({
      data: appointments
    });
  };

  createAppointment = async (req, res) => {
    const appointmentData = req.body;
    const result = await appointmentService.createAppointment(appointmentData);
    return res.status(201).json({ data: result });
  };
}

export default new AppointmentController();
