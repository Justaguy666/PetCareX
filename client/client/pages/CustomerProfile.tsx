import Header from "@/components/Header";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, MapPin, Heart, Package, Star, TrendingUp, Award, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getMembershipDisplay,
  DEFAULT_MEMBERSHIP_LEVEL,
  calculateYearlySpending,
  getNextLevelRequirement,
  getMembershipBadgeClass,
  getMembershipIcon
} from "@/lib/membershipUtils";
import { apiGet } from "@/api/api";
import AddPetModal from "@/components/AddPetModal";

export default function CustomerProfile() {
  const { user } = useAuth();

  if (!user || user.role !== "customer") return <Navigate to="/login" />;

  // Calculate real-time yearly spending
  const yearlySpending = calculateYearlySpending(user.id);
  const membershipLevel = user.membershipLevel || DEFAULT_MEMBERSHIP_LEVEL;
  const nextLevelInfo = getNextLevelRequirement(membershipLevel, yearlySpending);

  // Get data from user object
  const [profileData, setProfileData] = useState({
    customerId: "CUST-" + user.id,
    name: user.fullName,
    email: user.email,
    phone: user.phone || "",
    citizenId: (user as any).citizenId || "",  // Add citizen_id
    gender: (user as any).gender || "",
    dateOfBirth: (user as any).date_of_birth || (user as any).dateOfBirth || "",
    membershipLevel: membershipLevel,
    yearlySpending: yearlySpending,
    loyaltyPoints: user.loyaltyPoints || 0,
    totalPets: 0,  // Will be updated from API
    totalOrders: 0,
    memberSince: user.createdAt
  });

  // Fetch pets from backend
  const [pets, setPets] = useState<any[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [showAddPetModal, setShowAddPetModal] = useState(false);

  const fetchPets = async () => {
    setLoadingPets(true);
    try {
      const response = await apiGet('/me/pets');
      const petList = response?.data ?? [];
      setPets(petList);
      setProfileData(prev => ({ ...prev, totalPets: petList.length }));
    } catch (err) {
      console.error('Failed to fetch pets:', err);
      setPets([]);
    } finally {
      setLoadingPets(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground">View and manage your profile information</p>
          </div>
          <Link to="/profile-edit">
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
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{profileData.name || <span className="text-muted-foreground">N/A</span>}</p>
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
                  <p className="font-medium">{profileData.phone || <span className="text-muted-foreground">N/A</span>}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Citizen ID</p>
                  <p className="font-medium">{profileData.citizenId || <span className="text-muted-foreground">N/A</span>}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{profileData.gender || <span className="text-muted-foreground">N/A</span>}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {profileData.dateOfBirth
                      ? new Date(profileData.dateOfBirth).toLocaleDateString()
                      : <span className="text-muted-foreground">N/A</span>
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Membership Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Membership Details
            </CardTitle>
            <CardDescription>Your membership status and benefits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Membership Level Badge */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border-2">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{getMembershipIcon(profileData.membershipLevel)}</div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Level</p>
                  <Badge className={`${getMembershipBadgeClass(profileData.membershipLevel)} text-lg px-4 py-1`}>
                    {profileData.membershipLevel}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Yearly Spending</p>
                <p className="text-2xl font-bold text-primary">
                  {profileData.yearlySpending.toLocaleString()} VNĐ
                </p>
              </div>
            </div>

            {/* Next Level Progress */}
            {nextLevelInfo.nextLevel && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Progress to {nextLevelInfo.nextLevel}</p>
                  <p className="text-sm text-muted-foreground">
                    {((profileData.yearlySpending / nextLevelInfo.requiredSpending) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min((profileData.yearlySpending / nextLevelInfo.requiredSpending) * 100, 100)}%`
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <p className="text-muted-foreground">{nextLevelInfo.message}</p>
                </div>
              </div>
            )}

            {!nextLevelInfo.nextLevel && (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border-2 border-yellow-300">
                <Award className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Congratulations! You're at the highest level!
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Keep spending to maintain your VIP status
                  </p>
                </div>
              </div>
            )}

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Loyalty Points</p>
                  <p className="font-semibold">{profileData.loyaltyPoints} points</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Pets</p>
                  <p className="font-semibold">{profileData.totalPets} pets</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-semibold">{new Date(profileData.memberSince).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Pets */}
        <Card>
          <CardHeader>
            <CardTitle>My Pets</CardTitle>
            <CardDescription>Your registered pets</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPets ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading pets...
              </div>
            ) : pets.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No pets registered yet</p>
                <Button onClick={() => setShowAddPetModal(true)}>
                  Add Your First Pet
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {pets.map((pet) => (
                  <div key={pet.id} className="flex items-center gap-4 border-b pb-3 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium">{pet.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {pet.species || pet.type || 'Unknown'}
                        {pet.breed && ` • ${pet.breed}`}
                        {pet.age && ` • ${pet.age} years old`}
                        {pet.birth_date && !pet.age && ` • Born ${new Date(pet.birth_date).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="pt-3">
                  <Button onClick={() => setShowAddPetModal(true)} variant="outline" className="w-full">
                    Add New Pet
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add Pet Modal */}
      <AddPetModal
        open={showAddPetModal}
        onClose={() => setShowAddPetModal(false)}
        onSuccess={fetchPets}
      />
    </div>
  );
}
