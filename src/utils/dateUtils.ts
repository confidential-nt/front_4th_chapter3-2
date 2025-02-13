import { Event } from '../types.ts';

/**
 * 주어진 년도와 월의 일수를 반환합니다.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 주어진 날짜가 속한 주의 모든 날짜를 반환합니다.
 */
export function getWeekDates(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day;
  const sunday = new Date(date.setDate(diff));
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(sunday);
    nextDate.setDate(sunday.getDate() + i);
    weekDates.push(nextDate);
  }
  return weekDates;
}

export function getWeeksAtMonth(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month + 1);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weeks = [];

  const initWeek = () => Array(7).fill(null);

  let week: Array<number | null> = initWeek();

  for (let i = 0; i < firstDayOfMonth; i++) {
    week[i] = null;
  }

  for (const day of days) {
    const dayIndex = (firstDayOfMonth + day - 1) % 7;
    week[dayIndex] = day;
    if (dayIndex === 6 || day === daysInMonth) {
      weeks.push(week);
      week = initWeek();
    }
  }

  return weeks;
}

export function getEventsForDay(events: Event[], date: number): Event[] {
  return events.filter((event) => new Date(event.date).getDate() === date);
}

export function formatWeek(targetDate: Date) {
  const dayOfWeek = targetDate.getDay();
  const diffToThursday = 4 - dayOfWeek;
  const thursday = new Date(targetDate);
  thursday.setDate(targetDate.getDate() + diffToThursday);

  const year = thursday.getFullYear();
  const month = thursday.getMonth() + 1;

  const firstDayOfMonth = new Date(thursday.getFullYear(), thursday.getMonth(), 1);

  const firstThursday = new Date(firstDayOfMonth);
  firstThursday.setDate(1 + ((4 - firstDayOfMonth.getDay() + 7) % 7));

  const weekNumber: number =
    Math.floor((thursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  return `${year}년 ${month}월 ${weekNumber}주`;
}

/**
 * 주어진 날짜의 월 정보를 "YYYY년 M월" 형식으로 반환합니다.
 */
export function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}년 ${month}월`;
}

const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * 주어진 날짜가 특정 범위 내에 있는지 확인합니다.
 */
export function isDateInRange(date: Date, rangeStart: Date, rangeEnd: Date): boolean {
  const normalizedDate = stripTime(date);
  const normalizedStart = stripTime(rangeStart);
  const normalizedEnd = stripTime(rangeEnd);

  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
}

export function fillZero(value: number, size = 2) {
  return String(value).padStart(size, '0');
}

export function formatDate(currentDate: Date, day?: number) {
  return [
    currentDate.getFullYear(),
    fillZero(currentDate.getMonth() + 1),
    fillZero(day ?? currentDate.getDate()),
  ].join('-');
}

// TDD 때문에 단순한 함수 -> 복잡한 일을 하는 함수 빌드업이 가능했는지도.
export function getRepeatRules(
  date: Date,
  frequency: 'monthly' | 'yearly'
): Record<string, string> {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-based index
  const day = date.getDate();
  const dayOfWeek = date.getDay(); // 0 (일) ~ 6 (토)

  const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

  const weekOfMonth = Math.floor((day - 1) / 7) + 1; // 몇 번째 주인지
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  // 윤년 2월 29일 처리
  if (month === 1 && day === 29 && isLeapYear(year)) {
    return frequency === 'monthly'
      ? {
          normal: '매월 29일',
          'same-weekday-nth': `매월 ${weekOfMonth}번째 ${weekdays[dayOfWeek]}`,
          'last-weekday': `매월 마지막 ${weekdays[dayOfWeek]}`,
          'last-day': `매월 마지막 날`,
        }
      : {
          normal: `매년 2월 29일`,
          'same-weekday-nth': `매년 2월 ${weekOfMonth}번째 ${weekdays[dayOfWeek]}`,
          'last-weekday': `매년 2월 마지막 ${weekdays[dayOfWeek]}`,
          'last-day': `매년 2월 마지막 날`,
        };
  }

  // 31일 처리
  if (day === 31) {
    return frequency === 'monthly'
      ? {
          normal: `매월 31일`,
          'same-weekday-nth': `매월 ${weekOfMonth}번째 ${weekdays[dayOfWeek]}`,
          'last-weekday': `매월 마지막 ${weekdays[dayOfWeek]}`,
          'last-day': `매월 마지막 날`,
        }
      : {
          normal: `매년 ${month + 1}월 31일`,
          'same-weekday-nth': `매년 ${month + 1}월 ${weekOfMonth}번째 ${weekdays[dayOfWeek]}`,
          'last-weekday': `매년 ${month + 1}월 마지막 ${weekdays[dayOfWeek]}`,
          'last-day': `매년 ${month + 1}월 마지막 날`,
        };
  }

  // 일반적인 날짜 처리
  return frequency === 'monthly'
    ? {
        normal: `매월 ${day}일`,
        'same-weekday-nth': `매월 ${weekOfMonth}번째 ${weekdays[dayOfWeek]}`,
      }
    : {
        normal: `매년 ${month + 1}월 ${day}일`,
        'same-weekday-nth': `매년 ${month + 1}월 ${weekOfMonth}번째 ${weekdays[dayOfWeek]}`,
      };
}

export const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addWeeks = (date: Date, weeks: number) => {
  return addDays(date, weeks * 7);
};

export const addMonths = (date: Date, months: number) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const addYears = (date: Date, years: number) => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};
