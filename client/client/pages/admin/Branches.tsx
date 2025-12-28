import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost, apiPut, apiDelete } from "@/api/api";
import { Branch } from "@shared/types";

const EMPTY_FORM_DATA = {
    name: "",
    address: "",
    phone: "",
};

export default function BranchesPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(EMPTY_FORM_DATA);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const response = await apiGet('/branch');
            setBranches(response.data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch branches');
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    if (!user) {
        return <Navigate to="/login" />;
    }
    const filteredBranches = useMemo(() => branches.filter(branch =>
        branch.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (branch.address && branch.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (branch.phone_number && branch.phone_number.includes(searchTerm))
    ), [branches, searchTerm]);

    const handleEdit = (branch: Branch) => {
        setEditingId(branch.id);
        setFormData({
            name: branch.branch_name || "",
            address: branch.address || "",
            phone: branch.phone_number || "",
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await apiPut(`/branch/${editingId}`, formData);
                toast({
                    title: "Branch Updated",
                    description: "Branch information has been updated successfully.",
                });
            } else {
                await apiPost('/branch', formData);
                toast({
                    title: "Branch Created",
                    description: "New branch has been added successfully.",
                });
            }
            handleCancel();
            fetchBranches(); // Refetch data
        } catch (err: any) {
            toast({ title: "Operation Failed", description: err.message, variant: "destructive" });
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData(EMPTY_FORM_DATA);
    };

    const handleDelete = async (branchId: string) => {
        if (confirm("Are you sure you want to delete this branch?")) {
            try {
                await apiDelete(`/branch/${branchId}`);
                toast({
                    title: "Branch Deleted",
                    description: "Branch has been removed successfully.",
                });
                fetchBranches(); // Refetch data
            } catch (err: any) {
                toast({ title: "Deletion Failed", description: err.message, variant: "destructive" });
            }
        }
    };

    return (
        <AdminLayout>
            <main className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Branch Management</h1>
                    <p className="text-muted-foreground">Manage hospital branches and their information</p>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Branches</CardTitle>
                            <Button
                                onClick={() => setShowForm(!showForm)}
                                className="bg-primary hover:bg-primary/90 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {showForm ? 'Cancel' : 'Add Branch'}
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
                                        <label className="text-sm font-medium text-foreground block mb-2">Branch Name *</label>
                                        <Input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">Phone *</label>
                                        <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="0123456789" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">Address *</label>
                                    <Input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
                                </div>

                                <div className="flex gap-4">
                                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                                        {editingId ? "Update Branch" : "Add Branch"}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card className="border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Branch Name</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Phone Number</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
                            ) : error ? (
                                <TableRow><TableCell colSpan={6} className="text-center text-destructive">{error}</TableCell></TableRow>
                            ) : filteredBranches.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No branches found</TableCell>
                                </TableRow>
                            ) : (
                                filteredBranches.map((branch) => (
                                    <TableRow key={branch.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium">{branch.branch_name}</TableCell>
                                        <TableCell>{branch.address}</TableCell>
                                        <TableCell>{branch.phone_number}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleEdit(branch)} className="h-8">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleDelete(branch.id)} className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50">
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
