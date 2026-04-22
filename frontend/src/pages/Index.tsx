import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Building2, 
  Users, 
  CreditCard, 
  Calendar, 
  Shield, 
  ClipboardList,
  ArrowRight,
  Wifi,
  Car,
  UtensilsCrossed,
  Shirt,
  ShowerHead,
  Book,
  CheckCircle2
} from "lucide-react";

export default function Index() {
  const commonFeatures = [
    { icon: ClipboardList, title: "Easy Registration", description: "Simple one-time form for new tenants to join." },
    { icon: CreditCard, title: "Rent Tracking", description: "Automated rent dues and downloadable receipts." },
    { icon: Calendar, title: "Leave Management", description: "Mark holidays and track daily presence." },
    { icon: Users, title: "Tenant Dashboard", description: "View room details and manage your stay." },
    { icon: Shield, title: "Admin Control", description: "Complete control over approvals and payments." },
  ];

  const amenities = [
    { icon: Wifi, name: "Free WiFi" },
    { icon: ShowerHead, name: "Hot Water" },
    { icon: UtensilsCrossed, name: "Mess Available" },
    { icon: Shirt, name: "Laundry" },
    { icon: Car, name: "Parking" },
    { icon: Book, name: "Study Room" },
  ];

  const pgTypes = [
    {
      type: "boys",
      title: "Boys PG",
      subtitle: "For Male Students",
      color: "primary",
      bgGradient: "from-primary via-primary to-primary/80",
      stats: { rooms: 58, floors: 7 },
      description: "Well-maintained accommodation with all modern amenities for male students.",
      roomTypes: ["2 Sharing - ₹9,000/month", "3 Sharing - ₹7,500/month"],
    },
    {
      type: "girls",
      title: "Girls PG",
      subtitle: "For Female Students",
      color: "pink-600",
      bgGradient: "from-pink-600 via-pink-600 to-pink-500",
      stats: { rooms: 32, floors: 6 },
      description: "Safe and secure accommodation with all modern amenities for female students.",
      roomTypes: ["2 Sharing - ₹9,500/month", "3 Sharing - ₹8,000/month"],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-16 lg:py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Premium PG Accommodation for <span className="text-accent">Students</span>
            </h1>
            <p className="text-lg text-primary-foreground/90 mb-8">
              Safe, comfortable, and affordable living spaces for both boys and girls near top colleges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link to="/join">
                  Apply Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                <Link to="/login">Tenant Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* PG Types Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Accommodation
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We offer separate, well-managed PG accommodations for both boys and girls.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pgTypes.map((pg, index) => (
              <Card key={index} className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                <div className={`bg-gradient-to-r ${pg.bgGradient} text-white p-6`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{pg.title}</h3>
                      <p className="text-sm opacity-90">{pg.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex gap-6 mt-4">
                    <div>
                      <p className="text-3xl font-bold">{pg.stats.rooms}</p>
                      <p className="text-sm opacity-90">Rooms</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{pg.stats.floors}</p>
                      <p className="text-sm opacity-90">Floors</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4">{pg.description}</p>
                  
                  <div className="mb-4">
                    <p className="font-semibold mb-2">Room Types:</p>
                    <ul className="space-y-1">
                      {pg.roomTypes.map((room, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          {room}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link to="/join">Apply Now</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <Link to="/login">Login</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Amenities & Facilities
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need for comfortable student living
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {amenities.map((amenity, index) => (
              <div key={index} className="flex flex-col items-center p-4 bg-background rounded-lg shadow-sm">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <amenity.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">{amenity.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Us
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Digital-first approach to PG management for a hassle-free experience.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {commonFeatures.map((feature, index) => (
              <Card key={index} className="border-border hover:border-primary/50 transition-colors group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Fill the Form", desc: "Submit your details and ID proofs through our online form" },
              { step: "2", title: "Get Approved", desc: "Admin reviews your application and assigns a room" },
              { step: "3", title: "Move In", desc: "Complete payment and start your stay" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Join?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Start your application today and secure your room in our PG accommodation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to="/join">
                Apply Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              <Link to="/login">Tenant Login</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
