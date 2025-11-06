import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Leaf className="h-5 w-5 text-primary" />
            <span>© 2025 EcoQuest. Learn, Play, and Save the Planet.</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="transition-smooth hover:text-primary">About</a>
            <a href="#" className="transition-smooth hover:text-primary">Contact</a>
            <a href="#" className="transition-smooth hover:text-primary">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
