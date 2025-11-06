import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BadgeCard } from "@/components/BadgeCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trophy, Sparkles, BookOpen } from "lucide-react";
import ecoWarriorBadge from "@/assets/badge-eco-warrior.png";
import planetProtectorBadge from "@/assets/badge-planet-protector.png";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      setProfile(profileData);

      // Fetch all badges
      const { data: badgesData } = await supabase
        .from("badges")
        .select("*")
        .order("points_required", { ascending: true });

      setBadges(badgesData || []);

      // Fetch user badges
      const { data: userBadgesData } = await supabase
        .from("user_badges")
        .select("badge_id")
        .eq("user_id", user?.id);

      setUserBadges(userBadgesData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progressToNextLevel = profile ? ((profile.points % 100) / 100) * 100 : 0;
  const earnedBadgeIds = userBadges.map((ub) => ub.badge_id);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name}!</h1>
          <p className="text-muted-foreground">Continue your environmental learning journey</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <Card className="p-6 shadow-float">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-3xl font-bold text-primary">{profile?.points || 0}</p>
              </div>
              <Sparkles className="h-10 w-10 text-accent" />
            </div>
          </Card>

          <Card className="p-6 shadow-float">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Level</p>
                <p className="text-3xl font-bold text-secondary">{profile?.level || 1}</p>
              </div>
              <Trophy className="h-10 w-10 text-secondary" />
            </div>
            <div className="mt-4">
              <Progress value={progressToNextLevel} className="h-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                {100 - (profile?.points % 100)} points to Level {(profile?.level || 1) + 1}
              </p>
            </div>
          </Card>

          <Card className="p-6 shadow-float">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
                <p className="text-3xl font-bold text-primary">{userBadges.length}</p>
              </div>
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
          </Card>
        </div>

        {/* Badges Section */}
        <div>
          <h2 className="mb-6 text-2xl font-bold">Your Badges</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {badges.map((badge) => (
              <BadgeCard
                key={badge.id}
                name={badge.name}
                description={badge.description}
                earned={earnedBadgeIds.includes(badge.id)}
                iconUrl={
                  badge.name === "Eco Warrior" ? ecoWarriorBadge :
                  badge.name === "Planet Protector" ? planetProtectorBadge :
                  undefined
                }
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
