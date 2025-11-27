export type PropertyType = 'apartment' | 'house' | 'villa' | 'land' | 'office' | 'motel';
export type TransactionType = 'sale' | 'rent';
export type PropertyStatus = 'active' | 'hidden' | 'expired';
export type Direction = 'east' | 'west' | 'south' | 'north' | 'northeast' | 'northwest' | 'southeast' | 'southwest';

export interface Location {
  province: string;
  district: string;
  ward: string;
  street?: string;
  fullAddress: string;
}

export interface PropertyImage {
  id: string;
  uri: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  priceUnit: 'vnd' | 'million' | 'billion';
  pricePerM2?: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  direction?: Direction;
  propertyType: PropertyType;
  transactionType: TransactionType;
  location: Location;
  images: PropertyImage[];
  contactName: string;
  contactPhone: string;
  contactZalo?: string;
  isVIP: boolean;
  vipExpiryDate?: string;
  status: PropertyStatus;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
  lastPushedAt?: string;
  userId: string;
  viewCount: number;
  isFavorite?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  transactionType: TransactionType;
  propertyType?: PropertyType;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  link?: string;
}

export interface VIPPackage {
  id: string;
  name: string;
  days: number;
  price: number;
  description: string;
}

export interface SearchFilters {
  transactionType?: TransactionType;
  propertyType?: PropertyType;
  province?: string;
  district?: string;
  ward?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  bedrooms?: number;
  direction?: Direction;
  keyword?: string;
}
