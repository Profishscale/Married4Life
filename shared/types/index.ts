// Shared types between client and server

// User Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  subscriptionTier: 'free' | 'plus' | 'pro' | 'pro_max';
  partnerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Course Types
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnailUrl?: string;
  requiredTier: 'free' | 'plus' | 'pro' | 'pro_max';
  createdAt: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  orderIndex: number;
  videoUrl?: string;
  createdAt: Date;
}

// Game Types
export interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'conversation' | 'activity' | 'quiz' | 'challenge';
  createdAt: Date;
}

// AI Coach Types
export interface AIConversation {
  id: string;
  userId: string;
  message: string;
  response: string;
  context?: Record<string, any>;
  createdAt: Date;
}

export interface AISuggestion {
  id: string;
  userId: string;
  suggestion: string;
  type: 'activity' | 'course' | 'game' | 'tip';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

// Progress Types
export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: Date;
  progressPercentage: number;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Notification Types
export interface NotificationPreference {
  id: string;
  userId: string;
  reminderType: string;
  enabled: boolean;
  timePreference?: string;
  createdAt: Date;
}

// Subscription Types
export type SubscriptionTier = 'free' | 'plus' | 'pro' | 'pro_max';

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  features: string[];
}



