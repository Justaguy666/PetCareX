import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function VetEditProfile() {
    const { user } = useAuth();

    if (!user || user.role !== 'veterinarian') return <Navigate to="/login" />;

    // Profile editing requires admin - redirect to profile view
    return <Navigate to="/vet/profile" />;
}
