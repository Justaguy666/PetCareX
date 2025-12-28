import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { Calendar, Syringe, Heart, Clock, Users, Award, ShoppingBag, Stethoscope } from "lucide-react";
import { useState, useEffect } from "react";
import { apiGet } from "@/api/api";

export default function Index() {
  const [stats, setStats] = useState({ totalPets: 500, satisfactionRate: 98, emergencySupport: "24/7" });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiGet('/dashboard/public-stats');
        if (response?.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch public stats:', error);
      }
    };
    fetchStats();
  }, []);

  const services = [
    {
      icon: Calendar,
      title: "Health Check-ups",
      description: "Regular veterinary examinations to keep your pets in perfect health",
      color: "text-blue-600",
    },
    {
      icon: Syringe,
      title: "Vaccinations",
      description: "Essential vaccines to protect your pets from diseases",
      color: "text-green-600",
    },
    {
      icon: ShoppingBag,
      title: "Pet Products",
      description: "Quality food, toys, and supplies for your beloved companions",
      color: "text-orange-600",
    }
  ];

  const features = [
    {
      icon: Clock,
      title: "24/7 Emergency Care",
      description: "Round-the-clock emergency services for urgent pet care needs"
    },
    {
      icon: Users,
      title: "Expert Veterinarians",
      description: "Experienced and caring professionals dedicated to pet health"
    },
    {
      icon: Award,
      title: "Quality Service",
      description: "Award-winning care with 98% customer satisfaction rating"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section - Sales Style */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to PetCareX
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Your trusted partner in pet healthcare
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">
                {stats.totalPets > 1000
                  ? `${Math.floor(stats.totalPets / 1000)}k+`
                  : `${stats.totalPets}+`}
              </div>
              <div className="text-muted-foreground">Happy Pets Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">
                {stats.satisfactionRate > 100 ? 100 : stats.satisfactionRate}%
              </div>
              <div className="text-muted-foreground">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">{stats.emergencySupport}</div>
              <div className="text-muted-foreground">Emergency Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Sales Style Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Our Services</h2>
            <p className="text-muted-foreground text-lg">
              Comprehensive pet healthcare solutions for your beloved companions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="hover:shadow-2xl transition-all duration-500 border-none bg-white rounded-3xl group overflow-hidden shadow-slate-200/50">
                  <div className={`h-2 w-full bg-gradient-to-r ${service.color.includes('blue') ? 'from-blue-600 to-indigo-600' : service.color.includes('green') ? 'from-emerald-600 to-teal-600' : 'from-orange-500 to-amber-500'}`} />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 pt-8 px-8">
                    <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">{service.title}</CardTitle>
                    <div className={`${service.color} bg-slate-50 p-3 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all duration-300`}>
                      <Icon className="h-7 w-7" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <p className="text-slate-500 mb-8 leading-relaxed font-medium">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Why Choose Us</h2>
            <p className="text-muted-foreground text-lg">
              We're committed to providing the best care for your pets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <Icon className="h-10 w-10 text-primary mb-3" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 PetCareX. All rights reserved.</p>
          <p className="mt-2 text-sm">Your trusted partner in pet healthcare</p>
        </div>
      </footer>
    </div>
  );
}
