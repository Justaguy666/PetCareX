import React from "react";
import { useToast } from "@/hooks/use-toast";
import sampleReceptionData from "@/data/sampleReceptionData";

export default function InvoiceList() {
    const { toast } = useToast();
    const [invoices, setInvoices] = React.useState(() => {
        try {
            const raw = localStorage.getItem('petcare_invoices');
            if (raw) return JSON.parse(raw);
        } catch (e) { }
        return sampleReceptionData.sampleReceptionInvoices || [];
    });

    function markPaid(id: string) {
        const next = invoices.map((inv: any) => inv.id === id ? { ...inv, status: 'paid' } : inv);
        setInvoices(next);
        localStorage.setItem('petcare_invoices', JSON.stringify(next));
        toast({ title: 'Invoice updated', description: `Invoice ${id} marked paid.` });
    }

    return (
        <div className="space-y-3">
            {invoices.length === 0 ? (
                <div className="text-sm text-muted-foreground">No invoices</div>
            ) : (
                invoices.slice(0, 8).map((inv: any) => (
                    <div key={inv.id} className="p-2 border rounded flex items-center justify-between">
                        <div>
                            <div className="font-medium">{inv.id} — ${inv.total}</div>
                            <div className="text-xs text-muted-foreground">Due {inv.dueDate ?? inv.createdAt}</div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="text-sm font-medium">{inv.status}</div>
                            {inv.status !== 'paid' && (
                                <button className="text-primary text-sm" onClick={() => markPaid(inv.id)}>Mark paid</button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
