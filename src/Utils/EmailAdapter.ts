// EmailAdapterInterface.ts
export interface EmailAdapter {
  
    sendEmail(subject: string, body: string, recipient?: string): Promise<void>;
  }
  