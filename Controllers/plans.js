/* eslint-disable no-undef */
const { error } = require("../ApiResponse/apiResponse");
const Usage = require("../Models/usage");
const Plan = require("../Models/plans");
const User = require("../Models/user");
const Event = require("../Models/events");
const Spots = require("../Models/topHots");
const Design = require("../Models/designs");
const Bill = require("../Models/bills");
const OpenAI = require("openai");
require("dotenv").config();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.getPlans = async (ids) => {
  try {
    const plans = await Plan.find({
      status: true,
      isDeleted: false,
      $and: [ids?.length ? { _id: { $in: ids } } : {}],
    });
    return plans;
  } catch (err) {
    console.log(err);
    return [];
  }
};

exports.getUsage = async () => {
  try {
    const usage = await Usage.aggregate([
      {
        $group: {
          _id: null,
          linkedin: { $sum: "$linkedin" },
          internet: { $sum: "$internet" },
          facebook: { $sum: "$facebook" },
        },
      },
    ]);

    return [
      {
        name: "LinkedIn",
        used: usage[0].linkedin,
        icon: "https://ecommercemedia.s3.ap-south-1.amazonaws.com/Attachments/1760707154645.png",
      },
      {
        name: "Internet",
        used: usage[0].internet,
        icon: "https://ecommercemedia.s3.ap-south-1.amazonaws.com/Attachments/1760707154716.png",
      },
      {
        name: "Facebook",
        used: usage[0].facebook,
        icon: "https://ecommercemedia.s3.ap-south-1.amazonaws.com/Attachments/1760707154547.png",
      },
    ];
  } catch (err) {
    console.log(err);
    return [];
  }
};

exports.getCurrentPlan = async () => {
  try {
    const user = await User.find({}).populate("current_plan");
    return user.length ? user[0] : {};
  } catch (err) {
    console.log(err);
    return {};
  }
};

exports.getEvents = async (type) => {
  try {
    const events = await Event.find({
      date: { $gt: new Date() },
      $and: [type ? { type } : {}],
    });
    return events;
  } catch (err) {
    console.log(err);
    return [];
  }
};

exports.getSpots = async (type) => {
  try {
    const spots = await Spots.find({
      date: { $gt: new Date() },
      $and: [type ? { type } : {}],
    });
    return spots;
  } catch (err) {
    console.log(err);
    return [];
  }
};

exports.getBillings = async () => {
  try {
    const bills = await Bill.find({});
    // const billing = [
    //     { month: "Jul", cost: 20 },
    //     { month: "Aug", cost: 15 },
    //     { month: "Sept", cost: 25 },
    //     { month: "Oct", cost: 30 },
    //     { month: "Nov", cost: 0 },
    // ]
    return bills;
  } catch (err) {
    console.log(err);
    return [];
  }
};

exports.getDesign = async (req, res) => {
  try {
    const { intent, type, message } = req.body;
    console.log(req.body);
    const design = await Design.findOne({ intent, type }).lean();
    if (design) {
      // Customize design based on type
      if (type == "Top Hots") {
        const topHots = await this.getSpots("Top");
        const childrens = [];
        for (const spot of topHots) {
          childrens.push({
            type: "Box",
            alignment: "bottomstart",
            modifier: {
              fillMaxWidth: true,
              height: 300,
              borderRadius: 10,
              cornerRadius: 10,
              borderColor: "#52FFFFFF",
              borderWidth: 1,
            },
            children: [
              {
                type: "Image",
                url: spot.images[0],
                contentDescription: "",
                shape: "rounded",
                modifier: {
                  fillMaxWidth: true,
                  fillMaxHeight: true,
                },
                cornerRadius: 10,
              },
              {
                type: "Column",
                modifier: {
                  backgroundGradient: ["#00000000", "#FF000000"],
                },
                children: [
                  {
                    type: "Row",
                    modifier: {
                      fillMaxWidth: true,
                      paddingStart: 12,
                      paddingBottom: 4,
                    },
                    children: [
                      {
                        type: "Text",
                        text: "📅",
                        fontSize: 16,
                        color: "#FFFFFFFF",
                      },
                      {
                        type: "Text",
                        text: spot.dateString,
                        fontSize: 16,
                        fontWeight: "normal",
                        color: "#FFFFFFFF",
                        modifier: {
                          paddingStart: 12,
                          paddingBottom: 8,
                        },
                      },
                    ],
                  },
                  {
                    type: "Text",
                    text: spot.title,
                    fontSize: 19,
                    fontWeight: "bold",
                    color: "#FFFFFFFF",
                    modifier: {
                      paddingStart: 12,
                      paddingBottom: 8,
                    },
                  },
                ],
              },
            ],
          });
        }
        design.json.content.children[1].children = childrens;
        const vipSpots = await this.getSpots("VIP");
        const secretSpots = await this.getSpots("Secret");
        const childrens2 = [
          {
            type: "Column",
            horizontalAlignment: "center",
            modifier: {
              weight: 0.5,
            },
            children: [
              {
                type: "Image",
                url: vipSpots.length ? vipSpots[0]?.images[0] : "",
                contentDescription: "",
                contentScale: "Crop",
                height: 110,
                modifier: {
                  fillMaxWidth: true,
                },
                shape: "rounded",
                cornerRadius: 10,
              },
              {
                type: "Spacer",
                height: 10,
              },
              {
                type: "Text",
                text: "VIP Spot",
                fontSize: 16,
                fontWeight: "bold",
                color: "#FFFFFFFF",
              },
            ],
          },
          {
            type: "Spacer",
            width: 10,
          },
          {
            type: "Column",
            horizontalAlignment: "center",
            modifier: {
              weight: 0.5,
              paddingEnd: 16,
            },
            children: [
              {
                type: "Image",
                url: secretSpots.length ? secretSpots[0]?.images[0] : "",
                contentDescription: "",
                contentScale: "Crop",
                height: 110,
                modifier: {
                  fillMaxWidth: true,
                },
                shape: "rounded",
                cornerRadius: 10,
              },
              {
                type: "Spacer",
                height: 10,
              },
              {
                type: "Text",
                text: "Secret Spot",
                fontSize: 16,
                fontWeight: "bold",
                color: "#FFFFFFFF",
              },
            ],
          },
        ];
        design.json.content.children[3].children = childrens2;
        const sportsEvents = await this.getEvents("Sports");
        const childrens4 = [];
        for (const spot of sportsEvents) {
          childrens4.push({
            type: "Column",
            modifier: {
              cornerRadius: 15,
              backgroundColor: "#33FFFFFF",
              borderColor: "#ffffffff",
              borderWidth: 1,
            },
            children: [
              {
                type: "Image",
                url: spot.image,
                contentDescription: "",
                contentScale: "Crop",
                height: 150,
                modifier: {
                  fillMaxWidth: true,
                },
                shape: "rounded",
                cornerRadius: 15,
              },
              {
                type: "Column",
                contentPadding: {
                  paddingStart: 0,
                  paddingEnd: 64,
                },
                modifier: {
                  backgroundColor: "#33FFFFFF",
                },
                children: [
                  {
                    type: "Spacer",
                    height: 10,
                  },
                  {
                    type: "Text",
                    text: spot.title,
                    fontSize: 19,
                    fontWeight: "bold",
                    color: "#FFFFFFFF",
                    modifier: {
                      paddingStart: 12,
                      paddingBottom: 8,
                    },
                  },
                  {
                    type: "Row",
                    modifier: {
                      paddingStart: 12,
                      paddingBottom: 4,
                      fillMaxWidth: true,
                    },
                    children: [
                      {
                        type: "Text",
                        text: "📅",
                        fontSize: 16,
                        color: "#FFFFFFFF",
                      },
                      {
                        type: "Text",
                        text: spot.dateString,
                        fontSize: 16,
                        fontWeight: "normal",
                        color: "#FFFFFFFF",
                        modifier: {
                          paddingStart: 12,
                          paddingEnd: 12,
                        },
                      },
                    ],
                  },
                  {
                    type: "Spacer",
                    height: 10,
                  },
                ],
              },
            ],
          });
        }
        design.json.content.children[5].children[1].children = childrens4;
      } else if (type == "Special Spots") {
        const vipSpots = await this.getSpots("VIP");
        const secretSpots = await this.getSpots("Secret");
        const childrens2 = [
          {
            type: "Column",
            horizontalAlignment: "center",
            modifier: {
              weight: 0.5,
            },
            children: [
              {
                type: "Image",
                url: vipSpots.length ? vipSpots[0]?.images[0] : "",
                contentDescription: "",
                contentScale: "Crop",
                height: 110,
                modifier: {
                  fillMaxWidth: true,
                },
                shape: "rounded",
                cornerRadius: 10,
              },
              {
                type: "Spacer",
                height: 10,
              },
              {
                type: "Text",
                text: "VIP Spot",
                fontSize: 16,
                fontWeight: "bold",
                color: "#FFFFFFFF",
              },
            ],
          },
          {
            type: "Spacer",
            width: 10,
          },
          {
            type: "Column",
            horizontalAlignment: "center",
            modifier: {
              weight: 0.5,
              paddingEnd: 16,
            },
            children: [
              {
                type: "Image",
                url: secretSpots.length ? secretSpots[0]?.images[0] : "",
                contentDescription: "",
                contentScale: "Crop",
                height: 110,
                modifier: {
                  fillMaxWidth: true,
                },
                shape: "rounded",
                cornerRadius: 10,
              },
              {
                type: "Spacer",
                height: 10,
              },
              {
                type: "Text",
                text: "Secret Spot",
                fontSize: 16,
                fontWeight: "bold",
                color: "#FFFFFFFF",
              },
            ],
          },
        ];
        design.json.content.children[1].children = childrens2;
      } else if (type == "Sports Events") {
        const sportsEvents = await this.getEvents("Sports");
        const childrens4 = [];
        for (const spot of sportsEvents) {
          childrens4.push({
            type: "Column",
            modifier: {
              cornerRadius: 15,
              backgroundColor: "#33FFFFFF",
              borderColor: "#ffffffff",
              borderWidth: 1,
            },
            children: [
              {
                type: "Image",
                url: spot.image,
                contentDescription: "",
                contentScale: "Crop",
                height: 150,
                modifier: {
                  fillMaxWidth: true,
                },
                shape: "rounded",
                cornerRadius: 15,
              },
              {
                type: "Column",
                contentPadding: {
                  paddingStart: 0,
                  paddingEnd: 64,
                },
                modifier: {
                  backgroundColor: "#33FFFFFF",
                },
                children: [
                  {
                    type: "Spacer",
                    height: 10,
                  },
                  {
                    type: "Text",
                    text: spot.title,
                    fontSize: 19,
                    fontWeight: "bold",
                    color: "#FFFFFFFF",
                    modifier: {
                      paddingStart: 12,
                      paddingBottom: 8,
                    },
                  },
                  {
                    type: "Row",
                    modifier: {
                      paddingStart: 12,
                      paddingBottom: 4,
                      fillMaxWidth: true,
                    },
                    children: [
                      {
                        type: "Text",
                        text: "📅",
                        fontSize: 16,
                        color: "#FFFFFFFF",
                      },
                      {
                        type: "Text",
                        text: spot.dateString,
                        fontSize: 16,
                        fontWeight: "normal",
                        color: "#FFFFFFFF",
                        modifier: {
                          paddingStart: 12,
                          paddingEnd: 12,
                        },
                      },
                    ],
                  },
                  {
                    type: "Spacer",
                    height: 10,
                  },
                ],
              },
            ],
          });
        }
        design.json.content.children[1].children[0].children = childrens4;
      } else if (type == "Billing") {
        const bills = await this.getBills(message);
        const data = [];
        for (const x of bills.graph) {
          data.push({
            label: x.month,
            values: [
              {
                label: x.month,
                value: x.amount,
                colorGradient: ["#FF4C57CF", "#FFC850C0", "#FFFFCC70"],
              },
            ],
          });
        }
        design.json.content.children[0].children[0].children[2].data = data;
        design.json.content.children[0].children[0].children[3].children = [
          {
            type: "Box",
            padding: 12,
            modifier: {
              weight: 0.5,
              borderColor: "#FFFFFFFF",
              borderWidth: 1,
              cornerRadius: 8,
              backgroundColor: "#33FFFFFF",
            },
            children: [
              {
                type: "Column",
                children: [
                  {
                    type: "Text",
                    text: "Total Spending",
                    fontSize: 12,
                    color: "#FFFFFFFF",
                  },
                  {
                    type: "Text",
                    text: `AED ${bills.spending}`,
                    fontWeight: "bold",
                    color: "#FFFFFFFF",
                  },
                ],
              },
            ],
          },
          {
            type: "Box",
            padding: 12,
            modifier: {
              weight: 0.5,
              borderColor: "#FFFFFFFF",
              borderWidth: 1,
              cornerRadius: 8,
              backgroundColor: "#33FFFFFF",
            },
            children: [
              {
                type: "Column",
                children: [
                  {
                    type: "Text",
                    text: "Avg per month this year",
                    fontSize: 12,
                    color: "#FFFFFFFF",
                  },
                  {
                    type: "Text",
                    text: `AED ${bills.avg}`,
                    fontWeight: "bold",
                    color: "#FFFFFFFF",
                  },
                ],
              },
            ],
          },
        ];
      }
    }
    return res.status(200).json(design ? design.json : {});
  } catch (err) {
    console.log(err);
    return res.status(500).json(error("error", res.statusCode));
  }
};

exports.getBills = async (msg) => {
  try {
    const billings = await this.getBillings();
    // Call OpenAI's chat completion API
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
                        You are an agent whose job is to fetch the user's billing.
                        Your task:
                        - Analyze the user's bills given in monthly basis and return the output according to user's query.
                        - Give the result in required format only.
                        
                        Output format rules:
                        - Return ONLY the json in given format and in ASC order.
                        - Show bills of last 6 months only.
                        - If user ask for a specific month, return data for that month only.
                        - {"graph": [{"month": "Jan", amount: "200"},{"month": "Feb", amount: "300"}], "spending": "500", "avg": "250"}.
                    `,
        },
        {
          role: "user",
          content: `User Billings:\n${JSON.stringify(billings)}\n\nQuery: ${msg}`,
        },
      ],
      temperature: 0,
    });

    const billing = completion.choices[0].message.content;
    console.log(billing);
    // Extract and return billing data
    return JSON.parse(billing);
  } catch (err) {
    console.log(err);
    return [];
  }
};
