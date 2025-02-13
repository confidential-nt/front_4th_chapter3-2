import { Event } from '../../types';
import { getRepeatEvents, getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const events: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2024-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0, rule: 'normal' },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2024-07-05',
      startTime: '14:00',
      endTime: '15:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0, rule: 'normal' },
      notificationTime: 0,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2024-07-10',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0, rule: 'normal' },
      notificationTime: 0,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'week');
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2']);
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2', '이벤트 3']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(events, '이벤트', new Date('2024-07-01'), 'week');
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(3);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('이벤트 2');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const borderEvents: Event[] = [
      {
        id: '4',
        title: '6월 마지막 날 이벤트',
        date: '2024-06-30',
        startTime: '23:00',
        endTime: '23:59',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0, rule: 'normal' },
        notificationTime: 0,
      },
      ...events,
      {
        id: '5',
        title: '8월 첫 날 이벤트',
        date: '2024-08-01',
        startTime: '00:00',
        endTime: '01:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0, rule: 'normal' },
        notificationTime: 0,
      },
    ];
    const result = getFilteredEvents(borderEvents, '', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.title)).toEqual(['이벤트 1', '이벤트 2', '이벤트 3']);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(0);
  });
});

describe('getRepeatEvents', () => {
  it('2024-10-13 부터 시작하는 반복 일정이 2024-10-20 까지 매일 한번의 간격으로 진행된다면 총 8개의 이벤트가 생성되어야한다.', () => {
    expect(
      getRepeatEvents({
        title: '기존 회의',
        date: '2024-10-13',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2024-10-20', rule: 'normal' },
        notificationTime: 10,
      })
    ).toEqual([
      {
        title: '기존 회의',
        date: '2024-10-13',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2024-10-20', rule: 'normal' },
        notificationTime: 10,
      },
      {
        title: '기존 회의',
        date: '2024-10-14',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2024-10-20', rule: 'normal' },
        notificationTime: 10,
      },
      {
        title: '기존 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2024-10-20', rule: 'normal' },
        notificationTime: 10,
      },
      {
        title: '기존 회의',
        date: '2024-10-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2024-10-20', rule: 'normal' },
        notificationTime: 10,
      },
      {
        title: '기존 회의',
        date: '2024-10-17',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2024-10-20', rule: 'normal' },
        notificationTime: 10,
      },
      {
        title: '기존 회의',
        date: '2024-10-18',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2024-10-20', rule: 'normal' },
        notificationTime: 10,
      },
      {
        title: '기존 회의',
        date: '2024-10-19',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2024-10-20', rule: 'normal' },
        notificationTime: 10,
      },
      {
        title: '기존 회의',
        date: '2024-10-20',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2024-10-20', rule: 'normal' },
        notificationTime: 10,
      },
    ]);
  });

  it('2024-03-31 부터 시작하는 반복 일정이 2024-06-30 까지 "normal" 옵션으로 매달 진행될 경우 총 2개의 이벤트가 생성되어야한다.', () => {
    expect(
      getRepeatEvents({
        title: '기존 회의',
        date: '2024-03-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'normal', endDate: '2024-06-30' },
        notificationTime: 10,
      })
    ).toEqual([
      {
        title: '기존 회의',
        date: '2024-03-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'normal', endDate: '2024-06-30' },
        notificationTime: 10,
      },
      {
        title: '기존 회의',
        date: '2024-05-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'normal', endDate: '2024-06-30' },
        notificationTime: 10,
      },
    ]);
  });

  it('2024-02-29 부터 시작하는 반복 일정이 2024-06-30 까지 매달 "last-day" 옵션으로 진행될 경우 총 5개의 이벤트가 생성되어야한다.', () => {
    expect(
      getRepeatEvents({
        title: '기존 회의',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'last-day', endDate: '2024-06-30' },
        notificationTime: 10,
      })
    ).toEqual([
      {
        title: '기존 회의',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'last-day', endDate: '2024-06-30' },
        notificationTime: 10,
      },
      {
        title: '기존 회의',
        date: '2024-03-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'last-day', endDate: '2024-06-30' },
        notificationTime: 10,
      },
      {
        title: '기존 회의',
        date: '2024-04-30',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'last-day', endDate: '2024-06-30' },
        notificationTime: 10,
      },
      {
        title: '기존 회의',
        date: '2024-05-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'last-day', endDate: '2024-06-30' },
        notificationTime: 10,
      },
      {
        title: '기존 회의',
        date: '2024-06-30',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'last-day', endDate: '2024-06-30' },
        notificationTime: 10,
      },
    ]);
  });

  it('2024-02-29 부터 시작하는 반복 일정이 2025-06-30 까지 매년 "normal" 옵션으로 진행될 경우 총 1개의 이벤트가 생성되어야한다.', () => {
    expect(
      getRepeatEvents({
        title: '기존 회의',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'yearly', interval: 1, rule: 'normal' },
        notificationTime: 10,
      })
    ).toEqual([
      {
        title: '기존 회의',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'yearly', interval: 1, rule: 'normal' },
        notificationTime: 10,
      },
    ]);
  });

  it('2024-02-29 부터 시작하는 반복 일정이 2025-06-30 까지 매년 "last-day" 옵션으로 진행될 경우 총 2개의 이벤트가 생성되어야한다.', () => {
    expect(
      getRepeatEvents({
        title: '기존 회의',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'yearly', interval: 1, rule: 'last-day' },
        notificationTime: 10,
      })
    ).toEqual([
      {
        title: '기존 회의',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'yearly', interval: 1, rule: 'last-day' },
        notificationTime: 10,
      },
      {
        title: '기존 회의',
        date: '2025-02-28',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'yearly', interval: 1, rule: 'last-day' },
        notificationTime: 10,
      },
    ]);
  });

  it('2024-02-29 부터 시작하는 반복 일정이 2024-08-31 까지 매월 "last-weekday" 옵션으로 진행될 경우 총 7개의 이벤트가 생성되어야한다.', () => {
    expect(
      getRepeatEvents({
        title: '기존 회의',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'last-weekday', endDate: '2024-08-31' },
        notificationTime: 10,
      })
    ).toEqual([
      {
        title: '기존 회의',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'last-weekday', endDate: '2024-08-31' },
        notificationTime: 10,
      },
      {
        title: '기존 회의',
        date: '2024-03-28',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'last-weekday', endDate: '2024-08-31' },
        notificationTime: 10,
      },
      {
        title: '기존 회의',
        date: '2024-04-25',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'last-weekday', endDate: '2024-08-31' },
        notificationTime: 10,
      },
      {
        title: '기존 회의',
        date: '2024-05-30',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'last-weekday', endDate: '2024-08-31' },
        notificationTime: 10,
      },
      {
        title: '기존 회의',
        date: '2024-06-27',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'last-weekday', endDate: '2024-08-31' },
        notificationTime: 10,
      },
      {
        title: '기존 회의',
        date: '2024-07-25',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'last-weekday', endDate: '2024-08-31' },
        notificationTime: 10,
      },
      {
        title: '기존 회의',
        date: '2024-08-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'last-weekday', endDate: '2024-08-31' },
        notificationTime: 10,
      },
    ]);
  });

  it('2024-02-29 부터 시작하는 반복 일정이 2024-08-31 까지 매월 "same-weekday-nth" 옵션으로 진행될 경우 총 2개의 이벤트가 생성되어야한다.', () => {
    expect(
      getRepeatEvents({
        title: '기존 회의',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'same-weekday-nth', endDate: '2024-08-31' },
        notificationTime: 10,
      })
    ).toEqual([
      {
        title: '기존 회의',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'same-weekday-nth', endDate: '2024-08-31' },
        notificationTime: 10,
      },

      {
        title: '기존 회의',
        date: '2024-05-30',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'same-weekday-nth', endDate: '2024-08-31' },
        notificationTime: 10,
      },

      {
        title: '기존 회의',
        date: '2024-08-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, rule: 'same-weekday-nth', endDate: '2024-08-31' },
        notificationTime: 10,
      },
    ]);
  });
});
