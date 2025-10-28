import { format } from "date-fns";
import { EmailAdapter, NotificationServiceConfig } from "../types/notification";
import { EventProps } from "../types/types";

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

  public async notifyEvent(event: EventProps, addToast: (toast: ToastProps) => void): Promise<void> {
    const eventStart = new Date(event.start);
    const formattedTime = format(eventStart, "HH:mm");

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
