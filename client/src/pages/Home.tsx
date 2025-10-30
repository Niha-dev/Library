import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { AuthModal } from "@/components/AuthModal";
import { ProfileModal } from "@/components/ProfileModal";
import { HomeModule } from "@/components/HomeModule";
import { OverviewModule } from "@/components/OverviewModule";
import { AboutModule } from "@/components/AboutModule";
import { ContactModule } from "@/components/ContactModule";
import { GenreGrid } from "@/components/GenreGrid";
import { NotificationBar } from "@/components/NotificationBar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

export default function Home() {
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/auth/logout', {}),
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      toast({ title: "Success", description: "Logged out successfully" });
    },
  });

  return (
    <div className="min-h-screen">
      <NotificationBar />
      <Header
        onAuthClick={(mode) => setAuthMode(mode)}
        onProfileClick={() => setShowProfile(true)}
        onLogout={() => logoutMutation.mutate()}
      />
      
      <main className="pt-18">
        {user ? (
          <section className="py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
                  Explore Our Collection
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Browse through our diverse collection of genres and discover your next favorite book
                </p>
              </div>
              <GenreGrid />
            </div>
          </section>
        ) : (
          <>
            <HomeModule />
            <OverviewModule />
            <AboutModule />
            <ContactModule />
          </>
        )}
      </main>

      <AuthModal
        isOpen={authMode !== null}
        onClose={() => setAuthMode(null)}
        initialMode={authMode || 'login'}
      />

      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </div>
  );
}
