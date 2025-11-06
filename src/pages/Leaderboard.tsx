import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trophy, Medal, Award } from "lucide-react";

export default function Leaderboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchLeaders();
    }
  }, [user]);

  const fetchLeaders = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("points", { ascending: false })
        .limit(20);

      setLeaders(data || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">
            See how you rank against other environmental champions
          </p>
        </div>

        <Card className="max-w-3xl mx-auto shadow-eco">
          <div className="divide-y">
            {leaders.map((leader, index) => {
              const rank = index + 1;
              const isCurrentUser = leader.id === user?.id;
              const initials = leader.full_name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase() || "?";

              return (
                <div
                  key={leader.id}
                  className={`p-4 flex items-center gap-4 transition-smooth hover:bg-muted/50 ${
                    isCurrentUser ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(rank) || (
                      <span className="text-lg font-bold text-muted-foreground">
                        {rank}
                      </span>
                    )}
                  </div>

                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="font-semibold">
                      {leader.full_name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-primary">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Level {leader.level}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {leader.points}
                    </p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {leaders.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No rankings yet</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
