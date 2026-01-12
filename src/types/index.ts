export interface ParsedTicket {
  title: string;
  description: string;
  acceptanceCriteria: string[];
}

export interface Config {
  notion: {
    apiKey: string;
    pageId: string;
  };
  linear: {
    apiKey: string;
    teamId: string;
    projectId?: string;
  };
}
