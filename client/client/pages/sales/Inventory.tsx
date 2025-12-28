import SalesHeader from "@/components/SalesHeader";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { mockPetItems } from "@/lib/mockData";
import { Edit, Plus, Minus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Inventory() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [products, setProducts] = useState(mockPetItems);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    if (!user || user.role !== "sales") return <Navigate to="/login" />;

    const categories = ["all", "food", "toy", "accessory", "medication"];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.productCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleEditClick = (product: any) => {
        setEditingId(product.id);
        setEditForm({
            name: product.name,
            price: product.price,
            stock: product.stock,
        });
    };

    const handleSaveEdit = (productId: string) => {
        setProducts(products.map(p =>
            p.id === productId ? { ...p, ...editForm } : p
        ));
        setEditingId(null);
        toast({
            title: "Product Updated",
            description: "Product details have been saved successfully.",
        });
    };

    const handleStockAdjust = (productId: string, adjustment: number) => {
        setProducts(products.map(p =>
            p.id === productId ? { ...p, stock: Math.max(0, p.stock + adjustment) } : p
        ));
        toast({
            title: "Stock Adjusted",
            description: `Stock ${adjustment > 0 ? 'increased' : 'decreased'} by ${Math.abs(adjustment)} units.`,
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <SalesHeader />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Inventory Manager</h1>
                    <p className="text-muted-foreground">Manage products, stock levels, and prices</p>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or product code..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {categories.map(cat => (
                                    <Button
                                        key={cat}
                                        variant={categoryFilter === cat ? "default" : "outline"}
                                        onClick={() => setCategoryFilter(cat)}
                                        className="capitalize"
                                    >
                                        {cat}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Products Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Products ({filteredProducts.length})</CardTitle>
                        <CardDescription>View and manage all products in inventory</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price (VND)</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-mono text-sm">{product.productCode}</TableCell>
                                            <TableCell>
                                                {editingId === product.id ? (
                                                    <Input
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        className="w-48"
                                                    />
                                                ) : (
                                                    <div>
                                                        <p className="font-medium">{product.name}</p>
                                                        <p className="text-sm text-muted-foreground">{product.description}</p>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="capitalize">{product.category}</TableCell>
                                            <TableCell>
                                                {editingId === product.id ? (
                                                    <Input
                                                        type="number"
                                                        value={editForm.price}
                                                        onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                                        className="w-32"
                                                    />
                                                ) : (
                                                    product.price.toLocaleString()
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {editingId === product.id ? (
                                                    <Input
                                                        type="number"
                                                        value={editForm.stock}
                                                        onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                                                        className="w-24"
                                                    />
                                                ) : (
                                                    <span className={product.stock < 10 ? "text-red-600 font-semibold" : ""}>
                                                        {product.stock}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {product.stock < 5 ? (
                                                    <Badge variant="destructive">Critical</Badge>
                                                ) : product.stock < 10 ? (
                                                    <Badge className="bg-orange-500">Low Stock</Badge>
                                                ) : (
                                                    <Badge variant="default" className="bg-green-600">In Stock</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {editingId === product.id ? (
                                                    <div className="flex gap-2">
                                                        <Button size="sm" onClick={() => handleSaveEdit(product.id)}>
                                                            Save
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => handleEditClick(product)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => handleStockAdjust(product.id, 5)}>
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => handleStockAdjust(product.id, -5)}>
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
