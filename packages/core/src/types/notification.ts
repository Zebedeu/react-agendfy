import { NotificationService, ToastProps } from "../Notify/NotificationService";
import { Config, EventProps } from "./types";

export interface EmailAdapter {
    sendEmail(subject: string, body: string, recipient?: string): Promise<void>;
  }
  
  
  export interface NotificationServiceConfig {
    emailAdapter?: EmailAdapter;
    emailConfig?: {
      defaultRecipient: string;
    };
  }
  
  export interface UseEventReminderProps {
    events: EventProps[];
    notificationService: NotificationService;
    addToast: (toast: ToastProps) => void;
    alertConfig: { enabled: boolean };
    config: Config
  }

  export interface Toast {
    id: number;
    title: string;
    message: string;
    duration?: number;
    imageUrl?: string;
    time?: string;
  }
  
  export interface ToastProviderProps {
    children: React.ReactNode;
  }
  
  export interface ToastContextValue {
    addToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: number) => void;
  }
  
  