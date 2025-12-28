import AdminLayout from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAppointments,
  usePets,
  useUsers,
  useBranches,
} from "@/hooks/useHospitalData";
import { Calendar, Clock, User, Edit, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { AppointmentStatus } from "@shared/types";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { appointments, updateAppointment, deleteAppointment, assignVeterinarian } = useAppointments();
  const { getPet } = usePets();
  const { getUser, users } = useUsers();
  const { getBranch, branches } = useBranches();
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    appointmentDate: "",
    appointmentTime: "",
    reasonForVisit: "",
    status: "pending" as AppointmentStatus,
    veterinarianId: "",
  });

  if (!user) {
    return <Navigate to="/login" />;
  }

  const filteredAppointments =
    selectedBranch === "all"
      ? appointments
      : appointments.filter((a) => a.branchId === selectedBranch);

  const veterinarians = users.filter((u) => u.role === "veterinarian");

  const handleEdit = (apt: any) => {
    setEditingId(apt.id);
    setEditForm({
      appointmentDate: apt.appointmentDate,
      appointmentTime: apt.appointmentTime,
      reasonForVisit: apt.reasonForVisit,
      status: apt.status,
      veterinarianId: apt.veterinarianId || "",
    });
  };

  const handleSaveEdit = (aptId: string) => {
    updateAppointment(aptId, editForm);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (aptId: string) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      deleteAppointment(aptId);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-green-100 text-green-700",
      completed: "bg-blue-100 text-blue-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return styles[status] || styles.pending;
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Appointments</h1>
            <p className="text-muted-foreground">Manage and assign veterinarians to appointments</p>
          </div>
        </div>

        {/* Filters */}
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

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card className="p-12 text-center border border-border">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Appointments</h3>
              <p className="text-muted-foreground">
                No appointments found for the selected filters.
              </p>
            </Card>
          ) : (
            filteredAppointments.map((apt) => {
              const pet = getPet(apt.petId);
              const vet = apt.veterinarianId ? getUser(apt.veterinarianId) : null;
              const branch = getBranch(apt.branchId);

              return (
                <Card key={apt.id} className="p-6 border border-border hover:shadow-md transition-shadow">
                  {editingId === apt.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-foreground block mb-2">
                            Date
                          </label>
                          <input
                            type="date"
                            value={editForm.appointmentDate}
                            onChange={(e) =>
                              setEditForm({ ...editForm, appointmentDate: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground block mb-2">
                            Time
                          </label>
                          <input
                            type="time"
                            value={editForm.appointmentTime}
                            onChange={(e) =>
                              setEditForm({ ...editForm, appointmentTime: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground block mb-2">
                            Status
                          </label>
                          <select
                            value={editForm.status}
                            onChange={(e) =>
                              setEditForm({ ...editForm, status: e.target.value as AppointmentStatus })
                            }
                            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="pending">Pending</option>
                            <option value="checked-in">Checked-In</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground block mb-2">
                            Veterinarian
                          </label>
                          <select
                            value={editForm.veterinarianId}
                            onChange={(e) =>
                              setEditForm({ ...editForm, veterinarianId: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">Not assigned</option>
                            {veterinarians.map((vet) => (
                              <option key={vet.id} value={vet.id}>
                                {vet.fullName} - {vet.specialization}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground block mb-2">
                          Reason for Visit
                        </label>
                        <textarea
                          value={editForm.reasonForVisit}
                          onChange={(e) =>
                            setEditForm({ ...editForm, reasonForVisit: e.target.value })
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(apt.id)}
                          className="bg-primary hover:bg-primary/90 text-white"
                        >
                          Save Changes
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              {pet?.name} - {pet?.type}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {apt.reasonForVisit}
                            </p>

                            <div className="flex flex-wrap gap-4 mt-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{new Date(apt.appointmentDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{apt.appointmentTime}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span>{branch?.name}</span>
                              </div>
                            </div>

                            {vet && (
                              <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                                <p className="text-blue-900">
                                  <strong>Assigned to:</strong> {vet.fullName}
                                  {vet.specialization && ` - ${vet.specialization}`}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 min-w-max">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(apt.status)}`}
                        >
                          {apt.status}
                        </span>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(apt)}
                          className="text-xs"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive text-xs"
                          onClick={() => handleDelete(apt.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
