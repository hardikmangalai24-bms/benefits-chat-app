import { ExtractedBenefit, BenefitCategory, DocumentSection } from "./types";
import { complete } from "./claude";

const BATCH_SIZE = 10; // Process 10 sections at a time to stay within token limits

/**
 * Extract benefits from document sections using Claude AI
 */
export async function extractBenefits(
  sections: DocumentSection[]
): Promise<ExtractedBenefit[]> {
  console.log(`Extracting benefits from ${sections.length} sections...`);

  const allBenefits: ExtractedBenefit[] = [];
  const batches = chunkArray(sections, BATCH_SIZE);

  for (let i = 0; i < batches.length; i++) {
    console.log(`Processing batch ${i + 1}/${batches.length}...`);

    try {
      const batchBenefits = await extractBenefitsFromBatch(batches[i]);
      allBenefits.push(...batchBenefits);
    } catch (error: any) {
      console.error(`Error processing batch ${i + 1}:`, error.message);
      // Continue with other batches even if one fails
    }
  }

  // Deduplicate by (title + sectionRef)
  const deduped = deduplicateBenefits(allBenefits);

  // Sort by category then confidence
  const sorted = deduped.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    const confidenceOrder = { high: 0, medium: 1, low: 2 };
    return confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
  });

  console.log(`Extracted ${sorted.length} unique benefits`);

  return sorted;
}

/**
 * Extract benefits from a batch of sections
 */
async function extractBenefitsFromBatch(
  sections: DocumentSection[]
): Promise<ExtractedBenefit[]> {
  const systemPrompt = `You are a precise benefit extraction engine. Analyze the document sections provided and extract ALL benefits, entitlements, cashback offers, reward points, vouchers, milestone bonuses, insurance coverage, lounge access, fuel surcharge waivers, and any other user advantage.

For EVERY benefit found, output a JSON array. Each benefit object MUST have:
{
  "title": "short name of the benefit",
  "category": one of [cashback, rewards, vouchers, insurance, lounge_access, fuel_surcharge, milestone, dining, travel, shopping, other],
  "exactValue": "the EXACT numeric/percentage value as stated — e.g. '5%', '₹500', '2x points', '4 visits per quarter'",
  "description": "one sentence explanation",
  "conditions": ["array", "of", "exact", "conditions", "thresholds", "caps", "from", "the", "text"],
  "sectionRef": "the section number this was found in — e.g. §4.2.1",
  "sectionId": "the id field of the source section",
  "pageNumber": the page number as an integer,
  "confidence": "high if exact value stated, medium if inferred, low if vague"
}

Rules:
- Never invent values not in the text
- If a benefit says "up to ₹500 cashback on spends of ₹5,000", the exactValue is "up to ₹500" and conditions includes "minimum spend ₹5,000"
- Include ALL conditions: monthly caps, annual caps, category restrictions, merchant exclusions
- Return ONLY the JSON array, no other text`;

  // Format sections for the prompt
  const sectionsText = sections
    .map(
      (s) =>
        `Section ${s.sectionNumber} (ID: ${s.id}, Page: ${s.pageNumber}): ${s.title}\n${s.content}`
    )
    .join("\n\n---\n\n");

  const userMessage = `Extract all benefits from these sections:\n\n${sectionsText}`;

  try {
    const response = await complete(
      [{ role: "user", content: userMessage }],
      systemPrompt
    );

    // Parse JSON with error recovery
    const benefits = parseJSONResponse(response);

    // Add generated IDs
    return benefits.map((benefit, index) => ({
      id: `benefit_${Date.now()}_${index}`,
      ...benefit,
    }));
  } catch (error: any) {
    console.error("Error extracting benefits from batch:", error.message);
    return [];
  }
}

/**
 * Parse JSON response with error recovery
 */
function parseJSONResponse(response: string): Array<{
  title: string;
  category: BenefitCategory;
  exactValue: string;
  description: string;
  conditions: string[];
  sectionRef: string;
  sectionId: string;
  pageNumber: number;
  confidence: "high" | "medium" | "low";
}> {
  try {
    // Strip markdown code fences if present
    let cleaned = response.trim();

    // Remove ```json and ``` markers
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    // Find JSON array
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn("No JSON array found in response");
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed)) {
      console.warn("Response is not an array");
      return [];
    }

    // Validate each benefit
    return parsed.filter((benefit) => {
      return (
        benefit.title &&
        benefit.category &&
        benefit.exactValue &&
        benefit.description &&
        Array.isArray(benefit.conditions) &&
        benefit.sectionRef &&
        benefit.sectionId &&
        typeof benefit.pageNumber === "number" &&
        benefit.confidence
      );
    });
  } catch (error: any) {
    console.error("Error parsing JSON response:", error.message);
    return [];
  }
}

/**
 * Deduplicate benefits by (title + sectionRef)
 */
function deduplicateBenefits(
  benefits: ExtractedBenefit[]
): ExtractedBenefit[] {
  const seen = new Set<string>();
  const unique: ExtractedBenefit[] = [];

  for (const benefit of benefits) {
    const key = `${benefit.title.toLowerCase()}|${benefit.sectionRef}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(benefit);
    }
  }

  return unique;
}

/**
 * Find relevant sections for a query using TF-IDF scoring
 */
export async function findRelevantSections(
  query: string,
  sections: DocumentSection[],
  topK: number = 5
): Promise<DocumentSection[]> {
  console.log(`Finding relevant sections for query: "${query}"`);

  const queryTokens = tokenize(query.toLowerCase());
  const scores: Array<{ section: DocumentSection; score: number }> = [];

  // Calculate TF-IDF scores
  for (const section of sections) {
    let score = 0;

    // Boost if section number appears in query
    const sectionNumberMatch = queryTokens.some(
      (token) =>
        token === section.sectionNumber.toLowerCase() ||
        token.includes(section.sectionNumber.toLowerCase().replace(/[§\s]/g, ""))
    );

    if (sectionNumberMatch) {
      score += 10; // Strong boost for direct section reference
    }

    // Calculate TF-IDF score
    const sectionTokens = tokenize(
      `${section.title} ${section.content}`.toLowerCase()
    );
    const sectionTokenSet = new Set(sectionTokens);

    for (const queryToken of queryTokens) {
      if (sectionTokenSet.has(queryToken)) {
        // Term frequency in section
        const tf = sectionTokens.filter((t) => t === queryToken).length;

        // Inverse document frequency (simplified)
        const df = sections.filter((s) =>
          tokenize(`${s.title} ${s.content}`.toLowerCase()).includes(queryToken)
        ).length;
        const idf = Math.log(sections.length / (df + 1));

        score += tf * idf;
      }
    }

    // Boost for title matches
    const titleTokens = tokenize(section.title.toLowerCase());
    for (const queryToken of queryTokens) {
      if (titleTokens.includes(queryToken)) {
        score += 2;
      }
    }

    scores.push({ section, score });
  }

  // Sort by score and return top K
  scores.sort((a, b) => b.score - a.score);

  const relevant = scores.slice(0, topK).map((s) => s.section);

  console.log(
    `Found ${relevant.length} relevant sections with scores:`,
    scores.slice(0, topK).map((s) => s.score)
  );

  return relevant;
}

/**
 * Tokenize text into words
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2); // Filter out very short tokens
}

/**
 * Chunk array into batches
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Categorize a benefit based on keywords (legacy function)
 */
export function categorizeBenefit(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  const categories = {
    cashback: ["cashback", "cash back"],
    rewards: ["reward", "points", "miles"],
    vouchers: ["voucher", "gift card", "e-gift"],
    insurance: ["insurance", "cover", "protection"],
    lounge_access: ["lounge", "airport lounge"],
    fuel_surcharge: ["fuel", "surcharge waiver"],
    milestone: ["milestone", "bonus", "anniversary"],
    dining: ["dining", "restaurant", "food"],
    travel: ["travel", "flight", "hotel", "booking"],
    shopping: ["shopping", "retail", "merchant"],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category;
    }
  }

  return "other";
}

/**
 * Generate follow-up questions based on benefits (legacy function)
 */
export function generateFollowUpQuestions(
  benefits: ExtractedBenefit[]
): string[] {
  const questions: string[] = [];

  const categories = Array.from(new Set(benefits.map((b) => b.category)));

  if (categories.includes("insurance")) {
    questions.push("What insurance benefits are included?");
    questions.push("What are the coverage limits?");
  }

  if (categories.includes("cashback")) {
    questions.push("How do I earn cashback?");
    questions.push("What are the cashback rates?");
  }

  if (categories.includes("rewards")) {
    questions.push("How do reward points work?");
    questions.push("What can I redeem points for?");
  }

  if (categories.includes("lounge_access")) {
    questions.push("Which airport lounges can I access?");
  }

  // Add general questions
  questions.push("What benefits am I eligible for?");
  questions.push("When do my benefits start?");

  return questions.slice(0, 6); // Return max 6 questions
}

// Made with Bob
