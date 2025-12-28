export const sampleReceptionProfile = {
    staffId: 'REC-1001',
    fullName: 'Alex Parker',
    dob: '1990-02-15',
    gender: 'Female',
    startDate: '2018-06-01',
    position: 'Receptionist',
    branch: 'Downtown Branch',
    baseSalary: 4200000,
    transferHistory: [
        { from: 'Branch B', to: 'Downtown Branch', date: '2020-08-01', reason: 'Role fill' }
    ],
};

export const sampleReceptionCustomers = [
    { id: 'cust-1', fullName: 'John Doe', email: 'john@example.com', phone: '(555) 123-4567' },
    { id: 'cust-2', fullName: 'Mary Smith', email: 'mary@example.com', phone: '(555) 222-3344' },
    { id: 'cust-3', fullName: 'Alex Green', email: 'alex@example.com', phone: '(555) 444-5566' },
];

export const sampleReceptionPets = [
    { id: 'pet-201', name: 'Buddy', species: 'Dog', breed: 'Beagle', ownerId: 'cust-1', health: 'Good', lastVisit: '2025-10-18' },
    { id: 'pet-202', name: 'Luna', species: 'Cat', breed: 'Siamese', ownerId: 'cust-2', health: 'Allergic', lastVisit: '2025-09-05' },
    { id: 'pet-203', name: 'Milo', species: 'Dog', breed: 'Terrier', ownerId: 'cust-3', health: 'Recovering', lastVisit: '2025-11-01' },
];

export const sampleReceptionVets = [
    { id: 'vet-1', name: 'Dr. Emily Carter' },
    { id: 'vet-2', name: 'Dr. Lee Johnson' },
];

export const sampleReceptionServices = [
    { id: 'svc-1', name: 'Checkup', duration: 30, price: 30 },
    { id: 'svc-2', name: 'Vaccination', duration: 20, price: 25 },
    { id: 'svc-3', name: 'Grooming', duration: 40, price: 50 },
];

export const sampleReceptionBranches = ['Downtown Branch', 'Uptown Branch'];

export const sampleReceptionAppointments = [
    { id: 'r-apt-1', time: '09:00', date: '2025-11-27', customerId: 'cust-1', petId: 'pet-201', vetId: 'vet-1', serviceId: 'svc-1', branch: 'Downtown Branch', status: 'Scheduled' },
    { id: 'r-apt-2', time: '10:30', date: '2025-11-27', customerId: 'cust-2', petId: 'pet-202', vetId: 'vet-2', serviceId: 'svc-2', branch: 'Downtown Branch', status: 'Scheduled' },
    { id: 'r-apt-3', time: '13:00', date: '2025-11-27', customerId: 'cust-3', petId: 'pet-203', vetId: 'vet-1', serviceId: 'svc-1', branch: 'Uptown Branch', status: 'Pending' },
];

export const sampleReceptionInvoices = [
    { id: 'inv-r1', customerId: 'cust-1', petId: 'pet-201', items: [{ name: 'Checkup', price: 30, qty: 1 }], subtotal: 30, total: 33 },
];

export default {
    sampleReceptionProfile,
    sampleReceptionCustomers,
    sampleReceptionPets,
    sampleReceptionVets,
    sampleReceptionServices,
    sampleReceptionBranches,
    sampleReceptionAppointments,
    sampleReceptionInvoices,
};
