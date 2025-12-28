import SalesHeader from "@/components/SalesHeader";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Calendar, MapPin, Briefcase, DollarSign } from "lucide-react";

export default function Profile() {
    const { user } = useAuth();

    if (!user || user.role !== "sales") return <Navigate to="/login" />;

    const profileData = {
        employeeId: "EMP-" + user.id.slice(-4),
        name: user.fullName,
        email: user.email,
        phone: user.phone || "(555) 111-0004",
        gender: "Male",
        dateOfBirth: "1990-05-15",
        startDate: "2022-01-15",
        position: "Sales Staff",
        branch: "Downtown Pet Hospital",
        salary: "15,000,000 VND",
        transferHistory: [
            { date: "2022-01-15", branch: "Downtown Pet Hospital", position: "Sales Staff" }
        ]
    };

    return (
        <div className="min-h-screen bg-background">
            <SalesHeader />
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
                        <p className="text-muted-foreground">View and manage your profile information</p>
                    </div>
                    <Link to="/sales/profile-edit">
                        <Button>Edit Profile</Button>
                    </Link>
                </div>

                {/* Profile Card */}
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
                                    <p className="font-medium">{profileData.employeeId}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Full Name</p>
                                    <p className="font-medium">{profileData.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{profileData.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{profileData.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Gender</p>
                                    <p className="font-medium">{profileData.gender}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                                    <p className="font-medium">{new Date(profileData.dateOfBirth).toLocaleDateString()}</p>
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
                                    <p className="font-medium">{new Date(profileData.startDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Briefcase className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Position</p>
                                    <p className="font-medium">{profileData.position}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Branch</p>
                                    <p className="font-medium">{profileData.branch}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Salary</p>
                                    <p className="font-medium">{profileData.salary}</p>
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
                        <div className="space-y-3">
                            {profileData.transferHistory.map((transfer, index) => (
                                <div key={index} className="flex items-center gap-4 border-b pb-3 last:border-b-0">
                                    <div className="flex-1">
                                        <p className="font-medium">{transfer.branch}</p>
                                        <p className="text-sm text-muted-foreground">{transfer.position}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">{new Date(transfer.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
