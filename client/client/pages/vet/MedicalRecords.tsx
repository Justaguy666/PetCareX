import VetHeader from "@/components/VetHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useMedicalRecords } from "@/contexts/MedicalRecordsContext";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost } from "@/api/api";
import { toNumericId } from "@/lib/apiUtils";
import { MedicalRecord, PrescriptionItem } from "@shared/types";
import { Plus, Trash2 } from "lucide-react";

export default function MedicalRecords() {
    const { user } = useAuth();
    const { records, getRecordsByVeterinarianId } = useMedicalRecords();
    const [pets, setPets] = useState<any[]>([]);
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
    const [fetchedRecords, setFetchedRecords] = useState<MedicalRecord[]>([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [recordsError, setRecordsError] = useState<string | null>(null);

    // Form to create new exam record
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState<Partial<MedicalRecord>>({});
    const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
    const { toast } = useToast();

    if (!user || user.role !== 'veterinarian') return <Navigate to="/login" />;

    // Filter records for current veterinarian (local cache)
    const vetRecords = user.id ? getRecordsByVeterinarianId(user.id) : records;

    // Load assigned pets for vet to select when creating/viewing records
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const resp = await apiGet('/doctor/assigned-pets');
                const data = resp?.data ?? [];
                if (!mounted) return;
                setPets(Array.isArray(data) ? data : []);
            } catch (err: any) {
                console.error('Failed to load assigned pets', err);
                if (!mounted) return;
                setPets([]);
            }
        })();
        return () => { mounted = false; };
    }, []);

    // Fetch medical records when a pet is selected
    useEffect(() => {
        if (!selectedPetId) return;
        let mounted = true;
        (async () => {
            setLoadingRecords(true);
            setRecordsError(null);
            try {
                // TODO: Backend endpoint GET /api/pets/:petId/medical-records does not exist
                // This feature is disabled until backend implements the endpoint
                // For now, show empty records with a message
                console.warn('Medical records endpoint not available - backend endpoint missing');
                if (!mounted) return;
                setFetchedRecords([]);
                setRecordsError('Medical records feature requires backend endpoint /api/pets/:petId/medical-records');
            } catch (err: any) {
                console.error('Failed to load medical records', err);
                if (!mounted) return;
                setRecordsError(err?.message || 'Failed to load records - endpoint not implemented');
            } finally {
                if (mounted) setLoadingRecords(false);
            }
        })();
        return () => { mounted = false; };
    }, [selectedPetId]);

    const handleCreateRecord = async () => {
        if (!selectedPetId) {
            toast({ title: 'Error', description: 'Please select a pet before creating a record', variant: 'destructive' });
            return;
        }
        setCreating(true);
        try {
            // Convert pet_id to number (backend expects BIGINT)
            const petIdNum = toNumericId(selectedPetId);
            if (!petIdNum) {
                toast({ title: 'Error', description: 'Invalid pet ID', variant: 'destructive' });
                return;
            }

            const payload: any = {
                pet_id: petIdNum,
                diagnosis: formData.diagnosis,
                conclusion: formData.conclusion,
                appointment_date: formData.createdAt || new Date().toISOString(),
                weight: (formData as any).weight,
                temperature: (formData as any).temperature,
                blood_pressure: (formData as any).bloodPressure,
                symptoms: formData.symptoms,
                // Note: prescription is not accepted by backend fn_create_exam_record, but keeping for future compatibility
                // prescription: prescriptionItems,
            };

            // TODO: confirm backend expects snake_case keys as above and returns created object in data
            const resp = await apiPost('/doctor/exam-records', payload);
            const created = resp?.data ?? resp;
            if (created) {
                setFetchedRecords((prev) => [created as MedicalRecord, ...prev]);
                toast({ title: 'Success', description: 'Medical examination record created' });
                setFormData({});
                setPrescriptionItems([]);
            }
        } catch (err: any) {
            console.error('Failed to create exam record', err);
            toast({ title: 'Error', description: err?.message || 'Failed to create record', variant: 'destructive' });
        } finally {
            setCreating(false);
        }
    };

    const handleAddPrescription = () => {
        setPrescriptionItems([
            ...prescriptionItems,
            { drugName: "", quantity: 1, dosage: "", frequency: "", duration: "", instructions: "" },
        ]);
    };

    const handleRemovePrescription = (index: number) => {
        setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
    };

    const handlePrescriptionChange = (index: number, field: keyof PrescriptionItem, value: any) => {
        const updated = [...prescriptionItems];
        updated[index] = { ...updated[index], [field]: value };
        setPrescriptionItems(updated);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <VetHeader />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Medical Records</h1>
                    <p className="text-muted-foreground">View and manage pet medical records</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Records Table */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Medical Records</CardTitle>
                            <CardDescription>Select a pet to view records</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <Label>Pet</Label>
                                <select
                                    className="w-full border rounded p-2"
                                    value={selectedPetId || ''}
                                    onChange={(e) => setSelectedPetId(e.target.value || null)}
                                >
                                    <option value="">-- Select a pet --</option>
                                    {pets.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                                    ))}
                                </select>
                            </div>

                            {loadingRecords ? (
                                <div className="text-center py-8">Loading records...</div>
                            ) : recordsError ? (
                                <div className="text-center py-8 text-destructive">{recordsError}</div>
                            ) : fetchedRecords.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No medical records found for this pet</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Diagnosis</TableHead>
                                                <TableHead>Veterinarian</TableHead>
                                                <TableHead>Follow-up</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {fetchedRecords.map((record) => (
                                                <TableRow key={record.id}>
                                                    <TableCell>{formatDate(record.createdAt)}</TableCell>
                                                    <TableCell className="max-w-xs truncate">{record.diagnosis}</TableCell>
                                                    <TableCell>{record.veterinarianName || record.veterinarianId || 'Unknown'}</TableCell>
                                                    <TableCell>
                                                        {record.followUpDate ? (
                                                            <Badge variant="outline">{formatDate(record.followUpDate)}</Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground">N/A</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" variant="outline" onClick={() => { window.alert('View details in drawer (not implemented)'); }}>
                                                                View
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Edit Panel */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Medical Exam Record</CardTitle>
                            <CardDescription>Fill form to create a new medical examination record for the selected pet</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label>Diagnosis</Label>
                                    <Textarea value={formData.diagnosis || ''} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} rows={2} />
                                </div>
                                <div>
                                    <Label>Conclusion</Label>
                                    <Textarea value={formData.conclusion || ''} onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })} rows={2} />
                                </div>
                                <div>
                                    <Label>Symptoms</Label>
                                    <Textarea value={formData.symptoms || ''} onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })} rows={2} />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleCreateRecord} disabled={creating}>{creating ? 'Creating...' : 'Create Record'}</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
