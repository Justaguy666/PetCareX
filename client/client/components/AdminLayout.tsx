import AdminHeader from "./AdminHeader";
import { ReactNode } from "react";

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <>
            <AdminHeader />
            <main className="lg:ml-64 min-h-screen bg-gray-50">
                <div className="lg:pt-0 pt-16">
                    {children}
                </div>
            </main>
        </>
    );
}
