export interface UserProfile {
    id: string;
    anonymousName: string;
    realName?: string;
    age: number;
    gender: string;
    avatar?: string;
    bio?: string;
    isVerified: boolean;
    interests: string[];
    university?: string;
    faculty?: string;
    height?: string;
    degree?: string;
    hometown?: string;
    skinTone?: string;
}

export interface FilterOptions {
    ageRange: [number, number];
    universities: string[];
    interests: string[];
}
