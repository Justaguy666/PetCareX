import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useBranches } from "@/hooks/useHospitalData";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function BranchesPage() {
    const { user } = useAuth();
    const { branches, createBranch, updateBranch, deleteBranch } = useBranches();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: "",
        email: "",
        city: "",
        state: "",
        zipCode: "",
        openingTime: "08:00",
        closingTime: "18:00",
        managerId: user?.id || "",
    });

    if (!user) {
        return <Navigate to="/login" />;
    }

    const filteredBranches = branches.filter(branch =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.phone.includes(searchTerm)
    );

    const handleEdit = (branch: any) => {
        setEditingId(branch.id);
        setFormData({
            name: branch.name || "",
            address: branch.address || "",
            phone: branch.phone || "",
            email: branch.email || "",
            city: branch.city || "",
            state: branch.state || "",
            zipCode: branch.zipCode || "",
            openingTime: branch.workingHours?.monday?.start || "08:00",
            closingTime: branch.workingHours?.monday?.end || "18:00",
            managerId: branch.managerId || user.id || "",
        });
        setShowForm(true);
    };

    const validateForm = () => {
        // Name validation (max 100 chars)
        if (formData.name.length > 100) {
            toast({
                title: "Validation Error",
                description: "Branch name must not exceed 100 characters.",
                variant: "destructive",
            });
            return false;
        }

        // Address validation (max 200 chars, unique)
        if (formData.address.length > 200) {
            toast({
                title: "Validation Error",
                description: "Address must not exceed 200 characters.",
                variant: "destructive",
            });
            return false;
        }

        const addressExists = branches.some(b =>
            b.address.toLowerCase() === formData.address.toLowerCase() &&
            b.id !== editingId
        );
        if (addressExists) {
            toast({
                title: "Validation Error",
                description: "A branch with this address already exists.",
                variant: "destructive",
            });
            return false;
        }

        // Phone validation (9-10 digits, unique)
        const phoneDigits = formData.phone.replace(/\D/g, "");
        if (phoneDigits.length < 9 || phoneDigits.length > 10) {
            toast({
                title: "Validation Error",
                description: "Phone number must be 9-10 digits.",
                variant: "destructive",
            });
            return false;
        }

        const phoneExists = branches.some(b =>
            b.phone === formData.phone &&
            b.id !== editingId
        );
        if (phoneExists) {
            toast({
                title: "Validation Error",
                description: "A branch with this phone number already exists.",
                variant: "destructive",
            });
            return false;
        }

        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const branchData = {
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            managerId: formData.managerId,
            services: [],
            workingHours: {
                monday: { start: formData.openingTime, end: formData.closingTime },
                tuesday: { start: formData.openingTime, end: formData.closingTime },
                wednesday: { start: formData.openingTime, end: formData.closingTime },
                thursday: { start: formData.openingTime, end: formData.closingTime },
                friday: { start: formData.openingTime, end: formData.closingTime },
                saturday: { start: formData.openingTime, end: formData.closingTime },
                sunday: { start: formData.openingTime, end: formData.closingTime },
            },
        };

        if (editingId) {
            updateBranch(editingId, branchData);
            toast({
                title: "Branch Updated",
                description: "Branch information has been updated successfully.",
            });
        } else {
            createBranch(branchData);
            toast({
                title: "Branch Created",
                description: "New branch has been added successfully.",
            });
        }

        handleCancel();
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            name: "",
            address: "",
            phone: "",
            email: "",
            city: "",
            state: "",
            zipCode: "",
            openingTime: "08:00",
            closingTime: "18:00",
            managerId: user?.id || "",
        });
    };

    const handleDelete = (branchId: string) => {
        if (confirm("Are you sure you want to delete this branch?")) {
            deleteBranch(branchId);
            toast({
                title: "Branch Deleted",
                description: "Branch has been removed successfully.",
            });
        }
    };

    return (
        <AdminLayout>
            <main className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Branch Management</h1>
                    <p className="text-muted-foreground">Manage hospital branches and their information</p>
                </div>

                {/* Search and Add */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Branches</CardTitle>
                            <Button
                                onClick={() => setShowForm(!showForm)}
                                className="bg-primary hover:bg-primary/90 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Branch
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 mb-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="Search by name, address, or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Add/Edit Form */}
                {showForm && (
                    <Card className="mb-6 border border-border bg-primary/5">
                        <CardHeader>
                            <CardTitle>{editingId ? "Edit Branch" : "Add New Branch"}</CardTitle>
                            <CardDescription>
                                {editingId ? "Update branch information" : "Enter details for the new branch"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">
                                            Branch Name * (max 100 chars)
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            maxLength={100}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">
                                            Phone * (9-10 digits)
                                        </label>
                                        <Input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="0123456789"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">
                                            Email
                                        </label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">
                                            City
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">
                                            State
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">
                                            Zip Code
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.zipCode}
                                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">
                                            Opening Time
                                        </label>
                                        <Input
                                            type="time"
                                            value={formData.openingTime}
                                            onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">
                                            Closing Time
                                        </label>
                                        <Input
                                            type="time"
                                            value={formData.closingTime}
                                            onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">
                                        Address * (max 200 chars, unique)
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        maxLength={200}
                                        required
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                                        {editingId ? "Update Branch" : "Add Branch"}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Branches Table */}
                <Card className="border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Branch Name</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Phone Number</TableHead>
                                <TableHead>Opening Time</TableHead>
                                <TableHead>Closing Time</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBranches.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        No branches yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBranches.map((branch) => (
                                    <TableRow key={branch.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium">{branch.name}</TableCell>
                                        <TableCell>{branch.address}</TableCell>
                                        <TableCell>{branch.phone}</TableCell>
                                        <TableCell>{branch.workingHours?.monday?.start || "N/A"}</TableCell>
                                        <TableCell>{branch.workingHours?.monday?.end || "N/A"}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEdit(branch)}
                                                    className="h-8"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(branch.id)}
                                                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
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
            </main>
        </AdminLayout>
    );
}
