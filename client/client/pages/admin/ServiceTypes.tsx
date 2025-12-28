import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";
import { ServiceType, ServiceTypeId } from "@shared/types";

export default function ServiceTypesPage() {
    const { user } = useAuth();
    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<ServiceType | null>(null);
    const [formData, setFormData] = useState({
        id: "" as ServiceTypeId,
        name: "",
        basePrice: 0,
        description: "",
    });

    if (!user || user.role !== "admin") {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        loadServiceTypes();
    }, []);

    const loadServiceTypes = () => {
        const stored = localStorage.getItem("petcare_service_types");
        if (stored) {
            setServiceTypes(JSON.parse(stored));
        }
    };

    const handleOpenDialog = (type?: ServiceType) => {
        if (type) {
            setEditingType(type);
            setFormData({
                id: type.id,
                name: type.name,
                basePrice: type.basePrice,
                description: type.description || "",
            });
        } else {
            setEditingType(null);
            setFormData({
                id: "purchase",
                name: "",
                basePrice: 0,
                description: "",
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingType(null);
    };

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            alert("Please enter a service name");
            return;
        }

        if (formData.basePrice < 0) {
            alert("Base price must be >= 0");
            return;
        }

        // Rule: If service type is "Mua hàng" (purchase), basePrice must be 0
        if (formData.id === "purchase" && formData.basePrice !== 0) {
            alert("Service type 'Mua hàng' must have basePrice = 0");
            return;
        }

        const newServiceType: ServiceType = {
            id: formData.id,
            name: formData.name.trim(),
            basePrice: formData.basePrice,
            description: formData.description.trim(),
            createdAt: editingType?.createdAt || new Date().toISOString(),
        };

        let updated: ServiceType[];
        if (editingType) {
            updated = serviceTypes.map((t) => (t.id === editingType.id ? newServiceType : t));
        } else {
            // Check if ID already exists
            if (serviceTypes.some((t) => t.id === formData.id)) {
                alert("Service type with this ID already exists");
                return;
            }
            updated = [...serviceTypes, newServiceType];
        }

        localStorage.setItem("petcare_service_types", JSON.stringify(updated));
        setServiceTypes(updated);
        handleCloseDialog();
    };

    const handleDelete = (id: ServiceTypeId) => {
        if (confirm("Are you sure you want to delete this service type?")) {
            const updated = serviceTypes.filter((t) => t.id !== id);
            localStorage.setItem("petcare_service_types", JSON.stringify(updated));
            setServiceTypes(updated);
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
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Service Types Management</h1>
                    <p className="text-muted-foreground">
                        Manage service types and their base prices across the system
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                            Total: {serviceTypes.length}
                        </Badge>
                    </div>
                    <Button onClick={() => handleOpenDialog()} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Service Type
                    </Button>
                </div>

                {/* Table */}
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service ID</TableHead>
                                <TableHead>Service Name</TableHead>
                                <TableHead>Base Price</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {serviceTypes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        No service types found. Click "Add Service Type" to create one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                serviceTypes.map((type) => (
                                    <TableRow key={type.id}>
                                        <TableCell className="font-mono text-sm">{type.id}</TableCell>
                                        <TableCell className="font-medium">{type.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">{formatCurrency(type.basePrice)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground max-w-xs truncate">
                                            {type.description || "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenDialog(type)}
                                                    className="hover:bg-primary/10"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(type.id)}
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

                {/* Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingType ? "Edit Service Type" : "Add New Service Type"}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Service ID</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-md"
                                    value={formData.id}
                                    onChange={(e) => {
                                        const newId = e.target.value as ServiceTypeId;
                                        setFormData({
                                            ...formData,
                                            id: newId,
                                            basePrice: newId === "purchase" ? 0 : formData.basePrice
                                        });
                                    }}
                                    disabled={!!editingType}
                                >
                                    <option value="purchase">purchase</option>
                                    <option value="single-vaccine">single-vaccine</option>
                                    <option value="vaccine-package">vaccine-package</option>
                                    <option value="medical-exam">medical-exam</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Service Name *</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Mua hàng, Tiêm mũi lẻ"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Base Price (VND) *</label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.basePrice}
                                    onChange={(e) =>
                                        setFormData({ ...formData, basePrice: Number(e.target.value) })
                                    }
                                    placeholder="0"
                                    disabled={formData.id === "purchase"}
                                />
                                {formData.id === "purchase" && (
                                    <p className="text-xs text-muted-foreground">
                                        Service type "Mua hàng" must have basePrice = 0
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    placeholder="Brief description of the service"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit}>
                                {editingType ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
