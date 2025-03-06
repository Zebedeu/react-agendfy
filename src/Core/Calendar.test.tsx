import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Calendar from './Calendar';
import { ToastProvider } from './Components/Toast/Toast';

// --- Mocks dos Componentes Internos ---

// Mock do CalendarHeader com botões para simular interações
jest.mock('./Components/CalendarHeader', () => {
  return ({ 
    onNavigateToday, 
    onNavigateBack, 
    onNavigateForward, 
    onViewChange, 
    onResourceFilterChange 
  }: {
    onNavigateToday: () => void;
    onNavigateBack: () => void;
    onNavigateForward: () => void;
    onViewChange: (view: string) => void;
    onResourceFilterChange: (selected: string[]) => void;
  }) => (
    <div data-testid="calendar-header">
      <button data-testid="btn-today" onClick={onNavigateToday}>Today</button>
      <button data-testid="btn-back" onClick={onNavigateBack}>Back</button>
      <button data-testid="btn-forward" onClick={onNavigateForward}>Forward</button>
      <button data-testid="btn-view-change" onClick={() => onViewChange('month')}>Change View</button>
      <button data-testid="btn-resource-filter" onClick={() => onResourceFilterChange(['r1'])}>Filter Resource</button>
    </div>
  );
});

// Mocks para as demais views
jest.mock('./Components/View/DayView/DayView', () => () => (
  <div data-testid="day-view">DayView</div>
));

// Para o WeekView, o mock renderiza também os eventos e o currentDate em data-attributes,
// além de um botão que simula a atualização de um evento.
jest.mock('./Components/View/WeekView/WeekView', () => {
  return function MockWeekView({ events, currentDate, onEventUpdate }: { 
    events: any; 
    currentDate: Date;
    onEventUpdate: (event: any) => void;
  }) {
    return (
      <div 
        data-testid="week-view" 
        data-events={JSON.stringify(events)}
        data-current-date={currentDate.toISOString()}
      >
        WeekView
        <button data-testid="btn-event-update" onClick={() => onEventUpdate({ id: 1, title: 'Updated Event', resourceId: 'r1' })}>
          Update Event
        </button>
      </div>
    );
  };
});

jest.mock('./Components/View/MonthView/MonthView', () => () => (
  <div data-testid="month-view">MonthView</div>
));

jest.mock('./Components/View/ListView/ListView', () => () => (
  <div data-testid="list-view">ListView</div>
));

// --- Mocks dos Utilitários ---

// As funções de normalização e filtragem dos eventos são mockadas para facilitar os testes.
jest.mock('../Utils/calendarHelpers', () => ({
  normalizeEvents: jest.fn((events) => events),
  filterEvents: jest.fn((events, filteredResources) => {
    if (!filteredResources || filteredResources.length === 0) return events;
    return events.filter((event) => filteredResources.includes(event.resourceId));
  }),
}));

// Para controlar a navegação, mockamos o getNewDate.
// Neste exemplo, para "week" adicionamos ou subtraímos 7 dias.
jest.mock('../Utils/calendarNavigation', () => ({
  getNewDate: (currentDate: Date, view: string, delta: number) => {
    const multiplier = view === 'week' ? 7 : view === 'month' ? 30 : 1;
    return new Date(currentDate.getTime() + delta * multiplier * 86400000);
  }
}));

// --- Testes do Componente Calendar ---

describe('Calendar Component', () => {
  const events = [
    { id: 1, title: 'Event 1', resourceId: 'r1' },
    { id: 2, title: 'Event 2', resourceId: 'r2' },
    { id: 3, title: 'Event 3', resourceId: 'r1' },
  ];

  it('deve renderizar o CalendarHeader e a view padrão (week)', () => {
    render(
      <ToastProvider>
    <Calendar events={events} config={{ defaultView: 'week', lang: 'en' }} />
    </ToastProvider>);
    expect(screen.getByTestId('calendar-header')).toBeInTheDocument();
    expect(screen.getByTestId('week-view')).toBeInTheDocument();
  });

  it('deve mudar para MonthView ao clicar no botão de mudança de view', async () => {
    render(
      <ToastProvider>
      <Calendar events={events} config={{ defaultView: 'week', lang: 'en' }} />
      </ToastProvider>);
      
    fireEvent.click(screen.getByTestId('btn-view-change'));
    await waitFor(() => {
      expect(screen.getByTestId('month-view')).toBeInTheDocument();
    });
  });

  it('deve navegar para a data de hoje ao clicar no botão Today', async () => {
    render(
      <ToastProvider>
      <Calendar events={events} config={{ defaultView: 'week', lang: 'en' }} />
      </ToastProvider>);
    const weekViewBefore = screen.getByTestId('week-view');
    const previousDate = weekViewBefore.getAttribute('data-current-date');
    fireEvent.click(screen.getByTestId('btn-today'));
    await waitFor(() => {
      const weekViewAfter = screen.getByTestId('week-view');
      const newDate = weekViewAfter.getAttribute('data-current-date');
      expect(newDate).not.toEqual(previousDate);
      // Verifica se a nova data é aproximadamente o "agora"
      const now = new Date();
      const diff = Math.abs(new Date(newDate as string).getTime() - now.getTime());
      expect(diff).toBeLessThan(1000); // diferença de menos de 1 segundo
    });
  });

  it('deve navegar para trás e para frente ao clicar nos botões correspondentes', async () => {
    render(
      <ToastProvider>
      <Calendar events={events} config={{ defaultView: 'week', lang: 'en' }} />
      </ToastProvider>);
    const weekView = screen.getByTestId('week-view');
    const initialDate = new Date(weekView.getAttribute('data-current-date') as string);
    
    // Clica no botão "Back"
    fireEvent.click(screen.getByTestId('btn-back'));
    await waitFor(() => {
      const weekViewAfterBack = screen.getByTestId('week-view');
      const backDate = new Date(weekViewAfterBack.getAttribute('data-current-date') as string);
      // Para "week", o getNewDate subtrai 7 dias
      const expectedBackDate = new Date(initialDate.getTime() - 7 * 86400000);
      expect(Math.abs(backDate.getTime() - expectedBackDate.getTime())).toBeLessThan(1000);
    });

    // Clica no botão "Forward" duas vezes (avançando 14 dias a partir do estado atual)
    fireEvent.click(screen.getByTestId('btn-forward'));
    fireEvent.click(screen.getByTestId('btn-forward'));
    await waitFor(() => {
      const weekViewAfterForward = screen.getByTestId('week-view');
      const forwardDate = new Date(weekViewAfterForward.getAttribute('data-current-date') as string);
      // A partir do estado anterior (initialDate - 7 dias), dois cliques avançam 14 dias
      const expectedForwardDate = new Date(initialDate.getTime() - 7 * 86400000 + 14 * 86400000);
      expect(Math.abs(forwardDate.getTime() - expectedForwardDate.getTime())).toBeLessThan(1000);
    });
  });

  it('deve atualizar um evento quando o botão de update for clicado', async () => {
    const onEventUpdateMock = jest.fn();
    render(
      <ToastProvider>
      <Calendar events={events} config={{ defaultView: 'week', lang: 'en' }}  onEventUpdate={onEventUpdateMock}  />
      </ToastProvider>);    

    
    // Verifica os eventos iniciais
    let weekView = screen.getByTestId('week-view');
    let eventsData = JSON.parse(weekView.getAttribute('data-events') || '[]');
    expect(eventsData).toEqual(events);

    // Clica no botão de update presente no WeekView mock
    fireEvent.click(screen.getByTestId('btn-event-update'));
    await waitFor(() => {
      expect(onEventUpdateMock).toHaveBeenCalledWith({ id: 1, title: 'Updated Event', resourceId: 'r1' });
    });

    // Verifica se o estado interno atualizou o evento com id 1
    const updatedWeekView = screen.getByTestId('week-view');
    const updatedEventsData = JSON.parse(updatedWeekView.getAttribute('data-events') || '[]');
    const updatedEvent = updatedEventsData.find((e: any) => e.id === 1);
    expect(updatedEvent.title).toBe('Updated Event');
  });

  it('deve aplicar o filtro de recurso ao clicar no botão de filtro', async () => {
    render(
    <ToastProvider>
    <Calendar events={events} config={{ defaultView: 'week', lang: 'en' }} filteredResources={[]} />
    </ToastProvider>);
    let weekView = screen.getByTestId('week-view');
    let eventsData = JSON.parse(weekView.getAttribute('data-events') || '[]');
    // Inicialmente, todos os eventos devem ser exibidos
    expect(eventsData).toEqual(events);

    // Clica no botão de filtro para aplicar o filtro de recurso "r1"
    fireEvent.click(screen.getByTestId('btn-resource-filter'));
    await waitFor(() => {
      const updatedWeekView = screen.getByTestId('week-view');
      const filteredEventsData = JSON.parse(updatedWeekView.getAttribute('data-events') || '[]');
      expect(filteredEventsData).toEqual([
        { id: 1, title: 'Event 1', resourceId: 'r1' },
        { id: 3, title: 'Event 3', resourceId: 'r1' },
      ]);
    });
  });
});
