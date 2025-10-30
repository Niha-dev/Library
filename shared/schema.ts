import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - for authentication and profile
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  country: text("country").notNull().default('IN'), // ISO country code
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Genres table - predefined book genres
export const genres = pgTable("genres", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  imageUrl: text("image_url"),
  description: text("description"),
});

// Books cache - cache books fetched from external APIs
export const booksCache = pgTable("books_cache", {
  id: text("id").primaryKey(), // API ID from Google Books/Open Library
  genreId: varchar("genre_id").references(() => genres.id),
  title: text("title").notNull(),
  authors: text("authors"), // JSON array as string
  overview: text("overview"),
  imageUrl: text("image_url"),
  downloadUrl: text("download_url"),
  previewLink: text("preview_link"),
  publishedDate: text("published_date"),
  pageCount: integer("page_count"),
  cachedAt: timestamp("cached_at").notNull().defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'info', 'success', 'warning', 'error'
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Optional - can be sent by non-logged-in users
  name: text("name"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  country: text("country").notNull(),
  message: text("message"),
  bookId: text("book_id"), // If ordering a specific book
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  notifications: many(notifications),
  contactMessages: many(contactMessages),
  passwordResetTokens: many(passwordResetTokens),
}));

export const genresRelations = relations(genres, ({ many }) => ({
  books: many(booksCache),
}));

export const booksCacheRelations = relations(booksCache, ({ one }) => ({
  genre: one(genres, {
    fields: [booksCache.genreId],
    references: [genres.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const contactMessagesRelations = relations(contactMessages, ({ one }) => ({
  user: one(users, {
    fields: [contactMessages.userId],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Invalid email format"),
  passwordHash: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required").optional(),
  bio: z.string().optional(),
  country: z.string().length(2, "Invalid country code"),
}).omit({ id: true, createdAt: true });

export const registerUserSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).omit({ passwordHash: true }).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  bio: z.string().optional(),
  country: z.string().length(2, "Invalid country code").optional(),
});

export const insertGenreSchema = createInsertSchema(genres).omit({ id: true });

export const insertBookCacheSchema = createInsertSchema(booksCache).omit({ cachedAt: true });

export const insertNotificationSchema = createInsertSchema(notifications).omit({ 
  id: true, 
  createdAt: true, 
  read: true 
});

export const insertContactMessageSchema = createInsertSchema(contactMessages, {
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone number is required"),
  country: z.string().length(2, "Invalid country code"),
}).omit({ id: true, createdAt: true });

export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone number is required"),
  country: z.string().length(2, "Invalid country code"),
  message: z.string().optional(),
  bookId: z.string().optional(),
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;

export type Genre = typeof genres.$inferSelect;
export type InsertGenre = z.infer<typeof insertGenreSchema>;

export type BookCache = typeof booksCache.$inferSelect;
export type InsertBookCache = z.infer<typeof insertBookCacheSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactForm = z.infer<typeof contactFormSchema>;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
