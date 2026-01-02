import Image from "next/image";
import clsx from "clsx";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <div className={clsx("relative", className)}>
      <Image
        src="/nexus-logo.jpg"
        alt="Nexus Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
