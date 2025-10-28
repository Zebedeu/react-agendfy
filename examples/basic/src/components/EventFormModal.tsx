import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import './EventFormModal.css';

const formatISOForInput = (isoString: string) => {
  if (!isoString) return '';
  const date = parseISO(isoString);
  return format(date, "yyyy-MM-dd'T'HH:mm");
};

function EventFormModal({ isOpen, onClose, onSubmit, eventData }: any) {
  const initialFormState = {
    title: '',
    start: '',
    end: '',
    isAllDay: false,
    isMultiDay: false,
    color: '#38B2AC',
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen && eventData) {
      setFormData({
        ...initialFormState,
        start: formatISOForInput(eventData.start),
        end: formatISOForInput(eventData.end),
        isAllDay: eventData.isAllDay || false,
        isMultiDay: eventData.isMultiDay || false,
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

    let finalStart = new Date(formData.start);
    let finalEnd = new Date(formData.end);

    if (formData.isAllDay) {
      finalStart.setUTCHours(0, 0, 0, 0);
      finalEnd.setUTCHours(23, 59, 59, 999);
    }

    onSubmit({
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
