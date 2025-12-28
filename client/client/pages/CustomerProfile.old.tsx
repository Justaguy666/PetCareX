import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pet } from "@shared/types";
import { useEffect, useState } from "react";
import ProfileField from "@/components/ui/ProfileField";
import FeedbackCard, { FeedbackValues } from "@/components/ui/FeedbackCard";
import { Mail, Phone, MapPin, Edit2, Plus, Trash2, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CustomerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingPet, setIsAddingPet] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    cccd: (user as any)?.cccd || "",
    gender: (user as any)?.gender || "",
  });

  const [newPet, setNewPet] = useState<{
    name: string;
    type: "dog" | "cat" | "rabbit" | "bird" | "other";
    breed: string;
    age: number;
    weight: number;
    color: string;
  }>({
    name: "",
    type: "dog",
    breed: "",
    age: 0,
    weight: 0,
    color: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const allPets = JSON.parse(localStorage.getItem("petcare_pets") || "[]");
    const customerPets = allPets.filter((p: Pet) => p.customerId === user.id);
    setPets(customerPets);
  }, [user, navigate]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [feedback, setFeedback] = useState<FeedbackValues>({
    serviceQuality: 0,
    staffAttitude: 0,
    overallSatisfaction: 0,
    comment: "",
  });

  const handleSaveProfile = () => {
    const allUsers = JSON.parse(localStorage.getItem("petcare_users") || "[]");
    const userIndex = allUsers.findIndex((u: any) => u.id === user?.id);
    if (userIndex >= 0) {
      allUsers[userIndex] = {
        ...allUsers[userIndex],
        ...profileData,
      };
      localStorage.setItem("petcare_users", JSON.stringify(allUsers));
      localStorage.setItem("petcare_user", JSON.stringify(allUsers[userIndex]));
      setIsEditingProfile(false);
      alert("Profile updated successfully!");
    }
  };

  const handleSaveFeedback = () => {
    if (!user) return;

    const allFeedbacks = JSON.parse(localStorage.getItem("petcare_feedbacks") || "[]");
    allFeedbacks.push({
      id: `fb-${Date.now()}`,
      userId: user.id,
      ...feedback,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("petcare_feedbacks", JSON.stringify(allFeedbacks));
    alert("Feedback saved. Thank you for your response!");
  };

  const handleAddPet = () => {
    if (!user || !newPet.name || !newPet.breed) {
      alert("Please fill in all required fields");
      return;
    }

    const newPetData: Pet = {
      id: `pet-${Date.now()}`,
      customerId: user.id,
      name: newPet.name,
      type: newPet.type,
      breed: newPet.breed,
      age: newPet.age,
      weight: newPet.weight,
      color: newPet.color,
      medicalHistory: [],
      vaccinations: [],
      createdAt: new Date().toISOString(),
    };

    const allPets = JSON.parse(localStorage.getItem("petcare_pets") || "[]");
    allPets.push(newPetData);
    localStorage.setItem("petcare_pets", JSON.stringify(allPets));

    setPets([...pets, newPetData]);
    setNewPet({
      name: "",
      type: "dog",
      breed: "",
      age: 0,
      weight: 0,
      color: "",
    });
    setIsAddingPet(false);
    alert("Pet added successfully!");
  };

  const handleDeletePet = (petId: string) => {
    if (!confirm("Are you sure you want to delete this pet?")) return;

    const allPets = JSON.parse(localStorage.getItem("petcare_pets") || "[]");
    const filteredPets = allPets.filter((p: Pet) => p.id !== petId);
    localStorage.setItem("petcare_pets", JSON.stringify(filteredPets));

    setPets(pets.filter((p) => p.id !== petId));
    alert("Pet deleted successfully!");
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-2">My Profile</h1>
            <p className="text-lg text-muted-foreground">
              Manage your account and pet information
            </p>
          </div>

          {/* Profile Section */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* Profile Card */}
              <Card className="p-8 border border-border">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Account Information</h2>
                  {!isEditingProfile && (
                    <Button onClick={() => setIsEditingProfile(true)} variant="outline" size="sm" className="gap-2">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                  )}
                </div>

                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <ProfileField label="Full Name" name="fullName" value={profileData.fullName} onChange={handleProfileChange} />
                      <ProfileField label="CCCD" name="cccd" value={profileData.cccd} onChange={handleProfileChange} placeholder="Citizen ID / CCCD" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <ProfileField label="Email" name="email" value={profileData.email} onChange={handleProfileChange} type="email" />
                      <ProfileField label="Phone" name="phone" value={profileData.phone} onChange={handleProfileChange} type="tel" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <ProfileField label="Gender" name="gender" value={profileData.gender} onChange={(e) => setProfileData((prev) => ({ ...prev, gender: (e.target as HTMLSelectElement).value }))}>
                        <select name="gender" value={profileData.gender} onChange={(e) => setProfileData((prev) => ({ ...prev, gender: e.target.value }))} className="w-full px-3 py-2 rounded-md border border-input bg-background text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </ProfileField>
                      <div />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSaveProfile} className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2">
                        <Save className="w-4 h-4" />
                        Save Changes
                      </Button>
                      <Button onClick={() => setIsEditingProfile(false)} variant="outline" className="flex-1">
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Full Name</p>
                      <p className="text-lg font-medium text-foreground">{profileData.fullName}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">CCCD</p>
                      <p className="text-lg font-medium text-foreground">{profileData.cccd || 'Not provided'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Gender</p>
                      <p className="text-lg font-medium text-foreground">{profileData.gender || 'Not specified'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </p>
                      <p className="text-lg font-medium text-foreground">{profileData.email}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone
                      </p>
                      <p className="text-lg font-medium text-foreground">{profileData.phone || "Not provided"}</p>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <Button onClick={handleLogout} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 w-full">Logout</Button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Service Feedback - immediately under Account info */}
              <div>
                <FeedbackCard
                  values={feedback}
                  onChange={(v) => setFeedback(v)}
                />

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSaveFeedback}
                    className="bg-primary hover:bg-primary/90 text-white gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save changes
                  </Button>
                </div>
              </div>

            </div>

            {/* Account Stats */}
            <Card className="p-6 border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Account Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium text-foreground">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Type</p>
                  <p className="font-medium text-foreground capitalize">Customer</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pets Registered</p>
                  <p className="font-medium text-foreground">{pets.length}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Pets Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">My Pets</h2>
              {!isAddingPet && (
                <Button
                  onClick={() => setIsAddingPet(true)}
                  className="bg-primary hover:bg-primary/90 text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Pet
                </Button>
              )}
            </div>

            {/* Add Pet Form */}
            {isAddingPet && (
              <Card className="p-6 border border-border mb-6 bg-primary/5">
                <h3 className="text-lg font-bold text-foreground mb-4">Add New Pet</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Pet Name *
                    </label>
                    <input
                      type="text"
                      value={newPet.name}
                      onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                      placeholder="e.g., Max, Bella"
                      className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Type *
                      </label>
                      <select
                        value={newPet.type}
                        onChange={(e) =>
                          setNewPet({
                            ...newPet,
                            type: e.target.value as "dog" | "cat" | "rabbit" | "bird" | "other",
                          })
                        }
                        className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="dog">Dog</option>
                        <option value="cat">Cat</option>
                        <option value="rabbit">Rabbit</option>
                        <option value="bird">Bird</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Breed *
                      </label>
                      <input
                        type="text"
                        value={newPet.breed}
                        onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                        placeholder="e.g., Golden Retriever"
                        className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Age (years)
                      </label>
                      <input
                        type="number"
                        value={newPet.age}
                        onChange={(e) =>
                          setNewPet({ ...newPet, age: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={newPet.weight}
                        onChange={(e) =>
                          setNewPet({ ...newPet, weight: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Color
                      </label>
                      <input
                        type="text"
                        value={newPet.color}
                        onChange={(e) => setNewPet({ ...newPet, color: e.target.value })}
                        placeholder="e.g., Golden"
                        className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleAddPet}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white"
                    >
                      Save Pet
                    </Button>
                    <Button
                      onClick={() => setIsAddingPet(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Pets List */}
            {pets.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {pets.map((pet) => (
                  <Card key={pet.id} className="p-6 border border-border">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{pet.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {pet.type} • {pet.breed}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeletePet(pet.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Age:</span>
                        <span className="font-medium text-foreground">{pet.age} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Weight:</span>
                        <span className="font-medium text-foreground">{pet.weight} kg</span>
                      </div>
                      {pet.color && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Color:</span>
                          <span className="font-medium text-foreground">{pet.color}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Added:</span>
                        <span className="font-medium text-foreground">
                          {new Date(pet.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center border border-border">
                <div className="text-4xl mb-4">🐾</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No Pets Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Add your first pet to get started
                </p>
                <Button
                  onClick={() => setIsAddingPet(true)}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Add Your First Pet
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
