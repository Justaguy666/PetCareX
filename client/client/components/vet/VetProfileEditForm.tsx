import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
    profile: any;
    onSave?: (updated: any) => void;
}

export default function VetProfileEditForm({ profile, onSave }: Props) {
    const [form, setForm] = useState({ ...profile });

    const handleSave = () => {
        onSave?.(form);
        // parent page shows a non-blocking toast / navigates — avoid blocking alerts here
    };

    return (
        <Card className="p-6 border border-border max-w-3xl">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Employee ID</label>
                        <input value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Full Name</label>
                        <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md" />
                    </div>

                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Date of Birth</label>
                        <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Gender</label>
                        <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md">
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Start Date</label>
                        <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Position</label>
                        <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md" />
                    </div>

                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Branch</label>
                        <input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} className="w-full px-3 py-2 border border-input rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Base Salary</label>
                        <input type="number" value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: parseInt(e.target.value || '0') })} className="w-full px-3 py-2 border border-input rounded-md" />
                    </div>
                </div>

                <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold mb-2">Transfer History</h4>
                    <p className="text-sm text-muted-foreground">{`For the demo, each line represents a transfer: from => to => date => reason`}</p>
                    <textarea value={(form.transferHistory || []).map((h: any) => `${h.from}=>${h.to}=>${h.date}=>${h.reason}`).join('\n')} onChange={(e) => {
                        const parsed = e.target.value.split('\n').map((l) => {
                            const [from, to, date, reason] = l.split('=>');
                            return { from: (from || '').trim(), to: (to || '').trim(), date: (date || '').trim(), reason: (reason || '').trim() };
                        }).filter((x) => x.from || x.to || x.date || x.reason);
                        setForm({ ...form, transferHistory: parsed });
                    }} className="w-full px-3 py-2 border border-input rounded-md h-28" />
                </div>

                <div className="flex gap-2 pt-3">
                    <Button onClick={handleSave} className="bg-primary text-white">Save</Button>
                </div>
            </div>
        </Card>
    );
}
