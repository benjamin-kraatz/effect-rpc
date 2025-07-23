import React from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { cn } from "@/lib/utils";

export function AlertBlock({
  title,
  children: description,
  type = "info",
}: {
  title: string;
  children: React.ReactNode;
  type?: "info" | "warning" | "error";
}) {
  return (
    <Alert
      variant={type === "error" ? "destructive" : "default"}
      className={cn(
        type === "warning" && "bg-yellow-50 dark:bg-yellow-900/30",
        type === "error" && "bg-red-50/50 dark:bg-red-900/15",
        type === "info" && "bg-blue-50 dark:bg-blue-900/15"
      )}
    >
      <AlertTitle className="font-bold text-lg">{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
