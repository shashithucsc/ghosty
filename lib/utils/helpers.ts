import { v4 as uuidv4 } from 'uuid';

// Generate anonymous username
const adjectives = [
  'Charming', 'Brave', 'Gentle', 'Smart', 'Lovely', 'Wise', 'Sweet', 'Bold',
  'Clever', 'Daring', 'Elegant', 'Fearless', 'Graceful', 'Happy', 'Inspired',
  'Joyful', 'Kind', 'Lively', 'Magical', 'Noble', 'Optimistic', 'Peaceful',
  'Quirky', 'Radiant', 'Serene', 'Thoughtful', 'Unique', 'Vibrant', 'Witty',
  'Zealous', 'Amazing', 'Brilliant', 'Creative', 'Delightful', 'Energetic',
  'Fabulous', 'Genuine', 'Humble', 'Incredible', 'Jolly', 'Keen', 'Luminous',
];

const nouns = [
  'Soul', 'Explorer', 'Dreamer', 'Vibes', 'Spirit', 'Owl', 'Heart', 'Adventurer',
  'Butterfly', 'Comet', 'Dragon', 'Eagle', 'Phoenix', 'Falcon', 'Gecko',
  'Hawk', 'Iris', 'Jaguar', 'Kite', 'Lion', 'Meteor', 'Ninja', 'Orchid',
  'Panda', 'Quasar', 'Raven', 'Star', 'Tiger', 'Universe', 'Vortex',
  'Wolf', 'Xenon', 'Yeti', 'Zen', 'Angel', 'Bear', 'Cloud', 'Dove',
];

export function generateAnonymousName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 900) + 100; // 100-999
  return `${adjective}${noun}${number}`;
}

// Generate avatar based on gender
export function generateAvatar(gender: string): string {
  const avatars = {
    Male: ['👨', '🧑', '👨‍💼', '👨‍🎓', '🙋‍♂️', '👨‍🔬', '👨‍🎨', '👨‍💻', '🎩'],
    Female: ['👩', '👸', '💃', '👩‍🎓', '👩‍💼', '🌸', '👩‍🔬', '👩‍🎨', '👩‍💻'],
    'Non-binary': ['🧑', '⭐', '✨', '🌟', '💫', '🌈', '🦄', '🎭', '🎨'],
    Other: ['😊', '🌟', '✨', '💫', '🌈', '⭐', '🎭', '🎨', '🦋'],
  };

  const genderAvatars = avatars[gender as keyof typeof avatars] || avatars.Other;
  return genderAvatars[Math.floor(Math.random() * genderAvatars.length)];
}

// Calculate age from date of birth
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Generate activation token
export function generateActivationToken(): string {
  return uuidv4();
}

// Get token expiration time (24 hours from now)
export function getTokenExpiration(): string {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  return expiresAt.toISOString();
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
}

// Validate date of birth (must be 18+ years old)
export function isValidDateOfBirth(dateOfBirth: string): { valid: boolean; message?: string } {
  const age = calculateAge(dateOfBirth);
  if (age < 18) {
    return { valid: false, message: 'You must be at least 18 years old to use Ghosty' };
  }
  if (age > 100) {
    return { valid: false, message: 'Invalid date of birth' };
  }
  return { valid: true };
}

// Sanitize text input
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

// Validate file upload
export function validateFile(
  file: File,
  maxSizeMB: number = 5,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
): { valid: boolean; message?: string } {
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: `File type not allowed. Accepted types: ${allowedTypes.join(', ')}` };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, message: `File size must be less than ${maxSizeMB}MB` };
  }
  
  return { valid: true };
}
