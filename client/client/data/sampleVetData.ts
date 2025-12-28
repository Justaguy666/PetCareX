export const sampleVetProfile = {
    staffId: 'VET-1001',
    fullName: 'Dr. Emily Carter',
    dob: '1985-07-18',
    gender: 'Female',
    startDate: '2016-03-01',
    position: 'Veterinarian',
    branch: 'Hanoi Central Clinic',
    baseSalary: 12000000,
    transferHistory: [
        { from: 'Branch A', to: 'Hanoi Central Clinic', date: '2019-01-12', reason: 'Promotion' },
        { from: 'Branch C', to: 'Branch A', date: '2017-04-02', reason: 'Coverage rotation' },
    ],
};

export const sampleAppointments = [
    { id: 'apt-101', time: '09:30', pet: 'Bella', owner: 'John Doe', symptoms: 'Limping on back leg', status: 'Scheduled' },
    { id: 'apt-102', time: '10:15', pet: 'Max', owner: 'Mary Smith', symptoms: 'Coughing and sneezing', status: 'Checked-in' },
    { id: 'apt-103', time: '11:00', pet: 'Luna', owner: 'Alex Green', symptoms: 'Loss of appetite', status: 'In Progress' },
    { id: 'apt-104', time: '14:00', pet: 'Rocky', owner: 'Daniel Park', symptoms: 'Post-op wound check', status: 'Scheduled' },
    { id: 'apt-105', time: '15:30', pet: 'Milo', owner: 'Anna Kim', symptoms: 'Patchy fur / itching', status: 'Scheduled' },
];

export const sampleRecords = [
    {
        id: 'rec-201',
        pet: 'Bella',
        owner: 'John Doe',
        date: '2025-11-01',
        symptoms: 'Limping on back leg',
        diagnosis: 'Suspicion of soft tissue sprain',
        prescription: [
            { name: 'Carprofen', dose: '2 mg/kg', qty: 10 },
            { name: 'Wound balm', dose: 'Apply topically', qty: 1 },
        ],
        followUp: '2025-11-15',
        vet: 'Dr. Emily Carter',
    },
    {
        id: 'rec-202',
        pet: 'Max',
        owner: 'Mary Smith',
        date: '2025-10-22',
        symptoms: 'Coughing',
        diagnosis: 'Suspected upper respiratory infection',
        prescription: [
            { name: 'Amoxicillin', dose: '10 mg/kg', qty: 7 },
        ],
        followUp: '2025-10-30',
        vet: 'Dr. Emily Carter',
    },
    {
        id: 'rec-203',
        pet: 'Luna',
        owner: 'Alex Green',
        date: '2025-11-05',
        symptoms: 'Skin rash',
        diagnosis: '',
        prescription: [],
        followUp: '',
        vet: 'Dr. Emily Carter',
    },
];

export const sampleAssignedPets = [
    { id: 'pet-501', name: 'Bella', species: 'Dog', owner: 'John Doe', lastVisit: '2025-10-18', notes: 'Prefers calm handling' },
    { id: 'pet-502', name: 'Max', species: 'Cat', owner: 'Mary Smith', lastVisit: '2025-09-07', notes: 'Sensitive to injections' },
    { id: 'pet-503', name: 'Luna', species: 'Rabbit', owner: 'Alex Green', lastVisit: '2025-11-05', notes: 'Monitor diet' },
];

export const sampleNotifications = [
    { id: 'n-101', type: 'Appointment', text: "New booking for 14:00 — Bella", time: '2025-11-25T08:14:00Z', read: false },
    { id: 'n-102', type: 'Feedback', text: 'Feedback submitted for appointment rec-201', time: '2025-11-25T10:04:00Z', read: false },
    { id: 'n-103', type: 'System', text: 'Software update scheduled tonight', time: '2025-11-24T20:00:00Z', read: true },
];

export default {
    sampleVetProfile,
    sampleAppointments,
    sampleRecords,
    sampleAssignedPets,
    sampleNotifications,
};
