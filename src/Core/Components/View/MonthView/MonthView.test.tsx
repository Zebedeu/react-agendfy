// MonthView.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { addDays, format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import MonthView from './MonthView';

// Configura um locale de teste com slotDuration definido
const slotDuration = 30;
const localeTest = { slotDuration, ...enUS };

// Data de referência para os testes: 15 de janeiro de 2023
const currentDate = new Date('2023-01-15T00:00:00.000Z');

// Eventos de teste
const testEvents = [
  {
    id: '1',
    title: 'Event 1',
    start: '2023-01-15T09:00:00',
    end: '2023-01-15T10:00:00',
    color: '#FF0000',
    resourceIds: ['r1'],
  },
  {
    id: '2',
    title: 'Event 2',
    start: '2023-01-15T11:00:00',
    end: '2023-01-15T12:00:00',
    color: '#00FF00',
  },
  {
    id: '3',
    title: 'Event 3',
    start: '2023-01-15T13:00:00',
    end: '2023-01-15T14:00:00',
    color: '#0000FF',
  },
  {
    id: '4',
    title: 'Event 4',
    start: '2023-01-15T15:00:00',
    end: '2023-01-15T16:00:00',
    color: '#FFFF00',
  },
];

// Recursos de teste
const testResources = [{ id: 'r1', name: 'Resource 1' }];

// --- Mocks Necessários ---
// Mock para DndContext que adiciona botões para simular drag events
jest.mock('@dnd-kit/core', () => {
  const actual = jest.requireActual('@dnd-kit/core');
  return {
    ...actual,
    DndContext: ({ children, onDragStart, onDragEnd }: any) => (
      <div data-testid="dnd-context">
        {children}
        <button
          data-testid="simulate-drag-start-month"
          onClick={() => {
            if (onDragStart) {
              onDragStart({
                active: {
                  id: '1',
                  data: {
                    current: {
                      id: '1',
                      title: 'Event 1',
                      start: '2023-01-15T09:00:00',
                      end: '2023-01-15T10:00:00',
                      color: '#FF0000',
                    },
                  },
                },
              });
            }
          }}
        >
          Simulate Drag Start
        </button>
        <button
          data-testid="simulate-drag-end-month"
          onClick={() => {
            if (onDragEnd) {
              onDragEnd({
                active: {
                  id: '1',
                  data: {
                    current: {
                      id: '1',
                      title: 'Event 1',
                      start: '2023-01-15T09:00:00',
                      end: '2023-01-15T10:00:00',
                      color: '#FF0000',
                    },
                  },
                  transform: { x: 0, y: 50 },
                },
                over: { id: '2023-01-20' },
                delta: { y: 50 },
              });
            }
          }}
        >
          Simulate Drag End
        </button>
      </div>
    ),
    useDraggable: actual.useDraggable,
    useDroppable: actual.useDroppable,
  };
});

// Mock do ResourceView para identificar sua renderização
jest.mock('../../Resource/ResourceView', () => () => (
  <div data-testid="resource-view">ResourceView</div>
));

// Mock do expandRecurringEvents e ensureDate para simplificar os testes
jest.mock('../../../../Utils/DateTrannforms', () => ({
  ensureDate: (date: any) => new Date(date),
  expandRecurringEvents: (events: any) => events,
}));

// --- Início dos Testes ---
describe('MonthView Component', () => {
  it('deve renderizar o cabeçalho com os dias da semana', () => {
    render(
      <MonthView
        events={[]}
        currentDate={currentDate}
        locale={localeTest}
      />
    );
    // O cabeçalho é renderizado como uma grid com 7 colunas
    // Verifica pelo menos um dia do cabeçalho (usando formato abreviado, ex: "Su", "Mo", etc.)
    const headerCells = screen.getAllByText(/^[A-Za-z]{2,}$/);
    expect(headerCells.length).toBeGreaterThanOrEqual(7);
  });

  it('deve renderizar a grid de dias com células contendo números dos dias', () => {
    render(
      <MonthView
        events={[]}
        currentDate={currentDate}
        locale={localeTest}
      />
    );
    // Procura por um número de dia esperado; para currentDate em 15 de janeiro, espera que "15" esteja presente
    const dayCell = screen.getByText('15');
    expect(dayCell).toBeInTheDocument();
  });

  it('deve chamar onDayClick ao clicar em uma célula de dia', () => {
    const onDayClickMock = jest.fn();
    render(
      <MonthView
        events={[]}
        currentDate={currentDate}
        locale={localeTest}
        onDayClick={onDayClickMock}
      />
    );
    // Seleciona uma célula de dia: usamos o número "15" para o dia 15
    const dayCell = screen.getByText('15');
    fireEvent.click(dayCell);
    expect(onDayClickMock).toHaveBeenCalled();
    // Opcional: verificar que o argumento é uma data cujo dia é 15
    const clickedDate = onDayClickMock.mock.calls[0][0];
    expect(format(clickedDate, 'd')).toBe('15');
  });

  it('deve chamar onEventClick ao clicar em um evento', () => {
    const onEventClickMock = jest.fn();
    render(
      <MonthView
        events={testEvents}
        currentDate={currentDate}
        locale={localeTest}
        onEventClick={onEventClickMock}
      />
    );
    // O EventItem renderiza o título do evento; procura pelo texto "Event 1"
    const eventItem = screen.getByText('Event 1');
    fireEvent.click(eventItem);
    expect(onEventClickMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '1',
        title: 'Event 1',
        start: '2023-01-15T09:00:00',
        end: '2023-01-15T10:00:00',
      })
    );
  });

  it('deve exibir contador de eventos ocultos se houver mais de 3 eventos em um dia e disparar alert ao clicar', () => {
    // Para o mesmo dia, passamos 4 eventos (já definidos em testEvents)
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(
      <MonthView
        events={testEvents}
        currentDate={currentDate}
        locale={localeTest}
        onEventClick={() => {}}
      />
    );
    // Como MAX_VISIBLE_EVENTS é 3, espera-se que um contador "+1" seja renderizado na célula do dia
    const hiddenCount = screen.getByText('+1');
    expect(hiddenCount).toBeInTheDocument();
    // Simula clique no contador e verifica se alert foi chamado
    fireEvent.click(hiddenCount);
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('deve renderizar ResourceView quando showResourceView for true e recursos forem fornecidos', () => {
    render(
      <MonthView
        events={[]}
        currentDate={currentDate}
        locale={localeTest}
        resources={testResources}
        showResourceView={true}
      />
    );
    const resourceView = screen.getByTestId('resource-view');
    expect(resourceView).toBeInTheDocument();
  });

  it('deve chamar onEventUpdate quando um drag event for simulado', async () => {
    const onEventUpdateMock = jest.fn();
    render(
      <MonthView
        events={testEvents}
        currentDate={currentDate}
        locale={localeTest}
        onEventUpdate={onEventUpdateMock}
      />
    );
    // Simula o drag: primeiro dispara o drag start e depois o drag end usando os botões do mock de DndContext
    fireEvent.click(screen.getByTestId('simulate-drag-start-month'));
    fireEvent.click(screen.getByTestId('simulate-drag-end-month'));
    await waitFor(() => {
      expect(onEventUpdateMock).toHaveBeenCalled();
    });
    // Verifica se o evento atualizado possui datas recalculadas
    const updatedEvent = onEventUpdateMock.mock.calls[0][0];
    // Espera que a nova data de início seja "2023-01-20" com os mesmos horários (09:00:00)
    expect(format(new Date(updatedEvent.start), 'yyyy-MM-dd')).toBe('2023-01-20');
    // Verifica também o horário (usando parte do formato)
    expect(format(new Date(updatedEvent.start), 'HH:mm:ss')).toBe('09:00:00');
  });
});
