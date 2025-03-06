// Adapter de notificação
const NotificationAdapter = {
    sendEmail: (email, subject, message) => {
      // Lógica para enviar e-mail
    },
    sendBrowserNotification: (title, message) => {
      // Lógica para enviar notificação no navegador
    },
  };
  
  // Biblioteca de calendário
  function sendEventReminder(event, userEmail) {
    const subject = `Lembrete: ${event.title}`;
    const message = `Seu evento "${event.title}" começará em breve.`;
  
    NotificationAdapter.sendEmail(userEmail, subject, message);
    NotificationAdapter.sendBrowserNotification(subject, message);
  }