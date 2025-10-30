import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Library, Users, Globe } from "lucide-react";

const quotes = [
  {
    text: "The only thing you absolutely have to know is the location of the library.",
    author: "Albert Einstein",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
  },
  {
    text: "Libraries store the energy that fuels the imagination.",
    author: "Sidney Sheldon",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
  },
  {
    text: "A book is a dream that you hold in your hand.",
    author: "Neil Gaiman",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80",
  },
];

const stats = [
  {
    icon: BookOpen,
    value: "10,000+",
    label: "Books Available",
  },
  {
    icon: Library,
    value: "50+",
    label: "Libraries Connected",
  },
  {
    icon: Users,
    value: "5,000+",
    label: "Active Readers",
  },
  {
    icon: Globe,
    value: "25+",
    label: "Countries Served",
  },
];

export function OverviewModule() {
  return (
    <section id="overview" className="py-20 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
            Why Choose Our Library
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the joy of reading with our comprehensive digital library platform
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="text-center hover-elevate transition-all">
                <CardContent className="pt-6">
                  <stat.icon className="h-10 w-10 mx-auto mb-4 text-primary" />
                  <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quotes Carousel */}
        <div className="grid md:grid-cols-3 gap-8">
          {quotes.map((quote, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="overflow-hidden hover-elevate transition-all h-full">
                <div className="relative h-48">
                  <img
                    src={quote.image}
                    alt={quote.author}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <CardContent className="p-6">
                  <blockquote className="space-y-4">
                    <p className="text-lg font-serif italic text-foreground leading-relaxed">
                      "{quote.text}"
                    </p>
                    <footer className="text-sm text-muted-foreground font-medium">
                      — {quote.author}
                    </footer>
                  </blockquote>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
