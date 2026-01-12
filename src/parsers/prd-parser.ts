import { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { ParsedTicket } from "../types";

export class PRDParser {
  parse(blocks: BlockObjectResponse[]): ParsedTicket[] {
    const tickets: ParsedTicket[] = [];
    let currentTicket: Partial<ParsedTicket> | null = null;
    let currentSection: "description" | "acceptance" | null = null;

    for (const block of blocks) {
      // Detectar inicio de ticket (heading_3 que empieza con "TICKET:")
      if (block.type === "heading_3") {
        // Guardar ticket anterior si existe
        if (currentTicket?.title) {
          tickets.push(this.finalizeTicket(currentTicket));
        }

        const text = this.extractText(block);
        if (text.toUpperCase().startsWith("TICKET:")) {
          currentTicket = {
            title: text.replace(/^TICKET:\s*/i, "").trim(),
            description: "",
            acceptanceCriteria: [],
          };
          currentSection = null;
        }
        continue;
      }

      if (!currentTicket) continue;

      // Detectar secciones (heading_4)
      if (block.type === "heading_4") {
        const text = this.extractText(block).toLowerCase();
        if (text.includes("descripcion") || text.includes("description")) {
          currentSection = "description";
        } else if (text.includes("criterio") || text.includes("acceptance")) {
          currentSection = "acceptance";
        }
        continue;
      }

      // Agregar contenido a descripcion
      if (block.type === "paragraph" && currentSection === "description") {
        const text = this.extractText(block);
        if (text) {
          currentTicket.description =
            (currentTicket.description || "") + text + "\n";
        }
      }

      // Procesar listas de criterios de aceptacion
      if (block.type === "to_do" && currentSection === "acceptance") {
        const text = this.extractText(block);
        if (text) {
          currentTicket.acceptanceCriteria?.push(text);
        }
      }

      // Bullet lists tambien pueden ser criterios
      if (block.type === "bulleted_list_item" && currentSection === "acceptance") {
        const text = this.extractText(block);
        if (text) {
          currentTicket.acceptanceCriteria?.push(text);
        }
      }
    }

    // No olvidar el ultimo ticket
    if (currentTicket?.title) {
      tickets.push(this.finalizeTicket(currentTicket));
    }

    return tickets;
  }

  private extractText(block: BlockObjectResponse): string {
    const richTextTypes = [
      "paragraph",
      "heading_1",
      "heading_2",
      "heading_3",
      "heading_4",
      "bulleted_list_item",
      "to_do",
    ];

    if (richTextTypes.includes(block.type)) {
      const content = (block as Record<string, unknown>)[block.type] as {
        rich_text?: Array<{ plain_text: string }>;
      };
      if (content?.rich_text) {
        return content.rich_text.map((rt) => rt.plain_text).join("");
      }
    }
    return "";
  }

  private finalizeTicket(partial: Partial<ParsedTicket>): ParsedTicket {
    let description = partial.description?.trim() || "";

    // Agregar criterios de aceptacion al final de la descripcion
    if (partial.acceptanceCriteria && partial.acceptanceCriteria.length > 0) {
      description += "\n\n## Criterios de Aceptacion\n";
      description += partial.acceptanceCriteria.map((c) => `- [ ] ${c}`).join("\n");
    }

    return {
      title: partial.title || "Sin titulo",
      description,
      acceptanceCriteria: partial.acceptanceCriteria || [],
    };
  }
}
