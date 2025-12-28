import AdminLayout from "@/components/AdminLayout";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useBranches } from "@/hooks/useHospitalData";

export default function AdminProfileEdit() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { getBranch } = useBranches();

    if (!user || user.role !== "admin") return <Navigate to="/login" />;

    const userBranch = user.branchId ? getBranch(user.branchId) : null;

    const [formData, setFormData] = useState({
        fullName: user.fullName,
        phone: (user as any).phone || user.phone || "",
        gender: (user as any).gender || "",
        dateOfBirth: (user as any).dateOfBirth || "",
        startDate: (user as any).startDate || "",
        baseSalary: (user as any).baseSalary || "",
    });

    const handleChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSave = () => {
        // Validate required fields
        if (!formData.fullName.trim()) {
            toast({
                title: "Validation Error",
                description: "Full name is required.",
                variant: "destructive",
            });
            return;
        }

        // Update user data - keep branchId unchanged
        const updatedUser = {
            ...user,
            fullName: formData.fullName,
            phone: formData.phone,
            gender: formData.gender,
            dateOfBirth: formData.dateOfBirth,
            startDate: formData.startDate,
            baseSalary: formData.baseSalary,
            // branchId remains unchanged - admin cannot switch branches
        };

        // Update localStorage directly
        localStorage.setItem("petcare_user", JSON.stringify(updatedUser));

        // Update auth context
        login(updatedUser.email, user.password || "admin123");

        toast({
            title: "Profile Updated",
            description: "Your profile has been updated successfully.",
        });

        navigate("/admin/profile");
    };

    return (
        <AdminLayout>
            <main className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
                    <p className="text-muted-foreground">Update your profile information</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Make changes to your profile details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="fullName">Full Name *</Label>
                                <Input
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange("fullName", e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    placeholder="(555) 123-4567"
                                />
                            </div>

                            <div>
                                <Label htmlFor="gender">Gender</Label>
                                <select
                                    id="gender"
                                    value={formData.gender}
                                    onChange={(e) => handleChange("gender", e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => handleChange("startDate", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="baseSalary">Base Salary (VND)</Label>
                                <Input
                                    id="baseSalary"
                                    type="number"
                                    value={formData.baseSalary}
                                    onChange={(e) => handleChange("baseSalary", e.target.value)}
                                    placeholder="25000000"
                                />
                            </div>

                            <div>
                                <Label htmlFor="employeeId">Employee ID</Label>
                                <Input
                                    id="employeeId"
                                    value={(user as any).employeeId || "NV" + user.id.slice(-3).padStart(3, "0")}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <div>
                                <Label htmlFor="position">Position</Label>
                                <Input
                                    id="position"
                                    value="Branch Manager"
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <div>
                                <Label htmlFor="branchId">Branch ID (Cannot be changed)</Label>
                                <Input
                                    id="branchId"
                                    value={userBranch ? `${userBranch.id} - ${userBranch.name}` : "No branch assigned"}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button onClick={handleSave}>Save Changes</Button>
                                <Button variant="outline" onClick={() => navigate("/admin/profile")}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </AdminLayout>
    );
}
