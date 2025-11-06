import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Play } from "lucide-react";

export default function LessonDetail() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchLesson();
    }
  }, [user, id]);

  const fetchLesson = async () => {
    try {
      const { data: lessonData } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", id)
        .single();

      setLesson(lessonData);

      // Check if there's a quiz for this lesson
      const { data: quizData } = await supabase
        .from("quizzes")
        .select("*")
        .eq("lesson_id", id)
        .maybeSingle();

      setQuiz(quizData);
    } catch (error) {
      console.error("Error fetching lesson:", error);
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

  if (!lesson) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Lesson not found</h1>
          <Link to="/lessons">
            <Button className="mt-4">Back to Lessons</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link to="/lessons">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lessons
          </Button>
        </Link>

        <Card className="p-8 shadow-eco">
          <div className="mb-6">
            {lesson.difficulty && (
              <Badge className="mb-4">
                {lesson.difficulty}
              </Badge>
            )}
            <h1 className="text-4xl font-bold mb-4">{lesson.title}</h1>
            <p className="text-lg text-muted-foreground">{lesson.description}</p>
          </div>

          {lesson.image_url && (
            <img
              src={lesson.image_url}
              alt={lesson.title}
              className="w-full rounded-lg mb-6"
            />
          )}

          {lesson.video_url && (
            <div className="mb-6 aspect-video">
              <iframe
                src={lesson.video_url}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            </div>
          )}

          <div className="prose max-w-none mb-8">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {lesson.content}
            </p>
          </div>

          {quiz && (
            <div className="border-t pt-6">
              <h2 className="text-2xl font-bold mb-4">Test Your Knowledge</h2>
              <p className="text-muted-foreground mb-4">
                Ready to see what you've learned? Take the quiz!
              </p>
              <Button onClick={() => navigate(`/quiz/${quiz.id}`)}>
                <Play className="mr-2 h-4 w-4" />
                Start Quiz
              </Button>
            </div>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
}
