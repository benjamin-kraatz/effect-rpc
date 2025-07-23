"use client";

import {
  FileSpreadsheetIcon,
  GithubIcon,
  Home,
  RocketIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Getting Started",
    url: "/getting-started",
    icon: RocketIcon,
  },
  {
    title: "Core Concepts",
    url: "/core-concepts",
    icon: FileSpreadsheetIcon,
  },
];

export function AppSidebar() {
  const sidebar = useSidebar();
  return (
    <>
      <div
        className={cn(
          "fixed bottom-2 left-2 w-fit p-2 rounded-lg bg-card shadow-md z-50 md:top-2 md:bottom-auto md:left-2",
          sidebar.open && "md:left-[var(--sidebar-width)] md:translate-x-2",
          "transition-all duration-300 ease-in-out"
        )}
      >
        <SidebarTrigger />
      </div>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Effect RPC docs</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex flex-row w-full justify-evenly gap-2 pb-4">
                <SidebarMenuButton className="w-fit" asChild>
                  <Link
                    href="https://github.com/benjamin-kraatz/effect-rpc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground w-fit"
                    title="GitHub repository"
                  >
                    <GithubIcon />
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuButton className="w-fit" asChild>
                  <Link
                    href="https://www.npmjs.com/package/effect-rpc"
                    className="fill-muted-foreground hover:fill-foreground"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="NPM package"
                  >
                    <svg
                      width="72px"
                      height="72px"
                      viewBox="0 0 48 48"
                      xmlns="http://www.w3.org/2000/svg"
                      className="scale-125"
                    >
                      <g id="Layer_2" data-name="Layer 2">
                        <g id="invisible_box" data-name="invisible box">
                          <rect width="48" height="48" fill="none" />
                        </g>
                        <g id="Q3_icons" data-name="Q3 icons">
                          <g>
                            <rect x="21.6" y="19.9" width="2.4" height="4.84" />
                            <path d="M2,15V29.7H14.2v2.5H24V29.7H46V15ZM14.2,27.2H11.8V19.9H9.3v7.3H4.5V17.5h9.7Zm12.3,0H21.6v2.5H16.7V17.5h9.8Zm17.1,0H41.2V19.9H38.7v7.3H36.2V19.9H33.8v7.3H28.9V17.5H43.6Z" />
                          </g>
                        </g>
                      </g>
                    </svg>
                  </Link>
                </SidebarMenuButton>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
