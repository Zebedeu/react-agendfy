import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { TZDate } from '@date-fns/tz';
import './EventFormModal.css';

const formatISOForInput = (isoString: string, timeZone: string) => {
  if (!isoString) return '';
  // CORREÇÃO: Usar TZDate para formatar a data no fuso horário correto do calendário.
  const date = new TZDate(isoString, timeZone);
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
};

function EventFormModal({ isOpen, onClose, onSubmit, eventData, config }: any) {
  console.log('EventFormModal eventData:', eventData);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (isOpen && eventData) {
      // REFATORAÇÃO: Garante que o estado do formulário é sempre reiniciado
      // com os dados do evento atual, evitando dados obsoletos.
      setFormData({
        id: eventData.id || '',
        title: eventData.title || '',
        start: eventData.start ? formatISOForInput(eventData.start, config.timeZone) : '',
        end: eventData.end ? formatISOForInput(eventData.end, config.timeZone) : '',
        isAllDay: eventData.isAllDay || false,
        isMultiDay: eventData.isMultiDay || false,
        color: eventData.color || '#3490dc',
      });
    }
  }, [isOpen, eventData]);

  if (!isOpen || !eventData) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a title for the event.');
      return;
    }

    // CORREÇÃO: Interpretar a data do input como sendo no fuso horário do calendário.
    let finalStart = new TZDate(formData.start, config.timeZone);
    let finalEnd = new TZDate(formData.end, config.timeZone);

    if (formData.isAllDay) {
      finalStart.setUTCHours(0, 0, 0, 0);
      finalEnd.setUTCHours(23, 59, 59, 999);
    }

    onSubmit({
      id: formData.id, // <-- ADICIONAR ESTA LINHA
      title: formData.title,
      start: finalStart.toISOString(),
      end: finalEnd.toISOString(),
      isAllDay: formData.isAllDay,
      isMultiDay: formData.isMultiDay,
      color: formData.color,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create New Event</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ex: Team Meeting"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="start">Start</label>
            <input
              type="datetime-local"
              id="start"
              name="start"
              value={formData.start}
              onChange={handleInputChange}
              disabled={formData.isAllDay}
            />
          </div>
          <div className="form-group">
            <label htmlFor="end">End</label>
            <input
              type="datetime-local"
              id="end"
              name="end"
              value={formData.end}
              onChange={handleInputChange}
              disabled={formData.isAllDay}
            />
          </div>

          <div className="form-group-inline">
            <div className="form-group">
              <label htmlFor="color">Event Color</label>
              <input type="color" id="color" name="color" value={formData.color} onChange={handleInputChange} className="color-input"/>
            </div>
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="isAllDay"
                name="isAllDay"
                checked={formData.isAllDay}
                onChange={handleInputChange}
              />
              <label htmlFor="isAllDay">All Day</label>
            </div>
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="isMultiDay"
                name="isMultiDay"
                checked={formData.isMultiDay}
                onChange={handleInputChange}
              />
              <label htmlFor="isMultiDay">Multi-Day</label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventFormModal;
