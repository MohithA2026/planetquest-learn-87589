import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Trophy, BookOpen, Users } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden eco-gradient py-20 text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
                  Learn, Play, and Save the Planet
                </h1>
                <p className="text-lg md:text-xl opacity-90">
                  Join EcoQuest, the gamified environmental education platform that makes learning about our planet fun and rewarding!
                </p>
                <div className="flex gap-4">
                  <Link to={user ? "/dashboard" : "/auth"}>
                    <Button size="lg" variant="secondary">
                      <Sparkles className="mr-2 h-5 w-5" />
                      {user ? "Go to Dashboard" : "Start Learning"}
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <img 
                  src={heroBanner} 
                  alt="Students learning about environment" 
                  className="rounded-2xl shadow-eco"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Why EcoQuest?</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6 text-center shadow-float hover:shadow-eco transition-smooth">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Interactive Lessons</h3>
                <p className="text-sm text-muted-foreground">
                  Engaging content about climate, biodiversity, and sustainability
                </p>
              </Card>

              <Card className="p-6 text-center shadow-float hover:shadow-eco transition-smooth">
                <Sparkles className="mx-auto mb-4 h-12 w-12 text-accent" />
                <h3 className="mb-2 text-xl font-semibold">Earn Points</h3>
                <p className="text-sm text-muted-foreground">
                  Complete quizzes and challenges to earn points and level up
                </p>
              </Card>

              <Card className="p-6 text-center shadow-float hover:shadow-eco transition-smooth">
                <Trophy className="mx-auto mb-4 h-12 w-12 text-secondary" />
                <h3 className="mb-2 text-xl font-semibold">Unlock Badges</h3>
                <p className="text-sm text-muted-foreground">
                  Collect achievements as you become an environmental champion
                </p>
              </Card>

              <Card className="p-6 text-center shadow-float hover:shadow-eco transition-smooth">
                <Users className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-xl font-semibold">Compete & Learn</h3>
                <p className="text-sm text-muted-foreground">
                  Join the leaderboard and see how you rank against peers
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Make a Difference?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Start your environmental learning journey today
            </p>
            <Link to={user ? "/dashboard" : "/auth"}>
              <Button size="lg">
                {user ? "Continue Learning" : "Join Now"}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
