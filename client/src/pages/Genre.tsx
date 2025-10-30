import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Search } from "lucide-react";
import { Header } from "@/components/Header";
import { AuthModal } from "@/components/AuthModal";
import { ProfileModal } from "@/components/ProfileModal";
import { BookGrid } from "@/components/BookGrid";
import { NotificationBar } from "@/components/NotificationBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Genre, BookCache, User } from "@shared/schema";

export default function GenrePage() {
  const { id } = useParams<{ id: string }>();
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  const { data: genre, isLoading: genreLoading } = useQuery<Genre>({
    queryKey: [`/api/genres/${id}`],
    enabled: !!id,
  });

  const { data: books, isLoading: booksLoading } = useQuery<BookCache[]>({
    queryKey: [`/api/genres/${id}/books`],
    enabled: !!id,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/auth/logout', {}),
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      toast({ title: "Success", description: "Logged out successfully" });
    },
  });

  const filteredBooks = books?.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.authors?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <NotificationBar />
      <Header
        onAuthClick={(mode) => setAuthMode(mode)}
        onProfileClick={() => setShowProfile(true)}
        onLogout={() => logoutMutation.mutate()}
      />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link href="/">
            <Button variant="ghost" className="mb-6" data-testid="button-back-to-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          {/* Genre Header */}
          {genreLoading ? (
            <div className="mb-8">
              <Skeleton className="h-12 w-64 mb-4" />
              <Skeleton className="h-6 w-96" />
            </div>
          ) : genre ? (
            <div className="mb-8">
              <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                {genre.name}
              </h1>
              {genre.description && (
                <p className="text-lg text-muted-foreground">
                  {genre.description}
                </p>
              )}
            </div>
          ) : (
            <div className="mb-8">
              <h1 className="text-4xl font-serif font-bold text-foreground">
                Genre Not Found
              </h1>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-8 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-books"
              />
            </div>
          </div>

          {/* Books Grid */}
          {booksLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[2/3] w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <BookGrid books={filteredBooks} />
          )}
        </div>
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
