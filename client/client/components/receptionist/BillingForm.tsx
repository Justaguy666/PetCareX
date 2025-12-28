import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import sampleReceptionData from "@/data/sampleReceptionData";
import { useToast } from "@/hooks/use-toast";

export default function BillingForm() {
    const { toast } = useToast();
    const customers = sampleReceptionData.sampleReceptionCustomers || [];
    const pets = sampleReceptionData.sampleReceptionPets || [];
    const services = sampleReceptionData.sampleReceptionServices || [];

    const [customerId, setCustomerId] = React.useState(customers[0]?.id ?? "");
    const [petId, setPetId] = React.useState(pets[0]?.id ?? "");
    const [serviceId, setServiceId] = React.useState(services[0]?.id ?? "");
    const [qty, setQty] = React.useState(1);

    function submitInvoice() {
        const service = services.find(s => s.id === serviceId) || { name: "Service", price: 0 };
        const subtotal = (service.price || service?.price || 0) * qty;
        const tax = +(subtotal * 0.1).toFixed(2);
        const total = +(subtotal + tax).toFixed(2);

        const invoice = {
            id: `inv-${Date.now()}`,
            customerId,
            petId,
            items: [{ name: service.name || "Service", price: service.price || 0, qty }],
            subtotal,
            tax,
            total,
            status: "pending",
            createdAt: new Date().toISOString(),
        };

        try {
            const saved = JSON.parse(localStorage.getItem("petcare_invoices") || "[]");
            saved.unshift(invoice);
            localStorage.setItem("petcare_invoices", JSON.stringify(saved));
            toast({ title: "Invoice created", description: "Saved in local storage for demo." });
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Failed to save invoice." });
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
                            {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>)}
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
                            {pets.filter(p => p.ownerId === customerId || !customerId).map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name} — {p.species}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <p className="text-xs text-muted-foreground">Service / Item</p>
                    <Select onValueChange={setServiceId} value={serviceId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                            {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name} — ${s.price ?? 0}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <p className="text-xs text-muted-foreground">Qty</p>
                    <Input type="number" min={1} value={qty} onChange={(e) => setQty(parseInt(e.target.value || "1"))} />
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={submitInvoice} className="bg-primary text-white">Create Invoice</Button>
            </div>
        </div>
    );
}
