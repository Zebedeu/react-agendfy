// NotificationService.test.ts
import { NotificationService, EmailAdapter, EventData, ToastProps } from "./NotificationService";
import { format } from "date-fns";

// Cria um evento de exemplo para os testes
const sampleEvent: EventData = {
  id: "1",
  title: "Evento Teste",
  start: new Date().toISOString(),
  alertBefore: 10,
};

describe("NotificationService", () => {
  let emailAdapter: EmailAdapter;
  let addToast: jest.Mock<void, [toast: ToastProps]>;
  let service: NotificationService;

  beforeEach(() => {
    // Cria um adapter de e-mail simulado com jest
    emailAdapter = {
      sendEmail: jest.fn().mockResolvedValue(undefined),
    };

    // Cria uma função de addToast simulada
    addToast = jest.fn();

    // Instancia o serviço com o adapter de e-mail e configuração de e-mail
    service = new NotificationService({
      emailAdapter,
      emailConfig: { defaultRecipient: "test@example.com" },
    });
  });

  afterEach(() => {
    // Restaura qualquer modificação feita na propriedade global Notification
    jest.restoreAllMocks();
  });

  it("deve chamar addToast se a permissão de Notification não estiver concedida", async () => {
    // Simula a ausência de permissão para notificações (ou seja, não 'granted')
    Object.defineProperty(window, "Notification", {
      value: { permission: "default" },
      writable: true,
    });

    await service.notifyEvent(sampleEvent, addToast);

    // Espera que addToast seja chamado com os dados do alerta
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Alerta de Evento",
        message: expect.stringContaining(sampleEvent.title),
        duration: 5000,
      })
    );

    // Verifica que o emailAdapter.sendEmail também foi chamado
    expect(emailAdapter.sendEmail).toHaveBeenCalledWith(
      `Alerta: ${sampleEvent.title}`,
      expect.stringContaining(format(new Date(sampleEvent.start), "HH:mm")),
      "test@example.com"
    );
  });

  it("deve criar uma nova Notification se a permissão estiver 'granted'", async () => {
    // Cria um spy para a função construtora Notification
    const notificationSpy = jest.fn();
    // Sobrescreve a propriedade Notification no objeto global
    Object.defineProperty(window, "Notification", {
      value: function (title: string, options?: NotificationOptions) {
        notificationSpy(title, options);
      },
      writable: true,
    });
    // Define a permissão como 'granted'
    Object.defineProperty(Notification, "permission", {
      value: "granted",
      writable: true,
    });

    await service.notifyEvent(sampleEvent, addToast);

    // Espera que o construtor Notification tenha sido chamado
    expect(notificationSpy).toHaveBeenCalledWith(
      "Próximo evento",
      expect.objectContaining({
        body: expect.stringContaining(sampleEvent.title),
      })
    );

    // Como a permissão foi concedida, addToast não deve ser chamado
    expect(addToast).not.toHaveBeenCalled();

    // E o emailAdapter.sendEmail também deve ter sido chamado
    expect(emailAdapter.sendEmail).toHaveBeenCalled();
  });
});
