import dotenv from "dotenv";
import { Config } from "../types";

dotenv.config();

export function loadConfig(): Config {
  const required = [
    "NOTION_API_KEY",
    "NOTION_PAGE_ID",
    "LINEAR_API_KEY",
    "LINEAR_TEAM_ID",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\n` +
        `Please copy .env.example to .env and fill in the values.`
    );
  }

  return {
    notion: {
      apiKey: process.env.NOTION_API_KEY!,
      pageId: process.env.NOTION_PAGE_ID!,
    },
    linear: {
      apiKey: process.env.LINEAR_API_KEY!,
      teamId: process.env.LINEAR_TEAM_ID!,
      projectId: process.env.LINEAR_PROJECT_ID,
    },
  };
}
