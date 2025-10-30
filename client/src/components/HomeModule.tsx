import { motion } from "framer-motion";

export function HomeModule() {
  return (
    <section id="home" className="min-h-screen flex items-center bg-gradient-to-br from-background to-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Quote */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight">
              "A library is not a luxury but one of the necessities of life."
            </h1>
            <p className="text-xl text-muted-foreground font-serif italic">
              — Henry Ward Beecher
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover a world of knowledge at your fingertips. Browse thousands of books, 
              explore diverse genres, and embark on literary adventures from the comfort of your home.
            </p>
          </motion.div>

          {/* Right: Animated Video/Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative aspect-video rounded-lg overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80"
            >
              <source
                src="https://cdn.pixabay.com/vimeo/330743717/library-30838.mp4?width=1280&hash=21f2b1a4e9a6e0e1b9e8e8e8e8e8e8e8e8e8e8e8"
                type="video/mp4"
              />
            </video>
            
            {/* Fallback: Static Image with Animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 mix-blend-overlay" />
            <motion.div
              animate={{ 
                y: [0, -20, 0],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute bottom-8 left-8 right-8 z-20"
            >
              <div className="bg-card/90 backdrop-blur-sm rounded-lg p-6 border border-border">
                <p className="text-foreground font-medium">
                  Explore our vast collection of books and resources
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
