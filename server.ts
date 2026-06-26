import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { dbStore } from "./src/dbStore.js"; // note ES import path

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log requests for debugging
  app.use((req, res, next) => {
    console.log(`[AuraPOS API] ${req.method} ${req.url}`);
    next();
  });

  // API 1: Tenants
  app.get("/api/tenants", (req, res) => {
    try {
      const tenants = dbStore.getTenants();
      res.json(tenants);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API 2: Products List (Filtered by Tenant ID in query)
  app.get("/api/products", (req, res) => {
    try {
      const tenantId = req.query.tenant_id as string;
      if (!tenantId) {
        return res.status(400).json({ error: "Missing tenant_id parameter" });
      }
      const products = dbStore.getProducts(tenantId);
      res.json(products);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API 3: Add Product
  app.post("/api/products", (req, res) => {
    try {
      const tenantId = req.query.tenant_id as string;
      if (!tenantId) {
        return res.status(400).json({ error: "Missing tenant_id parameter" });
      }
      const product = dbStore.addProduct(tenantId, req.body);
      res.status(201).json(product);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API 4: Case-to-Bottle intake receipt
  app.post("/api/products/:id/receive", (req, res) => {
    try {
      const tenantId = req.query.tenant_id as string;
      const productId = req.params.id;
      const { cases, looseBottles } = req.body;

      if (!tenantId) {
        return res.status(400).json({ error: "Missing tenant_id parameter" });
      }

      const updated = dbStore.receiveInventory(
        tenantId,
        productId,
        Number(cases || 0),
        Number(looseBottles || 0)
      );

      if (!updated) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API 5: Customers List
  app.get("/api/customers", (req, res) => {
    try {
      const tenantId = req.query.tenant_id as string;
      if (!tenantId) {
        return res.status(400).json({ error: "Missing tenant_id parameter" });
      }
      const customers = dbStore.getCustomers(tenantId);
      res.json(customers);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API 6: Add Customer
  app.post("/api/customers", (req, res) => {
    try {
      const tenantId = req.query.tenant_id as string;
      if (!tenantId) {
        return res.status(400).json({ error: "Missing tenant_id" });
      }
      const customer = dbStore.addCustomer(tenantId, req.body);
      res.status(201).json(customer);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API 7: Transactions List
  app.get("/api/transactions", (req, res) => {
    try {
      const tenantId = req.query.tenant_id as string;
      if (!tenantId) {
        return res.status(400).json({ error: "Missing tenant_id parameter" });
      }
      const transactions = dbStore.getTransactions(tenantId);
      res.json(transactions);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API 8: Create Transaction (Registers sale and updates inventory counts)
  app.post("/api/transactions", (req, res) => {
    try {
      const tenantId = req.query.tenant_id as string;
      if (!tenantId) {
        return res.status(400).json({ error: "Missing tenant_id parameter" });
      }
      const transaction = dbStore.addTransaction(tenantId, req.body);
      res.status(201).json(transaction);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API 9: BARCODE AUTO-POPULATE LOOKUP from Open Food Facts
  app.get("/api/products/lookup/:barcode", async (req, res) => {
    try {
      const { barcode } = req.params;
      if (!barcode || barcode.trim() === "") {
        return res.status(400).json({ error: "Barcode is required" });
      }

      console.log(`[Barcode Lookup] Querying Open Food Facts for barcode: ${barcode}`);
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      
      if (!response.ok) {
        return res.status(404).json({ error: "Failed to query Open Food Facts API" });
      }

      const data: any = await response.json();

      if (data.status !== 1 || !data.product) {
        return res.status(404).json({ 
          error: "Product not found in Open Food Facts registry", 
          code: "NOT_FOUND" 
        });
      }

      const prod = data.product;

      // Extract details intelligently
      const brand = prod.brands ? prod.brands.split(',')[0].trim() : '';
      const nameOnly = prod.product_name || prod.product_name_en || '';
      const fullName = brand && !nameOnly.toLowerCase().includes(brand.toLowerCase())
        ? `${brand} ${nameOnly}`
        : nameOnly;

      // Volume / Size Variant (e.g. 750ml, 1.75L, etc)
      let size = prod.quantity || '';
      if (!size) {
        // Try parsing from size attributes
        size = prod.serving_size || '';
      }

      // Auto category detection
      let category: 'Wine' | 'Beer' | 'Liquor' | 'Extras' = 'Extras';
      const lowercaseName = fullName.toLowerCase();
      const categoriesText = (prod.categories_tags || []).join(' ').toLowerCase();
      const genericText = `${lowercaseName} ${categoriesText}`;

      if (genericText.includes('wine') || genericText.includes('champagne') || genericText.includes('cabernet') || genericText.includes('chardonnay') || genericText.includes('prosecco') || genericText.includes('merlot') || genericText.includes('bordeaux')) {
        category = 'Wine';
      } else if (genericText.includes('beer') || genericText.includes('lager') || genericText.includes('ipa') || genericText.includes('ale') || genericText.includes('cider') || genericText.includes('stout') || genericText.includes('pilsner')) {
        category = 'Beer';
      } else if (genericText.includes('whiskey') || genericText.includes('whisky') || genericText.includes('vodka') || genericText.includes('rum') || genericText.includes('tequila') || genericText.includes('gin') || genericText.includes('liquor') || genericText.includes('cognac') || genericText.includes('brandy') || genericText.includes('bourbon') || genericText.includes('scotch')) {
        category = 'Liquor';
      }

      // Auto age restriction detection
      const ageRestricted = ['Wine', 'Beer', 'Liquor'].includes(category);

      res.json({
        success: true,
        barcode,
        name: fullName,
        category,
        size: size,
        imageUrl: prod.image_url || prod.image_front_url || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=200',
        age_restricted: ageRestricted,
        brand: brand,
        raw_source: "Open Food Facts"
      });

    } catch (error: any) {
      console.error("[Barcode Lookup Error]", error);
      res.status(500).json({ error: "Internal server error during barcode lookup", details: error.message });
    }
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend assets in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA Fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AuraPOS Server] Service is running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
