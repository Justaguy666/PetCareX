import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import sampleReceptionData from "@/data/sampleReceptionData";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function ReceptionProfileEditForm() {
    const { toast } = useToast();
    const navigate = useNavigate();

    const persisted = React.useMemo(() => {
        try {
            const raw = localStorage.getItem("petcare_reception_profile");
            if (raw) return JSON.parse(raw);
        } catch (e) { }
        return sampleReceptionData.sampleReceptionProfile;
    }, []);

    const [form, setForm] = React.useState({ ...persisted });

    function onSave() {
        try {
            localStorage.setItem("petcare_reception_profile", JSON.stringify(form));
            toast({ title: "Profile saved", description: "Receptionist profile stored locally for demo." });
            navigate('/receptionist/profile');
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Failed to save profile." });
        }
    }

    return (
        <div className="max-w-3xl">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-muted-foreground">Full name</p>
                    <Input value={form.fullName || ""} onChange={e => setForm({ ...form, fullName: e.target.value })} />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">DOB</p>
                    <Input type="date" value={form.dob || ""} onChange={e => setForm({ ...form, dob: e.target.value })} />
                </div>

                <div>
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <Input value={form.gender || ""} onChange={e => setForm({ ...form, gender: e.target.value })} />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Position</p>
                    <Input value={form.position || ""} onChange={e => setForm({ ...form, position: e.target.value })} />
                </div>

                <div>
                    <p className="text-xs text-muted-foreground">Branch</p>
                    <Input value={form.branch || ""} onChange={e => setForm({ ...form, branch: e.target.value })} />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Start date</p>
                    <Input type="date" value={form.startDate || ""} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                </div>
            </div>

            <div className="flex justify-end mt-4">
                <Button onClick={onSave} className="bg-primary text-white">Save</Button>
            </div>
        </div>
    );
}
