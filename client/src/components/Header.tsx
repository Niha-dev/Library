import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, User, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User as UserType } from "@shared/schema";

interface HeaderProps {
  onAuthClick: (mode: "login" | "register") => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

export function Header({ onAuthClick, onProfileClick, onLogout }: HeaderProps) {
  const [location] = useLocation();

  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/auth/me"],
  });

  const scrollToSection = (sectionId: string) => {
    if (location !== "/") {
      window.location.href = `/#${sectionId}`;
    } else {
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/">
            <button
              className="flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-2 rounded-md transition-all"
              data-testid="link-home"
            >
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-serif font-bold text-foreground hidden sm:inline">
                LibraryHub
              </span>
            </button>
          </Link>

          {/* Navigation Links */}
          {location === "/" && !window.location.hash && (
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant="ghost"
                onClick={() => scrollToSection("home")}
                data-testid="link-home-section"
                className="font-medium"
              >
                Home
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection("overview")}
                data-testid="link-overview"
                className="font-medium"
              >
                Overview
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection("about")}
                data-testid="link-about"
                className="font-medium"
              >
                About
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection("contact")}
                data-testid="link-contact"
                className="font-medium"
              >
                Contact
              </Button>
            </nav>
          )}

          {/* Auth/User Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Hi,{" "}
                  <span className="font-medium text-foreground">
                    {user.name || "User"}
                  </span>
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      data-testid="button-user-menu"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user.avatarUrl || undefined}
                          alt={user.name || "User"}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem
                      onClick={onProfileClick}
                      data-testid="button-profile"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onLogout}
                      data-testid="button-logout"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => onAuthClick("login")}
                  data-testid="button-signin"
                  className="font-medium"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => onAuthClick("register")}
                  data-testid="button-signup"
                  className="font-medium bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
