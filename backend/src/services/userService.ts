import bcrypt from 'bcryptjs';
import { pool } from '../../database/init';
import { User } from '../../../shared/types';

export class UserService {
  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    phone?: string;
    relationshipStatus: string;
    partnerName?: string;
    birthday?: string;
  }): Promise<User> {
    try {
      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 10);

      // Insert user
      const result = await pool.query(
        `INSERT INTO users 
         (email, password_hash, first_name, last_name, phone, subscription_tier)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, first_name, last_name, phone, subscription_tier, 
                   created_at, updated_at`,
        [
          data.email,
          passwordHash,
          data.firstName,
          data.lastName || null,
          data.phone || null,
          'free', // Default subscription tier
        ]
      );

      const user = result.rows[0];

      // Store additional onboarding data in a separate table or JSON field
      // For now, we'll just return the basic user data
      // TODO: Create a user_profiles table for additional fields

      return {
        id: user.id.toString(),
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        subscriptionTier: user.subscription_tier as any,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error: any) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new Error('Email already exists');
      }
      throw new Error('Failed to create user');
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await pool.query(
        `SELECT id, email, password_hash, first_name, last_name, phone, 
                subscription_tier, partner_id, created_at, updated_at
         FROM users WHERE email = $1`,
        [email]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id.toString(),
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
        subscriptionTier: row.subscription_tier as any,
        partnerId: row.partner_id?.toString(),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Failed to get user');
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const result = await pool.query(
        `SELECT id, email, first_name, last_name, phone, 
                subscription_tier, partner_id, created_at, updated_at
         FROM users WHERE id = $1`,
        [parseInt(id)]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id.toString(),
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
        subscriptionTier: row.subscription_tier as any,
        partnerId: row.partner_id?.toString(),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      console.error('Error getting user by id:', error);
      return null;
    }
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    try {
      const result = await pool.query(
        `SELECT id, email, password_hash, first_name, last_name, phone, 
                subscription_tier, partner_id, created_at, updated_at
         FROM users WHERE email = $1`,
        [email]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      const isValid = await bcrypt.compare(password, row.password_hash);

      if (!isValid) {
        return null;
      }

      return {
        id: row.id.toString(),
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
        subscriptionTier: row.subscription_tier as any,
        partnerId: row.partner_id?.toString(),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      console.error('Error verifying password:', error);
      return null;
    }
  }
}

export const userService = new UserService();

