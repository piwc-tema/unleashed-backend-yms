export interface EmailConfig {
  service: string;
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}
