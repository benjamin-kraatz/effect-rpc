"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

type Props = {
  href?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: "link" | "primary" | "secondary";
  size?: "sm" | "lg" | "default" | "icon" | null;
};

export default function LinkedButton({
  href,
  children,
  className,
  variant,
  size,
}: Props) {
  const router = useRouter();
  return (
    <div>
      <Button
        asChild
        variant={"default"}
        className={cn("mt-4", className)}
        onClick={() => {
          router.push(href || "/getting-started");
        }}
      >
        {children}
      </Button>
    </div>
  );
}
