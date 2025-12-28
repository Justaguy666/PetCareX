import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers, useBranches } from "@/hooks/useHospitalData";
import { useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { User, UserRole } from "@shared/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2 } from "lucide-react";

const EMPTY_FORM_DATA = {
  fullName: "",
  email: "",
  password: "staff123",
  role: "receptionist" as UserRole,
  branchId: "",
  specialization: "",
  licenseNumber: "",
  phone: "",
};

export default function StaffPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    users,
    loading: usersLoading,
    error: usersError,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers();
  const {
    branches,
    loading: branchesLoading,
    error: branchesError,
  } = useBranches();

  const [selectedBranch, setSelectedBranch] = useState(user?.branchId || "all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM_DATA);

  const filteredStaff = useMemo(() => {
    if (selectedBranch === "all") {
      return users.filter((u) => u.role !== "customer");
    }
    return users.filter((u) => u.branchId === selectedBranch && u.role !== "customer");
  }, [users, selectedBranch]);

  const handleEdit = (staff: User) => {
    setEditingId(staff.id);
    setFormData({
      fullName: staff.fullName,
      email: staff.email,
      password: "", // Do not show existing password
      role: staff.role,
      branchId: staff.branchId || "",
      specialization: staff.specialization || "",
      licenseNumber: staff.licenseNumber || "",
      phone: staff.phone || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      await deleteUser(id);
      toast({ title: "Success", description: "Staff member deleted." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateUser(editingId, { ...formData, password: formData.password || undefined });
        toast({ title: "Success", description: "Staff member updated." });
      } else {
        await createUser(formData);
        toast({ title: "Success", description: "Staff member created." });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(EMPTY_FORM_DATA);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" />;
  }

  const loading = usersLoading || branchesLoading;
  const error = usersError || branchesError;

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">Loading staff and branches...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 text-destructive">Error: {error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage all staff members across all branches.</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <label>Filter by Branch:</label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.branch_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ ...EMPTY_FORM_DATA, branchId: user?.branchId || "" });
          }}>Add New Staff</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((staff) => (
            <Card key={staff.id} className="p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg">{staff.fullName}</h3>
                <p className="text-sm text-muted-foreground capitalize">{staff.role}</p>
                <p className="text-sm">{staff.email}</p>
                <p className="text-sm">
                  Branch: {branches.find((b) => b.id === staff.branchId)?.branch_name || "N/A"}
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(staff)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(staff.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingId ? "Edit Staff Member" : "Add New Staff Member"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                {!editingId && (
                  <Input
                    type="password"
                    placeholder="Password (default: staff123)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                )}
                <div className="grid grid-cols-2 gap-4">
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receptionist">Receptionist</SelectItem>
                      <SelectItem value="veterinarian">Veterinarian</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={formData.branchId} onValueChange={(value) => setFormData({ ...formData, branchId: value })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.branch_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.role === "veterinarian" && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Specialization"
                      value={formData.specialization}
                      onChange={(e) =>
                        setFormData({ ...formData, specialization: e.target.value })
                      }
                    />
                    <Input
                      placeholder="License Number"
                      value={formData.licenseNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, licenseNumber: e.target.value })
                      }
                    />
                            )}
                          </div>
                          <div className="flex gap-6 mt-3 text-sm text-muted-foreground">
                            {member.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {member.email}
                              </div>
                            )}
                            {member.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {member.phone}
                              </div>
                            )}
                          </div>
                          {member.role === "veterinarian" && member.specialization && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                              Specialization: {member.specialization}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditStaff(member)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm(`Delete ${member.fullName}?`)) {
                            deleteUser(member.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
