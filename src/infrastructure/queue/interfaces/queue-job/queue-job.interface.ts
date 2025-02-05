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

export interface QueueJobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
  jobId?: string;
}
