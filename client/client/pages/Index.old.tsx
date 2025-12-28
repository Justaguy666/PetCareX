import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Calendar, Syringe, Heart, Clock, Users, Award } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-white to-secondary/5 overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Premium Care for Your Beloved Pets
                </h1>
                <p className="text-xl text-muted-foreground">
                  Schedule check-ups, track vaccinations, and ensure your furry friends stay healthy and happy with our professional veterinary care.
                </p>
              </div>

              <div className="flex gap-4 flex-wrap">
                <Link to="/appointments">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                    Schedule Check-up
                  </Button>
                </Link>
                <Link to="/vaccinations">
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                    View Vaccinations
                  </Button>
                </Link>
              </div>

              <div className="flex gap-8 pt-4">
                <div>
                  <p className="text-3xl font-bold text-primary">500+</p>
                  <p className="text-sm text-muted-foreground">Happy Pets</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">98%</p>
                  <p className="text-sm text-muted-foreground">Satisfaction</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">24/7</p>
                  <p className="text-sm text-muted-foreground">Support</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-slide-in-up">
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8 md:p-12">
                <div className="bg-white rounded-xl p-8 text-center space-y-4">
                  <div className="text-6xl">🐶</div>
                  <h3 className="text-2xl font-bold text-foreground">Happy & Healthy</h3>
                  <p className="text-muted-foreground">Professional veterinary care you can trust</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Our Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive pet healthcare solutions designed with your pet's wellbeing in mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Check-ups Card */}
            <div className="group hover:shadow-lg transition-shadow duration-300 border border-border rounded-xl p-8 bg-white">
              <div className="mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Health Check-ups</h3>
              <p className="text-muted-foreground mb-6">
                Regular veterinary examinations to monitor your pet's health and catch any issues early.
              </p>
              <div className="flex items-center gap-2 text-primary font-medium">
                <span>Schedule Now</span>
                <span className="text-lg">→</span>
              </div>
            </div>

            {/* Vaccinations Card */}
            <div className="group hover:shadow-lg transition-shadow duration-300 border border-border rounded-xl p-8 bg-white">
              <div className="mb-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <Syringe className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Vaccination Tracking</h3>
              <p className="text-muted-foreground mb-6">
                Keep track of all vaccinations, reminders, and booster shots in one convenient place.
              </p>
              <div className="flex items-center gap-2 text-secondary font-medium">
                <span>View Records</span>
                <span className="text-lg">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Why Choose PetCare Pro
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the difference of modern, accessible pet healthcare
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Easy Scheduling</h3>
              <p className="text-muted-foreground">
                Book appointments in seconds with our intuitive online scheduling system.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <Heart className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Expert Care</h3>
              <p className="text-muted-foreground">
                Our experienced veterinarians provide compassionate, comprehensive care.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Certified Professionals</h3>
              <p className="text-muted-foreground">
                Fully licensed and certified veterinary professionals with years of experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-12 md:p-16 text-white text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Care for Your Pet?
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Get started with PetCare Pro today. Schedule your pet's first appointment and experience the difference.
            </p>
            <Link to="/appointments">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                Schedule Appointment Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-xl mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  🐾
                </div>
                <span>PetCare Pro</span>
              </div>
              <p className="text-white/70">
                Professional veterinary care for your beloved pets.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link to="/" className="hover:text-white transition">Health Check-ups</Link></li>
                <li><Link to="/" className="hover:text-white transition">Vaccinations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                <li><Link to="/appointments" className="hover:text-white transition">Appointments</Link></li>
                <li><Link to="/vaccinations" className="hover:text-white transition">Vaccinations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-white/70 mb-2">support@petcarepro.com</p>
              <p className="text-white/70">(555) 123-4567</p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-white/70">
            <p>&copy; 2024 PetCare Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
