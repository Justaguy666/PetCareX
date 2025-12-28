import { Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Pet, Appointment, Vaccine, VaccinePackage, Branch } from "@shared/types";
import {
  Calendar, Stethoscope, Syringe, Package, Eye, X,
  Clock, User, Phone, CheckCircle, AlertCircle, Edit, Trash2,
  MapPin, Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost, apiPut, apiDelete } from "@/api/api";

export default function Appointments() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Data states
  const [pets, setPets] = useState<Pet[]>([]);
  const [vets, setVets] = useState<any[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [packages, setPackages] = useState<VaccinePackage[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPackageDetails, setSelectedPackageDetails] = useState<VaccinePackage | null>(null);

  // Form states
  const [examForm, setExamForm] = useState({ petId: "", branchId: "", doctorId: "", date: "", time: "", reason: "" });
  const [singleDoseForm, setSingleDoseForm] = useState({ petId: "", branchId: "", vaccineId: "", doctorId: "", date: "", time: "", reason: "" });
  const [packageForm, setPackageForm] = useState({ petId: "", branchId: "", packageId: "", doctorId: "", date: "", time: "", reason: "" });

  // Modals
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: "", time: "", reason: "" });
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [aptToCancel, setAptToCancel] = useState<Appointment | null>(null);

  // Filter, Search, Sort, Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "mine";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeSubTab, setActiveSubTab] = useState(queryParams.get("sub") || "exam");

  useEffect(() => {
    const tab = queryParams.get("tab");
    const sub = queryParams.get("sub");
    if (tab) setActiveTab(tab);
    if (sub) setActiveSubTab(sub);
  }, [location.search]);

  if (!user) {
    return <Navigate to="/login?redirect=/appointments" replace />;
  }

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [petsResp, appsResp, branchesResp, vaccinesResp, packagesResp] = await Promise.all([
        apiGet('/me/pets'),
        apiGet('/appointments'),
        apiGet('/branch'),
        apiGet('/catalog/vaccines'),
        apiGet('/catalog/vaccine-packages')
      ]);

      setPets(petsResp?.data || []);
      setBranches(branchesResp?.data || []);
      setVaccines(vaccinesResp?.data || []);
      setPackages(packagesResp?.data || []);
      setVets([]); // Doctors loaded after branch selection

      const sortedApps = (appsResp?.data || []).sort((a: any, b: any) =>
        new Date(b.appointment_time).getTime() - new Date(a.appointment_time).getTime()
      );
      setAppointments(sortedApps);

    } catch (error) {
      console.error("Load failed:", error);
      toast({ title: "Error", description: "Failed to sync with clinical data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctorsByBranch = async (branchId: string) => {
    if (!branchId) {
      setVets([]);
      return;
    }
    try {
      const resp = await apiGet(`/catalog/doctors?branchId=${branchId}`);
      setVets(resp?.data || []);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      setVets([]);
    }
  };

  const generateTimeSlots = (branchId: string) => {
    if (!branchId) return [];
    const branch = branches.find(b => String(b.id) === String(branchId));
    if (!branch) return [];

    const slots: string[] = [];
    // opening_at and closing_at are in format "HH:mm:ss" or "HH:mm"
    const openingH = parseInt(String(branch.opening_at || '08').split(':')[0]);
    const closingH = parseInt(String(branch.closing_at || '20').split(':')[0]);

    for (let h = openingH; h < closingH; h++) {
      slots.push(`${String(h).padStart(2, "0")}:00`);
      slots.push(`${String(h).padStart(2, "0")}:30`);
    }
    return slots;
  };

    const handleBooking = async (formData: any, serviceType: string) => {
    if (!formData.petId || !formData.branchId || !formData.doctorId || !formData.date || !formData.time) {
      toast({ title: "Incomplete", description: "Please complete all required fields.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const appointment_time = new Date(`${formData.date}T${formData.time}:00`).toISOString();
      await apiPost('/appointments', {
        owner_id: Number(user.id),
        pet_id: Number(formData.petId),
        branch_id: Number(formData.branchId),
        doctor_id: Number(formData.doctorId),
        appointment_time,
        service_type: serviceType,
        reason: formData.reason
      });
      toast({ title: "Success!", description: "Appointment confirmed. See you soon!" });
      loadData();
      return true;
    } catch (error: any) {
      toast({ title: "Booking Error", description: error.message || "Something went wrong.", variant: "destructive" });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!aptToCancel) return;
    try {
      await apiDelete(`/appointments/${aptToCancel.id}`);
      toast({ title: "Cancelled", description: "Appointment has been successfully cancelled." });
      setCancelModalOpen(false);
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to cancel.", variant: "destructive" });
    }
  };

  const handleReschedule = async () => {
    if (!selectedApt || !rescheduleForm.date || !rescheduleForm.time) return;
    try {
      const appointment_time = new Date(`${rescheduleForm.date}T${rescheduleForm.time}:00`).toISOString();
      await apiPut(`/appointments/${selectedApt.id}`, { appointment_time, reason: rescheduleForm.reason });
      toast({ title: "Updated", description: "New appointment time is confirmed." });
      setRescheduleModalOpen(false);
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Reschedule failed.", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('chờ') || s.includes('pending')) return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
    if (s.includes('xác nhận') || s.includes('confirmed')) return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Confirmed</Badge>;
    if (s.includes('hoàn thành') || s.includes('completed')) return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Completed</Badge>;
    if (s.includes('hủy') || s.includes('cancelled')) return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Cancelled</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  // Filtered, sorted, paginated appointments
  const matchStatus = (aptStatus: string, filter: string) => {
    const s = aptStatus?.toLowerCase() || "";
    if (filter === "all") return true;
    if (filter === "pending") return s.includes("chờ") && !s.includes("đã xác nhận");
    if (filter === "confirmed") return s.includes("đã xác nhận");
    if (filter === "completed") return s.includes("hoàn thành");
    if (filter === "cancelled") return s.includes("hủy");
    return true;
  };

  const filteredAppointments = appointments
    .filter(apt => {
      const matchesSearch = searchTerm === "" || 
        apt.pet_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.branch_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.service_type?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = matchStatus(apt.status, statusFilter);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.appointment_time).getTime();
      const dateB = new Date(b.appointment_time).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = filteredAppointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">PetCareX Appointments</h1>
            <p className="text-slate-500 text-lg mt-2">Professional care for your beloved companion.</p>
          </div>
          <div className="flex gap-4">
            <div className="px-6 py-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><Calendar className="w-6 h-6" /></div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled</div>
                <div className="text-2xl font-black text-slate-900">{appointments.filter(a => !['Hủy bỏ', 'Hoàn thành'].includes(a.status)).length}</div>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <div className="flex justify-center">
            <TabsList className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 h-auto">
              <TabsTrigger value="mine" className="px-10 py-2.5 rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold transition-all">My History</TabsTrigger>
              <TabsTrigger value="book" className="px-10 py-2.5 rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold transition-all">New Booking</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="mine" className="mt-0">
            <Card className="bg-white border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-xl font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-600" /> Appointment Timeline</CardTitle>
                <CardDescription>Keep track of your companion's clinical visits.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold text-slate-500">Syncing with medical database...</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                      <Calendar className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No appointments yet</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mt-2">Start providing the best care for your pet by scheduling a check-up.</p>
                    <Button variant="outline" className="mt-8 rounded-xl px-8 h-12 font-bold hover:bg-slate-900 hover:text-white transition-all" onClick={() => setActiveTab("book")}>Book Now</Button>
                  </div>
                ) : (
                  <>
                    {/* Filter, Search, Sort Controls */}
                    <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center">
                      <Input 
                        placeholder="Search pet, doctor, branch..." 
                        className="w-64 h-10 rounded-lg" 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                      />
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40 h-10 rounded-lg">
                          <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" className="h-10 rounded-lg" onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}>
                        Sort: {sortOrder === "desc" ? "Newest" : "Oldest"}
                      </Button>
                      <span className="text-sm text-slate-500 ml-auto">{filteredAppointments.length} result(s)</span>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/80">
                            <TableHead className="py-5 px-6 font-bold text-slate-700">Service & ID</TableHead>
                            <TableHead className="font-bold text-slate-700">Companion</TableHead>
                            <TableHead className="font-bold text-slate-700">Location</TableHead>
                            <TableHead className="font-bold text-slate-700">Schedule</TableHead>
                            <TableHead className="font-bold text-slate-700">Specialist</TableHead>
                            <TableHead className="font-bold text-slate-700 text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedAppointments.map((apt) => (
                            <TableRow key={apt.id} className="hover:bg-slate-50/70 border-b border-slate-50 transition-colors">
                              <TableCell className="py-5 px-6">
                                <span className="font-black text-indigo-600 block">{apt.service_type}</span>
                                <span className="text-[10px] uppercase font-bold text-slate-400">ID: #{apt.id}</span>
                              </TableCell>
                              <TableCell className="font-bold text-slate-700">{apt.pet_name || 'Companion'}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5 text-slate-600">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="text-sm font-medium">{apt.branch_name || 'Main Branch'}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-black text-slate-900 text-sm">{new Date(apt.appointment_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  <span className="text-xs text-indigo-600 font-bold">{new Date(apt.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm font-medium text-slate-600">{apt.doctor_name || 'Assigned'}</TableCell>
                              <TableCell className="text-center">{getStatusBadge(apt.status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-sm text-slate-500">Page {currentPage} of {totalPages}</span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="rounded-lg" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
                          <Button variant="outline" size="sm" className="rounded-lg" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="book" className="mt-0">
            <Card className="bg-white border-none shadow-2xl shadow-slate-200/60 rounded-3xl overflow-hidden max-w-4xl mx-auto">
              <CardHeader className="bg-slate-900 text-white py-10 px-10">
                <CardTitle className="text-3xl font-black">Clinical Service Booking</CardTitle>
                <CardDescription className="text-slate-400 mt-2 text-lg">Select a specialized service for your pet.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-10">
                  <div className="flex justify-center">
                    <TabsList className="bg-slate-100 p-1.5 rounded-2xl w-full max-w-md h-auto">
                      <TabsTrigger value="exam" className="flex-1 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-black transition-all">Clinical Exam</TabsTrigger>
                      <TabsTrigger value="single" className="flex-1 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-black transition-all">Vaccination</TabsTrigger>
                      <TabsTrigger value="package" className="flex-1 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm font-black transition-all">Packages</TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Clinical Exam Form */}
                  <TabsContent value="exam">
                    <form className="space-y-10" onSubmit={async (e) => {
                      e.preventDefault();
                      const ok = await handleBooking(examForm, 'Khám bệnh');
                      if (ok) setExamForm({ petId: "", branchId: "", doctorId: "", date: "", time: "", reason: "" });
                    }}>
                      <div className="grid md:grid-cols-2 gap-8">
                        <FormGroup label="Companion *">
                          <Select value={examForm.petId} onValueChange={v => setExamForm(f => ({ ...f, petId: v }))}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"><SelectValue placeholder="Select pet" /></SelectTrigger>
                            <SelectContent className="rounded-xl drop-shadow-2xl">{pets.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormGroup>
                        <FormGroup label="Branch Location *">
                          <Select value={examForm.branchId} onValueChange={v => { setExamForm(f => ({ ...f, branchId: v, doctorId: "", time: "", date: "" })); fetchDoctorsByBranch(v); }}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"><SelectValue placeholder="Choose a clinic" /></SelectTrigger>
                            <SelectContent className="rounded-xl drop-shadow-2xl">{branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.branch_name}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormGroup>
                      </div>
                      <FormGroup label="Medical Expert *">
                        <Select value={examForm.doctorId} onValueChange={v => setExamForm(f => ({ ...f, doctorId: v }))} disabled={!examForm.branchId}>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"><SelectValue placeholder={examForm.branchId ? "Pick a veterinarian" : "Select branch first"} /></SelectTrigger>
                          <SelectContent className="rounded-xl drop-shadow-2xl">{vets.map(v => <SelectItem key={v.id} value={String(v.id)}>{v.fullName}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormGroup>
                      <div className="grid md:grid-cols-2 gap-8">
                        <FormGroup label="Preferred Date *">
                          <Input type="date" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all" value={examForm.date} min={new Date().toISOString().split('T')[0]} onChange={e => setExamForm(f => ({ ...f, date: e.target.value }))} disabled={!examForm.branchId} />
                        </FormGroup>
                        <FormGroup label="Preferred Time *">
                          <Input type="time" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all" value={examForm.time} onChange={e => setExamForm(f => ({ ...f, time: e.target.value }))} disabled={!examForm.branchId} min={branches.find(b => String(b.id) === examForm.branchId)?.opening_at?.toString().slice(0,5) || "08:00"} max={branches.find(b => String(b.id) === examForm.branchId)?.closing_at?.toString().slice(0,5) || "22:00"} />
                        </FormGroup>
                      </div>

                      <Button type="submit" className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-black text-xl shadow-xl shadow-indigo-100 transition-all" disabled={isSubmitting}>
                        {isSubmitting ? "Finalizing Schedule..." : "Confirm Medical Appointment"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Vaccination Form */}
                  <TabsContent value="single">
                    <form className="space-y-10" onSubmit={async (e) => {
                      e.preventDefault();
                      const ok = await handleBooking(singleDoseForm, 'Tiêm mũi lẻ');
                      if (ok) setSingleDoseForm({ petId: "", branchId: "", vaccineId: "", doctorId: "", date: "", time: "", reason: "" });
                    }}>
                      <div className="grid md:grid-cols-2 gap-8">
                        <FormGroup label="Companion *">
                          <Select value={singleDoseForm.petId} onValueChange={v => setSingleDoseForm(f => ({ ...f, petId: v }))}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"><SelectValue placeholder="Select pet" /></SelectTrigger>
                            <SelectContent className="rounded-xl drop-shadow-2xl">{pets.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormGroup>
                        <FormGroup label="Branch Location *">
                          <Select value={singleDoseForm.branchId} onValueChange={v => { setSingleDoseForm(f => ({ ...f, branchId: v, doctorId: "", time: "", date: "" })); fetchDoctorsByBranch(v); }}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"><SelectValue placeholder="Choose a clinic" /></SelectTrigger>
                            <SelectContent className="rounded-xl drop-shadow-2xl">{branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.branch_name}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormGroup>
                      </div>
                      <FormGroup label="Medical Expert *">
                        <Select value={singleDoseForm.doctorId} onValueChange={v => setSingleDoseForm(f => ({ ...f, doctorId: v }))} disabled={!singleDoseForm.branchId}>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"><SelectValue placeholder={singleDoseForm.branchId ? "Pick a veterinarian" : "Select branch first"} /></SelectTrigger>
                          <SelectContent className="rounded-xl drop-shadow-2xl">{vets.map(v => <SelectItem key={v.id} value={String(v.id)}>{v.fullName}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormGroup>
                      <div className="grid md:grid-cols-2 gap-8">
                        <FormGroup label="Preferred Date *">
                          <Input type="date" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all" value={singleDoseForm.date} min={new Date().toISOString().split('T')[0]} onChange={e => setSingleDoseForm(f => ({ ...f, date: e.target.value }))} disabled={!singleDoseForm.branchId} />
                        </FormGroup>
                        <FormGroup label="Preferred Time *">
                          <Input type="time" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all" value={singleDoseForm.time} onChange={e => setSingleDoseForm(f => ({ ...f, time: e.target.value }))} disabled={!singleDoseForm.branchId} min={branches.find(b => String(b.id) === singleDoseForm.branchId)?.opening_at?.toString().slice(0,5) || "08:00"} max={branches.find(b => String(b.id) === singleDoseForm.branchId)?.closing_at?.toString().slice(0,5) || "22:00"} />
                        </FormGroup>
                      </div>

                      <Button type="submit" className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-black text-xl shadow-xl shadow-indigo-100 transition-all" disabled={isSubmitting}>
                        {isSubmitting ? "Finalizing Schedule..." : "Confirm Vaccination Appointment"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Package Form */}
                  <TabsContent value="package">
                    <form className="space-y-10" onSubmit={async (e) => {
                      e.preventDefault();
                      const ok = await handleBooking(packageForm, 'Tiêm theo gói');
                      if (ok) setPackageForm({ petId: "", branchId: "", packageId: "", doctorId: "", date: "", time: "", reason: "" });
                    }}>
                      <div className="grid md:grid-cols-2 gap-8">
                        <FormGroup label="Companion *">
                          <Select value={packageForm.petId} onValueChange={v => setPackageForm(f => ({ ...f, petId: v }))}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"><SelectValue placeholder="Select pet" /></SelectTrigger>
                            <SelectContent className="rounded-xl drop-shadow-2xl">{pets.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormGroup>
                        <FormGroup label="Branch Location *">
                          <Select value={packageForm.branchId} onValueChange={v => { setPackageForm(f => ({ ...f, branchId: v, doctorId: "", time: "", date: "" })); fetchDoctorsByBranch(v); }}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"><SelectValue placeholder="Choose a clinic" /></SelectTrigger>
                            <SelectContent className="rounded-xl drop-shadow-2xl">{branches.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.branch_name}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormGroup>
                      </div>
                      <FormGroup label="Medical Expert *">
                        <Select value={packageForm.doctorId} onValueChange={v => setPackageForm(f => ({ ...f, doctorId: v }))} disabled={!packageForm.branchId}>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"><SelectValue placeholder={packageForm.branchId ? "Pick a veterinarian" : "Select branch first"} /></SelectTrigger>
                          <SelectContent className="rounded-xl drop-shadow-2xl">{vets.map(v => <SelectItem key={v.id} value={String(v.id)}>{v.fullName}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormGroup>
                      <div className="grid md:grid-cols-2 gap-8">
                        <FormGroup label="Preferred Date *">
                          <Input type="date" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all" value={packageForm.date} min={new Date().toISOString().split('T')[0]} onChange={e => setPackageForm(f => ({ ...f, date: e.target.value }))} disabled={!packageForm.branchId} />
                        </FormGroup>
                        <FormGroup label="Preferred Time *">
                          <Input type="time" className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all" value={packageForm.time} onChange={e => setPackageForm(f => ({ ...f, time: e.target.value }))} disabled={!packageForm.branchId} min={branches.find(b => String(b.id) === packageForm.branchId)?.opening_at?.toString().slice(0,5) || "08:00"} max={branches.find(b => String(b.id) === packageForm.branchId)?.closing_at?.toString().slice(0,5) || "22:00"} />
                        </FormGroup>
                      </div>

                      <Button type="submit" className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-black text-xl shadow-xl shadow-indigo-100 transition-all" disabled={isSubmitting}>
                        {isSubmitting ? "Finalizing Schedule..." : "Confirm Package Appointment"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Reschedule Modal */}
        <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
          <DialogContent className="max-w-md rounded-3xl p-8 border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Reschedule Visit</DialogTitle>
              <DialogDescription className="text-slate-500">Pick a more convenient time for your companion's care.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6 border-y border-slate-50 my-6">
              <FormGroup label="New Date">
                <Input type="date" className="h-12 rounded-xl bg-slate-50" value={rescheduleForm.date} min={new Date().toISOString().split('T')[0]} onChange={e => setRescheduleForm(f => ({ ...f, date: e.target.value }))} />
              </FormGroup>
              <FormGroup label="New Slot">
                <Select value={rescheduleForm.time} onValueChange={v => setRescheduleForm(f => ({ ...f, time: v }))}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50"><SelectValue placeholder="Slot" /></SelectTrigger>
                  <SelectContent className="rounded-xl drop-shadow-2xl">
                    {selectedApt && generateTimeSlots(selectedApt.branch_id).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormGroup>
            </div>
            <DialogFooter className="flex-row gap-4 sm:justify-center">
              <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-slate-200" onClick={() => setRescheduleModalOpen(false)}>Dismiss</Button>
              <Button className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-bold" onClick={handleReschedule}>Apply Change</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Modal */}
        <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
          <DialogContent className="max-w-sm rounded-3xl p-8 border-none shadow-2xl">
            <DialogHeader className="text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10" />
              </div>
              <DialogTitle className="text-2xl font-black">Cancel Check-up?</DialogTitle>
              <DialogDescription className="text-slate-500 mt-2">Are you sure you want to release this slot? You can always reschedule instead.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-row gap-4 sm:justify-center mt-8">
              <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-slate-200" onClick={() => setCancelModalOpen(false)}>Keep It</Button>
              <Button variant="destructive" className="flex-1 h-12 rounded-xl bg-rose-600 font-bold" onClick={handleCancel}>Confirm Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );

  // Helper Components
  function FormGroup({ label, children }: { label: string, children: React.ReactNode }) {
    return (
      <div className="space-y-3">
        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</Label>
        {children}
      </div>
    );
  }

  }
