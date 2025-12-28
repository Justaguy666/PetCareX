import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export type PrescriptionItem = { name: string; dose: string; qty: number };

interface RecordProps {
    record: {
        id: string;
        pet: string;
        owner: string;
        date?: string;
        symptoms?: string;
        diagnosis?: string;
        prescription?: PrescriptionItem[] | string;
        followUp?: string;
        vet?: string;
    } | null;
    onSave?: (updated: any) => void;
}

export default function MedicalRecordCard({ record, onSave }: RecordProps) {
    const [local, setLocal] = useState(record);

    // reset when record changes
    useState(() => setLocal(record));

    if (!record) return (
        <Card className="p-6 border border-border">
            <p className="text-sm text-muted-foreground">Select a medical record to view details</p>
        </Card>
    );

    const update = (partial: any) => setLocal((prev: any) => ({ ...(prev || {}), ...partial }));

    const handleSave = () => {
        onSave?.(local);
    };

    return (
        <Card className="p-6 border border-border">
            <h3 className="text-lg font-semibold mb-3">Record: {record.id}</h3>

            <div className="space-y-3 text-sm">
                <div>
                    <p className="text-xs text-muted-foreground">Pet</p>
                    <p className="font-medium text-foreground">{local?.pet}</p>
                </div>

                <div>
                    <label className="text-xs text-muted-foreground">Symptoms</label>
                    <textarea value={local?.symptoms} onChange={(e) => update({ symptoms: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md" rows={3} />
                </div>

                <div>
                    <label className="text-xs text-muted-foreground">Diagnosis</label>
                    <input value={local?.diagnosis || ''} onChange={(e) => update({ diagnosis: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md" />
                </div>

                <div>
                    <label className="text-xs text-muted-foreground">Prescription</label>
                    <div className="space-y-2">
                        {(Array.isArray(local?.prescription) ? local.prescription : []).map((p: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                                <input value={p.name} onChange={(e) => {
                                    const arr = Array.isArray(local?.prescription) ? [...local.prescription] : [];
                                    if (arr[idx]) {
                                        arr[idx] = { ...arr[idx], name: e.target.value };
                                        update({ prescription: arr });
                                    }
                                }} className="w-1/2 px-2 py-1 border border-input rounded-md" />
                                <input value={p.dose} onChange={(e) => {
                                    const arr = Array.isArray(local?.prescription) ? [...local.prescription] : [];
                                    if (arr[idx]) {
                                        arr[idx] = { ...arr[idx], dose: e.target.value };
                                        update({ prescription: arr });
                                    }
                                }} className="w-1/4 px-2 py-1 border border-input rounded-md" />
                                <input type="number" value={p.qty} onChange={(e) => {
                                    const arr = Array.isArray(local?.prescription) ? [...local.prescription] : [];
                                    if (arr[idx]) {
                                        arr[idx] = { ...arr[idx], qty: parseInt(e.target.value || '0') };
                                        update({ prescription: arr });
                                    }
                                }} className="w-1/6 px-2 py-1 border border-input rounded-md" />
                            </div>
                        ))}
                        <div>
                            <Button size="sm" onClick={() => {
                                const current = Array.isArray(local?.prescription) ? local.prescription : [];
                                update({ prescription: [...current, { name: '', dose: '', qty: 1 }] });
                            }}>Add Prescription Item</Button>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-xs text-muted-foreground">Follow-up Date</label>
                    <input type="date" value={local?.followUp || ''} onChange={(e) => update({ followUp: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md" />
                </div>

                <div>
                    <label className="text-xs text-muted-foreground">Veterinarian</label>
                    <p className="font-medium text-foreground">{local?.vet}</p>
                </div>

                <div className="flex gap-2 pt-3">
                    <Button onClick={handleSave} className="bg-primary text-white">Save Changes</Button>
                </div>
            </div>
        </Card>
    );
}
