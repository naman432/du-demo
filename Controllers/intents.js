/* eslint-disable no-undef */
const { success, error } = require("../ApiResponse/apiResponse");
const OpenAI = require("openai");
require("dotenv").config();
const {
  getPlans,
  getUsage,
  getCurrentPlan,
  getEvents,
  getSpots,
  getBills,
} = require("./plans");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.analyzeIntent = async (req, res) => {
  try {
    const { message } = req.query;
    const intents = [
      {
        id: 1,
        intent: "events",
        text: `
                    User wants to see their upcoming or past events.
                    Example queries:
                    - "Show my events"
                    - "What events are coming up?"
                    - "List my meetings or calendar items"
                    `,
      },
      {
        id: 2,
        intent: "usage",
        text: `
                    User wants to view data usage, call usage, or billing information.
                    Example queries:
                    - "Show my data usage"
                    - "How much internet have I used?"
                    - "Show my call usage"
                    `,
      },
      {
        id: 3,
        intent: "recommended_plans",
        text: `
                    User wants to get plan recommendations, upgrades, or buy more data.
                    Example queries:
                    - "I need more data"
                    - "Recommend a better plan"
                    - "Upgrade my plan"
                    - "I want to buy a new plan"
                    - "Which plan should I get?"
                    `,
      },
      {
        id: 4,
        intent: "current_plan",
        text: `
                    User wants to check their current active plan or subscription details.
                    Example queries:
                    - "Show my plan"
                    - "Show my plans"
                    - "What plan am I on?"
                    - "Tell me about my current plan"
                    - "What's my active plan?"
                    `,
      },
      {
        id: 5,
        intent: "plans",
        text: `
                    User wants to see the list of available or new plans.
                    Example queries:
                    - "Show available plans"
                    - "List all plans"
                    - "What plans do you have?"
                    - "Show data packs"
                    `,
      },
      {
        id: 6,
        intent: "top_hots",
        text: `
                    User wants to see the list of trending spots near by.
                    Example queries:
                    - "Show me whats hot"
                    - "List all hot spots"
                    - "What top hots do you have?"`,
      },
      {
        id: 7,
        intent: "special_spots",
        text: `
                    User wants to see the list of secret or vip spots near by.
                    Example queries:
                    - "Show secret spots"
                    - "Show hidden spots"
                    - "Show sports events"
                    - "Show vip spots"
                    - "List vip spots"
                    `,
      },
      {
        id: 8,
        intent: "sports_events",
        text: `
                    User wants to see the list of sports events near by.
                    Example queries:
                    - "Show sports events"
                    - "List sports events"`,
      },
      {
        id: 9,
        intent: "billing",
        text: `
                    User wants to view billing information.
                    Example queries:
                    - "Show my bill" or "Show billing details"
                    `,
      },
    ];
    //combining intents to string
    const intentList = intents.map((i) => `${i.intent}: ${i.text}`).join("\n");

    // Call OpenAI's chat completion API
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
                        You are an intent classifier.
                        You can only return one of these intents:
                        ${intents.map((i) => i.intent).join(", ")}.
                        
                        Rules:
                            1. If the user's message clearly asks to perform an action related to an intent, return that intent.
                            2. If the message expresses negation (e.g., "don't", "do not", "not", "never", "no") about an action, 
                                you must return an appropriate conversational message to user so that it understands that the intent is not matched.
                            3. If the message is unclear or ambiguous, respond conversationally to ask for clarification. Suggest what they might mean based on available options and ask them to be more specific.
                            4. If the message is irrelevant or does not match any intent at all, respond conversationally explaining that you can help with events, usage, plans, current plan details, or trending spots, and ask them to rephrase.
                            5. Return only the intent name or a conversational message to the user — no technical explanations.
                            6. If multiple intents are matched then give it as colon separated.
                                Example - "intent1:intent2"
                            7. When responding with messages (not intents), be natural and helpful in your tone but keep responses SHORT - just a brief question or clarification, not paragraphs.
                        `,
        },
        {
          role: "user",
          content: `Message: "${message}"\n\nAvailable intents:\n${intentList}`,
        },
      ],
      temperature: 0,
    });
    let plans = [],
      events = [],
      usage = [],
      current_plan = {},
      recommended_plans = [],
      sports = [],
      vips = [],
      secrets = [],
      topSpots = [],
      billings = [],
      type = "";
    const intent = completion.choices[0].message.content.trim().split(":");

    //fetch data based on intent
    if (intent.includes("plans")) {
      plans = await getPlans();
    }
    if (intent.includes("events")) {
      events = await getEvents();
    }
    if (intent.includes("usage")) {
      usage = await getUsage();
      current_plan = await getCurrentPlan();
    }
    if (intent.includes("billing")) {
      billings = await getBills(message);
      type = "Billing";
    }
    if (intent.includes("current_plan")) {
      current_plan = await getCurrentPlan();
    }
    if (intent.includes("recommended_plans")) {
      const recommendIds = await this.recommendPlans();
      recommended_plans = await getPlans(recommendIds);
    }
    if (intent.includes("top_hots")) {
      sports = await getEvents("Sports");
      vips = await getSpots("VIP");
      secrets = await getSpots("Secret");
      topSpots = await getSpots("Top");
      type = "Top Hots";
    }
    if (intent.includes("special_spots")) {
      vips = await getSpots("VIP");
      secrets = await getSpots("Secret");
      type = "Special Spots";
    }
    if (intent.includes("sports_events")) {
      sports = await getEvents("Sports");
      type = "Sports Events";
    }
    return res.status(200).json(
      success(
        "",
        {
          intent,
          plans,
          events,
          usage,
          current_plan,
          billings,
          recommended_plans,
          sports,
          vips,
          secrets,
          topSpots,
          type,
        },
        res.statusCode,
      ),
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json(error("error", res.statusCode));
  }
};

exports.recommendPlans = async () => {
  try {
    const plans = await getPlans();
    const usage = await getUsage();
    // Call OpenAI's chat completion API
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
                        You are a data plan recommender.
                        Your task:
                        - Analyze the user's data usage and match it with the most suitable plans.
                        - Choose some plan IDs from the provided list that best fit the user's needs.
                        - If no plan fits, return "none".
                        
                        Output format rules:
                        - Return ONLY the selected planId(s), separated by commas (e.g., "68ef9c3231f3b32ff835326a, 68ef9c9931f3b32ff835326b").
                        - Do not include any explanations, words, or punctuation besides commas.
                    `,
        },
        {
          role: "user",
          content: `User Usage:\n${JSON.stringify(usage)}\n\nAvailable Plans:\n${JSON.stringify(plans, null, 2)}`,
        },
      ],
      temperature: 0,
    });
    // Extract and return recommended plan IDs
    const recommendation = completion.choices[0].message.content
      .trim()
      .split(", ");
    console.log("Recommended Plan IDs:", recommendation);

    return recommendation;
  } catch (err) {
    console.log(err);
    return [];
  }
};
