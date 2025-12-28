import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useBranches, useUsers } from "@/hooks/useHospitalData";
import { Navigate, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Calendar, Briefcase, MapPin, DollarSign, Building2, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { branches, getBranch } = useBranches();
    const { users, getUsersByBranch } = useUsers();

    if (!user || user.role !== "admin") return <Navigate to="/login" />;

    // Get branch from user's branchId
    // If user doesn't have branchId, default to first branch as fallback
    const userBranchId = user.branchId || (branches.length > 0 ? branches[0].id : null);
    const userBranch = userBranchId ? getBranch(userBranchId) : null;
    const branchStaff = userBranchId ? getUsersByBranch(userBranchId).filter(u => u.role !== "admin") : [];

    // Read profile from user object with proper defaults
    const profile = {
        employeeId: (user as any).employeeId || "NV" + user.id.slice(-3).padStart(3, "0"),
        fullName: user.fullName,
        email: user.email,
        phone: (user as any).phone || user.phone || "Not set",
        gender: (user as any).gender || "Not set",
        dateOfBirth: (user as any).dateOfBirth || "Not set",
        startDate: (user as any).startDate || "2020-01-01",
        baseSalary: (user as any).baseSalary || "25000000",
        position: "Branch Manager",
        transferHistory: (user as any).transferHistory || [],
    }; const formatDate = (dateString: string) => {
        if (dateString === "Not set") return dateString;
        return new Date(dateString).toLocaleDateString();
    };

    const getOpeningTime = () => {
        if (!userBranch?.workingHours) return "N/A";
        // Get first available day's opening time
        for (const day of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
            const hours = userBranch.workingHours[day as keyof typeof userBranch.workingHours];
            if (hours?.start) return hours.start;
        }
        return "N/A";
    };

    const getClosingTime = () => {
        if (!userBranch?.workingHours) return "N/A";
        // Get first available day's closing time
        for (const day of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
            const hours = userBranch.workingHours[day as keyof typeof userBranch.workingHours];
            if (hours?.end) return hours.end;
        }
        return "N/A";
    };

    return (
        <AdminLayout>
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
                        <p className="text-muted-foreground">View and manage your profile information</p>
                    </div>
                    <Button onClick={() => navigate("/admin/profile-edit")}>Edit Profile</Button>
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
                                    <p className="font-medium">{profile.employeeId}</p>
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
                                    <p className="font-medium">{formatDate(profile.dateOfBirth)}</p>
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
                                    <p className="font-medium">{formatDate(profile.startDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Briefcase className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Position</p>
                                    <p className="font-medium">{profile.position}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Base Salary</p>
                                    <p className="font-medium">{parseInt(profile.baseSalary).toLocaleString()} VND</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Branch Information */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Branch Information</CardTitle>
                        <CardDescription>Details about the branch you manage (read-only)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {userBranch ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Branch ID</p>
                                            <p className="font-medium">{userBranch.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Branch Name</p>
                                            <p className="font-medium">{userBranch.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Address</p>
                                            <p className="font-medium">{userBranch.address}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {userBranch.city}, {userBranch.state} {userBranch.zipCode}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Phone Number</p>
                                            <p className="font-medium">{userBranch.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Opening Time</p>
                                            <p className="font-medium">{getOpeningTime()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Closing Time</p>
                                            <p className="font-medium">{getClosingTime()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No branch assigned</p>
                        )}
                    </CardContent>
                </Card>

                {/* Branch Overview */}
                {userBranch && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Branch Overview</CardTitle>
                            <CardDescription>Statistics for your branch</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        <p className="text-sm text-muted-foreground">Total Staff</p>
                                    </div>
                                    <p className="text-2xl font-bold">{branchStaff.length}</p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="h-5 w-5 text-green-600" />
                                        <p className="text-sm text-muted-foreground">Services</p>
                                    </div>
                                    <p className="text-2xl font-bold">{userBranch.services?.length || 0}</p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Mail className="h-5 w-5 text-orange-600" />
                                        <p className="text-sm text-muted-foreground">Branch Email</p>
                                    </div>
                                    <p className="text-sm font-medium truncate">{userBranch.email}</p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="h-5 w-5 text-purple-600" />
                                        <p className="text-sm text-muted-foreground">Location</p>
                                    </div>
                                    <p className="text-sm font-medium">{userBranch.city}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Staff in This Branch */}
                {userBranch && branchStaff.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Staff in This Branch</CardTitle>
                            <CardDescription>Employees assigned to {userBranch.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {branchStaff.map((staff) => (
                                        <TableRow key={staff.id}>
                                            <TableCell className="font-mono text-sm">{staff.id.slice(-4)}</TableCell>
                                            <TableCell className="font-medium">{staff.fullName}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {staff.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{staff.email}</TableCell>
                                            <TableCell>{staff.phone || "N/A"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

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
                                            <p className="font-medium">
                                                {transfer.fromBranch} → {transfer.toBranch}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{transfer.position || "Branch Manager"}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{formatDate(transfer.startDate)}</p>
                                            {transfer.endDate && (
                                                <p className="text-sm text-muted-foreground">to {formatDate(transfer.endDate)}</p>
                                            )}
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
        </AdminLayout>
    );
}
