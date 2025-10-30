import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import multer from "multer";
import axios from "axios";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import { pool } from "./db";

import {
  registerUserSchema,
  loginUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  contactFormSchema,
} from "@shared/schema";
import { error } from "console";

const PgSession = connectPgSimple(session);

// Multer configuration for avatar uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Extend express session
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

// Middleware to check authentication
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// Google Books API helper
async function searchBooksFromAPI(genre: string, maxResults: number = 20) {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/books/v1/volumes",
      {
        params: {
          q: `subject:${genre}`,
          maxResults,
          orderBy: "relevance",
        },
      }
    );

    return response.data.items || [];
  } catch (error) {
    console.error("Google Books API error:", error);
    return [];
  }
}

// Seed initial genres
async function seedGenres() {
  const genresData = [
    {
      name: "Fiction",
      imageUrl:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80",
      description: "Immerse yourself in captivating fictional worlds",
    },
    {
      name: "Non-Fiction",
      imageUrl:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80",
      description: "Discover real stories and factual insights",
    },
    {
      name: "Science Fiction",
      imageUrl:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
      description: "Explore futuristic and imaginative narratives",
    },
    {
      name: "Mystery",
      imageUrl:
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=400&q=80",
      description: "Unravel thrilling mysteries and suspense",
    },
    {
      name: "Romance",
      imageUrl:
        "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=400&q=80",
      description: "Experience heartwarming love stories",
    },
    {
      name: "Biography",
      imageUrl:
        "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=400&q=80",
      description: "Read about remarkable lives and achievements",
    },
    {
      name: "Self-Help",
      imageUrl:
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80",
      description: "Transform your life with practical guidance",
    },
    {
      name: "History",
      imageUrl:
        "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=400&q=80",
      description: "Journey through time and historical events",
    },
  ];

  const existingGenres = await storage.getAllGenres();
  if (existingGenres.length === 0) {
    for (const genreData of genresData) {
      await storage.createGenre(genreData);
    }
    console.log("Genres seeded successfully");
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 50) {
    throw new Error("SESSION_SECRET must be set in .env");
  }

  if (!process.env.NODE_ENV) {
    throw new Error("NODE_ENV MUST BE SET");
  }
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "dev",
        sameSite: "lax",
      },
    })
  );

  // Seed genres on startup
  seedGenres();

  // ========== AUTH ENDPOINTS ==========

  // POST /api/auth/register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);

      // Check if user exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(validatedData.password, 10);

      // Create user
      const user = await storage.createUser({
        email: validatedData.email,
        passwordHash,
        name: validatedData.name,
        country: validatedData.country || "IN",
      });

      // Create welcome notification
      await storage.createNotification({
        userId: user.id,
        type: "success",
        message: "Welcome to LibraryHub! Start exploring our collection.",
      });

      res.json({ message: "User registered successfully", userId: user.id });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });

  // POST /api/auth/login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);

      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(
        validatedData.password,
        user.passwordHash
      );
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({
        message: "Logged in successfully",
        user: { ...user, passwordHash: undefined },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Login failed" });
    }
  });

  // POST /api/auth/forgot-password
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);

      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        // Don't reveal if email exists
        return res.json({
          message: "If the email exists, a reset link has been sent",
        });
      }

      const resetToken = nanoid(32);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await storage.createPasswordResetToken(user.id, resetToken, expiresAt);

      // In production, send email with reset link
      // For now, log to console
      console.log(
        `Password reset link: ${
          process.env.REPLIT_DEV_DOMAIN || "http://localhost:5000"
        }/reset-password?token=${resetToken}`
      );

      res.json({ message: "If the email exists, a reset link has been sent" });
    } catch (error: any) {
      res
        .status(400)
        .json({ error: error.message || "Failed to send reset link" });
    }
  });

  // POST /api/auth/reset-password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);

      const resetToken = await storage.getPasswordResetToken(
        validatedData.token
      );
      if (!resetToken || resetToken.expiresAt < new Date()) {
        return res
          .status(400)
          .json({ error: "Invalid or expired reset token" });
      }

      const passwordHash = await bcrypt.hash(validatedData.password, 10);
      await storage.updateUser(resetToken.userId, { passwordHash });
      await storage.markTokenAsUsed(resetToken.id);

      res.json({ message: "Password reset successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Password reset failed" });
    }
  });

  // GET /api/auth/me
  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ ...user, passwordHash: undefined });
  });

  // POST /api/auth/logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // ========== PROFILE ENDPOINTS ==========

  // GET /api/profile
  app.get("/api/profile", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ ...user, passwordHash: undefined });
  });

  // PUT /api/profile
  app.put("/api/profile", requireAuth, async (req, res) => {
    try {
      const validatedData = updateProfileSchema.parse(req.body);

      const user = await storage.updateUser(req.session.userId!, validatedData);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ ...user, passwordHash: undefined });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Update failed" });
    }
  });

  // POST /api/profile/avatar
  app.post(
    "/api/profile/avatar",
    requireAuth,
    upload.single("avatar"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // In production, upload to S3 or similar service
        // For now, create a data URL (not recommended for production)
        const base64 = req.file.buffer.toString("base64");
        const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

        const user = await storage.updateUser(req.session.userId!, {
          avatarUrl: dataUrl,
        });

        res.json({ avatarUrl: user?.avatarUrl });
      } catch (error: any) {
        res.status(400).json({ error: error.message || "Upload failed" });
      }
    }
  );

  // ========== GENRE ENDPOINTS ==========

  // GET /api/genres
  app.get("/api/genres", async (req, res) => {
    const genres = await storage.getAllGenres();
    res.json(genres);
  });

  // GET /api/genres/:id
  app.get("/api/genres/:id", async (req, res) => {
    const genre = await storage.getGenre(req.params.id);
    if (!genre) {
      return res.status(404).json({ error: "Genre not found" });
    }
    res.json(genre);
  });

  // GET /api/genres/:id/books
  app.get("/api/genres/:id/books", async (req, res) => {
    try {
      const genre = await storage.getGenre(req.params.id);
      if (!genre) {
        return res.status(404).json({ error: "Genre not found" });
      }

      // Check cache first
      let books = await storage.getBooksByGenre(req.params.id);

      // If cache is empty or old, fetch from API
      if (books.length === 0) {
        const apiBooks = await searchBooksFromAPI(genre.name);

        // Cache the books
        for (const item of apiBooks) {
          const volumeInfo = item.volumeInfo || {};
          await storage.createBook({
            id: item.id,
            genreId: req.params.id,
            title: volumeInfo.title || "Unknown Title",
            authors: volumeInfo.authors?.join(", ") || null,
            overview: volumeInfo.description || null,
            imageUrl:
              volumeInfo.imageLinks?.thumbnail ||
              volumeInfo.imageLinks?.smallThumbnail ||
              null,
            downloadUrl: item.accessInfo?.pdf?.downloadLink || null,
            previewLink: volumeInfo.previewLink || null,
            publishedDate: volumeInfo.publishedDate || null,
            pageCount: volumeInfo.pageCount || null,
          });
        }

        books = await storage.getBooksByGenre(req.params.id);
      }

      res.json(books);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch books" });
    }
  });

  // ========== BOOK ENDPOINTS ==========

  // GET /api/books/:id
  app.get("/api/books/:id", async (req, res) => {
    const book = await storage.getBook(req.params.id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json(book);
  });

  // GET /api/books/:id/preview
  app.get("/api/books/:id/preview", async (req, res) => {
    const book = await storage.getBook(req.params.id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Return preview data (first 5 pages simulation)
    res.json({
      bookId: book.id,
      previewPages: 5,
      content: book.overview || "Preview content not available",
      previewLink: book.previewLink,
    });
  });

  // GET /api/books/:id/download
  app.get("/api/books/:id/download", async (req, res) => {
    const book = await storage.getBook(req.params.id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    if (!book.downloadUrl) {
      return res
        .status(404)
        .json({ error: "Download not available for this book" });
    }

    res.json({ downloadUrl: book.downloadUrl });
  });

  // ========== CONTACT ENDPOINT ==========

  // POST /api/contact
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = contactFormSchema.parse(req.body);

      const message = await storage.createContactMessage({
        userId: req.session.userId || null,
        ...validatedData,
      });

      // Send notification if user is logged in
      if (req.session.userId) {
        await storage.createNotification({
          userId: req.session.userId,
          type: "success",
          message:
            "Your message has been received. Our team will contact you soon!",
        });
      }

      res.json({ message: "Message sent successfully", id: message.id });
    } catch (error: any) {
      res
        .status(400)
        .json({ error: error.message || "Failed to send message" });
    }
  });

  // ========== NOTIFICATION ENDPOINTS ==========

  // GET /api/notifications
  app.get("/api/notifications", requireAuth, async (req, res) => {
    const notifications = await storage.getUserNotifications(
      req.session.userId!
    );
    res.json(notifications);
  });

  // PUT /api/notifications/:id/read
  app.put("/api/notifications/:id/read", requireAuth, async (req, res) => {
    await storage.markNotificationAsRead(req.params.id);
    res.json({ message: "Notification marked as read" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
