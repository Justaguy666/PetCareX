import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMedications, useBranches } from "@/hooks/useHospitalData";
import { AlertTriangle, Plus, TrendingDown, TrendingUp, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";

export default function MedicationsPage() {
  const { user } = useAuth();
  const { medications, createMedication, updateMedication, deleteMedication, getLowStockMedications, getExpiredMedications } = useMedications();
  const { branches } = useBranches();
  // Default to admin's branch
  const [selectedBranch, setSelectedBranch] = useState(user?.branchId || "all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    strength: "",
    unit: "",
    manufacturer: "",
    batchNumber: "",
    expiryDate: "",
    quantity: 0,
    reorderLevel: 0,
    price: 0,
    branchId: user?.branchId || "",
  });

  if (!user) {
    return <Navigate to="/login" />;
  }

  const expiredMeds = getExpiredMedications();
  const lowStockMeds = getLowStockMedications();
  const userBranchMeds =
    selectedBranch === "all"
      ? medications
      : medications.filter((m) => m.branchId === selectedBranch);

  const handleEdit = (med: any) => {
    setEditingId(med.id);
    setFormData({
      name: med.name || "",
      description: med.description || "",
      strength: med.strength || "",
      unit: med.unit || "",
      manufacturer: med.manufacturer || "",
      batchNumber: med.batchNumber || "",
      expiryDate: med.expiryDate || "",
      quantity: med.quantity || 0,
      reorderLevel: med.reorderLevel || 0,
      price: med.price || 0,
      branchId: med.branchId || user.branchId || "",
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const medData = {
      ...formData,
      quantity: Number(formData.quantity),
      reorderLevel: Number(formData.reorderLevel),
      price: Number(formData.price),
    };

    if (editingId) {
      updateMedication(editingId, medData);
    } else {
      createMedication(medData);
    }

    setFormData({
      name: "",
      description: "",
      strength: "",
      unit: "",
      manufacturer: "",
      batchNumber: "",
      expiryDate: "",
      quantity: 0,
      reorderLevel: 0,
      price: 0,
      branchId: user.branchId || "",
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      strength: "",
      unit: "",
      manufacturer: "",
      batchNumber: "",
      expiryDate: "",
      quantity: 0,
      reorderLevel: 0,
      price: 0,
      branchId: user.branchId || "",
    });
  };

  const handleDelete = (medId: string) => {
    if (confirm("Are you sure you want to delete this medication?")) {
      deleteMedication(medId);
    }
  };

  const isExpired = (date: string) => {
    return new Date(date) < new Date();
  };

  const isLowStock = (med: any) => med.quantity <= med.reorderLevel;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Medication Inventory</h1>
            <p className="text-muted-foreground">Manage medications, track usage, and monitor stock levels</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        </div>

        {/* Branch Filter */}
        <Card className="p-4 mb-6 border border-border">
          <div className="flex flex-wrap gap-4 items-center">
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
          </div>
        </Card>

        {/* Alerts */}
        <div className="space-y-3 mb-8">
          {expiredMeds.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">{expiredMeds.length} expired medication(s)</p>
                <p className="text-sm text-red-700">These should be removed from inventory</p>
              </div>
            </div>
          )}
          {lowStockMeds.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-900">{lowStockMeds.length} medication(s) low in stock</p>
                <p className="text-sm text-yellow-700">Consider reordering these medications</p>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Medication Form */}
        {showForm && (
          <Card className="p-6 mb-8 border border-border bg-primary/5">
            <h2 className="text-2xl font-bold text-foreground mb-6">{editingId ? "Edit Medication" : "Add New Medication"}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Strength *</label>
                  <input
                    type="text"
                    value={formData.strength}
                    onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                    placeholder="e.g., 250mg"
                    className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Unit *</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., tablet, ml"
                    className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Batch Number</label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Expiry Date *</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Quantity *</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Reorder Level *</label>
                  <input
                    type="number"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Price per Unit *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground block mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                  {editingId ? "Update Medication" : "Add Medication"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Medications Table */}
        <Card className="border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Medication</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Strength</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Quantity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Expiry</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userBranchMeds.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No medications yet
                    </td>
                  </tr>
                ) : (
                  userBranchMeds.map((med) => (
                    <tr key={med.id} className="border-b border-border hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{med.name}</p>
                          <p className="text-xs text-muted-foreground">{med.manufacturer}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground">{med.strength} {med.unit}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isLowStock(med) ? (
                            <TrendingDown className="w-4 h-4 text-yellow-600" />
                          ) : (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          )}
                          <span className="text-foreground">{med.quantity}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={isExpired(med.expiryDate) ? "text-red-600 font-medium" : "text-foreground"}>
                          {new Date(med.expiryDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isExpired(med.expiryDate)
                          ? "bg-red-100 text-red-700"
                          : isLowStock(med)
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                          }`}>
                          {isExpired(med.expiryDate) ? "Expired" : isLowStock(med) ? "Low Stock" : "OK"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-foreground">${med.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(med)}
                            className="h-8"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(med.id)}
                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
