import { LinearClient, Issue } from "@linear/sdk";
import { ParsedTicket } from "../types";

export class LinearService {
  constructor(
    private client: LinearClient,
    private teamId: string,
    private projectId?: string
  ) {}

  async createTicket(ticket: ParsedTicket): Promise<Issue> {
    const issuePayload = await this.client.createIssue({
      teamId: this.teamId,
      title: ticket.title,
      description: ticket.description,
      projectId: this.projectId,
    });

    const issue = await issuePayload.issue;
    if (!issue) {
      throw new Error(`Failed to create issue: ${ticket.title}`);
    }

    return issue;
  }

  async createTickets(tickets: ParsedTicket[]): Promise<Issue[]> {
    const createdIssues: Issue[] = [];

    for (const ticket of tickets) {
      try {
        console.log(`Creating ticket: ${ticket.title}`);
        const issue = await this.createTicket(ticket);
        createdIssues.push(issue);
        console.log(`  -> Created: ${issue.identifier}`);
      } catch (error) {
        console.error(`  -> Error creating "${ticket.title}":`, error);
      }
    }

    return createdIssues;
  }
}
