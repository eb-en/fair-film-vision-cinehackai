import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export const GlassCard = ({ children, className, hover = false, onClick, style }: GlassCardProps) => {
  return (
    <div 
      className={cn(
        hover ? "glass-hover" : "glass",
        "rounded-xl p-6",
        className
      )}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};
