import appointmentService from './appointment.service.js';

class AppointmentController {
  listAppointments = async (req, res) => {
    const { doctor, date } = req.query;
    const appointments = await appointmentService.listAppointments(doctor, date);
    res.status(200).json({
      data: appointments
    });
  };
}

export default new AppointmentController();
