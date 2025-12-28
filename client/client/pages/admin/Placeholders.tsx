import AdminLayout from "@/components/AdminLayout";

// Medical Records Page - keeping as placeholder until fully implemented
export function MedicalRecordsPage() {
  return (
    <AdminLayout>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Medical Records Management</h1>
        <p className="text-muted-foreground mb-6">View and manage pet medical records</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-blue-900 font-semibold mb-2">Medical Records Feature</p>
          <p className="text-blue-700">This page will display all medical records with filtering capabilities. Full implementation coming soon.</p>
        </div>
      </main>
    </AdminLayout>
  );
}
