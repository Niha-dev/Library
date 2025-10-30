import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import type { BookCache } from "@shared/schema";

interface BookGridProps {
  books: BookCache[];
}

export function BookGrid({ books }: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No books found</h3>
        <p className="text-muted-foreground">
          Try browsing other genres or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {books.map((book, index) => (
        <motion.div
          key={book.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.03 }}
        >
          <Link href={`/book/${book.id}`}>
            <Card 
              className="group cursor-pointer hover-elevate transition-all overflow-hidden h-full"
              data-testid={`card-book-${book.id}`}
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
                {book.imageUrl ? (
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <CardContent className="p-3">
                <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                  {book.title}
                </h3>
                {book.authors && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {book.authors}
                  </p>
                )}
                {book.publishedDate && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {new Date(book.publishedDate).getFullYear()}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
