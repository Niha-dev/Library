import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Sparkles, BookMarked, GraduationCap } from "lucide-react";
import { SiX, SiFacebook, SiInstagram, SiLinkedin } from "react-icons/si";

const impacts = [
  {
    icon: Heart,
    title: "Foster Love for Reading",
    description: "Cultivate a lifelong passion for books and learning through accessible digital resources.",
  },
  {
    icon: Sparkles,
    title: "Ignite Imagination",
    description: "Transport readers to new worlds and inspire creative thinking through diverse literature.",
  },
  {
    icon: BookMarked,
    title: "Preserve Knowledge",
    description: "Safeguard and share humanity's collective wisdom for future generations.",
  },
  {
    icon: GraduationCap,
    title: "Empower Education",
    description: "Provide educational resources that support learning and academic excellence.",
  },
];

const socialLinks = [
  { icon: SiX, href: "#", label: "X", color: "hover:text-foreground" },
  { icon: SiFacebook, href: "#", label: "Facebook", color: "hover:text-[#4267B2]" },
  { icon: SiInstagram, href: "#", label: "Instagram", color: "hover:text-[#E4405F]" },
  { icon: SiLinkedin, href: "#", label: "LinkedIn", color: "hover:text-[#0077B5]" },
];

export function AboutModule() {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
            The Impact of Books
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Books have the power to transform lives, bridge cultures, and illuminate minds. 
            Our mission is to make this transformative power accessible to everyone, everywhere.
          </p>
        </motion.div>

        {/* Impact Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {impacts.map((impact, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover-elevate transition-all">
                <CardContent className="pt-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <impact.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {impact.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {impact.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-serif font-bold text-foreground mb-4">
                Our Mission
              </h3>
              <p className="text-foreground leading-relaxed mb-4">
                We believe that access to knowledge should be a fundamental right, not a privilege. 
                Through our digital library platform, we're breaking down barriers to education and 
                literacy, connecting readers with books from around the world.
              </p>
              <p className="text-foreground leading-relaxed">
                Whether you're a student seeking academic resources, a professional looking to expand 
                your expertise, or simply someone who loves to read, our platform is designed to 
                support your journey of discovery and growth.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Social Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h3 className="text-xl font-semibold text-foreground mb-6">
            Connect With Us
          </h3>
          <div className="flex justify-center gap-6">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                aria-label={social.label}
                className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-card hover-elevate active-elevate-2 transition-all ${social.color}`}
                data-testid={`link-social-${social.label.toLowerCase()}`}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
