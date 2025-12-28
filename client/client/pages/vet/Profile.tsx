import VetHeader from "@/components/VetHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { User, Calendar, Briefcase, MapPin, DollarSign } from "lucide-react";

export default function VetProfile() {
    const { user } = useAuth();

    if (!user || user.role !== 'veterinarian') return <Navigate to="/login" />;

    // Use data from auth context (fetched from /auth/me)
    const profile = {
        id: (user as any).id || '',
        fullName: user.fullName || (user as any).full_name || '',
        gender: (user as any).gender || '',
        dateOfBirth: (user as any).date_of_birth || (user as any).dateOfBirth || '',
        branchName: (user as any).branch_name || (user as any).branchName || '',
        baseSalary: (user as any).base_salary || (user as any).baseSalary || 0,
    };

    return (
        <div className="min-h-screen bg-background">
            <VetHeader />
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">My Profile</h1>
                    <p className="text-muted-foreground">View your profile information</p>
                </div>

                {/* Personal Information */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Full Name</p>
                                    <p className="font-medium">{profile.fullName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Gender</p>
                                    <p className="font-medium">{profile.gender}</p>
                                </div>
                            </div>
                            {profile.dateOfBirth && (
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                                        <p className="font-medium">{new Date(profile.dateOfBirth).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Briefcase className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Role</p>
                                    <p className="font-medium">Veterinarian</p>
                                </div>
                            </div>
                            {profile.branchName && (
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Branch</p>
                                        <p className="font-medium">{profile.branchName}</p>
                                    </div>
                                </div>
                            )}
                            {profile.baseSalary > 0 && (
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Base Salary</p>
                                        <p className="font-medium">{Number(profile.baseSalary).toLocaleString()} VND</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
