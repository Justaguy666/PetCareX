import ReceptionHeader from "@/components/ReceptionHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppointmentBookingForm from "@/components/receptionist/AppointmentBookingForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useState } from "react";

const sampleCustomers = ['John Doe', 'Mary Smith', 'Alex Green'];
const samplePets = ['Bella', 'Max', 'Luna'];
const sampleVets = ['Dr. Anna Smith', 'Dr. Lee Johnson'];
const sampleServices = ['Checkup', 'Vaccination', 'Surgery'];
const sampleBranches = ['Downtown Branch', 'Uptown Branch'];

export default function Booking() {
    const { user } = useAuth();
    if (!user || user.role !== 'receptionist') return <Navigate to="/login" />;

    const [form, setForm] = useState({ customer: sampleCustomers[0], pet: samplePets[0], vet: sampleVets[0], service: sampleServices[0], branch: sampleBranches[0], date: '', time: '' });

    const submit = (e: any) => {
        e.preventDefault();
        alert('Appointment created — mock.');
    };

    return (
        <div className="min-h-screen bg-background">
            <ReceptionHeader />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Appointment Booking</h1>
                    <p className="text-muted-foreground">Create a new appointment for a customer</p>
                </div>

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Book New Appointment</CardTitle>
                        <CardDescription>Fill in the details below to schedule an appointment</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AppointmentBookingForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
