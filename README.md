# React Agendfy Calendar Component
# @react-agendfy/core


**React Agendfy** is a flexible and customizable calendar component for React applications. It supports various calendar views, drag and drop event management, recurring events, resource filtering, and now with enhanced timezone support and notification functionalities.

## Table of Contents

1.  [Features](#features)
2.  [Installation](#installation)
3.  [Usage](#usage)
    * [Basic Usage](#basic-usage)
    * [Calendar Views](#calendar-views)
    * [Event Handling](#event-handling)
    * [Drag and Drop](#drag-and-drop)
    * [Recurring Events](#recurring-events)
    * [Resource Filtering](#resource-filtering)
    * [Time Zones](#time-zones)
    * [Notifications (Alerts)](#notifications-alerts)
4.  [Configuration Options (Config Prop)](#configuration-options-config-prop)
5.  [Events Object Structure](#events-object-structure) 
6.  [Resources Object Structure](#resources-object-structure)
7.  [Email Adapter](#email-adapter)
8.  [Localization (i18n)](#localization-i18n)
9.   [Calendar Export (ICS Format)](#calendar-export-ics-format)
10.  [Plugin Support](#plugin-support)
     *  [Plugin Types](#plugin-types)
11.  [How to Create a Plugin](#how-to-create-a-plugin)
12.  [Contributing](#contributing)
13. [License](#license)

## Features

  - **Multiple Calendar Views**: Supports month, week, day, and list views.
  - **Drag & Drop Event Management**: Easily move and resize events within the calendar.
  - **Recurring Events**: Handles events that repeat daily, weekly, monthly, etc., using RRule.
  - **Event Resizing**:  Adjust event durations directly on the calendar (week and day views).
  - **Resource Filtering**: Filter events by assigned resources.
  - **Timezone Support**:  Comprehensive timezone handling using `@date-fns/tz`.
  - **Event Notifications (Alerts)**: Configure alerts to remind users of upcoming events.
  - **Customizable Configuration**:  Extensive `config` prop to tailor the calendar's appearance and behavior.
  - **Localization**: Basic localization for text elements.
  - **Extensible Plugin Architecture**: Add new views, themes, data sources, export formats, and more.
  - **Resource Display**:  Visually represent event resources.
  - **Tooltips**:  Informative tooltips for events.
  - **Business Hours**:  Highlight business hours in the calendar view.
  - **Event Click and Slot Click Handlers**:  Callbacks for user interactions.

## Installation

```bash
npm install @react-agendfy/core
```

or

```bash
yarn add @react-agendfy/core
```

Ensure you have installed all peer dependencies listed in the `peerDependencies` section of the `package.json`.

## Usage

### Basic Usage

Import the `Calendar` component and necessary dependencies into your React component:

```jsx
 import React, { useMemo, useRef, useState, useEffect, useCallback, FC } from 'react';
import { format } from 'date-fns';
import Calendar, { CalendarEvent } from './View/Calendar';
import { ToastProvider } from './Components/Toast/Toast';
import { EmailAdapter } from './types/notification';
 
export class ExampleEmailAdapter implements EmailAdapter {
  async sendEmail(subject: string, body: string, recipient?: string): Promise<void> {
    console.log(`Sending email to ${recipient}: ${subject} - ${body}`);
    return Promise.resolve();
  }
}

const resources = [
  { id: "r1", name: "Conference Room", type: "room" },
  { id: "r2", name: "John Silva", type: "person" },
  { id: "r3", name: "Projector", type: "equipment" },
  { id: "r4", name: "Holidays", type: "equipment" }
];

const initialEvents = [
  { id: "11", title: "March End Report Deadline", start: "2025-03-31T00:00:00.000Z", end: "2025-10-31T23:59:59.000Z", color: "#f44336", isAllDay: true, isMultiDay: true },
  { id: "12", title: "Daily Standup Meeting", start: "2025-10-23T10:00:00.000Z", end: "2025-10-23T10:30:00.000Z", color: "#2196f3", isAllDay: false, isMultiDay: false },
  { id: "13", title: "Annual Planning Session (2026 Budget)", start: "2025-12-15T00:00:00.000Z", end: "2025-12-17T23:59:59.000Z", color: "#673ab7", isAllDay: true, isMultiDay: true },
  { id: "14", title: "Q4 Performance Review", start: "2025-11-05T14:00:00.000Z", end: "2025-11-05T17:00:00.000Z", color: "#4caf50", isAllDay: false, isMultiDay: false },
  { id: "15", title: "Company Holiday Break", start: "2026-01-01T00:00:00.000Z", end: "2026-01-10T23:59:59.000Z", color: "#ffc107", isAllDay: true, isMultiDay: true },
  { id: "16", title: "Project Alpha Code Freeze", start: "2026-02-14T00:00:00.000Z", end: "2026-02-14T23:59:59.000Z", color: "#ff9800", isAllDay: true, isMultiDay: false },
  { id: "17", title: "Technical Workshop - New Framework", start: "2025-11-10T00:00:00.000Z", end: "2025-11-10T23:59:59.000Z", color: "#009688", isAllDay: true, isMultiDay: false },
  { id: "18", title: "Team Lunch Celebration", start: "2025-11-20T12:30:00.000Z", end: "2025-11-20T13:30:00.000Z", color: "#e91e63", isAllDay: false, isMultiDay: false },
  { id: "19", title: "Mandatory Security Training", start: "2026-03-01T00:00:00.000Z", end: "2026-03-01T23:59:59.000Z", color: "#3f51b5", isAllDay: true, isMultiDay: false }
];

function App() {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const storedEvents = localStorage.getItem('calendarEvents');
    return storedEvents ? JSON.parse(storedEvents) : initialEvents;
  });
  const [filteredResources, setFilteredResources] = useState<string[]>([]);

  const defaultConfig = {
    timeZone: 'Africa/Lagos',
    defaultView: "week",
    slotDuration: 15,
    slotLabelFormat: "HH:mm",
    slotMin: "08:00",
    slotMax: "23:59",
    lang: 'en',
    today: 'Today',
    monthView: 'Month',
    weekView: 'Week',
    dayView: 'Day',
    listView: 'List',
    all_day: 'All Day',
    clear_filter: 'Clear Filters',
    filter_resources: 'Filter Resources',
    businessHours: {
      enabled: true,
      intervals: [
        { daysOfWeek: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00" }
      ]
    },
    alerts: { enabled: true, thresholdMinutes: 15 },
    export: true,
    calendar_export: 'Export'
  };

  const config = useMemo(() => defaultConfig, []);

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  const handleEventUpdate = useCallback((updatedEvent: CalendarEvent) => {
    console.log("Updated event:", updatedEvent);
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  }, []);

  const handleResizedUpdate = useCallback((updatedEvent: CalendarEvent) => {
    console.log("Resized event:", updatedEvent);
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  }, []);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    console.log("Clicked event:", event);
  }, []);

  const handleDayClick = useCallback((dayDate: Date) => {
    console.log("Clicked day:", dayDate);
    alert(`Clicked day: ${format(dayDate, 'dd/MM/yyyy')}`);
  }, []);

  const handleSlotClick = useCallback((slotTime: Date) => {
    console.log("Clicked slot:", slotTime);
    alert(`Clicked slot: ${format(slotTime, 'HH:mm dd/MM/yyyy')}. You can add a new event here.`);
  }, []);

  const handleResourceFilterChange = useCallback((selectedResources: string[]) => {
    setFilteredResources(selectedResources);
  }, []);

  const myEmailAdapter: EmailAdapter = {
    sendEmail: async (subject, body, recipient) => {
      console.log("Sending email:", { subject, body, recipient });
      return Promise.resolve();
    },
  };

  const MyLeftHeaderPlugin: React.FC = () => <button className="react-agenfy-btn">Plugin</button>;

  interface SearchPluginProps {
    onSearch?: (term: string, results: CalendarEvent[]) => void;
    events?: CalendarEvent[];
    className?: string;
  }
  const MyRightHeaderPlugin: React.FC<SearchPluginProps> = ({ onSearch, events = [] }) => {
    const [q, setQ] = useState('');
    useEffect(() => {
      const term = q.trim().toLowerCase();
      const results = term.length === 0 ? [] : events.filter(e => (e.title || '').toLowerCase().includes(term));
      onSearch?.(q, results);
    }, [q, events, onSearch]);

    return (
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search..."
        className="react-agenfy-search-input"
        aria-label="Search events"
      />
    );
  };

  interface CustomViewProps {
    events: CalendarEvent[];
    currentDate: Date;
    config: any;
    onEventClick: (event: CalendarEvent) => void;
  }
  const MyCustomViewComponent: React.FC<CustomViewProps> = ({ events }) => {
    return <div>My Custom View! ({events.length} events)</div>;
  };

  return (
    <ToastProvider>
      <div className="">
        <Calendar
          events={events}
          config={{ ...config }}
          onEventUpdate={handleEventUpdate}
          onEventClick={handleEventClick}
          onDayClick={handleDayClick}
          onSlotClick={handleSlotClick}
          resources={resources}
          onEventResize={handleResizedUpdate}
          filteredResources={filteredResources}
          onResourceFilterChange={handleResourceFilterChange}
          theme="dark"
          emailAdapter={new ExampleEmailAdapter()}
          emailConfig={{ defaultRecipient: "usuario@exemplo.com" }}
          plugins={[
            darkThemePlugin,
            { location: 'left', type: 'filter', component: MyLeftHeaderPlugin, key: 'left' },
            { location: 'right', type: 'search', component: MyRightHeaderPlugin, props: { className: 'search-input' }, key: 'right' },
            { type: 'view', viewName: 'custom view', component: MyCustomViewComponent, key: 'custom-view-key' },
            { type: 'view', viewName: 'notes', component: MyCustomView, key: 'custom-nota-key' },
           ]}
        />
      </div>
    </ToastProvider>
  );
}

const darkThemePlugin = {
  type: 'theme',
  themeName: 'dark',
  key: 'dark-theme',
  cssVariables: {
    '--color-bg-white': '#1A202C',
    '--color-bg-gray-50': '#2D3748',
    '--color-bg-gray-100': '#4A5568',
    '--color-border': '#4A5568',
    '--color-border-gray-300': '#2D3748',
    '--color-text-gray-800': '#FFFFFF',
    '--color-text-gray-700': '#F7FAFC',
    '--color-text-gray-500': '#E2E8F0',
    '--btn-bg': '#4A5568',
    '--btn-hover-bg': '#718096',
  }
};

const MyCustomView: FC<CustomViewProps> = ({ events, currentDate, config, onEventClick }) => (
  <div>hello </div>
);

export default App;

```

### Calendar Views

React Agendfy supports four main calendar views, configurable via the `defaultView` option in the `config` prop:

  - **Month View**: Displays a traditional month grid. Set `defaultView: "month"`.
  - **Week View**: Shows a weekly agenda with time slots. Set `defaultView: "week"`.
  - **Day View**: Focuses on a single day's schedule with time slots. Set `defaultView: "day"`.
  - **List View**: Presents events in a list format, grouped by day for the current month. Set `defaultView: "list"`.

Users can navigate between views using the view selector in the calendar header.

### Event Handling

  - **`onEventClick(event: Event)`**: Callback function triggered when an event is clicked. Provides the event object as a parameter.
  - **`onEventUpdate(updatedEvent: Event)`**: Callback function for when an event is dragged and dropped to a new time slot or resized. It is crucial to update your event state with the `updatedEvent` provided.
  - **`onEventResize(resizedEvent: Event)`**: Callback function when an event is resized (Week and Day views only). Update your event state with the `resizedEvent`.
  - **`onDateRangeSelect({ start: string, end: string, isMultiDay: boolean })`**: Callback triggered when a user selects a date range by clicking and dragging on the calendar grid (Month and Week views). Useful for creating new events.

### Drag and Drop

  - **Enable Drag and Drop**: Drag and drop functionality is enabled by default when you provide the `onEventUpdate` and `onEventResize` callbacks.
  - **Moving Events**: Drag events to different time slots in week and day views to reschedule them. The `onEventUpdate` callback is triggered after a successful drag and drop operation.
  - **Resizing Events**: Resize events vertically in week and day views by dragging the bottom border of the event. The `onEventResize` callback is triggered upon resizing completion.

### Recurring Events

React Agendfy supports recurring events using the [RRule](https://www.google.com/url?sa=E&source=gmail&q=https://github.com/jakubroztocil/rrule) standard. Define recurrence rules in your event objects using the `recurrence` property.

```javascript
{
    id: "4",
    title: "Daily Standup",
    start: "2025-03-01T10:00:00.000Z",
    end: "2025-03-01T12:15:00.000Z",
    color: "#4caf50",
    recurrence: "FREQ=WEEKLY;INTERVAL=1;COUNT=10", // Example: Weekly for 10 occurrences
    isAllDay: false,
    isMultiDay: false,
},
```

The `expandRecurringEvents` utility function (exported from the library) can be used to expand recurring events into individual event instances for a given date range.

### Resource Filtering

  - **Resource Definition**: Define resources as an array of objects with `id`, `name`, and `type` properties. Pass this array to the `resources` prop of the `Calendar` component.
  - **Event Resources**: Assign resources to events using the `resources` property of the event object.
  - **Filtering Interface**: The calendar provides a built-in UI to filter events by resource type.
  - **`onResourceFilterChange(selectedResources: string[])`**:  Callback function that is called when the resource filter changes, providing an array of selected resource IDs.
  - **`filteredResources: string[]`**: Prop to control the resource filter externally. Pass an array of resource IDs to filter events displayed on the calendar.

### Time Zones

React Agendfy is timezone-aware, leveraging the `@date-fns/tz` library.

  - **Configuration**: Set the `timezone` property in the `config` prop to your desired timezone (e.g., `'America/Sao_Paulo'`, `'UTC'`, `'Africa/Luanda'`). Default timezone is **'UTC'**.

  - **TZDate**: Internally, the component uses `TZDate` objects from `@date-fns/tz` to handle dates and times, ensuring all calculations and displays are timezone-consistent.

  - **Event Dates**: Event `start` and `end` properties should be provided in ISO 8601 format (e.g., `"2025-07-20T10:00:00.000Z"`). While the component processes dates internally as `TZDate` objects with the configured timezone, it's recommended to store and manage event dates in UTC or a consistent timezone format to avoid ambiguity.

  - **Example Config**:

    ```javascript
    const config = useMemo(() => ({
        timezone: 'Africa/Luanda', // Example: Set timezone to Luanda
        // ... other configurations
    }), []);
    ```

    By configuring the `timezone`, the calendar will display times and perform date calculations according to the specified timezone, ensuring accurate representation for users in different time zones.

### Notifications (Alerts)

React Agendfy allows you to configure notifications or alerts for events using the `alertBefore` property in the event object. To enable email notifications, you need to implement and provide an `EmailAdapter` to the `Calendar` component.

  - **`alertBefore` Property**: In your event object, add `alertBefore` property to specify a reminder in minutes before the event starts.

    ```javascript
    {
        id: "6",
        title: "Team Lunch",
        start: "2025-03-05T14:00:00.000Z",
        end: "2025-03-05T15:00:00.000Z",
        color: "#ffc107",
        isAllDay": false,
        isMultiDay": false,
        alertBefore: 15, // Alert 15 minutes before event start
    }
    ```

  - **`EmailAdapter` Interface**: Define an adapter object that conforms to the `EmailAdapter` interface:

    ```typescript
    interface EmailAdapter {
        sendEmail: (subject: string, body: string, recipient: string) => Promise<void>;
    }
    ```

  - **Implementing `EmailAdapter`**: Create an object that implements the `EmailAdapter` interface with your email sending logic. Example using `console.log` for demonstration:

    ```javascript
    const myEmailAdapter = {
        sendEmail: async (subject, body, recipient) => {
            console.log("Sending email:", { subject, body, recipient });
            // Implement your actual email sending logic here (e.g., using an API, SMTP, etc.)
            return Promise.resolve();
        },
    };
    ```

  - **`emailAdapter` Prop**: Pass your implemented `EmailAdapter` to the `Calendar` component via the `emailAdapter` prop:

    ```jsx
    <Calendar
        // ...other props
        emailAdapter={myEmailAdapter}
    />
    ```

  - **`emailConfig` Prop**: Configure email settings using the `emailConfig` prop:

    ```jsx
    <Calendar
        // ...other props
        emailAdapter={myEmailAdapter}
        emailConfig={{ defaultRecipient: "[email address removed]" }} // Default recipient for notifications
    />
    ```

      - `defaultRecipient`: (Optional)  A default email address to be used if the event or user does not specify a recipient.

**Notification Behavior**:

  - When an event with `alertBefore` is created or updated, and the current time approaches the alert time, the calendar component (specifically with a backend implementation for processing alerts) will trigger the `sendEmail` method of the provided `EmailAdapter`.
  - The email will be sent to the specified recipient (if available in `event.recipient` or using `emailConfig.defaultRecipient` as fallback).
  - The email subject and body are automatically generated by the calendar component, including event details.
  - **Note**: The current component provides the front-end configuration and email sending *interface*.  **You will need to implement the backend logic** that periodically checks for events nearing their alert times and triggers the notification sending mechanism. This backend logic is outside the scope of this React component.

## Configuration Options (Config Prop)

The `config` prop is a JavaScript object that allows you to customize various aspects of the calendar. Below are the available configuration options:

| Option             | Type    | Default Value     | Description                                                                 |
| ------------------ | ------- | ----------------- | --------------------------------------------------------------------------- |
| `timezone`         | `string`| `'UTC'`           |  Sets the timezone for the calendar. Uses IANA timezone names (e.g., 'America/Sao\_Paulo', 'Africa/Luanda'). |
| `defaultView`      | `string`| `'week'`          |  Initial calendar view to display ('month', 'week', 'day', 'list').      |
| `slotDuration`     | `number`| `30`              |  Duration of time slots in minutes (Day and Week views).                    |
| `slotLabelFormat`    | `string`| `'HH:mm'`         |  Format for time slot labels (uses date-fns format strings).                |
| `slotMin`          | `string`| `'00:00'`         |  Start time for the Day and Week views.                                     |
| `slotMax`          | `string`| `'23:59'`         |  End time for the Day and Week views.                                       |
| `lang`             | `string`| `'en'`            |  Language code for localization (currently supports basic text elements).     |
| `today`            | `string`| `'Today'`         |  Text for the "Today" button.                                              |
| `monthView`        | `string`| `'Month'`         |  Text for the Month view button.                                            |
| `weekView`         | `string`| `'Week'`          |  Text for the Week view button.                                             |
| `dayView`          | `string`| `'Day'`           |  Text for the Day view button.                                              |
| `listView`         | `string`| `'List'`          |  Text for the List view button.                                             |
| `all_day`          | `string`| `'All Day'`       |  Text for "All Day" events.                                                |
| `clear_filter`     | `string`| `'Clear Filters'` |  Text for the "Clear Filters" button in resource filter.                    |
| `filter_resources` | `string`| `'Filter'`        |  Text for the "Filter" button in resource filter.                         |
| `businessHours`    | `object`| `undefined`       |  Configuration object for business hours highlighting (see below).          |

**Business Hours Configuration (`businessHours` in `config`)**

To highlight business hours in the week and day views, use the `businessHours` config option. It accepts an object with the following structure:

```typescriptreact
businessHours: {
    enabled: boolean; // Enables or disables the feature
    intervals: {
        daysOfWeek: number[]; // Array of days (0=Sun, 1=Mon, ..., 6=Sat)
        startTime: string;    // Start time in "HH:mm" format
        endTime: string;      // End time in "HH:mm" format
    }[];
}

```

**Example:**

```javascript
const config = useMemo(() => ({
    timezone: 'UTC',
    defaultView: "week",
    slotDuration: 30,
    businessHours: {
        start: 9, // 9 AM
        end: 18,  // 6 PM
        daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday (optional, defaults to all days if omitted)
    },
    // ... other configurations
}), []);
```

## Events Object Structure

The `events` prop expects an array of event objects. Each event object should have the following properties:

| Property             | Type               | Required | Description                                                                                       |
| -------------------- | ------------------ | -------- | ------------------------------------------------------------------------------------------------- |
| `id`                 | `string` | `number`| Yes      |  Unique identifier for the event.                                                                 |
| `title`              | `string`           | Yes      |  Title of the event, displayed on the calendar.                                                    |
| `start`              | `string`           | Yes      |  Start date and time of the event in ISO 8601 format (e.g., "2025-07-20T10:00:00.000Z").          |
| `end`                | `string`           | Yes      |  End date and time of the event in ISO 8601 format (e.g., "2025-07-20T12:00:00.000Z").            |
| `color`              | `string`           | No       |  Background color for the event (e.g., "\#3490dc", "red").                                       |
| `isAllDay`           | `boolean`          | No       |  Indicates if the event is an all-day event. Default is `false`.                                  |
| `isMultiDay`         | `boolean`          | No       |  Indicates if the event spans multiple days. Default is `false`.                                 |
| `recurrence`         | `string`           | No       |  RRule string for recurring events.                                                                 |
| `resources`          | `array`            | No       |  Array of resource objects assigned to the event (see Resources Object Structure).                 |
| `alertBefore`        | `number`           | No       |  Reminder time in minutes before the event start (for email notifications, requires EmailAdapter). |
| `[key: string]`      | `any`              | No       |  Allows adding any other custom properties to the event object.                                   |

## Resources Object Structure

The `resources` prop in the main `Calendar` component expects an array of resource objects. The `resources` property in the `event` object also uses the same structure. Each resource object should have:

| Property   | Type     | Required | Description                                         |
| ---------- | -------- | -------- | --------------------------------------------------- |
| `id`       | `string` | Yes      |  Unique identifier for the resource.                |
| `name`     | `string` | Yes      |  Display name of the resource.                      |
| `type`     | `string` | Yes      |  Type or category of the resource (e.g., "room", "person", "equipment"). |
| `[key: string]`| `any`  | No       | Allows adding any other custom properties.        |

## Email Adapter

To enable email notifications, you need to provide an `EmailAdapter` object to the `emailAdapter` prop of the `Calendar` component.

**Interface:**

```typescript
interface EmailAdapter {
    sendEmail: (subject: string, body: string, recipient: string) => Promise<void>;
}
```

**Implementation Example:**

```javascript
const myEmailAdapter = {
    sendEmail: async (subject, body, recipient) => {
        console.log("Sending email:", { subject, body, recipient });
        // Implement your email sending logic here
        return Promise.resolve();
    },
};
```

Pass this adapter to the `Calendar` component:

```jsx
<Calendar
    // ...other props
    emailAdapter={myEmailAdapter}
/>
```

## Localization (i18n)

Basic localization is supported for calendar text elements via the `config` prop. You can customize text for buttons and labels by setting the following properties in the `config` object to your desired language:

  - `today`
  - `monthView`
  - `weekView`
  - `dayView`
  - `listView`
  - `all_day`
  - `clear_filter`
  - `filter_resources`
  - `lang`:  Set the `lang` property to a language code (e.g., 'pt' for Portuguese, 'en' for English) to apply basic localization. Currently, only text element translations need to be manually provided in the `config`.

**Example (Portuguese Localization):**

```javascript
const config = useMemo(() => ({
    timezone: 'UTC',
    lang: 'pt',
    defaultView: "week",
    slotDuration: 30,
    today: 'Hoje',
    monthView: 'Mês',
    weekView: 'Semana',
    dayView: 'Dia',
    listView: 'Lista',
    all_day: 'Dia Inteiro',
    clear_filter: 'Limpar Filtro',
    filter_resources: 'Filtrar Recursos',
}), []);
```

## Calendar Export (ICS Format)

The calendar component also includes built-in support for exporting calendar events in the widely compatible ICS (iCalendar) format. This feature allows users to easily download their calendar data and import it into other calendar applications such as Google Calendar, Outlook Calendar, Apple Calendar, and more. The export functionality can typically be triggered via a button or option in the calendar header.

## Plugin Support

The calendar component also includes built-in support for exporting calendar events in the widely compatible ICS (iCalendar) format. This feature allows users to easily download their calendar data and import it into other calendar applications such as Google Calendar, Outlook Calendar, Apple Calendar, and more. The export functionality can typically be triggered via a button or option in the calendar header.

By default, the button for exporting the calendar is enabled (`export: true` in the configuration). You can customize the text displayed on this button by changing the value of the `calendar_export` attribute in the calendar's configuration object. For example, setting `calendar_export: "Download Calendar"` would change the button's text to "Download Calendar".

### Plugin Types

Here are the available plugin types:

#### 1. `ViewPlugin`
Adds a new custom view to the calendar.
- **`type: 'view'`**
- `viewName: string`: A unique name for the view (e.g., `'gantt'`).
- `component: FC<any>`: The React component that renders the view.
- `props?: { label?: string }`: The label for the view's button in the header.

**Example:**
```typescript
{
  type: 'view',
  viewName: 'my-agenda',
  component: MyAgendaViewComponent,
  key: 'agenda-plugin',
  props: { label: 'My Agenda' }
}
```

#### 2. `HeaderControlPlugin`
Adds UI controls (like filters or search bars) to the calendar header.
- **`type: 'filter' | 'search'`**
- `location: 'header'`: Specifies integration into the header.
- `component: FC<any>`: The React component for the control. It receives callbacks like `onFilterChange` or `onSearch`.

**Example:**
```typescript
{
  type: 'search',
  location: 'header',
  component: MySearchComponent,
  key: 'search-plugin'
}
```

#### 3. `DataSourcePlugin`
Integrates external data sources to fetch events.
- **`type: 'data-source'`**
- `fetchEvents: (startDate, endDate, config) => Promise<EventProps[]>`: An async function to load events.

#### 4. `EventRenderingPlugin`
Customizes the rendering of individual event components.
- **`type: 'event-rendering'`**
- `component: FC<any>`: The component to render an event.

#### 5. `InteractionPlugin`
Adds custom interaction logic, such as a different drag-and-drop implementation.
- **`type: 'interaction'`**
- `viewName: string`: The view to which this interaction applies (e.g., `'week'`).
- `component: FC<any>`: A wrapper component that provides the interaction context.

#### 6. `ThemePlugin`
Applies custom visual themes by dynamically injecting CSS variables.
- **`type: 'theme'`**
- `themeName: string`: A unique name for the theme (e.g., `'dark'`).
- `cssVariables: Record<string, string>`: An object of CSS variables to apply.

**How to use:**
1.  Define a `ThemePlugin` with your custom colors.
2.  Pass the plugin to the `<Calendar>` component.
3.  Activate the theme by setting the `theme` prop on `<Calendar>` to the `themeName` you defined.

**Example:**
```jsx
// 1. Define the dark theme plugin
const darkThemePlugin = {
  type: 'theme',
  themeName: 'dark',
  key: 'dark-theme',
  cssVariables: {
    '--color-bg-white': '#1A202C',           // Fundo principal (ex: cinza escuro)
    '--color-bg-gray-50': '#2D3748',         // Fundo secundário (ex: para cabeçalhos de tabela)
    '--color-bg-gray-100': '#4A5568',        // Fundo de elementos menores (ex: contador de eventos)
    '--color-border': '#4A5568',             // Cor da borda principal
    '--color-border-gray-300': '#2D3748',    // Cor da borda para elementos como all-day-column
    '--color-text-gray-800': '#FFFFFF',     // Texto principal (branco)
    '--color-text-gray-700': '#F7FAFC',     // Texto secundário (quase branco)
    '--color-text-gray-500': '#E2E8F0',     // Texto terciário (cinza claro)
    '--btn-bg': '#4A5568',                   // Fundo do botão
    '--btn-hover-bg': '#718096',             // Fundo do botão em hover
  }
};

// 2. Pass it to the Calendar
<Calendar
  plugins={[darkThemePlugin]}
  theme="dark" // 3. Activate the theme
  // ... other props
/>
```

#### 7. `ExportPlugin`
Adds new formats for exporting events.
- **`type: 'export'`**
- `formatName: string`: The internal name of the format (e.g., `'pdf'`).
- `label: string`: The label for the export menu item.
- `exportFunction: (events, config) => string | Promise<string>`: A function that returns the file content.
- `mimeType: string`: The file's MIME type.
- `fileExtension: string`: The file's extension.

#### 8. `CustomFilterPlugin`
Applies custom event filtering logic that can be controlled by UI components anywhere in the application.
- **`type: 'custom-filter'`**
- `filterName: string`: A unique name for the filter.
- `applyFilter: (events, config, filterValue) => EventProps[]`: A function that applies the filter logic.
- `component?: FC<any>`: An optional UI component to control the filter's value.

### Plugin Structure

Plugins are passed to the `Calendar` component via the `plugins` prop as an array of objects. Each plugin object should have at least a `type` property and may include other properties depending on the plugin type:

* `type`: (Required) A string indicating the type of the plugin (e.g., `'header'`, `'view'`, `'filter'`, `'search'`, `'dataSource'`).
* `location`: (For `header` plugins) A string specifying the location in the header: `'left'` or `'right'`.
* `viewName`: (For `view` plugins) A unique string identifying the custom view.
* `component`: (Optional) A React component (functional or class) that renders the plugin's UI or functionality. For `dataSource` plugins, this might handle configuration or initialization.
* `props`: (Optional) An object containing additional props that will be passed down to the plugin's `component`.
* `key`: (Optional) A unique key for the plugin, useful for React's rendering optimization.

### Usage

To use plugins, define them in an array and pass them to the `plugins` prop of the `<Calendar>` component.

```jsx
import Calendar from '@react-agendfy/core';
import { CalendarPlugin } from '@react-agendfy/core/dist/types'; // Adjust path as needed

// 1. Define a custom view component
const MyAgendaView = ({ events }) => <div>{events.length} events in my agenda.</div>;

// 2. Define an export function
const exportToExcel = async (events) => { /* ... logic ... */ return 'excel-data'; };

const App = () => {
  const myPlugins: CalendarPlugin[] = [
    {
      type: 'view',
      viewName: 'my-agenda',
      component: MyAgendaView,
      key: 'my-agenda-plugin',
      props: { label: 'My Agenda' }
    },
    {
      type: 'export',
      formatName: 'excel',
      label: 'Export to Excel',
      exportFunction: exportToExcel,
      mimeType: 'application/vnd.ms-excel',
      fileExtension: 'xls',
      key: 'excel-export-plugin'
    }
  ];

  return (
    <Calendar
      // ... other Calendar props
      events={...}
      plugins={myPlugins}
    />
  );
};
```

![print screen](img/1.png)
![print screen](img/2.png)
![print screen](img/3.png)
![print screen](img/4.png)
![print screen](img/5.png)

## Contributing

Contributions are welcome\! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## License

[MIT](LICENSE)

