import VetHeader from "@/components/VetHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Calendar, Briefcase, MapPin, DollarSign, PawPrint } from "lucide-react";

export default function VetProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user || user.role !== 'veterinarian') return <Navigate to="/login" />;

    // Read profile from user object
    const profile = {
        staffId: (user as any).staffId || 'VET-1001',
        fullName: user.fullName || 'Dr. Anna Smith',
        email: user.email || 'anna.smith@hospital.com',
        phone: (user as any).phone || '(555) 111-0001',
        dob: (user as any).dob || '1985-06-12',
        gender: (user as any).gender || 'Female',
        startDate: (user as any).startDate || '2020-04-01',
        specialization: (user as any).specialization || 'Small Animal Surgery',
        branchId: user.branchId || 'Downtown Branch',
        baseSalary: (user as any).baseSalary || '60000',
        transferHistory: (user as any).transferHistory || [],
    };

    return (
        <div className="min-h-screen bg-background">
            <VetHeader />
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
                        <p className="text-muted-foreground">View and manage your profile information</p>
                    </div>
                    <Button onClick={() => navigate('/vet/profile-edit')}>Edit Profile</Button>
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
                                    <p className="text-sm text-muted-foreground">Employee ID</p>
                                    <p className="font-medium">{profile.staffId}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Full Name</p>
                                    <p className="font-medium">{profile.fullName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{profile.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{profile.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Gender</p>
                                    <p className="font-medium">{profile.gender}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                                    <p className="font-medium">{new Date(profile.dob).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Employment Details */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Employment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Start Date</p>
                                    <p className="font-medium">{new Date(profile.startDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Briefcase className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Position</p>
                                    <p className="font-medium">Veterinarian</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <PawPrint className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Specialization</p>
                                    <p className="font-medium">{profile.specialization}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Branch</p>
                                    <p className="font-medium">{profile.branchId}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Salary</p>
                                    <p className="font-medium">${parseInt(profile.baseSalary).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transfer History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transfer History</CardTitle>
                        <CardDescription>Record of branch transfers and position changes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {profile.transferHistory && profile.transferHistory.length > 0 ? (
                            <div className="space-y-3">
                                {profile.transferHistory.map((transfer: any, index: number) => (
                                    <div key={index} className="flex items-center gap-4 border-b pb-3 last:border-b-0">
                                        <div className="flex-1">
                                            <p className="font-medium">{transfer.fromBranch} → {transfer.toBranch}</p>
                                            <p className="text-sm text-muted-foreground">{transfer.position || 'Veterinarian'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">{new Date(transfer.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No transfer history</p>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
