import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useMedicalRecords } from "@/contexts/MedicalRecordsContext";
import { useUsers, useBranches } from "@/hooks/useHospitalData";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Eye, Edit, Trash2, Plus, Search, Calendar, User, Stethoscope } from "lucide-react";
import { MedicalRecord, PrescriptionItem } from "@shared/types";

export default function AdminMedicalRecords() {
    const { user } = useAuth();
    const { records, getRecordById, updateRecord, deleteRecord, addRecord } = useMedicalRecords();
    const { users } = useUsers();
    const { branches } = useBranches();
    const { toast } = useToast();

    // Default to admin's branch
    const [selectedBranch, setSelectedBranch] = useState(user?.branchId || "all");
    const [searchTerm, setSearchTerm] = useState("");
    const [viewRecordId, setViewRecordId] = useState<string | null>(null);
    const [editRecordId, setEditRecordId] = useState<string | null>(null);
    const [showAddDialog, setShowAddDialog] = useState(false);

    const [editForm, setEditForm] = useState<Partial<MedicalRecord>>({});
    const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);

    if (!user || user.role !== "admin") {
        return <Navigate to="/login" />;
    }

    const veterinarians = users.filter((u) => u.role === "veterinarian");
    const customers = users.filter((u) => u.role === "customer");

    const branchFilteredRecords =
        selectedBranch === "all"
            ? records
            : records.filter((r) => r.branchId === selectedBranch);

    const filteredRecords = branchFilteredRecords.filter((record) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            record.petName.toLowerCase().includes(searchLower) ||
            record.customerName.toLowerCase().includes(searchLower) ||
            record.veterinarianName.toLowerCase().includes(searchLower) ||
            record.diagnosis.toLowerCase().includes(searchLower) ||
            record.id.toLowerCase().includes(searchLower)
        );
    });

    const handleView = (recordId: string) => {
        setViewRecordId(recordId);
    };

    const handleEdit = (recordId: string) => {
        const record = getRecordById(recordId);
        if (record) {
            setEditForm(record);
            setPrescriptionItems(record.prescription || []);
            setEditRecordId(recordId);
        }
    };

    const handleSaveEdit = () => {
        if (!editRecordId) return;

        updateRecord(editRecordId, {
            ...editForm,
            prescription: prescriptionItems,
        });

        toast({
            title: "Record Updated",
            description: "Medical record has been updated successfully.",
        });

        setEditRecordId(null);
        setEditForm({});
        setPrescriptionItems([]);
    };

    const handleDelete = (recordId: string) => {
        if (confirm("Are you sure you want to delete this medical record?")) {
            deleteRecord(recordId);
            toast({
                title: "Record Deleted",
                description: "Medical record has been deleted.",
            });
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

    const viewRecord = viewRecordId ? getRecordById(viewRecordId) : null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <AdminLayout>
            <main className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Medical Records</h1>
                    <p className="text-muted-foreground">
                        View and manage all pet medical records across the system
                    </p>
                </div>

                {/* Search and Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Search & Filter Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 flex-wrap">
                            <div>
                                <label className="text-sm font-medium text-foreground block mb-2">
                                    Filter by Branch
                                </label>
                                <select
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                    className="px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="all">All Branches</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search by pet, customer, veterinarian, or diagnosis..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Records Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Medical Records ({filteredRecords.length})</CardTitle>
                        <CardDescription>Complete list of pet medical examinations and treatments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Record ID</TableHead>
                                        <TableHead>Pet Name</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Veterinarian</TableHead>
                                        <TableHead>Diagnosis</TableHead>
                                        <TableHead>Follow-up Date</TableHead>
                                        <TableHead>Created Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRecords.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                                No medical records found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredRecords.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell className="font-mono text-sm">{record.id}</TableCell>
                                                <TableCell className="font-medium">{record.petName}</TableCell>
                                                <TableCell>{record.customerName}</TableCell>
                                                <TableCell>{record.veterinarianName}</TableCell>
                                                <TableCell className="max-w-xs truncate">{record.diagnosis}</TableCell>
                                                <TableCell>
                                                    {record.followUpDate ? (
                                                        <Badge variant="outline">{formatDate(record.followUpDate)}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{formatDate(record.createdAt)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleView(record.id)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleEdit(record.id)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDelete(record.id)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* View Record Dialog */}
                <Dialog open={!!viewRecordId} onOpenChange={() => setViewRecordId(null)}>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Medical Record Details</DialogTitle>
                            <DialogDescription>Complete medical examination record</DialogDescription>
                        </DialogHeader>
                        {viewRecord && (
                            <div className="space-y-6">
                                {/* Patient Information */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-muted-foreground">Pet Name</Label>
                                        <p className="font-semibold">{viewRecord.petName}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Customer</Label>
                                        <p className="font-semibold">{viewRecord.customerName}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Veterinarian</Label>
                                        <p className="font-semibold">{viewRecord.veterinarianName}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Date</Label>
                                        <p className="font-semibold">{formatDate(viewRecord.createdAt)}</p>
                                    </div>
                                </div>

                                {/* Vital Signs */}
                                <div>
                                    <h3 className="font-semibold mb-2">Vital Signs</h3>
                                    <div className="grid grid-cols-3 gap-4 bg-muted/50 p-4 rounded-lg">
                                        {viewRecord.weight && (
                                            <div>
                                                <Label className="text-muted-foreground text-xs">Weight</Label>
                                                <p className="font-semibold">{viewRecord.weight} lbs</p>
                                            </div>
                                        )}
                                        {viewRecord.temperature && (
                                            <div>
                                                <Label className="text-muted-foreground text-xs">Temperature</Label>
                                                <p className="font-semibold">{viewRecord.temperature}°F</p>
                                            </div>
                                        )}
                                        {viewRecord.bloodPressure && (
                                            <div>
                                                <Label className="text-muted-foreground text-xs">Blood Pressure</Label>
                                                <p className="font-semibold">{viewRecord.bloodPressure}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Symptoms */}
                                <div>
                                    <Label className="text-muted-foreground">Symptoms</Label>
                                    <p className="mt-1 p-3 bg-muted/50 rounded-lg">{viewRecord.symptoms}</p>
                                </div>

                                {/* Diagnosis */}
                                <div>
                                    <Label className="text-muted-foreground">Diagnosis</Label>
                                    <p className="mt-1 p-3 bg-muted/50 rounded-lg font-semibold">
                                        {viewRecord.diagnosis}
                                    </p>
                                </div>

                                {/* Conclusion */}
                                <div>
                                    <Label className="text-muted-foreground">Treatment Plan & Conclusion</Label>
                                    <p className="mt-1 p-3 bg-muted/50 rounded-lg">{viewRecord.conclusion}</p>
                                </div>

                                {/* Prescription */}
                                {viewRecord.prescription && viewRecord.prescription.length > 0 && (
                                    <div>
                                        <Label className="text-muted-foreground">Prescription</Label>
                                        <div className="mt-2 space-y-2">
                                            {viewRecord.prescription.map((item, index) => (
                                                <div key={index} className="p-3 bg-muted/50 rounded-lg">
                                                    <div className="font-semibold">
                                                        {item.drugName} - Quantity: {item.quantity}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        {item.dosage && <span>Dosage: {item.dosage} | </span>}
                                                        {item.frequency && <span>Frequency: {item.frequency} | </span>}
                                                        {item.duration && <span>Duration: {item.duration}</span>}
                                                    </div>
                                                    {item.instructions && (
                                                        <div className="text-sm mt-1">
                                                            <span className="font-medium">Instructions:</span> {item.instructions}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Follow-up */}
                                {viewRecord.followUpDate && (
                                    <div>
                                        <Label className="text-muted-foreground">Follow-up Appointment</Label>
                                        <p className="mt-1 font-semibold">
                                            <Calendar className="inline h-4 w-4 mr-2" />
                                            {formatDate(viewRecord.followUpDate)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setViewRecordId(null)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Record Dialog */}
                <Dialog open={!!editRecordId} onOpenChange={() => setEditRecordId(null)}>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Medical Record</DialogTitle>
                            <DialogDescription>Update medical examination details</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Pet Name</Label>
                                    <Input
                                        value={editForm.petName || ""}
                                        onChange={(e) => setEditForm({ ...editForm, petName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Customer Name</Label>
                                    <Input
                                        value={editForm.customerName || ""}
                                        onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Assigned Veterinarian</Label>
                                <Select
                                    value={editForm.veterinarianId}
                                    onValueChange={(value) => {
                                        const vet = veterinarians.find((v) => v.id === value);
                                        setEditForm({
                                            ...editForm,
                                            veterinarianId: value,
                                            veterinarianName: vet?.fullName || "",
                                        });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {veterinarians.map((vet) => (
                                            <SelectItem key={vet.id} value={vet.id}>
                                                {vet.fullName} - {vet.specialization}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>Weight (lbs)</Label>
                                    <Input
                                        type="number"
                                        value={editForm.weight || ""}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, weight: parseFloat(e.target.value) })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Temperature (°F)</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={editForm.temperature || ""}
                                        onChange={(e) =>
                                            setEditForm({ ...editForm, temperature: parseFloat(e.target.value) })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Blood Pressure</Label>
                                    <Input
                                        value={editForm.bloodPressure || ""}
                                        onChange={(e) => setEditForm({ ...editForm, bloodPressure: e.target.value })}
                                        placeholder="120/80"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Symptoms</Label>
                                <Textarea
                                    value={editForm.symptoms || ""}
                                    onChange={(e) => setEditForm({ ...editForm, symptoms: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label>Diagnosis</Label>
                                <Textarea
                                    value={editForm.diagnosis || ""}
                                    onChange={(e) => setEditForm({ ...editForm, diagnosis: e.target.value })}
                                    rows={2}
                                />
                            </div>

                            <div>
                                <Label>Treatment Plan & Conclusion</Label>
                                <Textarea
                                    value={editForm.conclusion || ""}
                                    onChange={(e) => setEditForm({ ...editForm, conclusion: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label>Follow-up Date</Label>
                                <Input
                                    type="date"
                                    value={editForm.followUpDate || ""}
                                    onChange={(e) => setEditForm({ ...editForm, followUpDate: e.target.value })}
                                />
                            </div>

                            {/* Prescription Items */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label>Prescription</Label>
                                    <Button size="sm" variant="outline" onClick={handleAddPrescription}>
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Medication
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {prescriptionItems.map((item, index) => (
                                        <Card key={index}>
                                            <CardContent className="pt-4">
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs">Drug Name</Label>
                                                            <Input
                                                                value={item.drugName}
                                                                onChange={(e) =>
                                                                    handlePrescriptionChange(index, "drugName", e.target.value)
                                                                }
                                                                placeholder="Medication name"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Quantity</Label>
                                                            <Input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) =>
                                                                    handlePrescriptionChange(
                                                                        index,
                                                                        "quantity",
                                                                        parseInt(e.target.value)
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div>
                                                            <Label className="text-xs">Dosage</Label>
                                                            <Input
                                                                value={item.dosage || ""}
                                                                onChange={(e) =>
                                                                    handlePrescriptionChange(index, "dosage", e.target.value)
                                                                }
                                                                placeholder="250mg"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Frequency</Label>
                                                            <Input
                                                                value={item.frequency || ""}
                                                                onChange={(e) =>
                                                                    handlePrescriptionChange(index, "frequency", e.target.value)
                                                                }
                                                                placeholder="Twice daily"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Duration</Label>
                                                            <Input
                                                                value={item.duration || ""}
                                                                onChange={(e) =>
                                                                    handlePrescriptionChange(index, "duration", e.target.value)
                                                                }
                                                                placeholder="7 days"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Instructions</Label>
                                                        <Input
                                                            value={item.instructions || ""}
                                                            onChange={(e) =>
                                                                handlePrescriptionChange(index, "instructions", e.target.value)
                                                            }
                                                            placeholder="Give with food"
                                                        />
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleRemovePrescription(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Remove
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditRecordId(null)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveEdit}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </AdminLayout>
    );
}
