import fs from 'fs';
import path from 'path';
import { Tenant, Product, Customer, Transaction } from './types';

const DB_FILE = path.join(process.cwd(), 'src', 'db-store.json');

// Initial seed data
const initialTenants: Tenant[] = [
  {
    id: 'tenant_1',
    name: 'Obsidian Wine & Spirits (Downtown)',
    slug: 'obsidian-downtown',
    licenseNumber: 'LIC-LIQ-2026-89472',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tenant_2',
    name: 'Amber Craft Beers & Spirits (Westside)',
    slug: 'amber-westside',
    licenseNumber: 'LIC-LIQ-2026-31049',
    createdAt: new Date().toISOString(),
  },
];

const initialCustomers: Customer[] = [
  {
    id: 'cust_1',
    tenant_id: 'tenant_1',
    name: 'Marcus Vance',
    first_name: 'Marcus',
    last_name: 'Vance',
    email: 'marcus.vance@example.com',
    phone: '555-0192',
    phone_number: '555-0192',
    dob: '1984-05-12',
    date_of_birth: '1984-05-12',
    loyalty_id: 'LOY-VANCE',
    total_lifetime_spend: 1420.50,
    store_credit_balance: 15.00,
    wholesale_tier: 'Retail Standard',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cust_2',
    tenant_id: 'tenant_1',
    name: 'Elena Rostova',
    first_name: 'Elena',
    last_name: 'Rostova',
    email: 'elena.rostova@example.com',
    phone: '555-0348',
    phone_number: '555-0348',
    dob: '1992-11-23',
    date_of_birth: '1992-11-23',
    loyalty_id: 'LOY-ROSTOVA',
    total_lifetime_spend: 2850.00,
    store_credit_balance: 0.00,
    wholesale_tier: 'Tier-2 Bar/Restaurant Bulk Account',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cust_3',
    tenant_id: 'tenant_2',
    name: 'Sarah Connor',
    first_name: 'Sarah',
    last_name: 'Connor',
    email: 'sarah.c@example.com',
    phone: '555-0987',
    phone_number: '555-0987',
    dob: '1965-11-10',
    date_of_birth: '1965-11-10',
    loyalty_id: 'LOY-CONNOR',
    total_lifetime_spend: 340.00,
    store_credit_balance: 50.00,
    wholesale_tier: 'Retail Standard',
    createdAt: new Date().toISOString(),
  },
];

const createInitialProducts = (): Product[] => [
  // Tenant 1 Products (Obsidian Wine & Spirits)
  {
    id: 'prod_1',
    tenant_id: 'tenant_1',
    name: 'Jameson Irish Whiskey',
    category: 'Liquor',
    description: 'Triple-distilled Irish whiskey, smooth and versatile.',
    imageUrl: 'https://images.unsplash.com/photo-1592751862414-0700084d6102?auto=format&fit=crop&q=80&w=200',
    age_restricted: true,
    distributor_sku: 'DI-JAM-750',
    barcode: '5011007003003',
    
    // Polaris compliance structures
    case_count: 5,
    bottles_per_case: 12,
    loose_bottle_count: 4,
    total_bottles_calculated: 64,
    cost_per_case: 240.00,
    cost_per_unit: 20.00,
    retail_price: 32.99,
    margin_percentage: 39.38,
    abv_percentage: 40.0,
    vintage_year: null,
    liquor_category: 'Spirits',
    deposit_fee: 0.10,
    upc_barcode: '5011007003003',

    // Backward compatibility
    inventory_bottles: 64,
    inventory_cases: 5,
    price_per_bottle: 32.99,
    price_per_case: 359.99,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_2',
    tenant_id: 'tenant_1',
    name: 'Veuve Clicquot Champagne',
    category: 'Wine',
    description: 'Symphony of fruitness and brioche, perfect for celebration.',
    imageUrl: 'https://images.unsplash.com/photo-1594462106222-3cf22d45a8f5?auto=format&fit=crop&q=80&w=200',
    age_restricted: true,
    distributor_sku: 'DI-VEU-750',
    barcode: '3045203301010',

    // Polaris compliance structures
    case_count: 3,
    bottles_per_case: 6,
    loose_bottle_count: 2,
    total_bottles_calculated: 20,
    cost_per_case: 210.00,
    cost_per_unit: 35.00,
    retail_price: 59.99,
    margin_percentage: 41.66,
    abv_percentage: 12.0,
    vintage_year: '2021',
    liquor_category: 'Wine',
    deposit_fee: 0.20,
    upc_barcode: '3045203301010',

    // Backward compatibility
    inventory_bottles: 20,
    inventory_cases: 3,
    price_per_bottle: 59.99,
    price_per_case: 329.99,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_3',
    tenant_id: 'tenant_1',
    name: 'Caymus Napa Cabernet Sauvignon',
    category: 'Wine',
    description: 'Rich, dark, with luscious flavors of black currant and dark cherries.',
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=200',
    age_restricted: true,
    distributor_sku: 'DI-CAY-CS-15',
    barcode: '012086111303',

    // Polaris compliance structures
    case_count: 1,
    bottles_per_case: 12,
    loose_bottle_count: 2,
    total_bottles_calculated: 14,
    cost_per_case: 600.00,
    cost_per_unit: 50.00,
    retail_price: 89.99,
    margin_percentage: 44.44,
    abv_percentage: 14.5,
    vintage_year: '2020',
    liquor_category: 'Wine',
    deposit_fee: 0.10,
    upc_barcode: '012086111303',

    // Backward compatibility
    inventory_bottles: 14,
    inventory_cases: 1,
    price_per_bottle: 89.99,
    price_per_case: 999.99,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_4',
    tenant_id: 'tenant_1',
    name: 'Heineken Premium Lager',
    category: 'Beer',
    description: 'Crisp, clean, classic Dutch golden lager.',
    imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=200',
    age_restricted: true,
    distributor_sku: 'DI-HEI-6PK',
    barcode: '072890000116',

    // Polaris compliance structures
    case_count: 4,
    bottles_per_case: 24,
    loose_bottle_count: 0,
    total_bottles_calculated: 96,
    cost_per_case: 28.80,
    cost_per_unit: 1.20,
    retail_price: 2.75,
    margin_percentage: 56.36,
    abv_percentage: 5.0,
    vintage_year: null,
    liquor_category: 'Beer',
    deposit_fee: 0.05,
    upc_barcode: '072890000116',

    // Backward compatibility
    inventory_bottles: 96,
    inventory_cases: 4,
    price_per_bottle: 2.75,
    price_per_case: 54.99,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_5',
    tenant_id: 'tenant_1',
    name: 'Crystal Wine Glass Set (2pcs)',
    category: 'Extras',
    description: 'Premium lead-free crystal glasses for wine.',
    imageUrl: 'https://images.unsplash.com/photo-1574926053821-79c5e338a933?auto=format&fit=crop&q=80&w=200',
    age_restricted: false,
    distributor_sku: 'ACC-WG-02',
    barcode: '885544332211',

    // Polaris compliance structures
    case_count: 2,
    bottles_per_case: 10,
    loose_bottle_count: 5,
    total_bottles_calculated: 25,
    cost_per_case: 120.00,
    cost_per_unit: 12.00,
    retail_price: 24.99,
    margin_percentage: 51.98,
    abv_percentage: 0.0,
    vintage_year: null,
    liquor_category: 'Extras',
    deposit_fee: 0.00,
    upc_barcode: '885544332211',

    // Backward compatibility
    inventory_bottles: 25,
    inventory_cases: 2,
    price_per_bottle: 24.99,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_6',
    tenant_id: 'tenant_1',
    name: 'Polar Ice Bag (10 lbs)',
    category: 'Extras',
    description: 'Pure double-filtered party ice block.',
    imageUrl: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&q=80&w=200',
    age_restricted: false,
    distributor_sku: 'ACC-ICE-10',
    barcode: '776655443322',

    // Polaris compliance structures
    case_count: 150,
    bottles_per_case: 1,
    loose_bottle_count: 0,
    total_bottles_calculated: 150,
    cost_per_case: 1.00,
    cost_per_unit: 1.00,
    retail_price: 3.49,
    margin_percentage: 71.34,
    abv_percentage: 0.0,
    vintage_year: null,
    liquor_category: 'Extras',
    deposit_fee: 0.00,
    upc_barcode: '776655443322',

    // Backward compatibility
    inventory_bottles: 150,
    inventory_cases: 150,
    price_per_bottle: 3.49,
    createdAt: new Date().toISOString(),
  },

  // Tenant 2 Products (Amber Craft Beers & Spirits)
  {
    id: 'prod_7',
    tenant_id: 'tenant_2',
    name: 'Lagunitas IPA Craft Beer',
    category: 'Beer',
    description: 'A well-rounded, highly drinkable India Pale Ale.',
    imageUrl: 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&q=80&w=200',
    age_restricted: true,
    distributor_sku: 'DI-LAG-IPA',
    barcode: '021078001704',

    // Polaris compliance structures
    case_count: 5,
    bottles_per_case: 24,
    loose_bottle_count: 0,
    total_bottles_calculated: 120,
    cost_per_case: 36.00,
    cost_per_unit: 1.50,
    retail_price: 3.25,
    margin_percentage: 53.84,
    abv_percentage: 6.2,
    vintage_year: null,
    liquor_category: 'Beer',
    deposit_fee: 0.05,
    upc_barcode: '021078001704',

    // Backward compatibility
    inventory_bottles: 120,
    inventory_cases: 5,
    price_per_bottle: 3.25,
    price_per_case: 65.00,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_8',
    tenant_id: 'tenant_2',
    name: 'Macallan 12 Year Double Cask',
    category: 'Liquor',
    description: 'Single malt Scotch whisky matured in sherry-seasoned oak casks.',
    imageUrl: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&q=80&w=200',
    age_restricted: true,
    distributor_sku: 'DI-MAC-12',
    barcode: '5010314051009',

    // Polaris compliance structures
    case_count: 2,
    bottles_per_case: 6,
    loose_bottle_count: 3,
    total_bottles_calculated: 15,
    cost_per_case: 360.00,
    cost_per_unit: 60.00,
    retail_price: 84.99,
    margin_percentage: 29.40,
    abv_percentage: 43.0,
    vintage_year: null,
    liquor_category: 'Spirits',
    deposit_fee: 0.10,
    upc_barcode: '5010314051009',

    // Backward compatibility
    inventory_bottles: 15,
    inventory_cases: 2,
    price_per_bottle: 84.99,
    price_per_case: 479.99,
    createdAt: new Date().toISOString(),
  },
];

const initialTransactions = (): Transaction[] => [
  {
    id: 'tx_1',
    tenant_id: 'tenant_1',
    customer_id: 'cust_1',
    customer_name: 'Marcus Vance',
    subtotal: 98.97,
    discount_total: 0.00,
    tax: 8.41,
    total: 107.38,
    payment_method: 'Card',
    
    // State-level compliance logging
    order_number: '#1001',
    cashier_user_id: 'usr_3',
    cashier_name: 'Sarah Jenkins',
    age_verified: true,
    verification_method: 'Scanned ID',
    birth_date_logged: '1984-05-12',
    compliance_timestamp: new Date(Date.now() - 3600000).toISOString(),
    
    category_discounts_applied: 0.00,
    promo_coupons_applied: 0.00,
    tax_accrued: 8.41,
    grand_total: 107.38,
    
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    items: [
      {
        id: 'txi_1',
        product_id: 'prod_1',
        product_name: 'Jameson Irish Whiskey',
        category: 'Liquor',
        quantity: 3,
        unit_price: 32.99,
        discount_applied: 0.00,
        total_price: 98.97,
        is_case_purchase: false,
      }
    ]
  },
  {
    id: 'tx_2',
    tenant_id: 'tenant_1',
    customer_id: 'cust_2',
    customer_name: 'Elena Rostova',
    subtotal: 359.94,
    discount_total: 35.99,
    tax: 27.54,
    total: 351.49,
    payment_method: 'Card',
    
    // State-level compliance logging
    order_number: '#1002',
    cashier_user_id: 'usr_3',
    cashier_name: 'Sarah Jenkins',
    age_verified: true,
    verification_method: 'Manual DOB Input',
    birth_date_logged: '1992-11-23',
    compliance_timestamp: new Date(Date.now() - 1800000).toISOString(),
    
    category_discounts_applied: 35.99,
    promo_coupons_applied: 0.00,
    tax_accrued: 27.54,
    grand_total: 351.49,

    createdAt: new Date(Date.now() - 1800000).toISOString(),
    items: [
      {
        id: 'txi_2',
        product_id: 'prod_2',
        product_name: 'Veuve Clicquot Champagne',
        category: 'Wine',
        quantity: 6,
        unit_price: 59.99,
        discount_applied: 35.99,
        total_price: 323.95,
        is_case_purchase: true,
      }
    ]
  },
];

interface DatabaseSchema {
  tenants: Tenant[];
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  // Enterprise Settings Configs
  storeProfile?: Record<string, any>;
  complianceSettings?: Record<string, any>;
  hardwareSettings?: Record<string, any>;
}

class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      tenants: [],
      products: [],
      customers: [],
      transactions: [],
      storeProfile: {},
      complianceSettings: {},
      hardwareSettings: {}
    };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        // Seed database
        this.data = {
          tenants: initialTenants,
          products: createInitialProducts(),
          customers: initialCustomers,
          transactions: initialTransactions(),
          storeProfile: {
            storeName: 'Obsidian Liquor & Wine',
            legalName: 'Obsidian Retail Enterprises LLC',
            address: '100 Grand Avenue, Suite 400, Chicago IL 60611',
            retail_license_num: 'LIC-LIQ-2026-89472',
            wholesale_license_num: 'LIC-WHL-2026-90412'
          },
          complianceSettings: {
            sales_tax_rate: 8.5,
            minimum_legal_age: 21,
            sales_cutoff_time: '02:00 AM',
            cutoff_enabled: true,
            max_spirits_per_transaction_gallons: 2.5
          },
          hardwareSettings: {
            cashDrawerStatus: 'Connected (USB Port 1)',
            cashDrawerTarget: '192.168.1.185',
            receiptPrinterStatus: 'Connected (Epson Print Service)',
            receiptPrinterTarget: '192.168.1.192',
            barcodeScannerStatus: 'Connected (HID Keyboard Wedge Mode)',
            barcodeScannerTarget: 'COM3',
            stripeReaderStatus: 'Connected (WiFi Stripe BBPOS)',
            stripeReaderTarget: '192.168.1.150'
          }
        };
        this.save();
      }

      // Ensure loaded items are fully normalized
      this.data.products = this.data.products.map(p => this.normalizeProduct(p));
      this.data.customers = this.data.customers.map(c => this.normalizeCustomer(c));
      this.data.transactions = this.data.transactions.map(t => this.normalizeTransaction(t));
      
      if (!this.data.storeProfile || Object.keys(this.data.storeProfile).length === 0) {
        this.data.storeProfile = {
          storeName: 'Obsidian Liquor & Wine',
          legalName: 'Obsidian Retail Enterprises LLC',
          address: '100 Grand Avenue, Suite 400, Chicago IL 60611',
          retail_license_num: 'LIC-LIQ-2026-89472',
          wholesale_license_num: 'LIC-WHL-2026-90412'
        };
      }
      if (!this.data.complianceSettings || Object.keys(this.data.complianceSettings).length === 0) {
        this.data.complianceSettings = {
          sales_tax_rate: 8.5,
          minimum_legal_age: 21,
          sales_cutoff_time: '02:00 AM',
          cutoff_enabled: true,
          max_spirits_per_transaction_gallons: 2.5
        };
      }
      if (!this.data.hardwareSettings || Object.keys(this.data.hardwareSettings).length === 0) {
        this.data.hardwareSettings = {
          cashDrawerStatus: 'Connected (USB Port 1)',
          cashDrawerTarget: '192.168.1.185',
          receiptPrinterStatus: 'Connected (Epson Print Service)',
          receiptPrinterTarget: '192.168.1.192',
          barcodeScannerStatus: 'Connected (HID Keyboard Wedge Mode)',
          barcodeScannerTarget: 'COM3',
          stripeReaderStatus: 'Connected (WiFi Stripe BBPOS)',
          stripeReaderTarget: '192.168.1.150'
        };
      }
    } catch (e) {
      console.error('Failed to load database, falling back to memory', e);
      this.data = {
        tenants: initialTenants,
        products: createInitialProducts().map(p => this.normalizeProduct(p)),
        customers: initialCustomers.map(c => this.normalizeCustomer(c)),
        transactions: initialTransactions().map(t => this.normalizeTransaction(t)),
        storeProfile: {
          storeName: 'Obsidian Liquor & Wine',
          legalName: 'Obsidian Retail Enterprises LLC',
          address: '100 Grand Avenue, Suite 400, Chicago IL 60611',
          retail_license_num: 'LIC-LIQ-2026-89472',
          wholesale_license_num: 'LIC-WHL-2026-90412'
        },
        complianceSettings: {
          sales_tax_rate: 8.5,
          minimum_legal_age: 21,
          sales_cutoff_time: '02:00 AM',
          cutoff_enabled: true,
          max_spirits_per_transaction_gallons: 2.5
        },
        hardwareSettings: {
          cashDrawerStatus: 'Connected (USB Port 1)',
          cashDrawerTarget: '192.168.1.185',
          receiptPrinterStatus: 'Connected (Epson Print Service)',
          receiptPrinterTarget: '192.168.1.192',
          barcodeScannerStatus: 'Connected (HID Keyboard Wedge Mode)',
          barcodeScannerTarget: 'COM3',
          stripeReaderStatus: 'Connected (WiFi Stripe BBPOS)',
          stripeReaderTarget: '192.168.1.150'
        }
      };
    }
  }

  private save() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file', e);
    }
  }

  // Normalization Helpers
  normalizeProduct(p: any): Product {
    const bottles_per_case = Number(p.bottles_per_case || 12);
    
    // Compute inventories
    let loose_bottle_count = Number(p.loose_bottle_count !== undefined ? p.loose_bottle_count : 0);
    let case_count = Number(p.case_count !== undefined ? p.case_count : 0);
    
    // If we only have legacy totals, use them to calculate case and loose count
    let total_bottles = p.inventory_bottles !== undefined ? Number(p.inventory_bottles) : ((case_count * bottles_per_case) + loose_bottle_count);
    
    if (p.inventory_bottles !== undefined && p.loose_bottle_count === undefined) {
      case_count = Math.floor(total_bottles / bottles_per_case);
      loose_bottle_count = total_bottles % bottles_per_case;
    } else {
      total_bottles = (case_count * bottles_per_case) + loose_bottle_count;
    }

    const retail_price = Number(p.retail_price !== undefined ? p.retail_price : (p.price_per_bottle !== undefined ? p.price_per_bottle : 29.99));
    const cost_per_case = Number(p.cost_per_case !== undefined ? p.cost_per_case : (p.cost_per_unit ? (p.cost_per_unit * bottles_per_case) : 180.00));
    const cost_per_unit = Number(p.cost_per_unit !== undefined ? p.cost_per_unit : (cost_per_case / bottles_per_case));
    const margin_percentage = retail_price > 0 ? Number((((retail_price - cost_per_unit) / retail_price) * 100).toFixed(2)) : 0;
    
    const abv_percentage = Number(p.abv_percentage !== undefined ? p.abv_percentage : (p.category === 'Liquor' ? 40.0 : p.category === 'Wine' ? 13.5 : p.category === 'Beer' ? 5.0 : 0.0));
    const vintage_year = p.vintage_year !== undefined ? p.vintage_year : null;
    const liquor_category = p.liquor_category || (p.category === 'Liquor' ? 'Spirits' : p.category || 'Extras');
    const deposit_fee = Number(p.deposit_fee !== undefined ? p.deposit_fee : (liquor_category === 'Beer' ? 0.05 : liquor_category === 'Wine' ? 0.20 : liquor_category === 'Spirits' ? 0.10 : 0.00));
    const upc_barcode = p.upc_barcode || p.barcode || Math.floor(100000000000 + Math.random() * 900000000000).toString();

    return {
      ...p,
      case_count,
      bottles_per_case,
      loose_bottle_count,
      total_bottles_calculated: total_bottles,
      
      cost_per_case,
      cost_per_unit,
      retail_price,
      margin_percentage,
      
      abv_percentage,
      vintage_year,
      liquor_category,
      deposit_fee,
      upc_barcode,

      // Legacy support
      inventory_bottles: total_bottles,
      inventory_cases: case_count,
      price_per_bottle: retail_price,
      price_per_case: p.price_per_case || Number((retail_price * bottles_per_case * 0.9).toFixed(2)),
      category: p.category || (liquor_category === 'Spirits' ? 'Liquor' : liquor_category),
      barcode: upc_barcode,
      vendor: p.vendor || 'Southern Glazer\'s Wine & Spirits'
    };
  }

  normalizeCustomer(c: any): Customer {
    const name = c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Valued Customer';
    const nameParts = name.split(' ');
    const first_name = c.first_name || nameParts[0] || 'Valued';
    const last_name = c.last_name || nameParts.slice(1).join(' ') || 'Customer';
    const email = c.email || `${first_name.toLowerCase()}.${last_name.toLowerCase()}@example.com`;
    const phone_number = c.phone_number || c.phone || '555-0100';
    const date_of_birth = c.date_of_birth || c.dob || '1995-01-01';
    
    const loyalty_id = c.loyalty_id || `LOY-${(c.id || '').split('_')[1]?.toUpperCase() || Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const total_lifetime_spend = Number(c.total_lifetime_spend !== undefined ? c.total_lifetime_spend : 150.00);
    const store_credit_balance = Number(c.store_credit_balance !== undefined ? c.store_credit_balance : 0.00);
    const wholesale_tier = c.wholesale_tier || 'Retail Standard';

    return {
      ...c,
      loyalty_id,
      first_name,
      last_name,
      email,
      phone_number,
      date_of_birth,
      total_lifetime_spend,
      store_credit_balance,
      wholesale_tier,
      
      // Backward compatibility
      name,
      phone: phone_number,
      dob: date_of_birth,
    };
  }

  normalizeTransaction(t: any): Transaction {
    const order_number = t.order_number || `#${(t.id || '').split('_')[1] || Math.floor(1000 + Math.random() * 9000)}`;
    const cashier_user_id = t.cashier_user_id || t.cashier_id || 'usr_3';
    const cashier_name = t.cashier_name || 'Sarah Jenkins';
    const customer_id = t.customer_id || null;
    const customer_name = t.customer_name || 'Walk-in Customer';
    const payment_method = t.payment_method || 'Cash';
    
    const age_verified = t.age_verified !== undefined ? t.age_verified : (t.age_verified_at ? true : false);
    const verification_method = t.verification_method || (age_verified ? 'Scanned ID' : 'None');
    const birth_date_logged = t.birth_date_logged || t.age_verified_dob || null;
    const compliance_timestamp = t.compliance_timestamp || t.age_verified_at || null;
    
    const subtotal = Number(t.subtotal || 0);
    const category_discounts_applied = Number(t.category_discounts_applied !== undefined ? t.category_discounts_applied : 0);
    const promo_coupons_applied = Number(t.promo_coupons_applied !== undefined ? t.promo_coupons_applied : 0);
    const tax_accrued = Number(t.tax_accrued !== undefined ? t.tax_accrued : (t.tax || 0));
    const grand_total = Number(t.grand_total !== undefined ? t.grand_total : (t.total || 0));

    return {
      ...t,
      order_number,
      cashier_user_id,
      cashier_name,
      customer_id,
      customer_name,
      payment_method,
      
      age_verified,
      verification_method,
      birth_date_logged,
      compliance_timestamp,
      
      subtotal,
      category_discounts_applied,
      promo_coupons_applied,
      tax_accrued,
      grand_total,
      
      // Backward compatibility
      tax: tax_accrued,
      total: grand_total,
      discount_total: category_discounts_applied + promo_coupons_applied,
    };
  }

  // Tenants
  getTenants(): Tenant[] {
    return this.data.tenants;
  }

  getTenant(id: string): Tenant | undefined {
    return this.data.tenants.find(t => t.id === id);
  }

  // Products
  getProducts(tenantId: string): Product[] {
    return this.data.products.filter(p => p.tenant_id === tenantId).map(p => this.normalizeProduct(p));
  }

  getProduct(tenantId: string, id: string): Product | undefined {
    const prod = this.data.products.find(p => p.id === id && p.tenant_id === tenantId);
    return prod ? this.normalizeProduct(prod) : undefined;
  }

  getProductByBarcode(tenantId: string, barcode: string): Product | undefined {
    const prod = this.data.products.find(p => (p.barcode === barcode || p.upc_barcode === barcode) && p.tenant_id === tenantId);
    return prod ? this.normalizeProduct(prod) : undefined;
  }

  addProduct(tenantId: string, productData: Partial<Product>): Product {
    const rawProduct = {
      ...productData,
      id: 'prod_' + Math.random().toString(36).substr(2, 9),
      tenant_id: tenantId,
      createdAt: new Date().toISOString(),
      chatter: []
    };
    const newProduct = this.normalizeProduct(rawProduct);
    newProduct.chatter!.push({
      id: 'cht_' + Math.random().toString(36).substr(2, 9),
      user: 'Staff',
      action: 'created',
      detail: `Created new catalog record for "${newProduct.name}" with initial retail price of $${newProduct.retail_price.toFixed(2)}.`,
      timestamp: new Date().toISOString()
    });
    this.data.products.push(newProduct);
    this.save();
    return newProduct;
  }

  updateProduct(tenantId: string, id: string, updates: Partial<Product>): Product | undefined {
    const index = this.data.products.findIndex(p => p.id === id && p.tenant_id === tenantId);
    if (index === -1) return undefined;
    
    const oldProduct = this.data.products[index];
    const changelog: string[] = [];
    
    if (updates.name && updates.name !== oldProduct.name) {
      changelog.push(`Name changed from "${oldProduct.name}" to "${updates.name}"`);
    }
    if (updates.retail_price !== undefined && updates.retail_price !== oldProduct.retail_price) {
      changelog.push(`Retail price changed from $${oldProduct.retail_price.toFixed(2)} to $${updates.retail_price.toFixed(2)}`);
    } else if (updates.price_per_bottle !== undefined && updates.price_per_bottle !== oldProduct.price_per_bottle) {
      changelog.push(`Retail price changed from $${oldProduct.price_per_bottle.toFixed(2)} to $${updates.price_per_bottle.toFixed(2)}`);
    }
    if (updates.cost_per_unit !== undefined && updates.cost_per_unit !== oldProduct.cost_per_unit) {
      changelog.push(`Unit cost changed from $${(oldProduct.cost_per_unit || 0).toFixed(2)} to $${updates.cost_per_unit.toFixed(2)}`);
    }
    if (updates.vendor && updates.vendor !== oldProduct.vendor) {
      changelog.push(`Vendor updated from "${oldProduct.vendor || 'None'}" to "${updates.vendor}"`);
    }
    if (updates.distributor_sku && updates.distributor_sku !== oldProduct.distributor_sku) {
      changelog.push(`SKU changed from "${oldProduct.distributor_sku || 'None'}" to "${updates.distributor_sku}"`);
    }

    const updatedRaw = {
      ...oldProduct,
      ...updates,
    };
    const updatedProduct = this.normalizeProduct(updatedRaw);

    if (!updatedProduct.chatter) {
      updatedProduct.chatter = [];
    }

    if (changelog.length > 0) {
      updatedProduct.chatter.push({
        id: 'cht_' + Math.random().toString(36).substr(2, 9),
        user: updates.vendor === undefined && updates.retail_price === undefined ? 'Automated POS System' : 'Staff',
        action: 'update',
        detail: changelog.join(', '),
        timestamp: new Date().toISOString()
      });
    }

    this.data.products[index] = updatedProduct;
    this.save();
    return updatedProduct;
  }

  // Case-to-Bottle intake function
  receiveInventory(tenantId: string, productId: string, cases: number, looseBottles: number): Product | undefined {
    const product = this.getProduct(tenantId, productId);
    if (!product) return undefined;

    // Convert cases and loose to new total
    const currentBottles = product.total_bottles_calculated;
    const additionalBottles = (cases * product.bottles_per_case) + looseBottles;
    const updatedBottles = currentBottles + additionalBottles;

    const newCaseCount = Math.floor(updatedBottles / product.bottles_per_case);
    const newLooseCount = updatedBottles % product.bottles_per_case;

    const updated = this.updateProduct(tenantId, productId, {
      case_count: newCaseCount,
      loose_bottle_count: newLooseCount,
      inventory_bottles: updatedBottles,
      inventory_cases: newCaseCount
    });

    if (updated) {
      if (!updated.chatter) updated.chatter = [];
      updated.chatter.push({
        id: 'cht_' + Math.random().toString(36).substr(2, 9),
        user: 'Staff',
        action: 'inventory_received',
        detail: `Received shipment intake: Added ${cases} cases (${cases * product.bottles_per_case} bottles) and ${looseBottles} loose bottles. Total inventory increased from ${currentBottles} to ${updatedBottles} bottles.`,
        timestamp: new Date().toISOString()
      });
      this.save();
    }

    return updated;
  }

  // Customers
  getCustomers(tenantId: string): Customer[] {
    return this.data.customers.filter(c => c.tenant_id === tenantId).map(c => this.normalizeCustomer(c));
  }

  addCustomer(tenantId: string, customerData: Partial<Customer>): Customer {
    const rawCustomer = {
      ...customerData,
      id: 'cust_' + Math.random().toString(36).substr(2, 9),
      tenant_id: tenantId,
      createdAt: new Date().toISOString(),
      chatter: []
    };
    const newCustomer = this.normalizeCustomer(rawCustomer);
    newCustomer.chatter!.push({
      id: 'cht_' + Math.random().toString(36).substr(2, 9),
      user: 'Staff',
      action: 'created',
      detail: `Created new customer record for "${newCustomer.name}" with email "${newCustomer.email || 'N/A'}" and phone "${newCustomer.phone_number || 'N/A'}".`,
      timestamp: new Date().toISOString()
    });
    this.data.customers.push(newCustomer);
    this.save();
    return newCustomer;
  }

  updateCustomer(tenantId: string, id: string, updates: Partial<Customer>): Customer | undefined {
    const index = this.data.customers.findIndex(c => c.id === id && c.tenant_id === tenantId);
    if (index === -1) return undefined;

    const oldCustomer = this.data.customers[index];
    const changelog: string[] = [];

    if (updates.name && updates.name !== oldCustomer.name) {
      changelog.push(`Name changed from "${oldCustomer.name}" to "${updates.name}"`);
    }
    if (updates.email && updates.email !== oldCustomer.email) {
      changelog.push(`Email changed from "${oldCustomer.email || 'None'}" to "${updates.email}"`);
    }
    if (updates.phone_number && updates.phone_number !== oldCustomer.phone_number) {
      changelog.push(`Phone changed from "${oldCustomer.phone_number || 'None'}" to "${updates.phone_number}"`);
    }
    if (updates.date_of_birth && updates.date_of_birth !== oldCustomer.date_of_birth) {
      changelog.push(`Date of Birth changed from "${oldCustomer.date_of_birth || 'None'}" to "${updates.date_of_birth}"`);
    }

    const updatedRaw = {
      ...oldCustomer,
      ...updates,
    };
    const updatedCustomer = this.normalizeCustomer(updatedRaw);

    if (!updatedCustomer.chatter) {
      updatedCustomer.chatter = [];
    }

    if (changelog.length > 0) {
      updatedCustomer.chatter.push({
        id: 'cht_' + Math.random().toString(36).substr(2, 9),
        user: 'Staff',
        action: 'update',
        detail: changelog.join(', '),
        timestamp: new Date().toISOString()
      });
    }

    this.data.customers[index] = updatedCustomer;
    this.save();
    return updatedCustomer;
  }

  addChatterComment(tenantId: string, type: 'products' | 'customers', recordId: string, user: string, comment: string): boolean {
    if (type === 'products') {
      const prod = this.getProduct(tenantId, recordId);
      if (prod) {
        if (!prod.chatter) prod.chatter = [];
        prod.chatter.push({
          id: 'cht_' + Math.random().toString(36).substr(2, 9),
          user,
          action: 'comment',
          detail: comment,
          timestamp: new Date().toISOString()
        });
        const index = this.data.products.findIndex(p => p.id === recordId && p.tenant_id === tenantId);
        if (index !== -1) {
          this.data.products[index] = prod;
        }
        this.save();
        return true;
      }
    } else if (type === 'customers') {
      const cust = this.data.customers.find(c => c.id === recordId && c.tenant_id === tenantId);
      if (cust) {
        if (!cust.chatter) cust.chatter = [];
        cust.chatter.push({
          id: 'cht_' + Math.random().toString(36).substr(2, 9),
          user,
          action: 'comment',
          detail: comment,
          timestamp: new Date().toISOString()
        });
        this.save();
        return true;
      }
    }
    return false;
  }

  // Transactions
  getTransactions(tenantId: string): Transaction[] {
    return this.data.transactions.filter(t => t.tenant_id === tenantId).map(t => this.normalizeTransaction(t));
  }

  addTransaction(tenantId: string, transactionData: Partial<Transaction>): Transaction {
    const rawTransaction = {
      ...transactionData,
      id: 'tx_' + (this.data.transactions.length + 1042).toString(),
      tenant_id: tenantId,
      createdAt: new Date().toISOString(),
    };
    const newTransaction = this.normalizeTransaction(rawTransaction);

    // Deduct inventory!
    for (const item of newTransaction.items) {
      const product = this.getProduct(tenantId, item.product_id);
      if (product) {
        const bottlesToDeduct = item.is_case_purchase 
          ? item.quantity * product.bottles_per_case 
          : item.quantity;
        
        const currentBottles = product.total_bottles_calculated;
        const newBottles = Math.max(0, currentBottles - bottlesToDeduct);
        const newCases = Math.floor(newBottles / product.bottles_per_case);
        const newLoose = newBottles % product.bottles_per_case;

        this.updateProduct(tenantId, item.product_id, {
          case_count: newCases,
          loose_bottle_count: newLoose,
          inventory_bottles: newBottles,
          inventory_cases: newCases
        });

        const updatedProduct = this.getProduct(tenantId, item.product_id);
        if (updatedProduct) {
          if (!updatedProduct.chatter) updatedProduct.chatter = [];
          updatedProduct.chatter.push({
            id: 'cht_' + Math.random().toString(36).substr(2, 9),
            user: 'Automated POS System',
            action: 'sale_deducted',
            detail: `Deducted ${bottlesToDeduct} bottles from stock due to customer checkout (Sale #${newTransaction.order_number}). Stock decreased from ${currentBottles} to ${newBottles} bottles.`,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    this.data.transactions.push(newTransaction);
    this.save();
    return newTransaction;
  }

  // Enterprise Store Settings
  getStoreProfile() {
    return this.data.storeProfile || {};
  }

  saveStoreProfile(profile: any) {
    this.data.storeProfile = {
      ...this.data.storeProfile,
      ...profile
    };
    this.save();
    return this.data.storeProfile;
  }

  getComplianceSettings() {
    return this.data.complianceSettings || {};
  }

  saveComplianceSettings(settings: any) {
    this.data.complianceSettings = {
      ...this.data.complianceSettings,
      ...settings
    };
    this.save();
    return this.data.complianceSettings;
  }

  getHardwareSettings() {
    return this.data.hardwareSettings || {};
  }

  saveHardwareSettings(settings: any) {
    this.data.hardwareSettings = {
      ...this.data.hardwareSettings,
      ...settings
    };
    this.save();
    return this.data.hardwareSettings;
  }
}

export const dbStore = new DatabaseStore();
