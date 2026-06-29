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
    email: 'marcus.vance@example.com',
    phone: '555-0192',
    dob: '1984-05-12',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cust_2',
    tenant_id: 'tenant_1',
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    phone: '555-0348',
    dob: '1992-11-23',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cust_3',
    tenant_id: 'tenant_2',
    name: 'Sarah Connor',
    email: 'sarah.c@example.com',
    phone: '555-0987',
    dob: '1965-11-10',
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
    bottles_per_case: 12,
    inventory_bottles: 64, // 5 cases & 4 bottles
    inventory_cases: 5,
    price_per_bottle: 32.99,
    price_per_case: 359.99, // Discounted from 32.99 * 12 = 395.88
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_2',
    tenant_id: 'tenant_1',
    name: 'Veuve Clicquot Yellow Label Champagne',
    category: 'Wine',
    description: 'Symphony of fruitness and brioche, perfect for celebration.',
    imageUrl: 'https://images.unsplash.com/photo-1594462106222-3cf22d45a8f5?auto=format&fit=crop&q=80&w=200',
    age_restricted: true,
    distributor_sku: 'DI-VEU-750',
    barcode: '3045203301010',
    bottles_per_case: 6,
    inventory_bottles: 20, // 3 cases & 2 bottles
    inventory_cases: 3,
    price_per_bottle: 59.99,
    price_per_case: 329.99, // 359.94 individual
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_3',
    tenant_id: 'tenant_1',
    name: 'Caymus Napa Valley Cabernet Sauvignon',
    category: 'Wine',
    description: 'Rich, dark, with luscious flavors of black currant and dark cherries.',
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=200',
    age_restricted: true,
    distributor_sku: 'DI-CAY-CS-15',
    barcode: '012086111303',
    bottles_per_case: 12,
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
    bottles_per_case: 24, // Case has 24 bottles
    inventory_bottles: 96, // 4 cases
    inventory_cases: 4,
    price_per_bottle: 2.75,
    price_per_case: 54.99, // 66.00 individual
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_5',
    tenant_id: 'tenant_1',
    name: 'Crystal Wine Glass Set (2pcs)',
    category: 'Extras',
    description: 'Premium lead-free crystal glasses for white and red wines.',
    imageUrl: 'https://images.unsplash.com/photo-1574926053821-79c5e338a933?auto=format&fit=crop&q=80&w=200',
    age_restricted: false,
    distributor_sku: 'ACC-WG-02',
    barcode: '885544332211',
    bottles_per_case: 10,
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
    bottles_per_case: 1,
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
    description: 'A well-rounded, highly drinkable India Pale Ale with dry-hopped accents.',
    imageUrl: 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&q=80&w=200',
    age_restricted: true,
    distributor_sku: 'DI-LAG-IPA',
    barcode: '021078001704',
    bottles_per_case: 24,
    inventory_bottles: 120, // 5 cases
    inventory_cases: 5,
    price_per_bottle: 3.25,
    price_per_case: 65.00,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod_8',
    tenant_id: 'tenant_2',
    name: 'Macallan 12 Year Double Cask Sherry Oak',
    category: 'Liquor',
    description: 'Single malt Scotch whisky matured in sherry-seasoned American and European oak casks.',
    imageUrl: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&q=80&w=200',
    age_restricted: true,
    distributor_sku: 'DI-MAC-12',
    barcode: '5010314051009',
    bottles_per_case: 6,
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
    age_verified_at: new Date(Date.now() - 3600000).toISOString(),
    age_verified_dob: '1984-05-12',
    cashier_id: 'user_cashier_1',
    cashier_name: 'Elena Rostova',
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
    discount_total: 35.99, // 10% wine mix & match or case break discount
    tax: 27.54,
    total: 351.49,
    payment_method: 'Tap-to-Pay',
    age_verified_at: new Date(Date.now() - 1800000).toISOString(),
    age_verified_dob: '1992-11-23',
    cashier_id: 'user_cashier_1',
    cashier_name: 'Elena Rostova',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    items: [
      {
        id: 'txi_2',
        product_id: 'prod_2',
        product_name: 'Veuve Clicquot Yellow Label Champagne',
        category: 'Wine',
        quantity: 6, // Eligible for 10% mix & match or case discount
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
}

class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      tenants: [],
      products: [],
      customers: [],
      transactions: [],
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
        };
        this.save();
      }
    } catch (e) {
      console.error('Failed to load database, falling back to memory', e);
      this.data = {
        tenants: initialTenants,
        products: createInitialProducts(),
        customers: initialCustomers,
        transactions: initialTransactions(),
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

  // Tenants
  getTenants(): Tenant[] {
    return this.data.tenants;
  }

  getTenant(id: string): Tenant | undefined {
    return this.data.tenants.find(t => t.id === id);
  }

  // Products
  getProducts(tenantId: string): Product[] {
    return this.data.products.filter(p => p.tenant_id === tenantId);
  }

  getProduct(tenantId: string, id: string): Product | undefined {
    return this.data.products.find(p => p.id === id && p.tenant_id === tenantId);
  }

  getProductByBarcode(tenantId: string, barcode: string): Product | undefined {
    return this.data.products.find(p => p.barcode === barcode && p.tenant_id === tenantId);
  }

  addProduct(tenantId: string, productData: Omit<Product, 'id' | 'tenant_id' | 'createdAt'>): Product {
    const newProduct: Product = {
      ...productData,
      id: 'prod_' + Math.random().toString(36).substr(2, 9),
      tenant_id: tenantId,
      createdAt: new Date().toISOString(),
      chatter: []
    };
    newProduct.chatter!.push({
      id: 'cht_' + Math.random().toString(36).substr(2, 9),
      user: 'Staff',
      action: 'created',
      detail: `Created new catalog record for "${newProduct.name}" with initial retail price of $${newProduct.price_per_bottle.toFixed(2)}.`,
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
    if (updates.price_per_bottle !== undefined && updates.price_per_bottle !== oldProduct.price_per_bottle) {
      changelog.push(`Bottle price changed from $${oldProduct.price_per_bottle.toFixed(2)} to $${updates.price_per_bottle.toFixed(2)}`);
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

    const updatedProduct = {
      ...oldProduct,
      ...updates,
    };

    if (!updatedProduct.chatter) {
      updatedProduct.chatter = [];
    }

    if (changelog.length > 0) {
      updatedProduct.chatter.push({
        id: 'cht_' + Math.random().toString(36).substr(2, 9),
        user: updates.vendor === undefined && updates.price_per_bottle === undefined ? 'Automated POS System' : 'Staff',
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

    // Convert cases to bottles
    const newBottlesFromCases = cases * product.bottles_per_case;
    const totalAdditionalBottles = newBottlesFromCases + looseBottles;

    const updatedBottles = product.inventory_bottles + totalAdditionalBottles;
    const updatedCases = Math.floor(updatedBottles / product.bottles_per_case);

    const oldBottles = product.inventory_bottles;

    const updated = this.updateProduct(tenantId, productId, {
      inventory_bottles: updatedBottles,
      inventory_cases: updatedCases,
    });

    if (updated) {
      if (!updated.chatter) updated.chatter = [];
      updated.chatter.push({
        id: 'cht_' + Math.random().toString(36).substr(2, 9),
        user: 'Staff',
        action: 'inventory_received',
        detail: `Received shipment intake: Added ${cases} cases (${newBottlesFromCases} bottles) and ${looseBottles} loose bottles. Total inventory increased from ${oldBottles} to ${updatedBottles} bottles.`,
        timestamp: new Date().toISOString()
      });
      this.save();
    }

    return updated;
  }

  // Customers
  getCustomers(tenantId: string): Customer[] {
    return this.data.customers.filter(c => c.tenant_id === tenantId);
  }

  addCustomer(tenantId: string, customerData: Omit<Customer, 'id' | 'tenant_id' | 'createdAt'>): Customer {
    const newCustomer: Customer = {
      ...customerData,
      id: 'cust_' + Math.random().toString(36).substr(2, 9),
      tenant_id: tenantId,
      createdAt: new Date().toISOString(),
      chatter: []
    };
    newCustomer.chatter!.push({
      id: 'cht_' + Math.random().toString(36).substr(2, 9),
      user: 'Staff',
      action: 'created',
      detail: `Created new customer record for "${newCustomer.name}" with email "${newCustomer.email || 'N/A'}" and phone "${newCustomer.phone || 'N/A'}".`,
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
    if (updates.phone && updates.phone !== oldCustomer.phone) {
      changelog.push(`Phone changed from "${oldCustomer.phone || 'None'}" to "${updates.phone}"`);
    }
    if (updates.dob && updates.dob !== oldCustomer.dob) {
      changelog.push(`Date of Birth changed from "${oldCustomer.dob || 'None'}" to "${updates.dob}"`);
    }

    const updatedCustomer = {
      ...oldCustomer,
      ...updates,
    };

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
    return this.data.transactions.filter(t => t.tenant_id === tenantId);
  }

  addTransaction(tenantId: string, transactionData: Omit<Transaction, 'id' | 'tenant_id' | 'createdAt'>): Transaction {
    const newTransaction: Transaction = {
      ...transactionData,
      id: 'tx_' + (this.data.transactions.length + 1042).toString(), // mimic order numbers e.g. #1042
      tenant_id: tenantId,
      createdAt: new Date().toISOString(),
    };

    // Deduct inventory!
    for (const item of newTransaction.items) {
      const product = this.getProduct(tenantId, item.product_id);
      if (product) {
        const bottlesToDeduct = item.is_case_purchase 
          ? item.quantity * product.bottles_per_case 
          : item.quantity;
        
        const newBottles = Math.max(0, product.inventory_bottles - bottlesToDeduct);
        const newCases = Math.floor(newBottles / product.bottles_per_case);

        const oldBottles = product.inventory_bottles;

        this.updateProduct(tenantId, item.product_id, {
          inventory_bottles: newBottles,
          inventory_cases: newCases,
        });

        const updatedProduct = this.getProduct(tenantId, item.product_id);
        if (updatedProduct) {
          if (!updatedProduct.chatter) updatedProduct.chatter = [];
          updatedProduct.chatter.push({
            id: 'cht_' + Math.random().toString(36).substr(2, 9),
            user: 'Automated POS System',
            action: 'sale_deducted',
            detail: `Deducted ${bottlesToDeduct} bottles from stock due to customer checkout (Sale #${newTransaction.id}). Stock decreased from ${oldBottles} to ${newBottles} bottles.`,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    this.data.transactions.push(newTransaction);
    this.save();
    return newTransaction;
  }
}

export const dbStore = new DatabaseStore();
