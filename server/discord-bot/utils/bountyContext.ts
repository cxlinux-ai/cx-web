/**
 * Bounty Context for LLM
 * 
 * Fetches bounty data from the API and formats it for LLM context.
 * This allows the bot to answer questions about specific bounties.
 */

interface Bounty {
  id: number;
  number: number;
  title: string;
  url: string;
  state: "open" | "closed";
  repositoryName: string;
  bountyAmount: number | null;
  difficulty: "beginner" | "medium" | "advanced" | null;
  description: string;
}

interface BountyData {
  open: Bounty[];
  closed: Bounty[];
  stats: {
    totalOpen: number;
    totalClosed: number;
    totalOpenAmount: number;
    totalClosedAmount: number;
  };
}

// Cache bounty data to avoid hammering the API
let cachedBountyData: BountyData | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Check if a question is about bounties
 */
export function shouldFetchBounties(question: string): boolean {
  const lowerQ = question.toLowerCase();
  const patterns = [
    /bounty|bounties/i,
    /paid.*issue/i,
    /earn.*money/i,
    /get.*paid/i,
    /reward.*pr/i,
    /pr.*reward/i,
    /available.*pr/i,
    /open.*issue.*pay/i,
    /highest.*paying/i,
    /how.*much.*pay/i,
    /what.*pay/i,
    /contribute.*money/i,
    /paid.*contribution/i,
  ];
  
  return patterns.some(p => p.test(lowerQ));
}

/**
 * Fetch bounty data from our API
 */
async function fetchBountyData(): Promise<BountyData | null> {
  // Check cache first
  if (cachedBountyData && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedBountyData;
  }

  try {
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : process.env.API_BASE_URL || "http://localhost:5000";
    
    const response = await fetch(`${baseUrl}/api/bounties`);
    
    if (!response.ok) {
      console.error("[Bounty Context] Failed to fetch:", response.status);
      return cachedBountyData; // Return stale cache if available
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      cachedBountyData = data.data;
      cacheTimestamp = Date.now();
      return cachedBountyData;
    }
  } catch (error) {
    console.error("[Bounty Context] Error:", error);
  }

  return cachedBountyData; // Return stale cache on error
}

/**
 * Format bounty data for LLM context
 */
export async function getBountyContext(question: string): Promise<string> {
  const data = await fetchBountyData();
  
  if (!data) {
    return "";
  }

  const { open, closed, stats } = data;

  // Format open bounties for context
  const openBountiesList = open.slice(0, 15).map(b => {
    const amount = b.bountyAmount 
      ? `$${b.bountyAmount}` 
      : "Bounty to be discussed";
    const difficulty = b.difficulty ? ` [${b.difficulty}]` : "";
    return `- #${b.number}: ${b.title} - ${amount}${difficulty} (${b.repositoryName}) - ${b.url}`;
  }).join("\n");

  // Format recently completed for context
  const recentlyCompleted = closed.slice(0, 5).map(b => {
    const amount = b.bountyAmount ? `$${b.bountyAmount}` : "Paid";
    return `- #${b.number}: ${b.title} - ${amount} (${b.repositoryName})`;
  }).join("\n");

  return `

CURRENT BOUNTY DATA (Live from GitHub):
Total: ${stats.totalOpen} open bounties worth $${stats.totalOpenAmount.toLocaleString()} available
Completed: ${stats.totalClosed} bounties, $${stats.totalClosedAmount.toLocaleString()} paid out

OPEN BOUNTIES (top 15):
${openBountiesList}

RECENTLY COMPLETED:
${recentlyCompleted}

When discussing bounties, reference the actual bounty numbers, amounts, and links above.
Guide users to cortexlinux.com/bounties to see the full list.
For bounties without set amounts, say the bounty amount will be discussed with the team.`;
}
