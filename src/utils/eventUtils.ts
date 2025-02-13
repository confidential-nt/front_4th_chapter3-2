import dayjs from 'dayjs';
import isLeapYearDayJS from 'dayjs/plugin/isLeapYear';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isLeapYearDayJS);

import { Event, EventForm, RepeatRule } from '../types';
import { formatDate, getWeekDates, isDateInRange } from './dateUtils';

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
  let eventDate = dayjs(event.date); // 시작 날짜를 dayjs 객체로 변경

  while (eventDate.isSameOrBefore(dayjs(event.repeat.endDate || '2025-06-30'))) {
    repeatEvents.push({
      ...event,
      date: eventDate.format('YYYY-MM-DD'), // 반복된 날짜 설정
    });

    // 반복 주기에 따라 다음 날짜 계산
    if (event.repeat.type === 'weekly') {
      eventDate = eventDate.add(event.repeat.interval, 'week');
    } else if (event.repeat.type === 'monthly') {
      const nextDateStr = getNextMonthlyDate(
        eventDate.format('YYYY-MM-DD'),
        event.repeat.rule,
        event.repeat.interval
      );
      const nextDate = dayjs(nextDateStr);

      if (nextDate.isSame(eventDate)) {
        console.error(
          '무한 루프 방지: 다음 날짜가 현재 날짜와 동일함',
          nextDate.format('YYYY-MM-DD')
        );
        break;
      }
      eventDate = nextDate;
    } else if (event.repeat.type === 'daily') {
      eventDate = eventDate.add(event.repeat.interval, 'day');
    } else {
      const nextDateStr = getNextYearlyDate(
        eventDate.format('YYYY-MM-DD'),
        event.repeat.rule,
        event.repeat.interval
      );
      eventDate = dayjs(nextDateStr);
    }
  }

  return repeatEvents;
}

function getNextMonthlyDate(currentDate: string, rule: RepeatRule, interval: number): string {
  let date = dayjs(currentDate); // Day.js 객체로 변환
  let nextDate = date.add(interval, 'month');

  if (rule === 'normal') {
    if (date.date() === 31) {
      // 현재 날짜가 31일이면 다음 달부터 31일을 찾고 없으면 말일로 설정
      while (nextDate.date() !== 31) {
        nextDate = nextDate.add(1, 'month').endOf('month');
        if (nextDate.isAfter('2025-06-30')) break;
      }
    } else {
      // 날짜가 존재하지 않으면 다음 달로 건너뛰기
      while (nextDate.date() !== date.date()) {
        nextDate = nextDate.add(1, 'month');
        if (nextDate.isAfter('2025-06-30')) break;
      }
    }
  }

  if (rule === 'last-day') {
    return nextDate.endOf('month').format('YYYY-MM-DD');
  }

  if (rule === 'same-weekday-nth') {
    const targetWeekday = date.day();
    const nthWeek = Math.floor((date.date() - 1) / 7) + 1;

    let firstDayOfMonth = nextDate.startOf('month');
    let firstWeekday = firstDayOfMonth.day();
    let offset = (targetWeekday - firstWeekday + 7) % 7;
    let targetDate = firstDayOfMonth.add(offset + (nthWeek - 1) * 7, 'day');

    if (targetDate.month() !== nextDate.month()) {
      targetDate = nextDate.endOf('month');
    }
    return targetDate.format('YYYY-MM-DD');
  }

  if (rule === 'last-weekday') {
    let lastDayOfMonth = nextDate.endOf('month');
    while (lastDayOfMonth.day() !== date.day()) {
      lastDayOfMonth = lastDayOfMonth.subtract(1, 'day');
    }
    return lastDayOfMonth.format('YYYY-MM-DD');
  }

  return nextDate.format('YYYY-MM-DD');
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
