import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { usePetItems, useBranches } from "@/hooks/useHospitalData";
import { Edit, Trash2, Plus, Search, Package, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function ProductsPage() {
    const { user } = useAuth();
    const { items, createItem, updateItem, deleteItem } = usePetItems();
    const { branches } = useBranches();
    const { toast } = useToast();
    // Default to admin's branch
    const [selectedBranch, setSelectedBranch] = useState(user?.branchId || "all");
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        productCode: "",
        name: "",
        description: "",
        category: "food" as "food" | "toy" | "accessory" | "medication" | "other",
        price: 0,
        stock: 0,
        branchId: user?.branchId || "",
    });

    if (!user) {
        return <Navigate to="/login" />;
    }

    const categories = ["all", "food", "toy", "accessory", "medication", "other"];

    const branchFilteredItems =
        selectedBranch === "all"
            ? items
            : items.filter((item) => item.branchId === selectedBranch);

    const filteredProducts = branchFilteredItems.filter((product) => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.productCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleEdit = (product: any) => {
        setEditingId(product.id);
        setFormData({
            productCode: product.productCode || "",
            name: product.name || "",
            description: product.description || "",
            category: product.category || "food",
            price: product.price || 0,
            stock: product.stock || 0,
            branchId: product.branchId || user.branchId || "",
        });
        setShowForm(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const productData = {
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
            createdAt: new Date().toISOString(),
        };

        if (editingId) {
            updateItem(editingId, productData);
            toast({
                title: "Product Updated",
                description: "Product has been updated successfully.",
            });
        } else {
            createItem(productData);
            toast({
                title: "Product Created",
                description: "New product has been added successfully.",
            });
        }

        handleCancel();
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            productCode: "",
            name: "",
            description: "",
            category: "food",
            price: 0,
            stock: 0,
            branchId: user?.branchId || "",
        });
    };

    const handleDelete = (productId: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            deleteItem(productId);
            toast({
                title: "Product Deleted",
                description: "Product has been removed successfully.",
            });
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            food: "bg-green-100 text-green-700",
            toy: "bg-blue-100 text-blue-700",
            accessory: "bg-purple-100 text-purple-700",
            medication: "bg-red-100 text-red-700",
            other: "bg-gray-100 text-gray-700",
        };
        return colors[category] || colors.other;
    };

    const lowStockProducts = filteredProducts.filter((p) => p.stock <= 10);

    return (
        <AdminLayout>
            <main className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Products Management</h1>
                    <p className="text-muted-foreground">Manage pet products and inventory across branches</p>
                </div>

                {/* Low Stock Alert */}
                {lowStockProducts.length > 0 && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-yellow-900">
                                {lowStockProducts.length} product(s) low in stock
                            </p>
                            <p className="text-sm text-yellow-700">Consider restocking these items soon</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Filters</CardTitle>
                            <Button
                                onClick={() => setShowForm(!showForm)}
                                className="bg-primary hover:bg-primary/90 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Product
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
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
                            <div>
                                <label className="text-sm font-medium text-foreground block mb-2">Category</label>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.slice(1).map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="Search by name or product code..."
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
                            <CardTitle>{editingId ? "Edit Product" : "Add New Product"}</CardTitle>
                            <CardDescription>
                                {editingId ? "Update product information" : "Enter details for the new product"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">
                                            Product Code *
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.productCode}
                                            onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                                            placeholder="P-001"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">
                                            Product Name *
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">
                                            Category *
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    category: e.target.value as any,
                                                })
                                            }
                                            className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            required
                                        >
                                            <option value="food">Food</option>
                                            <option value="toy">Toy</option>
                                            <option value="accessory">Accessory</option>
                                            <option value="medication">Medication</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">
                                            Branch *
                                        </label>
                                        <select
                                            value={formData.branchId}
                                            onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                            className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            required
                                        >
                                            <option value="">Select Branch</option>
                                            {branches.map((branch) => (
                                                <option key={branch.id} value={branch.id}>
                                                    {branch.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">
                                            Price ($) *
                                        </label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) =>
                                                setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                                            }
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground block mb-2">
                                            Stock Quantity *
                                        </label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={formData.stock}
                                            onChange={(e) =>
                                                setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground block mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                                        {editingId ? "Update Product" : "Add Product"}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Products Table */}
                <Card className="border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                        No products yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProducts.map((product) => {
                                    const branch = branches.find((b) => b.id === product.branchId);
                                    return (
                                        <TableRow key={product.id} className="hover:bg-gray-50">
                                            <TableCell className="font-mono text-sm">{product.productCode}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{product.name}</p>
                                                    {product.description && (
                                                        <p className="text-xs text-muted-foreground truncate max-w-xs">
                                                            {product.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getCategoryColor(product.category)}>
                                                    {product.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">${product.price.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={
                                                        product.stock <= 10
                                                            ? "text-yellow-600 font-semibold"
                                                            : "text-foreground"
                                                    }
                                                >
                                                    {product.stock}
                                                </span>
                                            </TableCell>
                                            <TableCell>{branch?.name || "N/A"}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(product)}
                                                        className="h-8"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDelete(product.id)}
                                                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </main>
        </AdminLayout>
    );
}
