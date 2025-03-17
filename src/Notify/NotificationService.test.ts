
import { EventProps } from "../types";
import { EmailAdapter } from "../types/notification";
import { NotificationService, ToastProps } from "./NotificationService";
import { format } from "date-fns";

const sampleEvent: EventProps = {
  id: "1",
  title: "Evento Teste",
  end: "2025-03-13T13:00:00.000Z",
  color: "#3490dc",
  isAllDay: false,
  isMultiDay: false,
  resources: [
    {
      id: "r1",
      name: "Conference Room",
      type: "room",
    },
  ],
  start: new Date().toISOString(),
  alertBefore: 10,
};

describe("NotificationService", () => {
  let emailAdapter: EmailAdapter;
  let addToast: jest.Mock<void, [toast: ToastProps]>;
  let service: NotificationService;

  beforeEach(() => {
  
    emailAdapter = {
      sendEmail: jest.fn().mockResolvedValue(undefined),
    };

  
    addToast = jest.fn();

  
    service = new NotificationService({
      emailAdapter,
      emailConfig: { defaultRecipient: "test@example.com" },
    });
  });

  afterEach(() => {
  
    jest.restoreAllMocks();
  });

  it("deve chamar addToast se a permissão de Notification não estiver concedida", async () => {
  
    Object.defineProperty(window, "Notification", {
      value: { permission: "default" },
      writable: true,
    });

    await service.notifyEvent(sampleEvent, addToast);

  
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Alerta de Evento",
        message: expect.stringContaining(sampleEvent.title),
        duration: 5000,
      })
    );

  
    expect(emailAdapter.sendEmail).toHaveBeenCalledWith(
      `Alerta: ${sampleEvent.title}`,
      expect.stringContaining(format(new Date(sampleEvent.start), "HH:mm")),
      "test@example.com"
    );
  });

  it("deve criar uma nova Notification se a permissão estiver 'granted'", async () => {
  
    const notificationSpy = jest.fn();
  
    Object.defineProperty(window, "Notification", {
      value: function (title: string, options?: NotificationOptions) {
        notificationSpy(title, options);
      },
      writable: true,
    });
  
    Object.defineProperty(Notification, "permission", {
      value: "granted",
      writable: true,
    });

    await service.notifyEvent(sampleEvent, addToast);

  
    expect(notificationSpy).toHaveBeenCalledWith(
      "Próximo evento",
      expect.objectContaining({
        body: expect.stringContaining(sampleEvent.title),
      })
    );

  
    expect(addToast).not.toHaveBeenCalled();

  
    expect(emailAdapter.sendEmail).toHaveBeenCalled();
  });
});
