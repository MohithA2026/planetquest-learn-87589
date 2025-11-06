import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, BookOpen, ArrowRight } from "lucide-react";

export default function Lessons() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchLessons();
    }
  }, [user]);

  const fetchLessons = async () => {
    try {
      const { data } = await supabase
        .from("lessons")
        .select("*")
        .order("order_index", { ascending: true });

      setLessons(data || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-primary/10 text-primary";
      case "intermediate":
        return "bg-accent/10 text-accent";
      case "advanced":
        return "bg-secondary/10 text-secondary";
      default:
        return "bg-muted text-muted-foreground";
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Environmental Lessons</h1>
          <p className="text-muted-foreground">
            Explore our library of lessons about climate, sustainability, and the environment
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="flex flex-col shadow-float hover:shadow-eco transition-smooth">
              <div className="p-6 flex-1">
                <div className="mb-3 flex items-start justify-between">
                  <BookOpen className="h-8 w-8 text-primary" />
                  {lesson.difficulty && (
                    <Badge className={getDifficultyColor(lesson.difficulty)}>
                      {lesson.difficulty}
                    </Badge>
                  )}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{lesson.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                  {lesson.description}
                </p>
              </div>
              <div className="border-t p-4">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate(`/lessons/${lesson.id}`)}
                >
                  Read Lesson
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {lessons.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No lessons available yet</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
