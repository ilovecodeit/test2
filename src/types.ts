export interface UserProfile {
  userId: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
}

export interface MockupHistory {
  id: string;
  userId: string;
  originalImage: string; // base64 string
  productName: string;
  productDescription?: string;
  medium: "mug" | "billboard" | "tshirt" | "phone_case" | "totebag";
  mockupImage: string; // base64 string
  prompt?: string;
  createdAt: string;
}
