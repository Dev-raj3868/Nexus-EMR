import logoImage from "@/assets/nexus-logo.jpg";

const Logo = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <img 
      src={logoImage} 
      alt="Nexus Logo" 
      className={className}
    />
  );
};

export default Logo;
