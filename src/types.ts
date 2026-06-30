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
  role: 'Admin' | 'Manager' | 'Cashier'; // Polaris standardized roles
  status?: 'Active' | 'Inactive';
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
  category: 'Wine' | 'Beer' | 'Liquor' | 'Extras'; // Legacy compatibility
  description?: string;
  imageUrl?: string;
  age_restricted: boolean;
  distributor_sku?: string;
  barcode?: string; // Legacy compatibility
  
  // High-fidelity Polaris fields
  case_count: number; // integer count of cases
  bottles_per_case: number; // integer bottles per case
  loose_bottle_count: number; // integer loose bottles in inventory
  total_bottles_calculated: number; // computed: (case_count * bottles_per_case) + loose_bottle_count
  
  cost_per_case: number; // decimal cost per case
  cost_per_unit: number; // computed: cost_per_case / bottles_per_case
  retail_price: number; // decimal price per bottle
  margin_percentage: number; // computed: ((retail_price - cost_per_unit) / retail_price) * 100
  
  abv_percentage: number; // decimal ABV percentage (e.g. 40.0)
  vintage_year: string | null; // e.g. "2018", null
  liquor_category: 'Spirits' | 'Wine' | 'Beer' | 'Extras';
  deposit_fee: number; // e.g. CRV breakage fee / environmental deposit
  upc_barcode: string; // unique scan code

  // Backward compatibility fields
  inventory_cases: number; // floor(inventory_bottles / bottles_per_case)
  inventory_bottles: number; // total bottles in stock
  price_per_bottle: number; // maps to retail_price
  price_per_case?: number;
  vendor?: string; // distributor
  createdAt: string;
  chatter?: ChatterMessage[];
}

export interface Customer {
  id: string;
  tenant_id: string;
  name: string; // legacy: Combined first and last name
  email: string;
  phone: string; // legacy: phone number
  dob?: string; // legacy: date of birth

  // Polaris expanded fields
  loyalty_id: string; // unique loyalty ID
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string;
  total_lifetime_spend: number;
  store_credit_balance: number;
  wholesale_tier: 'Retail Standard' | 'Tier-2 Bar/Restaurant Bulk Account';

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
  customer_id?: string | null;
  customer_name?: string;
  items: TransactionItem[];
  subtotal: number;
  discount_total: number;
  tax: number;
  total: number;
  payment_method: 'Cash' | 'Card' | 'Split' | 'House Account'; // Card includes previous 'Tap-to-Pay'
  
  // State-level compliance logging
  order_number: string; // e.g. #1001
  cashier_user_id: string; // UUID/id of cashier
  cashier_name: string;
  age_verified: boolean;
  verification_method: 'Scanned ID' | 'Manual DOB Input' | 'None';
  birth_date_logged: string | null;
  compliance_timestamp: string | null;
  
  category_discounts_applied: number;
  promo_coupons_applied: number;
  tax_accrued: number;
  grand_total: number;

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

// Procurement Purchase Order interfaces
export interface PurchaseOrderItem {
  product_id: string;
  product_name: string;
  ordered_cases: number;
  received_cases: number;
  unit_cost_contracted: number;
}

export interface PurchaseOrder {
  id: string; // e.g. po_1234
  purchase_order_number: string; // e.g. PO-4921
  vendor_name: string; // e.g. Southern Glazer's Wine & Spirits
  po_status: 'Draft' | 'Sent' | 'Partially Received' | 'Fully Received';
  items: PurchaseOrderItem[];
  createdAt: string;
}
