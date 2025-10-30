// Storage layer implementation with PostgreSQL - based on blueprint:javascript_database
import { eq, and } from "drizzle-orm";
import { db } from "./db-local";
import {
  users,
  genres,
  booksCache,
  notifications,
  contactMessages,
  passwordResetTokens,
  type User,
  type InsertUser,
  type Genre,
  type InsertGenre,
  type BookCache,
  type InsertBookCache,
  type Notification,
  type InsertNotification,
  type ContactMessage,
  type InsertContactMessage,
  type PasswordResetToken,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  // Genre operations
  getAllGenres(): Promise<Genre[]>;
  getGenre(id: string): Promise<Genre | undefined>;
  createGenre(genre: InsertGenre): Promise<Genre>;

  // Book operations
  getBook(id: string): Promise<BookCache | undefined>;
  getBooksByGenre(genreId: string): Promise<BookCache[]>;
  createBook(book: InsertBookCache): Promise<BookCache>;
  updateBook(id: string, data: Partial<BookCache>): Promise<BookCache | undefined>;

  // Notification operations
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;

  // Contact message operations
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;

  // Password reset token operations
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markTokenAsUsed(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Genre operations
  async getAllGenres(): Promise<Genre[]> {
    return await db.select().from(genres);
  }

  async getGenre(id: string): Promise<Genre | undefined> {
    const [genre] = await db.select().from(genres).where(eq(genres.id, id));
    return genre || undefined;
  }

  async createGenre(insertGenre: InsertGenre): Promise<Genre> {
    const [genre] = await db.insert(genres).values(insertGenre).returning();
    return genre;
  }

  // Book operations
  async getBook(id: string): Promise<BookCache | undefined> {
    const [book] = await db.select().from(booksCache).where(eq(booksCache.id, id));
    return book || undefined;
  }

  async getBooksByGenre(genreId: string): Promise<BookCache[]> {
    return await db
      .select()
      .from(booksCache)
      .where(eq(booksCache.genreId, genreId));
  }

  async createBook(insertBook: InsertBookCache): Promise<BookCache> {
    const [book] = await db.insert(booksCache).values(insertBook).returning();
    return book;
  }

  async updateBook(id: string, data: Partial<BookCache>): Promise<BookCache | undefined> {
    const [book] = await db
      .update(booksCache)
      .set(data)
      .where(eq(booksCache.id, id))
      .returning();
    return book || undefined;
  }

  // Notification operations
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }

  // Contact message operations
  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const [message] = await db
      .insert(contactMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // Password reset token operations
  async createPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<PasswordResetToken> {
    const [resetToken] = await db
      .insert(passwordResetTokens)
      .values({ userId, token, expiresAt })
      .returning();
    return resetToken;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false)
        )
      );
    return resetToken || undefined;
  }

  async markTokenAsUsed(id: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, id));
  }
}

export const storage = new DatabaseStorage();
