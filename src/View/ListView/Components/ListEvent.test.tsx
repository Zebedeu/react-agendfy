import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListEvent } from './ListEvent'; // Ajusta o caminho se necessário
import { Config, EventProps } from '../../../types';

// Mock da função generateTooltipContent para isolar o teste do componente ListEvent
jest.mock('../../../Utils/generateTooltipContent.ts', () => (event) => `Tooltip for ${event.title}`);

describe('ListEvent Component', () => {
  const defaultEvent: EventProps = {
    id: '1',
    title: 'Evento de Teste',
    start: new Date('2024-01-01T10:00:00.000Z').toISOString(),
    end: new Date('2024-01-01T11:00:00.000Z').toISOString(),
    color: '#abcdef',
    isAllDay: true,
    isMultiDay: true,
    resources: [],
  };

  const defaultConfig: Config = {
    timeZone: 'UTC',
    defaultView: 'week',
    slotDuration: 60,
    slotLabelFormat: 'HH:mm',
    slotMin: '00:00',
    slotMax: '23:59',
    lang: 'pt',
    today: 'Hoje',
    monthView: 'Mês',
    weekView: 'Semana',
    dayView: 'Dia',
    listView: 'Lista',
    all_day: 'Todo o dia',
    clear_filter: 'Limpar Filtros',
    filter_resources: 'Filtrar',
    businessHours: {
      enabled: true,
      intervals: [
        { daysOfWeek: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00" }
      ]
    },
    
    alerts: {
      enabled: false,          
      thresholdMinutes: 15,  
    }, 
   };

  it('Deve renderizar o componente ListEvent sem erros', () => {
    render(<ListEvent event={defaultEvent} currentDate={new Date()} config={defaultConfig} />);
    expect(screen.getByText('Evento de Teste')).toBeInTheDocument();
  });

  it('Deve exibir o título do evento', () => {
    render(<ListEvent event={defaultEvent} currentDate={new Date()} config={defaultConfig} />);
    expect(screen.getByText('Evento de Teste')).toBeInTheDocument();
  });

  it('Deve exibir a hora de início e fim do evento formatadas', () => {
    const { debug } = render(<ListEvent event={defaultEvent} currentDate={new Date()} config={defaultConfig} />);
    debug(); // Print the HTML output to console
    expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument(); // If there are two spaces after the hyphen
   });
 
  it('Deve renderizar ResourceDisplay se o evento tiver recursos', () => {
    const eventWithResources: EventProps = {
      ...defaultEvent,
      resources: [{ id: 'r1', name: 'Sala 1', type: 'room' }],
    };
    render(<ListEvent event={eventWithResources} currentDate={new Date()} config={defaultConfig} />);
    expect(screen.getByTestId('resource-display-container')).toBeInTheDocument(); // Use getByTestId
  });

  it('Não deve renderizar ResourceDisplay se o evento não tiver recursos', () => {
    render(<ListEvent event={defaultEvent} currentDate={new Date()} config={defaultConfig} />);
    expect(screen.queryByRole('resource-display')).not.toBeInTheDocument();
  });


  it('Deve aplicar o estilo de backgroundColor com a cor do evento', () => {
    render(<ListEvent event={defaultEvent} currentDate={new Date()} config={defaultConfig} />);
    const listEventDiv = screen.getByTestId('list-event-container'); // Usa getByTestId agora
    expect(listEventDiv).toHaveStyle({ backgroundColor: '#abcdef' });
  });
 
  it('Deve chamar onEventClick quando o componente é clicado', () => {
    const onEventClickMock = jest.fn();
    render(<ListEvent event={defaultEvent} currentDate={new Date()} config={defaultConfig} onEventClick={onEventClickMock} />);
    fireEvent.click(screen.getByTestId('list-event-container')); // Usa getByTestId aqui
    expect(onEventClickMock).toHaveBeenCalledTimes(1);
    expect(onEventClickMock).toHaveBeenCalledWith(defaultEvent);

  });


  it('Deve definir o atributo "title" com o conteúdo do tooltip gerado', () => {
    const { container } = render(<ListEvent event={defaultEvent} currentDate={new Date()} config={defaultConfig} />);
    const listEventDiv = container.querySelector('div.react-agenfy-listevent-container') as HTMLElement; // Seleciona com querySelector e classe CSS (ajusta seletor se necessário)
    expect(listEventDiv).toHaveAttribute('title', 'Tooltip for Evento de Teste');
  });

 
});