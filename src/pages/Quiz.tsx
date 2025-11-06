import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function Quiz() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchQuiz();
    }
  }, [user, id]);

  const fetchQuiz = async () => {
    try {
      const { data: quizData } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", id)
        .single();

      setQuiz(quizData);

      const { data: questionsData } = await supabase
        .from("questions")
        .select("*")
        .eq("quiz_id", id)
        .order("order_index", { ascending: true });

      setQuestions(questionsData || []);
    } catch (error) {
      console.error("Error fetching quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      toast({
        title: "Please select an answer",
        variant: "destructive",
      });
      return;
    }

    const isCorrect = selectedAnswer === questions[currentQuestion].correct_answer;
    if (isCorrect) {
      setScore(score + questions[currentQuestion].points);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      submitQuiz(isCorrect);
    }
  };

  const submitQuiz = async (lastAnswerCorrect: boolean) => {
    const finalScore = lastAnswerCorrect 
      ? score + questions[currentQuestion].points 
      : score;
    
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    try {
      await supabase.from("quiz_attempts").insert({
        user_id: user?.id,
        quiz_id: id,
        score: finalScore,
        total_points: totalPoints,
      });

      // Update user points
      const { data: profile } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", user?.id)
        .single();

      if (profile) {
        const newPoints = profile.points + finalScore;
        const newLevel = Math.floor(newPoints / 100) + 1;

        await supabase
          .from("profiles")
          .update({ 
            points: newPoints,
            level: newLevel
          })
          .eq("id", user?.id);
      }

      setScore(finalScore);
      setShowResult(true);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to submit quiz",
        variant: "destructive",
      });
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showResult) {
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((score / totalPoints) * 100);

    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto p-8 text-center shadow-eco">
            {percentage >= 70 ? (
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-primary" />
            ) : (
              <XCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            )}
            <h1 className="text-3xl font-bold mb-4">Quiz Complete!</h1>
            <p className="text-5xl font-bold text-primary mb-4">{score}/{totalPoints}</p>
            <p className="text-xl mb-8">You scored {percentage}%</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate("/lessons")}>
                Back to Lessons
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                View Dashboard
              </Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Quiz not found</h1>
        </main>
        <Footer />
      </div>
    );
  }

  const question = questions[currentQuestion];
  const options = question.options as string[];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto p-8 shadow-eco">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm font-semibold text-primary">
                {question.points} points
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <h2 className="text-2xl font-bold mb-6">{question.question_text}</h2>

          <RadioGroup value={selectedAnswer?.toString()} onValueChange={(val) => setSelectedAnswer(parseInt(val))}>
            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer rounded-lg border p-4 transition-smooth hover:border-primary"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <Button 
            onClick={handleNextQuestion} 
            className="w-full mt-8"
            size="lg"
          >
            {currentQuestion < questions.length - 1 ? "Next Question" : "Submit Quiz"}
          </Button>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
