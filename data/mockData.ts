// Mock data for the entire application

export interface Complaint {
  id: string;
  caseRef: string;
  consumerName: string;
  email: string;
  phone: string;
  businessName: string;
  businessAddress: string;
  category: string;
  description: string;
  dateFiled: string;
  status: "Submitted" | "Under Review" | "Investigation" | "Resolved";
  assignedOfficer: string;
  notes: string[];
  responseSummary: string;
}

export interface PricePoint {
  /** Short month label, oldest first. */
  month: string;
  surveyed: number;
}

export interface PriceEntry {
  id: string;
  product: string;
  supplier: string;
  surveyedPrice: number;
  controlledPrice: number;
  lastUpdated: string;
  category: string;
  unit: string;
  /** Six months of surveyed prices, used for the trend sparkline and detail chart. */
  history: PricePoint[];
}

export const sampleComplaints: Complaint[] = [
  {
    id: "1",
    caseRef: "CP-2026-00142",
    consumerName: "Maria Joseph",
    email: "maria.joseph@email.com",
    phone: "+0-000-555-0134",
    businessName: "Island Mart Supermarket",
    businessAddress: "Bridge Street, Central District",
    category: "Misleading Pricing",
    description: "The store displayed rice at $4.50 per kg but charged $6.20 at checkout. When I pointed this out, the cashier said the shelf label was outdated. This has happened multiple times.",
    dateFiled: "2026-02-28",
    status: "Under Review",
    assignedOfficer: "Officer K. Williams",
    notes: ["Initial review completed. Store has been contacted for response."],
    responseSummary: "Under active investigation. Store has been notified.",
  },
  {
    id: "2",
    caseRef: "CP-2026-00138",
    consumerName: "David Charles",
    email: "d.charles@email.com",
    phone: "+0-000-555-0198",
    businessName: "TechZone Electronics",
    businessAddress: "Marine Parade, South District",
    category: "Defective Product",
    description: "Purchased a washing machine that stopped working after 2 weeks. Store refuses to honour the 1-year warranty, claiming water damage.",
    dateFiled: "2026-02-25",
    status: "Investigation",
    assignedOfficer: "Officer R. Baptiste",
    notes: ["Warranty documentation reviewed.", "Independent inspection scheduled for March 5."],
    responseSummary: "Independent product inspection has been arranged.",
  },
  {
    id: "3",
    caseRef: "CP-2026-00135",
    consumerName: "Shania Peters",
    email: "s.peters@email.com",
    phone: "+0-000-555-0167",
    businessName: "Caribbean Fresh Foods",
    businessAddress: "Market Square, Central District",
    category: "Poor Service",
    description: "Ordered groceries for delivery. Half the items were missing and the company refuses to refund or redeliver.",
    dateFiled: "2026-02-20",
    status: "Resolved",
    assignedOfficer: "Officer J. Thomas",
    notes: ["Mediation session held.", "Company agreed to full refund."],
    responseSummary: "Resolved — company issued full refund to consumer.",
  },
  {
    id: "4",
    caseRef: "CP-2026-00150",
    consumerName: "Kevin Alexander",
    email: "k.alex@email.com",
    phone: "+0-000-555-0145",
    businessName: "AutoParts Caribbean",
    businessAddress: "Harbour Road, West District",
    category: "False Advertising",
    description: "Online ad claimed 50% off all brake pads. At the store, only one brand was discounted and it was only 15% off.",
    dateFiled: "2026-03-05",
    status: "Submitted",
    assignedOfficer: "",
    notes: [],
    responseSummary: "",
  },
  {
    id: "5",
    caseRef: "CP-2026-00148",
    consumerName: "Alicia George",
    email: "a.george@email.com",
    phone: "+0-000-555-0189",
    businessName: "PharmaCare Plus",
    businessAddress: "High Street, South District",
    category: "Misleading Pricing",
    description: "Pharmacy charged significantly above the controlled price for essential medication. Receipt shows $85 for medication with a controlled price of $45.",
    dateFiled: "2026-03-02",
    status: "Under Review",
    assignedOfficer: "Officer K. Williams",
    notes: ["Price records requested from pharmacy."],
    responseSummary: "Awaiting documentation from the business.",
  },
];

const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

const history = (...values: number[]): PricePoint[] =>
  values.map((surveyed, index) => ({ month: months[index], surveyed }));

export const samplePrices: PriceEntry[] = [
  { id: "1", product: "White Rice", unit: "1 kg", supplier: "Island Mart", surveyedPrice: 4.50, controlledPrice: 4.25, lastUpdated: "2026-03-08", category: "Food", history: history(4.10, 4.15, 4.20, 4.30, 4.40, 4.50) },
  { id: "2", product: "Vegetable Cooking Oil", unit: "1 L", supplier: "Fresh Foods Ltd", surveyedPrice: 8.75, controlledPrice: 8.50, lastUpdated: "2026-03-07", category: "Food", history: history(8.20, 8.35, 8.40, 8.55, 8.60, 8.75) },
  { id: "3", product: "All-Purpose Flour", unit: "2 kg", supplier: "Caribbean Wholesale", surveyedPrice: 6.20, controlledPrice: 6.00, lastUpdated: "2026-03-08", category: "Food", history: history(5.80, 5.85, 5.95, 6.05, 6.10, 6.20) },
  { id: "4", product: "Bottled Water", unit: "1.5 L", supplier: "Spring Valley", surveyedPrice: 3.20, controlledPrice: 3.25, lastUpdated: "2026-03-06", category: "Food", history: history(3.25, 3.25, 3.30, 3.25, 3.20, 3.20) },
  { id: "5", product: "Unleaded Gasoline", unit: "1 gallon", supplier: "SOL Fuel", surveyedPrice: 14.85, controlledPrice: 14.50, lastUpdated: "2026-03-09", category: "Fuel", history: history(13.90, 14.20, 14.60, 14.40, 14.70, 14.85) },
  { id: "6", product: "Diesel", unit: "1 gallon", supplier: "Rubis Energy", surveyedPrice: 12.95, controlledPrice: 13.00, lastUpdated: "2026-03-09", category: "Fuel", history: history(12.60, 12.80, 13.10, 13.05, 12.90, 12.95) },
  { id: "7", product: "Laundry Detergent", unit: "1 kg", supplier: "Home Essentials", surveyedPrice: 12.50, controlledPrice: 12.00, lastUpdated: "2026-03-05", category: "Household", history: history(11.80, 11.90, 12.10, 12.20, 12.35, 12.50) },
  { id: "8", product: "Dish Soap", unit: "500 ml", supplier: "CleanCo", surveyedPrice: 5.50, controlledPrice: 5.50, lastUpdated: "2026-03-04", category: "Household", history: history(5.40, 5.45, 5.55, 5.50, 5.45, 5.50) },
  { id: "9", product: "USB Flash Drive", unit: "32 GB", supplier: "TechZone", surveyedPrice: 25.00, controlledPrice: 22.00, lastUpdated: "2026-03-03", category: "Electronics", history: history(23.00, 23.50, 24.00, 24.00, 24.50, 25.00) },
  { id: "10", product: "Portable Phone Charger", unit: "10,000 mAh", supplier: "MobileTech", surveyedPrice: 45.00, controlledPrice: 40.00, lastUpdated: "2026-03-02", category: "Electronics", history: history(42.00, 42.50, 43.00, 44.00, 44.00, 45.00) },
  { id: "11", product: "Brown Sugar", unit: "1 kg", supplier: "Sugar Mill Co.", surveyedPrice: 4.70, controlledPrice: 4.75, lastUpdated: "2026-03-07", category: "Food", history: history(4.70, 4.75, 4.80, 4.75, 4.70, 4.70) },
  { id: "12", product: "Corned Beef", unit: "340 g", supplier: "Island Mart", surveyedPrice: 9.50, controlledPrice: 9.00, lastUpdated: "2026-03-06", category: "Food", history: history(9.10, 9.20, 9.25, 9.35, 9.40, 9.50) },
];

export type UpdateKind = "Price notice" | "Event" | "Safety alert" | "Guidance";

/**
 * Article bodies are structured blocks rather than HTML strings, so the
 * editorial type scale stays under the design system's control and nothing
 * arbitrary can be injected into the page.
 */
export type UpdateBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string; attribution: string }
  | { type: "note"; variant: "info" | "warning" | "success" | "danger"; title?: string; text: string };

export interface Update {
  id: string;
  /** URL segment. Stable — treat a published slug as permanent. */
  slug: string;
  kind: UpdateKind;
  title: string;
  /** ISO date, `yyyy-MM-dd`. */
  date: string;
  /** One-sentence standfirst, used on the index and as the meta description. */
  summary: string;
  body: UpdateBlock[];
}

/** Newest first. */
export const updates: Update[] = [
  {
    id: "1",
    slug: "price-controls-essential-food-items-march-2026",
    kind: "Price notice",
    title: "New price controls on essential food items effective March 2026",
    date: "2026-03-01",
    summary:
      "Updated maximum prices have been issued for 15 essential food items. The price checker has been updated and officers begin verification this week.",
    body: [
      {
        type: "paragraph",
        text: "The Consumer Affairs Division has issued revised maximum retail prices for 15 essential food items. The revision follows a review of landed import costs over the previous quarter, and takes effect immediately.",
      },
      {
        type: "paragraph",
        text: "A maximum retail price is a ceiling, not a fixed price. Shops may charge less than the published figure and many do, so it is still worth comparing prices between shops in your area.",
      },
      { type: "heading", text: "Which items are affected" },
      {
        type: "list",
        items: [
          "Rice, flour, and brown sugar",
          "Cooking oil and margarine",
          "Powdered and evaporated milk",
          "Tinned fish and tinned corned beef",
          "Bottled drinking water",
        ],
      },
      {
        type: "paragraph",
        text: "The full schedule, including the exact pack sizes each price applies to, is published in the official gazette. Pack size matters: a price set for a one-kilogram bag does not apply to a two-kilogram bag of the same product.",
      },
      { type: "heading", text: "What to do if you are charged more" },
      {
        type: "paragraph",
        text: "Keep your receipt and note the shelf price you saw. Both together are far stronger evidence than either on its own. You can then file a complaint through this portal, and an officer will follow it up with the business.",
      },
      {
        type: "note",
        variant: "info",
        title: "Check before you complain",
        text: "Confirm the pack size matches the one in the schedule. A different size is the most common reason a price looks wrong when it is not.",
      },
      {
        type: "quote",
        text: "Publishing the schedule is only half the job. What changes behaviour is consumers knowing the number and asking about it at the till.",
        attribution: "Consumer Affairs Division",
      },
    ],
  },
  {
    id: "2",
    slug: "consumer-rights-week-2026",
    kind: "Event",
    title: "Consumer Rights Week 2026 — events and workshops",
    date: "2026-02-20",
    summary:
      "Free workshops run from 15 to 22 March on knowing your rights, comparing prices, and filing a complaint that gets acted on.",
    body: [
      {
        type: "paragraph",
        text: "Consumer Rights Week runs from 15 to 22 March. Every session is free, no registration is needed, and each one is repeated in the evening so that people working during the day can attend.",
      },
      { type: "heading", text: "Sessions" },
      {
        type: "list",
        items: [
          "Knowing your five consumer rights — what you are entitled to, and what a business must do",
          "Comparing prices — using the price checker and reading a shelf label properly",
          "Filing a complaint that gets acted on — what evidence to gather before you start",
          "For small businesses — price display rules, warranties, and refund obligations",
        ],
      },
      {
        type: "paragraph",
        text: "The session for small businesses is deliberately included. A large share of complaints come from traders who did not know an obligation existed rather than from deliberate wrongdoing, and those cases are the easiest to prevent.",
      },
      { type: "heading", text: "Where" },
      {
        type: "paragraph",
        text: "Sessions are held at Consumer Affairs offices and at community centres. Contact the Consumer Affairs Division for the venue nearest you, or ask about a session at your workplace or community group.",
      },
      {
        type: "note",
        variant: "success",
        title: "Bring a receipt",
        text: "If you have an unresolved problem with a purchase, bring the receipt and any photographs to the complaint session and an officer can look at it with you.",
      },
    ],
  },
  {
    id: "3",
    slug: "counterfeit-phone-chargers-seized",
    kind: "Safety alert",
    title: "Counterfeit phone chargers seized",
    date: "2026-02-15",
    summary:
      "Officers removed more than 200 counterfeit chargers from sale. Counterfeit chargers are a fire risk and should not be used.",
    body: [
      {
        type: "note",
        variant: "danger",
        title: "Stop using a charger you suspect is counterfeit",
        text: "Unplug it and stop using it. Counterfeit chargers commonly omit the insulation and protection components that keep the mains supply separated from the cable you hold.",
      },
      {
        type: "paragraph",
        text: "Consumer Affairs officers removed more than 200 counterfeit phone chargers from sale at a premises following a routine inspection. The chargers carried the branding of a well-known manufacturer but were not made by them.",
      },
      { type: "heading", text: "How to spot one" },
      {
        type: "list",
        items: [
          "The price is far below what the same charger costs from an authorised dealer",
          "The moulding is rough, the seams do not meet cleanly, or the pins wobble",
          "Printed text is misspelt, blurred, or missing safety and compliance markings",
          "It is unusually light for its size",
          "It becomes hot to the touch in normal use",
        ],
      },
      {
        type: "paragraph",
        text: "None of these is conclusive on its own, but several together are a strong signal. The most reliable protection is buying from an authorised dealer and keeping the receipt.",
      },
      { type: "heading", text: "If you bought one" },
      {
        type: "paragraph",
        text: "You are entitled to raise it with the seller, and a counterfeit item sold as genuine is a matter the Division will take up. File a complaint through this portal with the receipt and a photograph of the charger and its packaging.",
      },
    ],
  },
  {
    id: "4",
    slug: "how-to-read-a-shelf-label",
    kind: "Guidance",
    title: "How to read a shelf label, and what to do when it does not match the till",
    date: "2026-02-04",
    summary:
      "Shelf price and till price disagreeing is the single most common complaint we receive. Here is what the label should show and how to resolve a mismatch.",
    body: [
      {
        type: "paragraph",
        text: "A mismatch between the shelf price and the price charged at the till is the most common complaint we receive. It is also among the easiest to resolve, provided you notice it before you leave the shop.",
      },
      { type: "heading", text: "What a shelf label should tell you" },
      {
        type: "list",
        items: [
          "The item the price applies to, clearly enough that it cannot be confused with the one beside it",
          "The pack size — a price for 500ml does not apply to the one-litre bottle",
          "The unit price where it is shown, which is what lets you compare two different pack sizes honestly",
          "Whether the price is a temporary promotion, and the date it ends",
        ],
      },
      { type: "heading", text: "If the till charges more" },
      {
        type: "paragraph",
        text: "Raise it at the till before paying. Ask the cashier to check the shelf label. Most mismatches are genuine mistakes — an old label left up after a price change — and are corrected on the spot.",
      },
      {
        type: "paragraph",
        text: "If the shop will not honour the displayed price, pay only if you still want the item, keep the receipt, and photograph the shelf label before you leave. The label is the evidence, and it may be gone by the time an officer visits.",
      },
      {
        type: "note",
        variant: "warning",
        title: "Photograph the label, not just the receipt",
        text: "A receipt alone shows what you paid. It does not show what was advertised. Without a photograph of the label the case rests on your recollection against the shop's.",
      },
      {
        type: "quote",
        text: "The photograph of the shelf label is the difference between a complaint we can act on and one we can only record.",
        attribution: "Consumer Affairs Division",
      },
    ],
  },
  {
    id: "5",
    slug: "price-surveillance-expands-to-fuel-and-household-goods",
    kind: "Guidance",
    title: "Price surveillance expands to fuel and household goods",
    date: "2026-01-22",
    summary:
      "Weekly surveys now cover fuel and household essentials alongside food, and the results appear in the public price checker.",
    body: [
      {
        type: "paragraph",
        text: "Weekly price surveys have been extended beyond food to cover fuel and a set of household essentials. Officers record what is actually being charged in shops and forecourts, and those records feed the price checker on this portal.",
      },
      {
        type: "paragraph",
        text: "The distinction matters when reading the checker. The legal maximum is what the law permits. The surveyed price is what an officer recorded on a specific date at a specific shop. Prices can move between surveys, so treat the surveyed figure as a guide rather than a guarantee.",
      },
      { type: "heading", text: "Newly covered" },
      {
        type: "list",
        items: [
          "Unleaded petrol and diesel",
          "Laundry detergent and dish soap",
          "Basic cleaning supplies",
        ],
      },
      {
        type: "note",
        variant: "info",
        title: "Set a price alert",
        text: "Open any product in the price checker and choose to be emailed when its surveyed price changes.",
      },
    ],
  },
];

/* ---------------------------------------------------------------------------
   Reporting and analytics. Aggregates a regulator or policymaker would ask for.
   ------------------------------------------------------------------------ */

export const complaintsByCategory = [
  { category: "Misleading pricing", count: 412 },
  { category: "Defective product", count: 318 },
  { category: "Poor service", count: 247 },
  { category: "False advertising", count: 164 },
  { category: "Other", count: 106 },
];

export const complaintsByMonth = [
  { month: "Oct", filed: 168, resolved: 141 },
  { month: "Nov", filed: 184, resolved: 159 },
  { month: "Dec", filed: 221, resolved: 173 },
  { month: "Jan", filed: 196, resolved: 188 },
  { month: "Feb", filed: 243, resolved: 205 },
  { month: "Mar", filed: 235, resolved: 223 },
];

/** Compliance by product category — the national equivalent of the old
    by-country breakdown, which does not apply to a single-country site. */
export const complianceByCategory = [
  { category: "Food", withinLimit: 78, aboveLimit: 22 },
  { category: "Fuel", withinLimit: 84, aboveLimit: 16 },
  { category: "Household", withinLimit: 71, aboveLimit: 29 },
  { category: "Electronics", withinLimit: 62, aboveLimit: 38 },
];

/** Median days from filing to resolution. */
export const resolutionTimeByMonth = [
  { month: "Oct", days: 34 },
  { month: "Nov", days: 31 },
  { month: "Dec", days: 36 },
  { month: "Jan", days: 28 },
  { month: "Feb", days: 24 },
  { month: "Mar", days: 21 },
];
