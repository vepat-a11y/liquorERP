export interface Tenant {
  id: string;
  name: string;
  slug: string;
  licenseNumber: string;
  createdAt: string;
}

export interface User {
  id: string;
  tenant_id: string;
  clerkUserId: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "750mL", "1.75L", "Single Bottle", "Case (12 Bottles)"
  price: number;
  cost: number;
  distributor_sku: string;
  barcode: string;
  inventory_bottles: number; // total individual bottles
  bottles_per_case?: number; // e.g. 12
  is_case: boolean; // if true, this variant is the case itself
}

export interface ChatterMessage {
  id: string;
  user: string;
  action: 'created' | 'update' | 'inventory_received' | 'sale_deducted' | 'comment';
  detail: string;
  timestamp: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  category: 'Wine' | 'Beer' | 'Liquor' | 'Extras';
  description?: string;
  imageUrl?: string;
  age_restricted: boolean;
  distributor_sku?: string;
  barcode?: string;
  // Case info
  bottles_per_case: number; // Default e.g. 12, 24, 1
  inventory_cases: number; // calculated as floor(inventory_bottles / bottles_per_case)
  inventory_bottles: number; // total individual bottles in stock
  price_per_bottle: number;
  price_per_case?: number; // optional, case-break discount price
  cost_per_unit?: number; // cost of the product / wholesale cost
  vendor?: string; // Vendor name / distributor info
  variants?: ProductVariant[];
  createdAt: string;
  chatter?: ChatterMessage[];
}

export interface Customer {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  phone: string;
  dob?: string; // for age check lookup
  createdAt: string;
  chatter?: ChatterMessage[];
}

export interface TransactionItem {
  id: string;
  product_id: string;
  product_name: string;
  category: string;
  quantity: number; // number of bottles or items
  unit_price: number;
  discount_applied: number;
  total_price: number;
  is_case_purchase: boolean;
}

export interface Transaction {
  id: string;
  tenant_id: string;
  customer_id?: string;
  customer_name?: string;
  items: TransactionItem[];
  subtotal: number;
  discount_total: number;
  tax: number;
  total: number;
  payment_method: 'Cash' | 'Card' | 'Tap-to-Pay';
  age_verified_at?: string; // timestamp of DOB check
  age_verified_dob?: string; // scanned/input DOB
  cashier_id: string;
  cashier_name: string;
  createdAt: string;
}

export interface DiscountRule {
  id: string;
  name: string;
  type: 'category' | 'coupon';
  category?: 'Wine' | 'Beer' | 'Liquor' | 'Extras';
  minQuantity?: number;
  discountPercent?: number; // e.g. 10 for 10%
  discountAmount?: number;  // e.g. 5.00 for $5 off
  code?: string; // for coupon codes e.g. "HAPPYHOUR"
  isActive: boolean;
}

export interface DeliveryOrder {
  id: string;
  platform: 'UberEats' | 'DoorDash' | 'GrubHub' | 'Instacart' | 'Website Instore Pickup' | 'Website Delivery';
  customer: string;
  phone?: string;
  address?: string;
  items: { productName: string; productId: string; qty: number }[];
  total: number;
  status: 'Pending' | 'Accepted' | 'Processed';
  createdAt: string;
}

