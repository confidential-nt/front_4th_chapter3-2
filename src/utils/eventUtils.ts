import { Event, EventForm } from '../types';
import { addDays, addMonths, addWeeks, formatDate, getWeekDates, isDateInRange } from './dateUtils';

function filterEventsByDateRange(events: Event[], start: Date, end: Date): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return isDateInRange(eventDate, start, end);
  });
}

function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

function filterEventsByDateRangeAtWeek(events: Event[], currentDate: Date) {
  const weekDates = getWeekDates(currentDate);
  return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
}

function filterEventsByDateRangeAtMonth(events: Event[], currentDate: Date) {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  return filterEventsByDateRange(events, monthStart, monthEnd);
}

export function getFilteredEvents(
  events: Event[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
): Event[] {
  const searchedEvents = searchEvents(events, searchTerm);

  if (view === 'week') {
    return filterEventsByDateRangeAtWeek(searchedEvents, currentDate);
  }

  if (view === 'month') {
    return filterEventsByDateRangeAtMonth(searchedEvents, currentDate);
  }

  return searchedEvents;
}

export function getExpandedEventsForMonth(events: Event[], currentDate: Date) {
  // ! 얘에 대한 테스트도 필요함.
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // ! 흠.. 얘가 필요한가?
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  return getFilteredEvents(
    events.flatMap((event) => {
      if (event.repeat.type === 'none') {
        return [event]; // 반복 일정이 아니면 그대로 반환
      }

      const expandedEvents = [];
      let eventDate = new Date(event.date); // 시작 날짜

      while (
        eventDate <= new Date(event.repeat.endDate ? event.repeat.endDate : '2025-06-30') &&
        eventDate <= endOfMonth
      ) {
        if (eventDate >= startOfMonth) {
          expandedEvents.push({
            ...event,
            date: formatDate(eventDate), // 반복된 날짜 설정
          });
        }

        // 반복 주기에 따라 다음 날짜 계산
        if (event.repeat.type === 'weekly') {
          eventDate = addWeeks(eventDate, event.repeat.interval);
          // new
        } else if (event.repeat.type === 'monthly') {
          eventDate = addMonths(eventDate, event.repeat.interval);
        } else if (event.repeat.type === 'daily') {
          eventDate = addDays(eventDate, event.repeat.interval);
        }
      }

      return expandedEvents;
    }),
    '',
    currentDate,
    'month'
  );
}

export function getExpandedEvents(event: Event | EventForm) {
  if (event.repeat.type === 'none') {
    return [event]; // 반복 일정이 아니면 그대로 반환
  }

  const expandedEvents = [];
  let eventDate = new Date(event.date); // 시작 날짜

  while (eventDate <= new Date(event.repeat.endDate ? event.repeat.endDate : '2025-06-30')) {
    expandedEvents.push({
      ...event,
      date: formatDate(eventDate), // 반복된 날짜 설정
    });

    // 반복 주기에 따라 다음 날짜 계산
    if (event.repeat.type === 'weekly') {
      eventDate = addWeeks(eventDate, event.repeat.interval);
      // new
    } else if (event.repeat.type === 'monthly') {
      eventDate = addMonths(eventDate, event.repeat.interval);
    } else if (event.repeat.type === 'daily') {
      eventDate = addDays(eventDate, event.repeat.interval);
    }
  }

  return expandedEvents;
}
