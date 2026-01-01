import { cn } from "@/lib/utils";

type HeadingLevel = "h1" | "h2" | "h3" | "h4";

interface HeadingProps {
  as?: HeadingLevel;
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}

const headingStyles: Record<HeadingLevel, string> = {
  h1: "font-display text-4xl md:text-5xl lg:text-6xl font-bold",
  h2: "font-display text-3xl md:text-4xl font-bold",
  h3: "font-display text-2xl md:text-3xl font-semibold",
  h4: "font-display text-xl md:text-2xl font-semibold",
};

export function Heading({
  as: Tag = "h2",
  children,
  className,
  accent = false,
}: HeadingProps) {
  return (
    <Tag
      className={cn(
        headingStyles[Tag],
        "text-navy dark:text-white",
        accent && "text-gold",
        className
      )}
    >
      {children}
    </Tag>
  );
}
