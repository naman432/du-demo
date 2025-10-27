/* eslint-disable no-undef */
const { success, error } = require("../ApiResponse/apiResponse");
const OpenAI = require("openai");
const { QdrantClient } = require("@qdrant/js-client-rest");
require("dotenv").config();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const qdrant = new QdrantClient({
  url: "https://307f26a1-6fc2-48c1-9216-999cba910b56.eu-west-2-0.aws.cloud.qdrant.io",
  apiKey: process.env.QDRANT_API_KEY,
});
const COLLECTION_NAME = "plans";
exports.getQuery = async (req, res) => {
  try {
    const { message } = req.query;
    const result = await semanticSearch(message);
    return res.status(200).json(success("Success", { result }, res.statusCode));
  } catch (err) {
    console.log(err);
    return res.status(500).json(error("error", res.statusCode));
  }
};

async function initCollection() {
  //Delete existing collection
  await qdrant.deleteCollection(COLLECTION_NAME);
  // Create collection if not exists
  const exists = await qdrant.getCollection(COLLECTION_NAME).catch(() => null);
  if (!exists) {
    console.log("🆕 Creating collection...");
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 1536, // OpenAI embedding vector size
        distance: "Cosine",
      },
    });
  } else {
    console.log("✅ Collection already exists");
  }
  await qdrant.deleteCollection("intents");
  const exists1 = await qdrant.getCollection("intents").catch(() => null);
  if (!exists1) {
    console.log("🆕 Creating collection...");
    await qdrant.createCollection("intents", {
      vectors: {
        size: 1536, // OpenAI embedding vector size
        distance: "Cosine",
      },
    });
  } else {
    console.log("✅ Collection already exists");
  }
}

async function embedText(text) {
  // Generate embedding using OpenAI
  const res = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding;
}

async function insertDocuments() {
  const documents = [
    {
      id: 1,
      text: `=== WHATSAPP ACTIVITY DATA ===

                Date: 2025-10-14
                WhatsApp Activity Summary:
                - Active time: 85 minutes
                - Messages sent: 124
                - Messages received: 156
                - Media files shared: 12
                - Most active chat: Family Group
                - Peak usage hours: 12:00 PM and 8:00 PM
                - Chat distribution: 65% group chats, 35% personal chats
                - Daily engagement: High activity with frequent messaging

                Date: 2025-10-13
                WhatsApp Activity Summary:
                - Active time: 92 minutes
                - Messages sent: 138
                - Messages received: 167
                - Media files shared: 8
                - Most active chat: Work Team
                - Peak usage hours: 10:00 AM and 3:00 PM
                - Chat distribution: 75% group chats, 25% personal chats
                - Daily engagement: Very high activity with work-related communications

                WhatsApp Weekly Summary:
                - Total active time: 620 minutes (10.3 hours)
                - Total messages exchanged: 1850
                - Media shared: 45 files
                - Most active groups: Family Group, Work Team
                - Usage pattern: Consistent daily usage with peak activity during work hours and evenings`,
    },
    {
      id: 2,
      text: `=== YOUTUBE ACTIVITY DATA ===

                Date: 2025-10-14
                YouTube Activity Summary:
                - Watch time: 120 minutes (2 hours)
                - Videos watched: 8
                - Most watched category: Technology
                - Peak usage hour: 8:00 PM
                - Category breakdown: Technology (45 min), Education (35 min), Entertainment (40 min)
                - Viewing pattern: Evening entertainment with focus on tech content

                Date: 2025-10-13
                YouTube Activity Summary:
                - Watch time: 90 minutes (1.5 hours)
                - Videos watched: 6
                - Most watched category: Education
                - Peak usage hour: 7:00 PM
                - Category breakdown: Education (50 min), Technology (25 min), Entertainment (15 min)
                - Viewing pattern: Educational content focus with moderate usage

                YouTube Weekly Summary:
                - Total watch time: 840 minutes (14 hours)
                - Average daily time: 120 minutes
                - Favorite category: Technology
                - Total videos watched: 42
                - Usage pattern: Regular evening viewing with preference for technology and educational content`,
    },
    {
      id: 3,
      text: `=== BATTERY PERFORMANCE DATA ===

                Date: 2025-10-14
                Battery Performance Summary:
                - Charge cycles: 2 full cycles
                - Battery range: 100% to 15% (85% usage)
                - Screen on time: 5.2 hours
                - Top consuming apps: YouTube (25%), Instagram (20%), WhatsApp (15%), Chrome (10%)
                - Battery health: Good performance with typical usage patterns

                Date: 2025-10-13
                Battery Performance Summary:
                - Charge cycles: 1 full cycle
                - Battery range: 100% to 20% (80% usage)
                - Screen on time: 4.8 hours
                - Top consuming apps: YouTube (20%), WhatsApp (18%), Instagram (15%), Chrome (12%)
                - Battery health: Excellent performance with efficient usage

                Battery Weekly Summary:
                - Average charge cycles: 1.5 per day
                - Average screen time: 5.0 hours daily
                - Most consuming apps: YouTube, Instagram, WhatsApp
                - Battery health: Good overall performance with normal degradation patterns
                - Usage recommendation: Moderate to heavy usage with room for optimization`,
    },
    {
      id: 4,
      text: `=== USER BEHAVIOR PATTERNS ===

                Communication Patterns:
                - Heavy WhatsApp user with strong preference for group communications
                - Peak communication hours: 10AM-12PM and 3PM-8PM
                - Balanced between personal and professional messaging
                - High media sharing activity indicates rich communication style

                Entertainment Patterns:
                - Regular YouTube viewer with consistent daily consumption
                - Strong preference for educational and technology content
                - Evening viewing habits (7-8PM peak times)
                - Moderate to high engagement with longer viewing sessions

                Device Usage Patterns:
                - Moderate to heavy smartphone user (5+ hours screen time)
                - Balanced app usage across social, entertainment, and productivity
                - Typical charging behavior with 1-2 cycles per day
                - Good battery management with reasonable charge levels`,
    },
    {
      id: 5,
      text: `=== PLANS AVAILABLE ===

                1. Business Plan 200
                Description: Plan for YouTube users
                Features: None
                Price: $200

                2. Business Plan 300
                Description: Plan for Twitter users
                Features: None
                Price: $300

                3. Business Plan 500
                Description: Plan for Twitter and Instagram users
                Features: None
                Price: $500`,
    },
  ];

  console.log("⚙️ Generating embeddings...");
  const points = [];
  // Generate embeddings and prepare points
  for (const doc of documents) {
    const vector = await embedText(doc.text);
    points.push({
      id: doc.id,
      vector,
      payload: { text: doc.text },
    });
  }

  await qdrant.upsert(COLLECTION_NAME, { points });
  console.log("✅ Documents inserted successfully");
}

async function insertIntents() {
  const intents = [
    {
      id: 1,
      intent: "whatsapp_activity",
      text: "Summarize or query WhatsApp activity data",
    },
    {
      id: 2,
      intent: "youtube_activity",
      text: "Summarize or query YouTube activity data",
    },
    {
      id: 3,
      intent: "battery_performance",
      text: "Analyze battery performance and power consumption",
    },
    {
      id: 4,
      intent: "user_behavior",
      text: "Describe general behavior patterns based on data",
    },
    {
      id: 5,
      intent: "plan_information",
      text: "Retrieve available business plan details",
    },
    {
      id: 6,
      intent: "compare_usage",
      text: "Compare usage across apps or time periods",
    },
    {
      id: 7,
      intent: "recommend_plan",
      text: "Recommend suitable business plan based on activity",
    },
    {
      id: 8,
      intent: "summary_overview",
      text: "Provide a holistic summary of all user activity",
    },
  ];

  console.log("⚙️ Generating embeddings for intents...");
  const points = [];

  for (const item of intents) {
    const vector = await embedText(item.text);
    points.push({
      id: item.id,
      vector,
      payload: item,
    });
  }

  await qdrant.upsert("intents", { points });
  console.log("✅ Intents stored successfully");
}

async function semanticSearch(query) {
  // Generate embedding for the query
  const queryVector = await embedText(query);
  // Perform search in Qdrant
  const results = await qdrant.search(COLLECTION_NAME, {
    vector: queryVector,
    limit: 7,
  });

  console.log(`\n🔍 Query: "${query}"`);
  console.log("📚 Top results:");
  let text = ``;
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.payload.text} (score: ${r.score.toFixed(4)})`);
    text = text + r.payload.text + "\n";
  });
  return text;
}

(async () => {
  // await initCollection();
  // await insertDocuments();
  // await insertIntents();
  // Try some semantic searches
  // await semanticSearch("What is a Node.js framework?");
  // await semanticSearch("AI vector database for search");
})();
