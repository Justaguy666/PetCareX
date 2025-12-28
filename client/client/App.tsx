import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { MedicalRecordsProvider } from "@/contexts/MedicalRecordsContext";
import { useEffect } from "react";
import { initializeMockData } from "@/lib/mockData";

// Customer Pages
import Index from "./pages/Index";
import Appointments from "./pages/Appointments";
import NotFound from "./pages/NotFound";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Customer Dashboard Pages
import CustomerDashboard from "./pages/CustomerDashboard";
import ProductStore from "./pages/ProductStore";
import Cart from "./pages/Cart";
import OrderHistory from "./pages/OrderHistory";
import CustomerProfile from "./pages/CustomerProfile";
import CustomerProfileEdit from "./pages/CustomerProfileEdit";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminAppointments from "./pages/admin/Appointments";
import AdminStaff from "./pages/admin/Staff";
import AdminCustomers from "./pages/admin/Customers";
import AdminMedications from "./pages/admin/Medications";
import AdminMedicalRecords from "./pages/admin/MedicalRecords";
import AdminProfile from "./pages/admin/Profile";
import AdminProfileEdit from "./pages/admin/ProfileEdit";
import BranchesPage from "./pages/admin/Branches";
import ProductsPage from "./pages/admin/Products";
import InvoicesPage from "./pages/admin/Invoices";
import ServiceTypesPage from "./pages/admin/ServiceTypes";
import VaccinesPage from "./pages/admin/Vaccines";
import VaccinePackagesPage from "./pages/admin/VaccinePackages";
import PromotionsPage from "./pages/admin/Promotions";
import TransferHistoryPage from "./pages/admin/TransferHistory";
import BranchInventoryPage from "./pages/admin/BranchInventory";
import BranchPromotionsPage from "./pages/admin/BranchPromotions";
import RatingAnalytics from "./pages/admin/RatingAnalytics";
import ProductInventoryPage from "./pages/admin/ProductInventory";
import VaccineInventoryPage from "./pages/admin/VaccineInventory";
import CustomerMedicalHistory from "./pages/CustomerMedicalHistory";
import CustomerServices from "./pages/CustomerServices";
import CustomerServiceDetail from "./pages/CustomerServiceDetail";
// import CustomerServiceBooking from "./pages/CustomerServiceBooking";
import CustomerAppointmentDetail from "./pages/CustomerAppointmentDetail";
// import CustomerAppointments from "./pages/CustomerAppointments";

// Vet / Receptionist / Sales pages
import VetDashboard from "./pages/vet/Dashboard";
import VetProfile from "./pages/vet/Profile";
import VetEditProfile from "./pages/vet/EditProfile";
import VetToday from "./pages/vet/TodayAppointments";
import VetRecords from "./pages/vet/MedicalRecords";
import VetAssignedPets from "./pages/vet/AssignedPets";
import VetNotifications from "./pages/vet/Notifications";
import SingleDoseInjections from "./pages/vet/SingleDoseInjections";
import PackageInjections from "./pages/vet/PackageInjections";

import ReceptionDashboard from "./pages/receptionist/Dashboard";
import ReceptionProfile from "./pages/receptionist/Profile";
import ReceptionEditProfile from "./pages/receptionist/EditProfile";
import ReceptionBooking from "./pages/receptionist/Booking";
import ReceptionCheckin from "./pages/receptionist/Checkin";
import ReceptionPetLookup from "./pages/receptionist/PetLookup";
import ReceptionBilling from "./pages/receptionist/Billing";
import InjectionAppointments from "./pages/receptionist/InjectionAppointments";

import SalesDashboard from "./pages/sales/Dashboard";
import SalesProfile from "./pages/sales/Profile";
import SalesProfileEdit from "./pages/sales/ProfileEdit";
import SalesInventory from "./pages/sales/Inventory";
import SalesSalesPage from "./pages/sales/SalesPage";
import SalesInvoice from "./pages/sales/Invoice";
import ServiceInvoices from "./pages/sales/ServiceInvoices";
import ServiceInvoiceDetail from "./pages/sales/ServiceInvoiceDetail";

const queryClient = new QueryClient();

const AppContent = () => {
  useEffect(() => {
    initializeMockData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CartProvider>
            <MedicalRecordsProvider>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Customer Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/appointments" element={<Appointments />} />

                {/* Customer Dashboard Routes */}
                <Route path="/dashboard" element={<CustomerDashboard />} />
                <Route path="/store" element={<ProductStore />} />
                <Route path="/shop" element={<ProductStore />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/profile" element={<CustomerProfile />} />
                <Route path="/profile-edit" element={<CustomerProfileEdit />} />
                <Route path="/medical-history" element={<CustomerMedicalHistory />} />
                <Route path="/customer/services" element={<CustomerServices />} />
                <Route path="/customer/services/:id" element={<CustomerServiceDetail />} />
                <Route path="/customer/booking" element={<Appointments />} />
                <Route path="/customer/booking/:id" element={<CustomerAppointmentDetail />} />
                <Route path="/customer/appointments" element={<Appointments />} />
                <Route path="/customer/appointments/:id" element={<CustomerAppointmentDetail />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/appointments" element={<AdminAppointments />} />
                <Route path="/admin/staff" element={<AdminStaff />} />
                <Route path="/admin/customers" element={<AdminCustomers />} />
                <Route path="/admin/medications" element={<AdminMedications />} />
                <Route path="/admin/branches" element={<BranchesPage />} />
                <Route path="/admin/medical-records" element={<AdminMedicalRecords />} />
                <Route path="/admin/products" element={<ProductsPage />} />
                <Route path="/admin/invoices" element={<InvoicesPage />} />
                <Route path="/admin/service-types" element={<ServiceTypesPage />} />
                <Route path="/admin/vaccines" element={<VaccinesPage />} />
                <Route path="/admin/vaccine-packages" element={<VaccinePackagesPage />} />
                <Route path="/admin/promotions" element={<PromotionsPage />} />
                <Route path="/admin/transfer-history" element={<TransferHistoryPage />} />
                <Route path="/admin/branch-inventory" element={<BranchInventoryPage />} />
                <Route path="/admin/branch-promotions" element={<BranchPromotionsPage />} />
                <Route path="/admin/inventory/products" element={<ProductInventoryPage />} />
                <Route path="/admin/inventory/vaccines" element={<VaccineInventoryPage />} />
                <Route path="/admin/analytics/ratings" element={<RatingAnalytics />} />
                <Route path="/admin/profile" element={<AdminProfile />} />
                <Route path="/admin/profile-edit" element={<AdminProfileEdit />} />

                {/* Veterinarian Routes */}
                <Route path="/vet" element={<VetDashboard />} />
                <Route path="/vet/dashboard" element={<VetDashboard />} />
                <Route path="/vet/appointments-today" element={<VetToday />} />
                <Route path="/vet/medical-records" element={<VetRecords />} />
                <Route path="/vet/assigned-pets" element={<VetAssignedPets />} />
                <Route path="/vet/injections/single" element={<SingleDoseInjections />} />
                <Route path="/vet/injections/package" element={<PackageInjections />} />
                <Route path="/vet/notifications" element={<VetNotifications />} />
                <Route path="/vet/profile" element={<VetProfile />} />
                <Route path="/vet/profile/edit" element={<VetEditProfile />} />

                {/* Receptionist Routes */}
                <Route path="/receptionist" element={<ReceptionDashboard />} />
                <Route path="/receptionist/dashboard" element={<ReceptionDashboard />} />
                <Route path="/receptionist/profile" element={<ReceptionProfile />} />
                <Route path="/receptionist/profile/edit" element={<ReceptionEditProfile />} />
                <Route path="/receptionist/booking" element={<ReceptionBooking />} />
                <Route path="/receptionist/appointments/injections" element={<InjectionAppointments />} />
                <Route path="/receptionist/checkin" element={<ReceptionCheckin />} />
                <Route path="/receptionist/pet-lookup" element={<ReceptionPetLookup />} />
                <Route path="/receptionist/billing" element={<ReceptionBilling />} />

                {/* Sales Staff Routes */}
                <Route path="/sales" element={<SalesDashboard />} />
                <Route path="/sales/dashboard" element={<SalesDashboard />} />
                <Route path="/sales/inventory" element={<SalesInventory />} />
                <Route path="/sales/sales-page" element={<SalesSalesPage />} />
                <Route path="/sales/invoice" element={<SalesInvoice />} />
                <Route path="/sales/invoices/services" element={<ServiceInvoices />} />
                <Route path="/sales/invoices/services/:id" element={<ServiceInvoiceDetail />} />
                <Route path="/sales/profile" element={<SalesProfile />} />
                <Route path="/sales/profile-edit" element={<SalesProfileEdit />} />

                {/* Catch All */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MedicalRecordsProvider>
          </CartProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
