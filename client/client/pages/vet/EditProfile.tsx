import VetHeader from "@/components/VetHeader";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function VetEditProfile() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    if (!user || user.role !== 'veterinarian') return <Navigate to="/login" />;

    const [formData, setFormData] = useState({
        fullName: user.fullName || 'Dr. Anna Smith',
        phone: (user as any).phone || '(555) 111-0001',
        gender: (user as any).gender || 'Female',
        dateOfBirth: (user as any).dob || '1985-06-12',
        specialization: (user as any).specialization || 'Small Animal Surgery',
    });

    const handleChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSave = () => {
        // Update user data (in real app, this would update database)
        const updatedUser = {
            ...user,
            fullName: formData.fullName,
            phone: formData.phone,
            dob: formData.dateOfBirth,
            gender: formData.gender,
            specialization: formData.specialization,
        };

        // Update localStorage directly
        localStorage.setItem('petcare_user', JSON.stringify(updatedUser));

        // Update auth context by re-logging in
        login(user.email, user.password || 'vet123');

        toast({
            title: 'Profile Updated',
            description: 'Your profile has been updated successfully.',
        });

        navigate('/vet/profile');
    };

    return (
        <div className="min-h-screen bg-background">
            <VetHeader />
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
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="gender">Gender</Label>
                                <Input
                                    id="gender"
                                    value={formData.gender}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="specialization">Specialization</Label>
                                <Input
                                    id="specialization"
                                    value={formData.specialization}
                                    onChange={(e) => handleChange('specialization', e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button onClick={handleSave}>Save Changes</Button>
                                <Button variant="outline" onClick={() => navigate('/vet/profile')}>
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
