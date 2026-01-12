import { Client } from "@notionhq/client";
import { LinearClient } from "@linear/sdk";
import { loadConfig } from "./config/env";
import { NotionService } from "./services/notion-service";
import { LinearService } from "./services/linear-service";
import { PRDParser } from "./parsers/prd-parser";
import * as readline from "readline";

async function main() {
  console.log("=== Notion PRD to Linear Tickets ===\n");

  // 1. Cargar configuracion
  const config = loadConfig();
  console.log("Configuration loaded successfully");

  // 2. Inicializar clientes
  const notionClient = new Client({ auth: config.notion.apiKey });
  const linearClient = new LinearClient({ apiKey: config.linear.apiKey });

  // 3. Inicializar servicios
  const notionService = new NotionService(notionClient);
  const linearService = new LinearService(
    linearClient,
    config.linear.teamId,
    config.linear.projectId
  );
  const parser = new PRDParser();

  // 4. Obtener bloques de Notion
  console.log(`\nFetching PRD from Notion page: ${config.notion.pageId}`);
  const blocks = await notionService.getPageBlocks(config.notion.pageId);
  console.log(`Found ${blocks.length} blocks`);

  // 5. Parsear tickets
  const tickets = parser.parse(blocks);
  console.log(`\nParsed ${tickets.length} tickets:`);
  tickets.forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.title}`);
  });

  if (tickets.length === 0) {
    console.log("\nNo tickets found. Please check your PRD format.");
    console.log("Tickets should start with: ### TICKET: [titulo]");
    return;
  }

  // 6. Confirmar antes de crear
  console.log("\nPress Enter to create tickets in Linear, or Ctrl+C to cancel...");
  await waitForEnter();

  // 7. Crear tickets en Linear
  console.log("\nCreating tickets in Linear...");
  const created = await linearService.createTickets(tickets);

  console.log(`\n=== Done! Created ${created.length}/${tickets.length} tickets ===`);
}

function waitForEnter(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("", () => {
      rl.close();
      resolve();
    });
  });
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
