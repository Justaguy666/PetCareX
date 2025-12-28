import VetHeader from "@/components/VetHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useMedicalRecords } from "@/contexts/MedicalRecordsContext";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost } from "@/api/api";
import { toNumericId } from "@/lib/apiUtils";
import { MedicalRecord, PrescriptionItem } from "@shared/types";
import { Stethoscope, Syringe, Package } from "lucide-react";

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

    // History dialog
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [prescriptionItems, setPrescriptionItems] = useState<any[]>([]);
    const [medicines, setMedicines] = useState<any[]>([]);
    const { toast } = useToast();

    if (!user || user.role !== 'veterinarian') return <Navigate to="/login" />;

    // Filter records for current veterinarian (local cache)
    const vetRecords = user.id ? getRecordsByVeterinarianId(user.id) : records;

    // Load assigned pets and medicines for vet
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const [petsResp, medsResp] = await Promise.all([
                    apiGet('/doctor/assigned-pets'),
                    apiGet('/doctor/medicines')
                ]);
                if (!mounted) return;
                setPets(Array.isArray(petsResp?.data) ? petsResp.data : []);
                setMedicines(Array.isArray(medsResp?.data) ? medsResp.data : []);
            } catch (err: any) {
                console.error('Failed to load data', err);
                if (!mounted) return;
                setPets([]);
                setMedicines([]);
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
                const resp = await apiGet(`/doctor/pets/${selectedPetId}/medical-records`);
                if (!mounted) return;
                setFetchedRecords(resp?.data ?? []);
            } catch (err: any) {
                console.error('Failed to load medical records', err);
                if (!mounted) return;
                setRecordsError(err?.message || 'Failed to load records');
                setFetchedRecords([]);
            } finally {
                if (mounted) setLoadingRecords(false);
            }
        })();
        return () => { mounted = false; };
    }, [selectedPetId]);

    const handleCreateRecord = async () => {
        if (!selectedPetId) {
            toast({ title: 'Lỗi', description: 'Vui lòng chọn pet trước khi tạo hồ sơ', variant: 'destructive' });
            return;
        }
        if (!formData.diagnosis || formData.diagnosis.trim() === '') {
            toast({ title: 'Lỗi', description: 'Vui lòng nhập chẩn đoán (Diagnosis)', variant: 'destructive' });
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
                appointment_date: new Date().toISOString(),
                prescriptions: prescriptionItems.filter(p => p.medicine_id).map(p => ({
                    medicine_id: Number(p.medicine_id),
                    quantity: Number(p.quantity) || 1,
                    dosage: p.dosage || '',
                    duration: p.duration || '',
                    instructions: p.instructions || ''
                }))
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
            { medicine_id: "", quantity: 1, dosage: "", duration: "", instructions: "" },
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

    const handleViewHistory = async () => {
        if (!selectedPetId) return;
        setLoadingHistory(true);
        setHistoryDialogOpen(true);
        try {
            const resp = await apiGet(`/doctor/pets/${selectedPetId}/full-history`);
            setHistoryData(resp?.data ?? []);
        } catch (error) {
            console.error('Failed to load pet history', error);
            setHistoryData([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'examination': return <Stethoscope className="w-4 h-4 text-blue-600" />;
            case 'single_injection': return <Syringe className="w-4 h-4 text-green-600" />;
            case 'package_injection': return <Package className="w-4 h-4 text-purple-600" />;
            default: return null;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'examination': return 'Khám bệnh';
            case 'single_injection': return 'Tiêm mũi lẻ';
            case 'package_injection': return 'Tiêm theo gói';
            default: return type;
        }
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
                                            {fetchedRecords.map((record: any) => (
                                                <TableRow key={record.id}>
                                                    <TableCell>{record.created_at ? formatDate(record.created_at) : 'N/A'}</TableCell>
                                                    <TableCell className="max-w-xs truncate">{record.diagnosis}</TableCell>
                                                    <TableCell>{record.doctor_name || 'Unknown'}</TableCell>
                                                    <TableCell>
                                                        {record.appointment_date ? (
                                                            <Badge variant="outline">{formatDate(record.appointment_date)}</Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground">N/A</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" variant="outline" onClick={handleViewHistory}>
                                                                View History
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
                                    <Label>Diagnosis *</Label>
                                    <Textarea 
                                        value={formData.diagnosis || ''} 
                                        onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} 
                                        rows={3}
                                        placeholder="Enter diagnosis (max 500 characters)"
                                        maxLength={500}
                                    />
                                </div>
                                <div>
                                    <Label>Conclusion</Label>
                                    <Textarea 
                                        value={formData.conclusion || ''} 
                                        onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })} 
                                        rows={3}
                                        placeholder="Enter conclusion (max 1000 characters)"
                                        maxLength={1000}
                                    />
                                </div>

                                {/* Prescriptions Section */}
                                <div className="border-t pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-base font-semibold">Toa thuốc</Label>
                                        <Button type="button" size="sm" variant="outline" onClick={handleAddPrescription}>
                                            + Thêm thuốc
                                        </Button>
                                    </div>
                                    {prescriptionItems.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">Chưa có thuốc trong toa (tùy chọn)</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {prescriptionItems.map((item, idx) => (
                                                <div key={idx} className="p-3 border rounded-lg space-y-2 bg-gray-50">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium">Thuốc #{idx + 1}</span>
                                                        <Button type="button" size="sm" variant="ghost" onClick={() => handleRemovePrescription(idx)}>
                                                            Xóa
                                                        </Button>
                                                    </div>
                                                    <select
                                                        className="w-full border rounded p-2 text-sm"
                                                        value={item.medicine_id || ''}
                                                        onChange={(e) => handlePrescriptionChange(idx, 'medicine_id' as any, e.target.value)}
                                                    >
                                                        <option value="">-- Chọn thuốc --</option>
                                                        {medicines.map((m: any) => (
                                                            <option key={m.id} value={m.id}>{m.name}</option>
                                                        ))}
                                                    </select>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            type="number"
                                                            className="border rounded p-2 text-sm"
                                                            placeholder="Số lượng"
                                                            value={item.quantity || ''}
                                                            onChange={(e) => handlePrescriptionChange(idx, 'quantity' as any, e.target.value)}
                                                            min={1}
                                                        />
                                                        <input
                                                            type="text"
                                                            className="border rounded p-2 text-sm"
                                                            placeholder="Liều dùng (vd: 2 viên/ngày)"
                                                            value={item.dosage || ''}
                                                            onChange={(e) => handlePrescriptionChange(idx, 'dosage' as any, e.target.value)}
                                                        />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="w-full border rounded p-2 text-sm"
                                                        placeholder="Thời gian (vd: 7 ngày)"
                                                        value={item.duration || ''}
                                                        onChange={(e) => handlePrescriptionChange(idx, 'duration' as any, e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="w-full border rounded p-2 text-sm"
                                                        placeholder="Hướng dẫn sử dụng (tùy chọn)"
                                                        value={item.instructions || ''}
                                                        onChange={(e) => handlePrescriptionChange(idx, 'instructions' as any, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={handleCreateRecord} disabled={creating}>{creating ? 'Creating...' : 'Create Record'}</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* History Dialog */}
                <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Lịch sử thăm khám</DialogTitle>
                        </DialogHeader>
                        {loadingHistory ? (
                            <div className="text-center py-8">Đang tải...</div>
                        ) : historyData.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">Chưa có lịch sử thăm khám</div>
                        ) : (
                            <div className="space-y-4">
                                {historyData.map((item: any, idx: number) => (
                                    <div key={idx} className="p-4 border rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getTypeIcon(item.type)}
                                            <Badge variant="outline">{getTypeLabel(item.type)}</Badge>
                                            <span className="text-sm text-muted-foreground ml-auto">
                                                {item.created_at ? formatDate(item.created_at) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <div><strong>Bác sĩ:</strong> {item.doctor_name || 'N/A'}</div>
                                            {item.type === 'examination' && (
                                                <>
                                                    <div><strong>Chẩn đoán:</strong> {item.description || 'N/A'}</div>
                                                    <div><strong>Kết luận:</strong> {item.conclusion || 'N/A'}</div>
                                                </>
                                            )}
                                            {item.type === 'single_injection' && (
                                                <>
                                                    <div><strong>Vaccine:</strong> {item.vaccine_name || 'N/A'}</div>
                                                    <div><strong>Liều lượng:</strong> {item.dosage || 'N/A'} ml</div>
                                                </>
                                            )}
                                            {item.type === 'package_injection' && (
                                                <div><strong>Gói vaccine:</strong> {item.vaccine_name || 'N/A'}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
