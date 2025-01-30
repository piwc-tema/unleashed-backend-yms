import { Buffer } from 'buffer';

export interface QueueJob {
  name: string;
  data: EmailJobData;
  opts?: {
    attempts?: number;
    backoff?: {
      type: string;
      delay: number;
    };
    priority?: number;
  };
}

export interface EmailJobData {
  to: string;
  subject: string;
  templateName: string;
  context: Record<string, any>;
  attachments?: { filename: string; content: Buffer }[];
}
