import { Event, EventForm, RepeatRule } from '../types';
import { addDays, addWeeks, formatDate, getWeekDates, isDateInRange } from './dateUtils';

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

export function getRepeatEvents(event: Event | EventForm) {
  if (event.repeat.type === 'none') {
    return [event]; // 반복 일정이 아니면 그대로 반환
  }

  const repeatEvents = [];
  let eventDate = new Date(event.date); // 시작 날짜

  while (eventDate <= new Date(event.repeat.endDate ? event.repeat.endDate : '2025-06-30')) {
    repeatEvents.push({
      ...event,
      date: formatDate(eventDate), // 반복된 날짜 설정
    });

    // 반복 주기에 따라 다음 날짜 계산
    if (event.repeat.type === 'weekly') {
      eventDate = addWeeks(eventDate, event.repeat.interval);
      // new
    } else if (event.repeat.type === 'monthly') {
      eventDate = new Date(
        getNextMonthlyDate(formatDate(eventDate), event.repeat.rule, event.repeat.interval)
      );
    } else if (event.repeat.type === 'daily') {
      eventDate = addDays(eventDate, event.repeat.interval);
    } else {
      eventDate = new Date(
        getNextYearlyDate(formatDate(eventDate), event.repeat.rule, event.repeat.interval)
      );
    }
  }

  return repeatEvents;
}

function getNextMonthlyDate(currentDate: string, rule: RepeatRule, interval: number): string {
  const date = new Date(currentDate);
  let nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + interval); // interval을 먼저 적용

  if (rule === 'normal') {
    // 날짜를 먼저 설정한 후 월 비교
    nextDate.setDate(date.getDate());

    // 다음 달이 정상적으로 반영되지 않았을 경우 (날짜가 조정되어 달이 바뀐 경우)
    if (nextDate.getMonth() !== (date.getMonth() + interval) % 12) {
      // 다음 달로 조정하여 유효한 날짜를 찾음
      while (nextDate.getMonth() !== (date.getMonth() + interval) % 12) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
    }

    return formatDate(nextDate);
  }

  if (rule === 'last-day') {
    nextDate.setMonth(nextDate.getMonth() + 1); // interval을 적용한 다음 달
    nextDate.setDate(0); // 마지막 날
    return formatDate(nextDate);
  }

  if (rule === 'same-weekday-nth') {
    const targetWeekday = date.getDay(); // 현재 요일 (0~6)
    const nthWeek = Math.floor((date.getDate() - 1) / 7) + 1; // 몇 번째 주인지

    while (true) {
      const firstDay = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
      const firstWeekday = firstDay.getDay();

      let offset = (targetWeekday - firstWeekday + 7) % 7;
      let targetDate = 1 + offset + (nthWeek - 1) * 7;
      let testDate = new Date(nextDate.getFullYear(), nextDate.getMonth(), targetDate);

      if (testDate.getMonth() === nextDate.getMonth()) {
        return formatDate(testDate);
      }
      nextDate.setMonth(nextDate.getMonth() + interval); // interval을 고려하여 이동
    }
  }

  if (rule === 'last-weekday') {
    nextDate.setMonth(nextDate.getMonth() + 1); // interval을 반영한 다음 달
    nextDate.setDate(0); // 마지막 날

    while (nextDate.getDay() !== date.getDay()) {
      nextDate.setDate(nextDate.getDate() - 1);
    }
    return formatDate(nextDate);
  }
}
export function getNextYearlyDate(currentDate: string, rule: RepeatRule, interval: number): string {
  const date = new Date(currentDate);
  const year = date.getFullYear();
  const month = date.getMonth(); // 0: 1월, 1: 2월, ...
  const day = date.getDate();

  if (rule === 'normal') {
    let nextYear = year + interval;

    // 2월 29일의 경우, 다음 윤년을 찾아야 함
    if (month === 1 && day === 29) {
      while (!isLeapYear(nextYear)) {
        nextYear++;
      }
      return formatDate(new Date(nextYear, month, 29));
    }

    return formatDate(new Date(nextYear, month, day)); // 일반적인 경우는 interval 만큼 증가
  }

  if (rule === 'last-day') {
    return formatDate(new Date(year + interval, month + 1, 0)); // 다음 해 2월 마지막 날
  }

  const nthWeek = Math.ceil(day / 7); // 몇 번째 주인지 계산
  const weekday = date.getDay(); // 요일 (0: 일요일 ~ 6: 토요일)

  if (rule === 'same-weekday-nth') {
    return formatDate(getNthWeekdayOfMonth(year + interval, month, weekday, nthWeek)); // 같은 n번째 o요일
  }

  if (rule === 'last-weekday') {
    return formatDate(getLastWeekdayOfMonth(year + interval, month, weekday)); // 마지막 o요일
  }

  return formatDate(date);
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getNthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date {
  let date = new Date(year, month, 1);
  let count = 0;

  while (date.getMonth() === month) {
    if (date.getDay() === weekday) {
      count++;
      if (count === nth) return date;
    }
    date.setDate(date.getDate() + 1);
  }

  return date; // fallback (should not reach here)
}

function getLastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  let date = new Date(year, month + 1, 0); // 해당 월의 마지막 날

  while (date.getDay() !== weekday) {
    date.setDate(date.getDate() - 1);
  }

  return date;
}
