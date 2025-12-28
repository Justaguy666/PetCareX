import Header from "@/components/Header";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getMembershipDisplay, DEFAULT_MEMBERSHIP_LEVEL } from "@/lib/membershipUtils";
import { Star } from "lucide-react";
import { apiGet, apiPut } from "@/api/api";

export default function CustomerProfileEdit() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    if (!user || user.role !== "customer") return <Navigate to="/login" />;

    const [formData, setFormData] = useState({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "", // Local state uses camelCase
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
        citizenId: user.citizenId || "",
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Map frontend camelCase to backend snake_case
            const updatePayload = {
                fullName: formData.fullName,
                phone_number: formData.phone,
                citizen_id: formData.citizenId,
                gender: formData.gender,
                date_of_birth: formData.dateOfBirth,
            };

            const response = await apiPut('/me/profile', updatePayload);
            if (response) {
                await refreshUser();

                toast({
                    title: "Thành công",
                    description: "Thông tin cá nhân đã được cập nhật.",
                });
                navigate("/profile");
            }
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            toast({
                title: "Lỗi",
                description: error.message || "Không thể cập nhật thông tin.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
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
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange("fullName", e.target.value)}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    placeholder="0123456789"
                                />
                            </div>
                            <div>
                                <Label htmlFor="citizenId">Citizen ID</Label>
                                <Input
                                    id="citizenId"
                                    value={formData.citizenId}
                                    onChange={(e) => handleChange("citizenId", e.target.value)}
                                    placeholder="12 digits"
                                    maxLength={12}
                                />
                            </div>
                            <div>
                                <Label htmlFor="gender">Gender</Label>
                                <select
                                    id="gender"
                                    value={formData.gender}
                                    onChange={(e) => handleChange("gender", e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-md"
                                >
                                    <option value="">Select gender</option>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
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

                            {/* Read-only Membership Display */}
                            <div className="bg-muted/50 rounded-lg p-4 border border-border">
                                <div className="flex items-center gap-3">
                                    <Star className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <Label className="text-sm text-muted-foreground">Membership Level (Read-only)</Label>
                                        <p className="font-medium text-lg mt-1">
                                            {getMembershipDisplay(user.membershipLevel || DEFAULT_MEMBERSHIP_LEVEL)}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Membership is automatically upgraded based on your yearly spending
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </Button>
                                <Button variant="outline" onClick={() => navigate("/profile")} disabled={isSaving}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
