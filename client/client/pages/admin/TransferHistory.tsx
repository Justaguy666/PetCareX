import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, History, ArrowRight } from "lucide-react";
import { StaffTransfer, User, Branch } from "@shared/types";

export default function TransferHistoryPage() {
    const { user } = useAuth();
    const [transfers, setTransfers] = useState<StaffTransfer[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        staffId: "",
        fromBranchId: "",
        toBranchId: "",
        transferDate: "",
        reason: "",
        notes: "",
    });

    if (!user || user.role !== "admin") {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        loadTransfers();
        loadUsers();
        loadBranches();
    }, []);

    const loadTransfers = () => {
        const stored = localStorage.getItem("petcare_staff_transfers");
        if (stored) {
            setTransfers(JSON.parse(stored));
        }
    };

    const loadUsers = () => {
        const stored = localStorage.getItem("petcare_users");
        if (stored) {
            setUsers(JSON.parse(stored).filter((u: User) => u.role !== "customer" && u.role !== "admin"));
        }
    };

    const loadBranches = () => {
        const stored = localStorage.getItem("petcare_branches");
        if (stored) {
            setBranches(JSON.parse(stored));
        }
    };

    const handleOpenDialog = () => {
        setFormData({
            staffId: "",
            fromBranchId: "",
            toBranchId: "",
            transferDate: "",
            reason: "",
            notes: "",
        });
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
    };

    const handleSubmit = () => {
        if (!formData.staffId || !formData.fromBranchId || !formData.toBranchId) {
            alert("Please fill in all required fields");
            return;
        }
        if (formData.fromBranchId === formData.toBranchId) {
            alert("From and To branches must be different");
            return;
        }
        if (!formData.transferDate) {
            alert("Please select transfer date");
            return;
        }
        if (!formData.reason.trim()) {
            alert("Please provide transfer reason");
            return;
        }

        const newTransfer: StaffTransfer = {
            id: `transfer-${Date.now()}`,
            staffId: formData.staffId,
            fromBranchId: formData.fromBranchId,
            toBranchId: formData.toBranchId,
            transferDate: formData.transferDate,
            reason: formData.reason.trim(),
            approvedBy: user.id,
            notes: formData.notes.trim(),
            createdAt: new Date().toISOString(),
        };

        const updated = [newTransfer, ...transfers];
        localStorage.setItem("petcare_staff_transfers", JSON.stringify(updated));

        // Update staff member's branchId
        const updatedUsers = users.map(u =>
            u.id === formData.staffId ? { ...u, branchId: formData.toBranchId } : u
        );
        const allUsers = JSON.parse(localStorage.getItem("petcare_users") || "[]");
        const finalUsers = allUsers.map((u: User) => {
            const updated = updatedUsers.find(uu => uu.id === u.id);
            return updated || u;
        });
        localStorage.setItem("petcare_users", JSON.stringify(finalUsers));

        setTransfers(updated);
        setUsers(updatedUsers);
        handleCloseDialog();
    };

    const getStaffName = (staffId: string) => {
        return users.find(u => u.id === staffId)?.fullName || staffId;
    };

    const getBranchName = (branchId: string) => {
        return branches.find(b => b.id === branchId)?.name || branchId;
    };

    const getApproverName = (approverId: string) => {
        const allUsers = JSON.parse(localStorage.getItem("petcare_users") || "[]");
        return allUsers.find((u: User) => u.id === approverId)?.fullName || "Admin";
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Staff Transfer History</h1>
                    <p className="text-muted-foreground">
                        Track staff transfers between branches
                    </p>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <Badge variant="outline" className="text-sm">
                        Total: {transfers.length}
                    </Badge>
                    <Button onClick={handleOpenDialog} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Record Transfer
                    </Button>
                </div>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transfer Date</TableHead>
                                <TableHead>Staff Member</TableHead>
                                <TableHead>Transfer Route</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Approved By</TableHead>
                                <TableHead>Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transfers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        No transfer records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transfers.map((transfer) => (
                                    <TableRow key={transfer.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <History className="w-4 h-4 text-primary" />
                                                {transfer.transferDate}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{getStaffName(transfer.staffId)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{getBranchName(transfer.fromBranchId)}</Badge>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                                <Badge variant="default">{getBranchName(transfer.toBranchId)}</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">{transfer.reason}</TableCell>
                                        <TableCell className="text-muted-foreground">{getApproverName(transfer.approvedBy)}</TableCell>
                                        <TableCell className="text-muted-foreground max-w-xs truncate">
                                            {transfer.notes || "—"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Record Staff Transfer</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Staff Member *</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-md"
                                    value={formData.staffId}
                                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                                >
                                    <option value="">Select staff member</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.fullName} ({u.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">From Branch *</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-md"
                                        value={formData.fromBranchId}
                                        onChange={(e) => setFormData({ ...formData, fromBranchId: e.target.value })}
                                    >
                                        <option value="">Select branch</option>
                                        {branches.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">To Branch *</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-md"
                                        value={formData.toBranchId}
                                        onChange={(e) => setFormData({ ...formData, toBranchId: e.target.value })}
                                    >
                                        <option value="">Select branch</option>
                                        {branches.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Transfer Date *</label>
                                <Input
                                    type="date"
                                    value={formData.transferDate}
                                    onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Reason *</label>
                                <Textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    placeholder="e.g., Branch consolidation, staff requested transfer"
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Additional Notes</label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Optional notes"
                                    rows={2}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit}>Record Transfer</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
