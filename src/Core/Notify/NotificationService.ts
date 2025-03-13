import { format } from "date-fns";

export interface EmailAdapter {
  sendEmail(subject: string, body: string, recipient?: string): Promise<void>;
}

export interface NotificationServiceConfig {
  emailAdapter?: EmailAdapter;
  emailConfig?: {
    defaultRecipient: string;
  };
}

export interface EventData {
  id: string;
  title: string;
  start: string;
  alertBefore?: number; // em minutos
}

export interface ToastProps {
  title: string;
  message: string;
  duration: number;
}

export class NotificationService {
  private emailAdapter?: EmailAdapter;
  private emailConfig?: { defaultRecipient: string };

  constructor(config: NotificationServiceConfig) {
    this.emailAdapter = config.emailAdapter;
    this.emailConfig = config.emailConfig;
  }

  public async notifyEvent(event: EventData, addToast: (toast: ToastProps) => void): Promise<void> {
    const eventStart = new Date(event.start);
    const formattedTime = format(eventStart, "HH:mm");

    // Notificação via navegador ou toast
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Próximo evento", {
        body: `${event.title} começa às ${formattedTime}`,
      });
    } else {
      addToast({
        title: "Alerta de Evento",
        message: `${event.title} começa às ${formattedTime}`,
        duration: 5000,
      });
    }

    // Envio de e-mail, se o adapter estiver configurado
    if (this.emailAdapter) {
      const subject = `Alerta: ${event.title}`;
      const body = `O evento "${event.title}" começará às ${formattedTime}. Por favor, verifique sua agenda.`;
      const recipient = this.emailConfig?.defaultRecipient;
      try {
        await this.emailAdapter.sendEmail(subject, body, recipient);
      } catch (err) {
        console.error("Erro ao enviar e-mail:", err);
      }
    }
  }
}
