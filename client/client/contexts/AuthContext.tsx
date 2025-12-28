import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@shared/types";
import { DEFAULT_MEMBERSHIP_LEVEL } from "@/lib/membershipUtils";
import { apiPost, apiGet } from "@/api/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from backend on mount if cookies exist, otherwise check localStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        // First check if we have cookies (try to fetch from backend)
        try {
          const response = await apiGet("/auth/me");
          if (response?.data) {
            const backendUser = mapBackendUserToFrontend(response.data);
            setUser(backendUser);
            localStorage.setItem("petcare_user", JSON.stringify(backendUser));
            setIsLoading(false);
            return;
          }
        } catch (error) {
          // No valid session, try localStorage as fallback
          console.log("No valid session, checking localStorage");
        }

        // Fallback to localStorage if backend session doesn't exist
        const storedUser = localStorage.getItem("petcare_user");
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (error) {
            console.error("Failed to parse stored user:", error);
          }
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    // Call backend login API - cookies will be set automatically
    await apiPost("/auth/login", { email, password });

    // After login, fetch user data from /auth/me
    const response = await apiGet("/auth/me");
    if (!response?.data) {
      throw new Error("Failed to fetch user data after login");
    }

    const backendUser = mapBackendUserToFrontend(response.data);
    setUser(backendUser);
    localStorage.setItem("petcare_user", JSON.stringify(backendUser));
  };

  const logout = async () => {
    try {
      // Call backend logout API to clear cookies
      await apiPost("/auth/logout", {});
    } catch (error) {
      console.error("Logout API error (continuing anyway):", error);
    }

    setUser(null);
    localStorage.removeItem("petcare_user");
    // Always redirect to shared login route on logout
    try {
      // prefer SPA navigation if available
      window.location.href = '/login';
    } catch (e) {
      // no-op
    }
  };

  const signup = async (email: string, password: string, fullName: string, role: UserRole) => {
    // Call backend register API
    // Backend expects: { email, username, password }
    // We'll use fullName as username for now
    await apiPost("/auth/register", {
      email,
      username: fullName, // Use fullName as username
      password
    });

    // After successful registration, login to get user data and cookies
    await login(email, password);
  };

  const refreshUser = async () => {
    try {
      const response = await apiGet("/auth/me");
      if (response?.data) {
        const backendUser = mapBackendUserToFrontend(response.data);
        setUser(backendUser);
        localStorage.setItem("petcare_user", JSON.stringify(backendUser));
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signup,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Helper function to map backend user data to frontend User type
function mapBackendUserToFrontend(backendUser: any): User {
  // Map backend account_type/role to frontend UserRole
  const roleMap: Record<string, UserRole> = {
    "Khách hàng": "customer",
    "Nhân viên tiếp tân": "receptionist",
    "Bác sĩ thú y": "veterinarian",
    "Nhân viên bán hàng": "sales",
    "Quản lý chi nhánh": "admin",
  };

  // Map backend membership_level to frontend format
  const membershipMap: Record<string, string> = {
    "Cơ bản": "Cơ bản",
    "Thân thiết": "Thân thiết",
    "VIP": "VIP",
  };

  return {
    id: String(backendUser.id),
    email: backendUser.email,
    fullName: backendUser.full_name || "",
    role: roleMap[backendUser.role] || "customer",
    membershipLevel: backendUser.membership_level
      ? (membershipMap[backendUser.membership_level] as any)
      : undefined,
    phone: backendUser.phone_number || null,
    citizenId: backendUser.citizen_id || null,
    gender: backendUser.gender || null,
    dateOfBirth: backendUser.date_of_birth || null,
    createdAt: backendUser.created_at || new Date().toISOString(),
  };
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
