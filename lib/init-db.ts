/**
 * Creates tables and seeds demo data if the database is empty.
 * Called once at application start from the root layout.
 */
import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";

const DB_PATH =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "consumer-protection.db");

function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function generateId(): string {
  return crypto.randomBytes(12).toString("hex");
}

let initialised = false;

export function initializeDatabase(): void {
  if (initialised) return;
  initialised = true;

  const sqlite = new Database(DB_PATH);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      case_ref TEXT NOT NULL UNIQUE,
      consumer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      business_name TEXT NOT NULL,
      business_address TEXT,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      incident_date TEXT,
      amount REAL,
      date_filed TEXT NOT NULL DEFAULT (date('now')),
      status TEXT NOT NULL DEFAULT 'Submitted',
      assigned_officer TEXT DEFAULT '',
      notes TEXT NOT NULL DEFAULT '[]',
      response_summary TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS price_entries (
      id TEXT PRIMARY KEY,
      product TEXT NOT NULL,
      supplier TEXT NOT NULL,
      surveyed_price REAL NOT NULL,
      controlled_price REAL NOT NULL,
      last_updated TEXT NOT NULL,
      category TEXT NOT NULL,
      unit TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS price_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      price_entry_id TEXT NOT NULL,
      month TEXT NOT NULL,
      surveyed REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS officers (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL
    );
  `);

  // Seed officers
  const officerCount = (sqlite.prepare("SELECT COUNT(*) as n FROM officers").get() as { n: number }).n;
  if (officerCount === 0) {
    const insertOfficer = sqlite.prepare(
      "INSERT INTO officers (id, username, name, password_hash) VALUES (?, ?, ?, ?)"
    );
    [
      { id: generateId(), username: "kwilliams", name: "Officer K. Williams", password: "demo1234" },
      { id: generateId(), username: "rbaptiste", name: "Officer R. Baptiste", password: "demo1234" },
      { id: generateId(), username: "jthomas", name: "Officer J. Thomas", password: "demo1234" },
    ].forEach(({ id, username, name, password }) => {
      insertOfficer.run(id, username, name, sha256(password));
    });
  }

  // Seed complaints
  const complaintCount = (sqlite.prepare("SELECT COUNT(*) as n FROM complaints").get() as { n: number }).n;
  if (complaintCount === 0) {
    const insertComplaint = sqlite.prepare(`
      INSERT INTO complaints
        (id, case_ref, consumer_name, email, phone, business_name, business_address,
         category, description, date_filed, status, assigned_officer, notes, response_summary)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `);

    const seed = [
      {
        id: generateId(), caseRef: "CP-2026-00142", consumerName: "Maria Joseph",
        email: "maria.joseph@email.com", phone: "+0-000-555-0134",
        businessName: "Island Mart Supermarket", businessAddress: "Bridge Street, Central District",
        category: "Misleading Pricing",
        description: "The store displayed rice at $4.50 per kg but charged $6.20 at checkout. When I pointed this out, the cashier said the shelf label was outdated.",
        dateFiled: "2026-02-28", status: "Under Review",
        assignedOfficer: "Officer K. Williams",
        notes: JSON.stringify(["Initial review completed. Store has been contacted for response."]),
        responseSummary: "Under active investigation. Store has been notified.",
      },
      {
        id: generateId(), caseRef: "CP-2026-00138", consumerName: "David Charles",
        email: "d.charles@email.com", phone: "+0-000-555-0198",
        businessName: "TechZone Electronics", businessAddress: "Marine Parade, South District",
        category: "Defective Product",
        description: "Purchased a washing machine that stopped working after 2 weeks. Store refuses to honour the 1-year warranty.",
        dateFiled: "2026-02-25", status: "Investigation",
        assignedOfficer: "Officer R. Baptiste",
        notes: JSON.stringify(["Warranty documentation reviewed.", "Independent inspection scheduled for March 5."]),
        responseSummary: "Independent product inspection has been arranged.",
      },
      {
        id: generateId(), caseRef: "CP-2026-00135", consumerName: "Shania Peters",
        email: "s.peters@email.com", phone: "+0-000-555-0167",
        businessName: "Caribbean Fresh Foods", businessAddress: "Market Square, Central District",
        category: "Poor Service",
        description: "Ordered groceries for delivery. Half the items were missing and the company refuses to refund or redeliver.",
        dateFiled: "2026-02-20", status: "Resolved",
        assignedOfficer: "Officer J. Thomas",
        notes: JSON.stringify(["Mediation session held.", "Company agreed to full refund."]),
        responseSummary: "Resolved - company issued full refund to consumer.",
      },
      {
        id: generateId(), caseRef: "CP-2026-00150", consumerName: "Kevin Alexander",
        email: "k.alex@email.com", phone: "+0-000-555-0145",
        businessName: "AutoParts Caribbean", businessAddress: "Harbour Road, West District",
        category: "False Advertising",
        description: "Online ad claimed 50% off all brake pads. At the store, only one brand was discounted and it was only 15% off.",
        dateFiled: "2026-03-05", status: "Submitted",
        assignedOfficer: "",
        notes: JSON.stringify([]),
        responseSummary: "",
      },
      {
        id: generateId(), caseRef: "CP-2026-00145", consumerName: "Angela Francis",
        email: "a.francis@email.com", phone: "+0-000-555-0112",
        businessName: "QuickFix Appliances", businessAddress: "High Street, North District",
        category: "Poor Service",
        description: "Paid $350 for a microwave repair. The microwave broke again three days later with the same fault. They are refusing to redo the repair at no cost.",
        dateFiled: "2026-03-01", status: "Under Review",
        assignedOfficer: "Officer K. Williams",
        notes: JSON.stringify(["Consumer contacted. Awaiting repair invoice documentation."]),
        responseSummary: "Awaiting supporting documents from consumer.",
      },
    ];

    for (const entry of seed) {
      insertComplaint.run(entry.id, entry.caseRef, entry.consumerName, entry.email, entry.phone,
        entry.businessName, entry.businessAddress, entry.category, entry.description,
        entry.dateFiled, entry.status, entry.assignedOfficer, entry.notes, entry.responseSummary);
    }
  }

  // Seed prices
  const priceCount = (sqlite.prepare("SELECT COUNT(*) as n FROM price_entries").get() as { n: number }).n;
  if (priceCount === 0) {
    const insertPriceEntry = sqlite.prepare(`
      INSERT INTO price_entries (id, product, supplier, surveyed_price, controlled_price, last_updated, category, unit)
      VALUES (?,?,?,?,?,?,?,?)
    `);
    const insertPricePoint = sqlite.prepare(`
      INSERT INTO price_points (price_entry_id, month, surveyed) VALUES (?,?,?)
    `);

    const prices = [
      {
        id: generateId(), product: "White Rice (Jasmine)", supplier: "Massy Stores",
        surveyedPrice: 6.20, controlledPrice: 5.50, lastUpdated: "2026-03-10",
        category: "Food", unit: "per kg",
        history: [5.30, 5.40, 5.50, 5.80, 6.00, 6.20],
      },
      {
        id: generateId(), product: "Refined Sugar", supplier: "Julian's Supermarket",
        surveyedPrice: 4.10, controlledPrice: 4.50, lastUpdated: "2026-03-08",
        category: "Food", unit: "per kg",
        history: [3.90, 4.00, 4.10, 4.10, 4.10, 4.10],
      },
      {
        id: generateId(), product: "Cooking Gas (20 lb)", supplier: "Gas Depot",
        surveyedPrice: 68.00, controlledPrice: 65.00, lastUpdated: "2026-03-09",
        category: "Fuel", unit: "per cylinder",
        history: [60.00, 62.00, 63.50, 65.00, 66.50, 68.00],
      },
      {
        id: generateId(), product: "Unleaded Gasoline (87 oct)", supplier: "NUPW Petrol",
        surveyedPrice: 14.95, controlledPrice: 15.50, lastUpdated: "2026-03-07",
        category: "Fuel", unit: "per litre",
        history: [14.00, 14.20, 14.50, 14.70, 14.80, 14.95],
      },
      {
        id: generateId(), product: "Bleach (1 L)", supplier: "Super J Supermarket",
        surveyedPrice: 5.00, controlledPrice: 5.00, lastUpdated: "2026-03-06",
        category: "Household", unit: "per bottle",
        history: [4.80, 4.80, 4.90, 4.95, 5.00, 5.00],
      },
      {
        id: generateId(), product: "Dish Soap (500 ml)", supplier: "Massy Stores",
        surveyedPrice: 7.50, controlledPrice: 7.00, lastUpdated: "2026-03-05",
        category: "Household", unit: "per bottle",
        history: [6.50, 6.70, 6.80, 7.00, 7.20, 7.50],
      },
      {
        id: generateId(), product: "AA Batteries (4-pack)", supplier: "Courts",
        surveyedPrice: 12.00, controlledPrice: 14.00, lastUpdated: "2026-03-03",
        category: "Electronics", unit: "per pack",
        history: [11.00, 11.50, 11.75, 12.00, 12.00, 12.00],
      },
    ];

    const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    for (const priceEntry of prices) {
      insertPriceEntry.run(priceEntry.id, priceEntry.product, priceEntry.supplier, priceEntry.surveyedPrice, priceEntry.controlledPrice,
        priceEntry.lastUpdated, priceEntry.category, priceEntry.unit);
      priceEntry.history.forEach((surveyed, index) => {
        insertPricePoint.run(priceEntry.id, months[index], surveyed);
      });
    }
  }

  sqlite.close();
}
