import React from "react";
import sampleReceptionData from "@/data/sampleReceptionData";
import { apiPost } from "@/api/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { normalizeAppointmentPayload, toNumericId } from "@/lib/apiUtils";

export default function AppointmentBookingForm() {
    const { toast } = useToast();
    const customers = sampleReceptionData.sampleReceptionCustomers || [];
    const pets = sampleReceptionData.sampleReceptionPets || [];
    const vets = sampleReceptionData.sampleReceptionVets || [];
    const services = sampleReceptionData.sampleReceptionServices || [];
    const branches = sampleReceptionData.sampleReceptionBranches || [];
    const [isSaving, setIsSaving] = React.useState(false);

    const [customerId, setCustomerId] = React.useState(customers[0]?.id ?? "");
    const [petId, setPetId] = React.useState(pets[0]?.id ?? "");
    const [vetId, setVetId] = React.useState(vets[0]?.id ?? "");
    const [serviceId, setServiceId] = React.useState(services[0]?.id ?? "");
    const [branch, setBranch] = React.useState(branches[0] ?? "");
    const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]);
    const [time, setTime] = React.useState("09:00");

    async function saveAppointment() {
        setIsSaving(true);
        try {
            // Normalize payload to backend format (snake_case, TIMESTAMPTZ)
            const normalized = normalizeAppointmentPayload({
                customerId,
                petId,
                veterinarianId: vetId,
                branchId: branch,
                appointmentDate: date,
                appointmentTime: time,
            });

            if (!normalized) {
                toast({ 
                    title: "Error", 
                    description: "Missing required fields. Please fill in all fields.", 
                    variant: 'destructive' 
                });
                return;
            }

            const resp = await apiPost('/appointments', normalized);
            // Accept either { data: ... } or direct object
            const created = resp?.data ?? resp;
            if (created) {
                toast({ title: "Appointment created", description: "Appointment saved." });
                // attempt to clear form
                setCustomerId(customers[0]?.id ?? "");
                setPetId(pets[0]?.id ?? "");
                setVetId(vets[0]?.id ?? "");
                setServiceId(services[0]?.id ?? "");
                setBranch(branches[0] ?? "");
                setDate(new Date().toISOString().split("T")[0]);
                setTime("09:00");
            } else {
                toast({ title: "Error", description: "Unexpected response from server", variant: 'destructive' });
            }
        } catch (e: any) {
            console.error('Failed to create appointment', e);
            toast({ title: 'Error', description: e?.message || 'Failed to create appointment', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <Select onValueChange={setCustomerId} value={customerId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                            {customers.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <p className="text-xs text-muted-foreground">Pet</p>
                    <Select onValueChange={setPetId} value={petId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select pet" />
                        </SelectTrigger>
                        <SelectContent>
                            {pets.filter(p => p.ownerId === customerId || !customerId).map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.name} ({p.species})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <p className="text-xs text-muted-foreground">Service</p>
                    <Select onValueChange={setServiceId} value={serviceId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                            {services.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <p className="text-xs text-muted-foreground">Vet</p>
                    <Select onValueChange={setVetId} value={vetId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select vet" />
                        </SelectTrigger>
                        <SelectContent>
                            {vets.map(v => (
                                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <p className="text-xs text-muted-foreground">Branch</p>
                    <Select onValueChange={setBranch} value={branch}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                            {branches.map(b => (
                                <SelectItem key={b} value={b}>{b}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>

                <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
            </div>

            <div className="flex items-center justify-end">
                <Button onClick={saveAppointment} className="bg-primary text-white" disabled={isSaving}>
                    {isSaving ? 'Creating...' : 'Create Appointment'}
                </Button>
            </div>
        </div>
    );
}
