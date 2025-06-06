// Unified Product interface for the frontend
export interface Product {
  id: string; // Backend uses UUID strings
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  category: string;
  imageUrl: string; // Main image URL (first from images array)
  images?: string[]; // Optional array of all images
  producer: {
    id: string;
    name: string;
    shopName?: string;
  };
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Cart item interface
export interface CartItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  producer: string; // Producer name/shop name
  image: string;
  category: string;
  quantity: number;
}

// Producer interface
export interface Producer {
  id: string;
  name: string;
  shopName?: string;
  description: string;
  specialties: string[];
  image: string;
  location: string;
}
