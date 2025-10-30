import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Genre } from "@shared/schema";

export function GenreGrid() {
  const { data: genres, isLoading } = useQuery<Genre[]>({
    queryKey: ['/api/genres'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <Skeleton className="aspect-[3/4] w-full" />
            <CardContent className="pt-4">
              <Skeleton className="h-6 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!genres || genres.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No genres available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {genres.map((genre, index) => (
        <motion.div
          key={genre.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          <Link href={`/genre/${genre.id}`}>
            <Card 
              className="group cursor-pointer hover-elevate transition-all overflow-hidden h-full"
              data-testid={`card-genre-${genre.id}`}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                {genre.imageUrl ? (
                  <img
                    src={genre.imageUrl}
                    alt={genre.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl font-serif text-primary/30">
                      {genre.name[0]}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <CardContent className="pt-4">
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {genre.name}
                </h3>
                {genre.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {genre.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
