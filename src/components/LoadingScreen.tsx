'use client';

import { useEffect, useState } from "react";
import Logo from "./Logo";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  // Fake progress for UI only
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 2));
    }, 30);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background image (from /public) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/loading-bg.jpg')" }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-background/80 to-secondary/40 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        
        {/* Logo */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl animate-pulse" />
          <Logo className="relative w-40 h-40 animate-pulse drop-shadow-2xl" />
        </div>

        {/* Text & Progress */}
        <div className="flex flex-col items-center gap-4 w-80">
          <h2 className="text-3xl font-bold text-foreground">Nexus</h2>

          <p className="text-muted-foreground text-sm">
            Hospital Management System
          </p>

          {/* Progress bar */}
          <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary via-primary-light to-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-muted-foreground text-xs animate-pulse">
            {progress < 30
              ? "Initializing..."
              : progress < 70
              ? "Loading resources..."
              : "Almost ready..."}
          </p>
        </div>
      </div>
    </div>
  );
}
