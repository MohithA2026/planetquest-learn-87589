
-- Migration: 20251106042915
-- Create profiles table for user data
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  points integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create badges table
CREATE TABLE public.badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon_url text,
  points_required integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for badges
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Badges are viewable by everyone
CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT
  USING (true);

-- Create user_badges junction table
CREATE TABLE public.user_badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS for user_badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Users can view their own badges
CREATE POLICY "Users can view their own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Create lessons table
CREATE TABLE public.lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  content text NOT NULL,
  image_url text,
  video_url text,
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Lessons are viewable by everyone
CREATE POLICY "Lessons are viewable by authenticated users"
  ON public.lessons FOR SELECT
  TO authenticated
  USING (true);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Quizzes are viewable by authenticated users
CREATE POLICY "Quizzes are viewable by authenticated users"
  ON public.quizzes FOR SELECT
  TO authenticated
  USING (true);

-- Create questions table
CREATE TABLE public.questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  points integer NOT NULL DEFAULT 10,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Questions are viewable by authenticated users
CREATE POLICY "Questions are viewable by authenticated users"
  ON public.questions FOR SELECT
  TO authenticated
  USING (true);

-- Create quiz_attempts table
CREATE TABLE public.quiz_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score integer NOT NULL,
  total_points integer NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for quiz_attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Users can view their own attempts
CREATE POLICY "Users can view their own quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own attempts
CREATE POLICY "Users can insert their own quiz attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update profile updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for lessons
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for quizzes
CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert starter badges
INSERT INTO public.badges (name, description, points_required) VALUES
  ('Eco Starter', 'Welcome to your environmental journey!', 0),
  ('Green Learner', 'Completed your first lesson', 50),
  ('Eco Warrior', 'Earned 100 points', 100),
  ('Planet Protector', 'Earned 250 points', 250),
  ('Climate Champion', 'Earned 500 points', 500),
  ('Earth Guardian', 'Earned 1000 points', 1000);

-- Insert sample lessons
INSERT INTO public.lessons (title, description, content, difficulty, order_index) VALUES
  (
    'Introduction to Climate Change',
    'Learn the basics of climate change and its impact on our planet',
    'Climate change refers to long-term shifts in temperatures and weather patterns. These shifts may be natural, but since the 1800s, human activities have been the main driver of climate change, primarily due to the burning of fossil fuels like coal, oil, and gas.',
    'beginner',
    1
  ),
  (
    'Renewable Energy Sources',
    'Discover clean energy alternatives for a sustainable future',
    'Renewable energy comes from natural sources that are constantly replenished. Examples include solar, wind, hydro, and geothermal power. These sources produce little to no greenhouse gas emissions and help reduce our dependence on fossil fuels.',
    'beginner',
    2
  ),
  (
    'The Water Cycle and Conservation',
    'Understanding water resources and how to protect them',
    'Water is essential for all life on Earth. The water cycle describes how water moves through our environment. Conservation efforts include reducing water waste, protecting watersheds, and preventing pollution of water sources.',
    'intermediate',
    3
  ),
  (
    'Biodiversity and Ecosystems',
    'Explore the variety of life on Earth and why it matters',
    'Biodiversity refers to the variety of all living things on our planet. Healthy ecosystems depend on this diversity. When species disappear, the entire ecosystem can be affected, which impacts humans through food supply, medicine, and climate regulation.',
    'intermediate',
    4
  ),
  (
    'Sustainable Living Practices',
    'Daily actions you can take to reduce your environmental impact',
    'Sustainable living involves making choices that reduce your negative impact on the environment. This includes reducing waste, recycling, using less energy, choosing sustainable products, and supporting eco-friendly businesses.',
    'beginner',
    5
  );
