import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Syringe } from "lucide-react";
import { Vaccine } from "@shared/types";

export default function VaccinesPage() {
    const { user } = useAuth();
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVaccine, setEditingVaccine] = useState<Vaccine | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        price: 0,
        manufacturer: "",
        description: "",
    });

    if (!user || user.role !== "admin") {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        loadVaccines();
    }, []);

    const loadVaccines = () => {
        const stored = localStorage.getItem("petcare_vaccines");
        if (stored) {
            setVaccines(JSON.parse(stored));
        }
    };

    const handleOpenDialog = (vaccine?: Vaccine) => {
        if (vaccine) {
            setEditingVaccine(vaccine);
            setFormData({
                name: vaccine.name,
                price: vaccine.price,
                manufacturer: vaccine.manufacturer || "",
                description: vaccine.description || "",
            });
        } else {
            setEditingVaccine(null);
            setFormData({
                name: "",
                price: 0,
                manufacturer: "",
                description: "",
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingVaccine(null);
    };

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            alert("Please enter vaccine name");
            return;
        }

        if (formData.name.length > 200) {
            alert("Vaccine name must be max 200 characters");
            return;
        }

        if (formData.price <= 0) {
            alert("Price must be greater than 0");
            return;
        }

        // Check for unique name (except when editing same vaccine)
        const nameExists = vaccines.some(
            (v) => v.name.toLowerCase() === formData.name.trim().toLowerCase() && v.id !== editingVaccine?.id
        );
        if (nameExists) {
            alert("Vaccine with this name already exists");
            return;
        }

        const newVaccine: Vaccine = {
            id: editingVaccine?.id || `vac-${Date.now()}`,
            name: formData.name.trim(),
            price: formData.price,
            manufacturer: formData.manufacturer.trim(),
            description: formData.description.trim(),
            createdAt: editingVaccine?.createdAt || new Date().toISOString(),
        };

        let updated: Vaccine[];
        if (editingVaccine) {
            updated = vaccines.map((v) => (v.id === editingVaccine.id ? newVaccine : v));
        } else {
            updated = [...vaccines, newVaccine];
        }

        localStorage.setItem("petcare_vaccines", JSON.stringify(updated));
        setVaccines(updated);
        handleCloseDialog();
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this vaccine?")) {
            const updated = vaccines.filter((v) => v.id !== id);
            localStorage.setItem("petcare_vaccines", JSON.stringify(updated));
            setVaccines(updated);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Vaccines Management</h1>
                    <p className="text-muted-foreground">
                        Manage vaccine catalog for single-dose injections and packages
                    </p>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                            Total: {vaccines.length}
                        </Badge>
                    </div>
                    <Button onClick={() => handleOpenDialog()} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Vaccine
                    </Button>
                </div>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vaccine Name</TableHead>
                                <TableHead>Manufacturer</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vaccines.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        No vaccines found. Click "Add Vaccine" to create one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                vaccines.map((vaccine) => (
                                    <TableRow key={vaccine.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Syringe className="w-4 h-4 text-primary" />
                                                {vaccine.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {vaccine.manufacturer || "—"}
                                        </TableCell>
                                        <TableCell className="font-medium">{formatCurrency(vaccine.price)}</TableCell>
                                        <TableCell className="text-muted-foreground max-w-xs truncate">
                                            {vaccine.description || "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenDialog(vaccine)}
                                                    className="hover:bg-primary/10"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(vaccine.id)}
                                                    className="hover:bg-destructive/10 text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingVaccine ? "Edit Vaccine" : "Add New Vaccine"}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Vaccine Name * (max 200 chars)</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., DHPP, Rabies Vaccine"
                                    maxLength={200}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price (VND) * (must be &gt; 0)</label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    placeholder="150000"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Manufacturer</label>
                                <Input
                                    value={formData.manufacturer}
                                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                                    placeholder="e.g., Zoetis, Merial"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the vaccine"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit}>
                                {editingVaccine ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
