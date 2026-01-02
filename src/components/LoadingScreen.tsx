import { useEffect, useState } from "react";
import Logo from "./Logo";
import loadingBg from "@/assets/loading-bg.jpg";

const LoadingScreen = ({ onLoadingComplete }: { onLoadingComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onLoadingComplete, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${loadingBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-background/80 to-secondary/40 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative flex flex-col items-center gap-8 z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <Logo className="relative w-40 h-40 animate-fade-in drop-shadow-2xl" />
        </div>
        
        <div className="flex flex-col items-center gap-4 w-80">
          <h2 className="text-3xl font-bold text-foreground animate-fade-in">
            Nexus
          </h2>
          <p className="text-muted-foreground text-sm animate-fade-in">
            Hospital Management System
          </p>
          
          {/* Progress bar */}
          <div className="w-full h-2 bg-muted/30 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary via-primary-light to-primary transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>
          </div>
          
          <p className="text-muted-foreground text-xs animate-pulse">
            {progress < 30 ? "Initializing..." : progress < 70 ? "Loading resources..." : "Almost ready..."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
