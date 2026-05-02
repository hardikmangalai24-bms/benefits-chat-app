import { ProcessedDocument, ExtractedBenefit, DocumentSection } from "./types";

/**
 * Demo document for hackathon presentation
 * Represents a realistic "Premium Rewards Credit Card — Terms and Conditions"
 */

const demoSections: DocumentSection[] = [
  {
    id: "sec-1",
    sectionNumber: "§1",
    title: "Definitions",
    content: "In these Terms and Conditions, unless the context otherwise requires: 'Card' means the Premium Rewards Credit Card issued by the Bank; 'Cardholder' means the person to whom the Card is issued; 'Reward Points' means points earned on eligible transactions...",
    pageNumber: 1,
  },
  {
    id: "sec-2",
    sectionNumber: "§2",
    title: "Account Opening",
    content: "The Card will be issued subject to the Bank's credit assessment and approval. The Cardholder must be at least 21 years of age and have a minimum annual income of ₹5,00,000...",
    pageNumber: 2,
  },
  {
    id: "sec-3",
    sectionNumber: "§3",
    title: "Credit Limit",
    content: "The Bank will assign a credit limit based on the Cardholder's creditworthiness. The credit limit may be reviewed and revised by the Bank at its discretion...",
    pageNumber: 3,
  },
  {
    id: "sec-4",
    sectionNumber: "§4",
    title: "Rewards Programme",
    content: "The Premium Rewards Programme allows Cardholders to earn and redeem Reward Points on eligible transactions. Points are earned at the rate of 1 point per ₹100 spent on most categories...",
    pageNumber: 4,
  },
  {
    id: "sec-4-1",
    sectionNumber: "§4.1",
    title: "Earning Points",
    content: "Reward Points are earned on all retail transactions except fuel, utility bills, and cash withdrawals. Bonus points may be awarded during promotional periods...",
    pageNumber: 4,
  },
  {
    id: "sec-4-1-2",
    sectionNumber: "§4.1.2",
    title: "Welcome Bonus",
    content: "New Cardholders will receive 5,000 bonus Reward Points upon making their first transaction within 30 days of card activation. This offer is valid for first-time cardholders only...",
    pageNumber: 5,
  },
  {
    id: "sec-4-2",
    sectionNumber: "§4.2",
    title: "Redemption",
    content: "Reward Points can be redeemed for cashback, travel vouchers, shopping vouchers, or merchandise. Minimum redemption is 1,000 points. Points expire after 3 years from the date of earning...",
    pageNumber: 5,
  },
  {
    id: "sec-4-2-1",
    sectionNumber: "§4.2.1",
    title: "Cashback Redemption",
    content: "Points can be converted to cashback at the rate of 1 point = ₹0.25. Minimum redemption is 1,000 points (₹250). New cardholders receive ₹250 cashback on their first online transaction within 60 days of card activation...",
    pageNumber: 6,
  },
  {
    id: "sec-4-2-2",
    sectionNumber: "§4.2.2",
    title: "Travel Vouchers",
    content: "Cardholders who achieve annual spending of ₹1,50,000 or more will receive a ₹2,000 travel voucher valid on partner airlines and hotels. The voucher is issued within 30 days of reaching the milestone and is valid for 6 months...",
    pageNumber: 6,
  },
  {
    id: "sec-4-2-3",
    sectionNumber: "§4.2.3",
    title: "Shopping Vouchers",
    content: "Points can be redeemed for shopping vouchers at partner retailers including Amazon, Flipkart, and major department stores. Vouchers are delivered electronically within 48 hours...",
    pageNumber: 7,
  },
  {
    id: "sec-5",
    sectionNumber: "§5",
    title: "Cashback Offers",
    content: "The Card offers category-specific cashback on grocery, fuel, and dining transactions. Cashback is credited to the card account within 90 days of the transaction date...",
    pageNumber: 8,
  },
  {
    id: "sec-5-1",
    sectionNumber: "§5.1",
    title: "Grocery Cashback",
    content: "Cardholders earn 5% cashback on grocery spends at supermarkets and online grocery platforms. Maximum cashback is ₹300 per month. Minimum transaction value must be ₹200. This offer is applicable only at supermarkets and excludes convenience stores...",
    pageNumber: 8,
  },
  {
    id: "sec-5-2",
    sectionNumber: "§5.2",
    title: "Fuel Cashback",
    content: "Enjoy 1% fuel surcharge waiver on transactions between ₹400 and ₹5,000 at all fuel stations across India. Maximum waiver of ₹250 per month. Not applicable on diesel purchases for commercial vehicles...",
    pageNumber: 9,
  },
  {
    id: "sec-5-3",
    sectionNumber: "§5.3",
    title: "Dining Cashback",
    content: "Earn 2x reward points on dining spends at restaurants. This benefit is valid only at restaurants rated 4 stars or above on Zomato and is applicable on weekends (Friday to Sunday) only. Maximum bonus points: 2,000 per month...",
    pageNumber: 9,
  },
  {
    id: "sec-5-3-1",
    sectionNumber: "§5.3.1",
    title: "Partner Restaurant Discount",
    content: "Cardholders receive 25% discount at partner restaurants, up to a maximum of ₹500 per visit. Valid at over 500 partner restaurants across major cities. Reservation must be made through the Bank's dining portal...",
    pageNumber: 10,
  },
  {
    id: "sec-6",
    sectionNumber: "§6",
    title: "Milestone Benefits",
    content: "Cardholders who spend ₹20,000 or more in a calendar month will receive a ₹500 Swiggy voucher. The voucher is credited within 15 days of the month end and is valid for 90 days. This benefit is available every month...",
    pageNumber: 11,
  },
  {
    id: "sec-7",
    sectionNumber: "§7",
    title: "Lounge Access",
    content: "Cardholders are entitled to 4 complimentary airport lounge visits per quarter at domestic and international airports. Access is provided through Priority Pass. Additional visits can be purchased at ₹500 per visit. Lounge access must be booked 24 hours in advance through the mobile app...",
    pageNumber: 12,
  },
  {
    id: "sec-8",
    sectionNumber: "§8",
    title: "Insurance Coverage",
    content: "The Card provides comprehensive insurance coverage including air accident insurance, purchase protection, and lost card liability protection...",
    pageNumber: 13,
  },
  {
    id: "sec-8-1",
    sectionNumber: "§8.1",
    title: "Air Accident Insurance",
    content: "Cardholders are covered for air accident insurance up to ₹1 crore when the flight tickets are purchased using the Card. Coverage is automatic and requires no additional premium...",
    pageNumber: 13,
  },
  {
    id: "sec-8-3",
    sectionNumber: "§8.3",
    title: "Purchase Protection",
    content: "Items purchased using the Card are protected against theft or accidental damage for 90 days from the date of purchase, up to a maximum of ₹50,000 per item. Electronics and jewelry are covered. Claims must be filed within 7 days of the incident...",
    pageNumber: 14,
  },
  {
    id: "sec-9",
    sectionNumber: "§9",
    title: "Fees and Charges",
    content: "Annual fee: ₹2,500 (waived on annual spends above ₹2,00,000). Late payment fee: ₹500. Cash advance fee: 2.5% of transaction amount. Foreign currency markup: 3.5% (waived up to ₹5,000 per month as per §9.3)...",
    pageNumber: 15,
  },
  {
    id: "sec-9-3",
    sectionNumber: "§9.3",
    title: "Foreign Currency Transactions",
    content: "Zero forex markup on international transactions up to ₹5,000 per month. Beyond this limit, standard markup of 3.5% applies. This benefit is available on both online and offline international transactions...",
    pageNumber: 16,
  },
  {
    id: "sec-10",
    sectionNumber: "§10",
    title: "Exclusions",
    content: "Reward Points are not earned on: fuel transactions, utility bill payments, cash withdrawals, EMI transactions, and balance transfers. Cashback offers do not apply to government payments and insurance premium payments...",
    pageNumber: 17,
  },
];

const demoBenefits: ExtractedBenefit[] = [
  {
    id: "benefit-1",
    category: "cashback",
    title: "Grocery Cashback",
    description: "Earn cashback on your grocery shopping at supermarkets",
    exactValue: "5%",
    conditions: [
      "Maximum ₹300 per month",
      "Minimum transaction ₹200",
      "Applicable at supermarkets only",
    ],
    sectionRef: "§5.1",
    sectionId: "sec-5-1",
    pageNumber: 8,
    confidence: "high",
  },
  {
    id: "benefit-2",
    category: "milestone",
    title: "Monthly Swiggy Voucher",
    description: "Get a Swiggy voucher when you reach monthly spending milestone",
    exactValue: "₹500",
    conditions: [
      "Spend ₹20,000 or more per month",
      "Voucher valid for 90 days",
      "Credited within 15 days of month end",
    ],
    sectionRef: "§6",
    sectionId: "sec-6",
    pageNumber: 11,
    confidence: "high",
  },
  {
    id: "benefit-3",
    category: "lounge_access",
    title: "Airport Lounge Access",
    description: "Complimentary access to airport lounges worldwide",
    exactValue: "4 visits per quarter",
    conditions: [
      "Domestic and international airports",
      "Priority Pass membership",
      "Must book 24 hours in advance",
    ],
    sectionRef: "§7",
    sectionId: "sec-7",
    pageNumber: 12,
    confidence: "high",
  },
  {
    id: "benefit-4",
    category: "fuel_surcharge",
    title: "Fuel Surcharge Waiver",
    description: "Save on fuel surcharge at all petrol pumps",
    exactValue: "1%",
    conditions: [
      "Transactions between ₹400-₹5,000",
      "Maximum ₹250 per month",
      "Not valid for commercial diesel",
    ],
    sectionRef: "§5.2",
    sectionId: "sec-5-2",
    pageNumber: 9,
    confidence: "high",
  },
  {
    id: "benefit-5",
    category: "dining",
    title: "Dining Reward Points",
    description: "Earn double reward points on restaurant spends",
    exactValue: "2x points",
    conditions: [
      "Valid at restaurants rated 4+ on Zomato",
      "Weekends only (Friday-Sunday)",
      "Maximum 2,000 bonus points per month",
    ],
    sectionRef: "§5.3",
    sectionId: "sec-5-3",
    pageNumber: 9,
    confidence: "high",
  },
  {
    id: "benefit-6",
    category: "travel",
    title: "Annual Travel Voucher",
    description: "Receive a travel voucher on reaching annual spending milestone",
    exactValue: "₹2,000",
    conditions: [
      "Annual spend of ₹1,50,000 required",
      "Valid on partner airlines and hotels",
      "Voucher valid for 6 months",
    ],
    sectionRef: "§4.2.2",
    sectionId: "sec-4-2-2",
    pageNumber: 6,
    confidence: "high",
  },
  {
    id: "benefit-7",
    category: "travel",
    title: "Zero Forex Markup",
    description: "No foreign currency markup on international transactions",
    exactValue: "0% markup up to ₹5,000/month",
    conditions: [
      "First ₹5,000 per month at 0%",
      "Standard 3.5% beyond limit",
      "Valid on online and offline transactions",
    ],
    sectionRef: "§9.3",
    sectionId: "sec-9-3",
    pageNumber: 16,
    confidence: "high",
  },
  {
    id: "benefit-8",
    category: "insurance",
    title: "Air Accident Insurance",
    description: "Comprehensive air accident coverage",
    exactValue: "₹1 crore",
    conditions: [
      "Flight tickets must be purchased with card",
      "Automatic coverage, no premium",
      "Worldwide coverage",
    ],
    sectionRef: "§8.1",
    sectionId: "sec-8-1",
    pageNumber: 13,
    confidence: "high",
  },
  {
    id: "benefit-9",
    category: "rewards",
    title: "Welcome Bonus Points",
    description: "Bonus reward points on first transaction",
    exactValue: "5,000 points",
    conditions: [
      "First transaction within 30 days",
      "Valid for new cardholders only",
      "Points credited within 7 days",
    ],
    sectionRef: "§4.1.2",
    sectionId: "sec-4-1-2",
    pageNumber: 5,
    confidence: "high",
  },
  {
    id: "benefit-10",
    category: "cashback",
    title: "First Online Transaction Cashback",
    description: "Cashback on your first online purchase",
    exactValue: "₹250",
    conditions: [
      "First online transaction only",
      "Within 60 days of activation",
      "Minimum transaction ₹500",
    ],
    sectionRef: "§4.2.1",
    sectionId: "sec-4-2-1",
    pageNumber: 6,
    confidence: "high",
  },
  {
    id: "benefit-11",
    category: "insurance",
    title: "Purchase Protection Insurance",
    description: "Protection against theft or damage of purchased items",
    exactValue: "Up to ₹50,000 per item",
    conditions: [
      "90 days from purchase date",
      "Covers electronics and jewelry",
      "Claim within 7 days of incident",
    ],
    sectionRef: "§8.3",
    sectionId: "sec-8-3",
    pageNumber: 14,
    confidence: "high",
  },
  {
    id: "benefit-12",
    category: "dining",
    title: "Partner Restaurant Discount",
    description: "Exclusive discount at partner restaurants",
    exactValue: "25% off, up to ₹500 per visit",
    conditions: [
      "Valid at 500+ partner restaurants",
      "Must book through Bank's portal",
      "Major cities only",
    ],
    sectionRef: "§5.3.1",
    sectionId: "sec-5-3-1",
    pageNumber: 10,
    confidence: "high",
  },
];

export const DEMO_DOCUMENT: ProcessedDocument = {
  id: "demo-doc-001",
  name: "Premium Rewards Credit Card — Terms and Conditions.pdf",
  filename: "Premium Rewards Credit Card — Terms and Conditions.pdf",
  uploadedAt: new Date(),
  pageCount: 17,
  sections: demoSections,
  benefits: demoBenefits,
  rawText: demoSections.map(s => s.content).join('\n\n'),
  summary: "Premium Rewards Credit Card Terms and Conditions with comprehensive benefits including cashback, travel perks, insurance coverage, and milestone rewards.",
  metadata: {
    pageCount: 17,
    extractedAt: new Date().toISOString(),
    processingTime: 0,
  },
};

/**
 * Pre-canned demo conversation for hackathon presentation
 */
export const DEMO_CONVERSATION = [
  {
    role: "user" as const,
    content: "What are my top benefits?",
    delay: 500,
  },
  {
    role: "assistant" as const,
    content: `Great question! I can see you have the **Premium Rewards Credit Card** with some excellent benefits.

Before I walk you through everything, let me ask: are you more interested in **everyday cashback and rewards** for groceries and dining, or are you looking for **travel and lifestyle perks** like lounge access and travel vouchers?

This will help me highlight the most relevant benefits for you!`,
    delay: 1000,
    followUpQuestions: ["Everyday rewards", "Travel & lifestyle", "Show me everything"],
  },
  {
    role: "user" as const,
    content: "I travel a lot",
    delay: 500,
  },
  {
    role: "assistant" as const,
    content: `Perfect! Here are your **top travel benefits**:

**✈️ Airport Lounge Access** [CITE:sec-7:§7:12]
- **4 complimentary visits per quarter** at domestic and international airports
- Access via Priority Pass membership
- Must book 24 hours in advance through the mobile app

**🌍 Zero Forex Markup** [CITE:sec-9-3:§9.3:16]
- **0% foreign currency markup** on your first ₹5,000 of international transactions per month
- Applies to both online and offline purchases
- Standard 3.5% markup beyond the ₹5,000 limit

**🎁 Annual Travel Voucher** [CITE:sec-4-2-2:§4.2.2:6]
- **₹2,000 travel voucher** when you spend ₹1,50,000 annually
- Valid on partner airlines and hotels
- Voucher valid for 6 months

**🛡️ Air Accident Insurance** [CITE:sec-8-1:§8.1:13]
- **₹1 crore coverage** when you book flights with your card
- Automatic coverage with no additional premium
- Worldwide protection

These benefits make your card excellent for frequent travelers!`,
    delay: 1500,
    followUpQuestions: [
      "What's the condition for lounge access?",
      "How do I claim the travel voucher?",
      "Tell me about other benefits",
    ],
  },
  {
    role: "user" as const,
    content: "What's the condition for lounge access?",
    delay: 500,
  },
  {
    role: "assistant" as const,
    content: `Let me quote the exact terms from **Section 7 — Lounge Access**: [CITE:sec-7:§7:12]

> "Cardholders are entitled to **4 complimentary airport lounge visits per quarter** at domestic and international airports. Access is provided through Priority Pass. Additional visits can be purchased at ₹500 per visit. **Lounge access must be booked 24 hours in advance through the mobile app**."

**Key conditions:**
- ✅ 4 free visits every 3 months (resets quarterly)
- ✅ Works at both domestic and international airports
- ✅ Priority Pass membership included
- ⚠️ **Must book 24 hours before** your flight
- 💰 Extra visits cost ₹500 each

Make sure to book through your bank's mobile app at least a day before your travel!`,
    delay: 1200,
    followUpQuestions: [
      "How do I book lounge access?",
      "What other travel benefits do I have?",
      "Tell me about cashback offers",
    ],
  },
];

// Made with Bob
