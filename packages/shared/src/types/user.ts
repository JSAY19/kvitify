export interface UserDTO {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface SmokingProfileDTO {
  id: string;
  quitDate: string;
  cigarettesPerDay: number;
  pricePerPack: number;
  cigarettesPerPack: number;
  smokingYears: number | null;
  motivation: string | null;
}

export interface OnboardingData {
  quitDate: string;
  cigarettesPerDay: number;
  pricePerPack: number;
  cigarettesPerPack: number;
  smokingYears?: number;
  motivation?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserDTO;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
