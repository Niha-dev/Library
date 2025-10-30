import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, Eye, BookOpen, Mail } from "lucide-react";
import { Header } from "@/components/Header";
import { AuthModal } from "@/components/AuthModal";
import { ProfileModal } from "@/components/ProfileModal";
import { NotificationBar } from "@/components/NotificationBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { BookCache, User } from "@shared/schema";

const countries = [
  { code: 'IN', name: 'India', phoneFormat: '+91 XXXXX XXXXX' },
  { code: 'US', name: 'United States', phoneFormat: '+1 (XXX) XXX-XXXX' },
  { code: 'GB', name: 'United Kingdom', phoneFormat: '+44 XXXX XXXXXX' },
];

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderData, setOrderData] = useState({ email: '', phone: '', country: 'IN' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  const { data: book, isLoading } = useQuery<BookCache>({
    queryKey: [`/api/books/${id}`],
    enabled: !!id,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/auth/logout', {}),
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      toast({ title: "Success", description: "Logged out successfully" });
    },
  });

  const orderMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/contact', { ...data, bookId: id }),
    onSuccess: () => {
      setShowOrderForm(false);
      toast({ 
        title: "Order Placed", 
        description: "Our team will contact you soon!" 
      });
    },
  });

  const handleDownload = () => {
    if (book?.downloadUrl) {
      window.open(book.downloadUrl, '_blank');
      toast({ title: "Download Started", description: "Your book is downloading..." });
    } else {
      toast({ 
        title: "Not Available", 
        description: "Download not available for this book", 
        variant: "destructive" 
      });
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
    setCurrentPage(1);
  };

  const selectedCountry = countries.find(c => c.code === orderData.country);

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
          <Link href={book?.genreId ? `/genre/${book.genreId}` : '/'}>
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Books
            </Button>
          </Link>

          {isLoading ? (
            <div className="grid lg:grid-cols-2 gap-12">
              <Skeleton className="aspect-[2/3] w-full max-w-md" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          ) : book ? (
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Book Cover */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative w-full max-w-md aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                  {book.imageUrl ? (
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                      <BookOpen className="h-24 w-24 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              </div>

              {/* Book Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-serif font-bold text-foreground mb-3">
                    {book.title}
                  </h1>
                  {book.authors && (
                    <p className="text-xl text-muted-foreground mb-4">
                      by {book.authors}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {book.publishedDate && (
                      <Badge variant="secondary">
                        {new Date(book.publishedDate).getFullYear()}
                      </Badge>
                    )}
                    {book.pageCount && (
                      <Badge variant="secondary">
                        {book.pageCount} pages
                      </Badge>
                    )}
                  </div>
                </div>

                {book.overview && (
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-3">
                      Overview
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {book.overview}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleDownload}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    size="lg"
                    data-testid="button-download"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download Book
                  </Button>
                  
                  <Button
                    onClick={handlePreview}
                    variant="outline"
                    className="w-full"
                    size="lg"
                    data-testid="button-preview"
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    Preview (First 5 Pages)
                  </Button>

                  <Button
                    onClick={() => setShowOrderForm(true)}
                    variant="outline"
                    className="w-full"
                    size="lg"
                    data-testid="button-order"
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    Order Physical Copy
                  </Button>
                </div>

                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> Preview allows you to read the first 5 pages. 
                      For the complete book, please download or order a physical copy.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Book Not Found
              </h2>
              <p className="text-muted-foreground">
                The book you're looking for doesn't exist.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Book Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of 5 (Preview only)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  data-testid="button-prev-page"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
                  disabled={currentPage === 5}
                  data-testid="button-next-page"
                >
                  Next
                </Button>
              </div>
            </div>
            <Card>
              <CardContent className="p-8">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {`Page ${currentPage}\n\n`}
                  {book?.overview || 'Preview content would appear here...'}
                </p>
              </CardContent>
            </Card>
            {currentPage === 5 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <p className="text-foreground font-medium mb-4">
                    You've reached the end of the preview
                  </p>
                  <Button
                    onClick={handleDownload}
                    className="bg-accent text-accent-foreground"
                    data-testid="button-download-from-preview"
                  >
                    Download Full Book
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Form Modal */}
      <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Order Physical Copy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={orderData.email}
                onChange={(e) => setOrderData({ ...orderData, email: e.target.value })}
                placeholder="you@example.com"
                data-testid="input-order-email"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Select
                value={orderData.country}
                onValueChange={(value) => setOrderData({ ...orderData, country: value })}
              >
                <SelectTrigger data-testid="select-order-country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={orderData.phone}
                onChange={(e) => setOrderData({ ...orderData, phone: e.target.value })}
                placeholder={selectedCountry?.phoneFormat}
                data-testid="input-order-phone"
              />
            </div>
            <Button
              onClick={() => orderMutation.mutate(orderData)}
              disabled={orderMutation.isPending || !orderData.email || !orderData.phone}
              className="w-full"
              data-testid="button-order-submit"
            >
              {orderMutation.isPending ? 'Placing Order...' : 'Place Order'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
