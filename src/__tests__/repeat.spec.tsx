import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import App from '../App';
import { server } from '../setupTests';
import { saveScheduleWithRepeat, setup } from './rtl-utils';
import {
  setupEventListMockHandlerCreation,
  setupEventListMockHandlerUpdating,
  setupMockHandlerCreation,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';

describe('반복 유형 선택', () => {
  it('사용자는 일정 생성 또는 수정 시 반복 유형을 선택할 수 있다.', async () => {
    const { user } = setup(<App />);

    const checkbox = screen.getByLabelText('반복 일정') as HTMLInputElement;

    if (!checkbox.checked) {
      await user.click(checkbox);
    }

    const expected = screen.getByLabelText('반복 유형');
    expect(expected).toBeInTheDocument();
  });

  it('반복 유형은 매일, 매주, 매월, 매년 중 하나여야 한다.', () => {
    setup(<App />);

    const select = screen.getByLabelText('반복 유형') as HTMLSelectElement;
    const options = Array.from(select.options).map((option) => option.textContent);

    const expectedOptions = ['매일', '매주', '매월', '매년'];

    expectedOptions.forEach((option) => {
      expect(options).toContain(option);
    });
  });

  it('윤년의 2월 29일에 매월 반복 설정 시, 다음 옵션 중 하나를 선택할 수 있다: 매월 29일, 해당 월에서 29일이 속한 주차의 같은 요일, 해당 월의 마지막 동일 요일, 해당 월의 마지막 날.', async () => {
    const { user } = setup(<App />);

    await user.type(screen.getByLabelText('날짜'), '2024-02-29');

    const checkbox = screen.getByLabelText('반복 일정') as HTMLInputElement;
    if (!checkbox.checked) {
      await user.click(checkbox);
    }

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    await user.selectOptions(repeatTypeSelect, 'monthly');

    const repeatRuleSelect = (await screen.findByLabelText('반복 규칙')) as HTMLSelectElement;
    const repeatRuleOptions = Array.from(repeatRuleSelect.options).map(
      (option) => option.textContent
    );

    const expectedOptions = [
      '매월 29일',
      '매월 5번째 목요일',
      '매월 마지막 목요일',
      '매월 마지막 날',
    ];

    expectedOptions.forEach((option) => {
      expect(repeatRuleOptions).toContain(option);
    });
  });

  it('윤년의 2월 29일에 매년 반복 설정 시, 다음 옵션 중 하나를 선택할 수 있다: 매년 2월 29일, 해당 연도의 2월에서 29일이 속한 주차의 같은 요일, 해당 연도의 2월 마지막 동일 요일, 해당 연도의 2월 마지막 날.', async () => {
    const { user } = setup(<App />);

    await user.type(screen.getByLabelText('날짜'), '2024-02-29');

    const checkbox = screen.getByLabelText('반복 일정') as HTMLInputElement;
    if (!checkbox.checked) {
      await user.click(checkbox);
    }

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    await user.selectOptions(repeatTypeSelect, 'yearly');

    const repeatRuleSelect = (await screen.findByLabelText('반복 규칙')) as HTMLSelectElement;
    const repeatRuleOptions = Array.from(repeatRuleSelect.options).map(
      (option) => option.textContent
    );

    const expectedOptions = [
      '매년 2월 29일',
      '매년 2월 5번째 목요일',
      '매년 2월 마지막 목요일',
      '매년 2월 마지막 날',
    ];

    expectedOptions.forEach((option) => {
      expect(repeatRuleOptions).toContain(option);
    });
  });

  it('31일에 매월 반복 설정 시, 다음 옵션 중 하나를 선택할 수 있다: 매월 31일, 해당 월에서 31일이 속한 주차의 같은 요일, 해당 월의 마지막 동일 요일, 해당 월의 마지막 날.', async () => {
    const { user } = setup(<App />);

    await user.type(screen.getByLabelText('날짜'), '2024-03-31');

    const checkbox = screen.getByLabelText('반복 일정') as HTMLInputElement;
    if (!checkbox.checked) {
      await user.click(checkbox);
    }

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    await user.selectOptions(repeatTypeSelect, 'monthly');

    const repeatRuleSelect = (await screen.findByLabelText('반복 규칙')) as HTMLSelectElement;
    const repeatRuleOptions = Array.from(repeatRuleSelect.options).map(
      (option) => option.textContent
    );

    const expectedOptions = [
      '매월 31일',
      '매월 5번째 일요일',
      '매월 마지막 일요일',
      '매월 마지막 날',
    ];

    expectedOptions.forEach((option) => {
      expect(repeatRuleOptions).toContain(option);
    });
  });

  it('31일에 매년 반복 설정 시, 다음 옵션 중 하나를 선택할 수 있다: 매년 동일 월의 31일, 해당 연도의 동일 월에서 31일이 속한 주차의 같은 요일, 해당 연도의 동일 월 마지막 동일 요일, 해당 연도의 동일 월 마지막 날.', async () => {
    // ! Rules라는 데이터형을 추가하지 않는 방식은 없을까?
    const { user } = setup(<App />);

    await user.type(screen.getByLabelText('날짜'), '2024-03-31');

    const checkbox = screen.getByLabelText('반복 일정') as HTMLInputElement;
    if (!checkbox.checked) {
      await user.click(checkbox);
    }

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    await user.selectOptions(repeatTypeSelect, 'yearly');

    const repeatRuleSelect = (await screen.findByLabelText('반복 규칙')) as HTMLSelectElement;
    const repeatRuleOptions = Array.from(repeatRuleSelect.options).map(
      (option) => option.textContent
    );

    const expectedOptions = [
      '매년 3월 31일',
      '매년 3월 5번째 일요일',
      '매년 3월 마지막 일요일',
      '매년 3월 마지막 날',
    ];

    expectedOptions.forEach((option) => {
      expect(repeatRuleOptions).toContain(option);
    });
  });

  it('그외 날짜에 매월 반복 설정 시, 다음 옵션 중 하나를 선택할 수 있다: 매월 o일, 해당 월에서 o일이 속한 주차의 같은 요일', async () => {
    const { user } = setup(<App />);

    await user.type(screen.getByLabelText('날짜'), '2024-02-17');

    const checkbox = screen.getByLabelText('반복 일정') as HTMLInputElement;
    if (!checkbox.checked) {
      await user.click(checkbox);
    }

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    await user.selectOptions(repeatTypeSelect, 'monthly');

    const repeatRuleSelect = (await screen.findByLabelText('반복 규칙')) as HTMLSelectElement;
    const repeatRuleOptions = Array.from(repeatRuleSelect.options).map(
      (option) => option.textContent
    );

    const expectedOptions = ['매월 17일', '매월 3번째 토요일'];

    expectedOptions.forEach((option) => {
      expect(repeatRuleOptions).toContain(option);
    });
  });

  it('그외 날짜에 매년 반복 설정 시, 다음 옵션 중 하나를 선택할 수 있다: 매년 o월 o일, 해당 연도의 o월에서 o일이 속한 주차의 같은 요일', async () => {
    const { user } = setup(<App />);

    await user.type(screen.getByLabelText('날짜'), '2024-02-17');

    const checkbox = screen.getByLabelText('반복 일정') as HTMLInputElement;
    if (!checkbox.checked) {
      await user.click(checkbox);
    }

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    await user.selectOptions(repeatTypeSelect, 'yearly');

    const repeatRuleSelect = (await screen.findByLabelText('반복 규칙')) as HTMLSelectElement;
    const repeatRuleOptions = Array.from(repeatRuleSelect.options).map(
      (option) => option.textContent
    );

    const expectedOptions = ['매년 2월 17일', '매년 2월 3번째 토요일'];

    expectedOptions.forEach((option) => {
      expect(repeatRuleOptions).toContain(option);
    });
  });
});

describe('반복 간격 설정', () => {
  it('사용자는 반복 간격을 설정할 수 있다.', async () => {
    const { user } = setup(<App />);

    const repeatIntervalInput = screen.getByLabelText('반복 간격') as HTMLInputElement;

    await user.clear(repeatIntervalInput);
    await user.type(repeatIntervalInput, '3');

    const expected = repeatIntervalInput.value;

    expect(expected).toBe('3');
  });
});

describe('반복 일정 표시', () => {
  it('기존의 일정 중에서 반복 일정이 아닌 경우, 반복 일정으로 표시되지 않는다.', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              id: 1,
              title: '팀 회의',
              date: '2024-10-15',
              startTime: '09:00',
              endTime: '10:00',
              description: '주간 팀 미팅',
              location: '회의실 A',
              category: '업무',
              repeat: { type: 'none', interval: 0, rules: [] },
              notificationTime: 10,
            },
          ],
        });
      })
    );

    setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const monthView = within(screen.getByTestId('month-view'));
    const event = monthView.queryByLabelText('repeat-event');
    expect(event).not.toBeInTheDocument();
  });

  it('사용자가 새로운 반복 일정을 추가 했다면, 해당 일정이 반복 일정으로 추가가 되어야한다.', async () => {
    setupEventListMockHandlerCreation([]);

    const { user } = setup(<App />);

    await saveScheduleWithRepeat(user, {
      title: '새로운 회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'daily', interval: 1, rules: [], endDate: '2024-10-18' },
    });

    const monthView = within(screen.getByTestId('month-view'));
    const events = await monthView.findAllByLabelText('repeat-event');
    expect(events[0]).toBeInTheDocument();
    const eventTitle = within(events[0]).getByText('새로운 회의');
    expect(eventTitle).toBeInTheDocument();
  });
});

describe('반복 종료', () => {
  it('2024-10-13 부터 매일 1번씩 반복되는 일정이 2024-10-20에 끝난다면, 그날까지 반복일정으로 표시되어야한다.', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              title: '기존 회의',
              date: '2024-10-13',
              startTime: '09:00',
              endTime: '10:00',
              description: '기존 팀 미팅',
              location: '회의실 B',
              category: '업무',
              repeat: { type: 'daily', interval: 1, endDate: '2024-10-20' },
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
              repeat: { type: 'daily', interval: 1, endDate: '2024-10-20' },
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
              repeat: { type: 'daily', interval: 1, endDate: '2024-10-20' },
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
              repeat: { type: 'daily', interval: 1, endDate: '2024-10-20' },
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
              repeat: { type: 'daily', interval: 1, endDate: '2024-10-20' },
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
              repeat: { type: 'daily', interval: 1, endDate: '2024-10-20' },
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
              repeat: { type: 'daily', interval: 1, endDate: '2024-10-20' },
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
              repeat: { type: 'daily', interval: 1, endDate: '2024-10-20' },
              notificationTime: 10,
            },
          ],
        });
      })
    );

    setup(<App />);

    const monthView = within(screen.getByTestId('month-view'));
    const events = await monthView.findAllByLabelText('repeat-event');
    expect(events.length).toBe(8);
    const eventTitle = within(events[0]).getByText('기존 회의');
    expect(eventTitle).toBeInTheDocument();
  });
});

describe('반복 일정 단일 수정', () => {
  it('사용자가 반복 일정을 수정한다면, 수정된 단일 일정으로 변경 되어야 한다.', async () => {
    setupEventListMockHandlerUpdating();

    const { user } = setup(<App />);

    const monthView = within(screen.getByTestId('month-view'));
    const events = await monthView.findAllByLabelText('repeat-event');
    expect(events.length).toBe(3);

    const editButton = (await screen.findAllByLabelText('Edit event'))[1];
    await user.click(editButton);

    const titleInput = screen.getByLabelText('제목');

    await user.clear(titleInput);
    await user.type(titleInput, '수정된 회의');

    await user.click(screen.getByTestId('event-submit-button'));

    const eventTitle = monthView.getByText('수정된 회의');
    expect(eventTitle).toBeInTheDocument();
    const updatedEvents = await monthView.findAllByLabelText('repeat-event');
    expect(updatedEvents.length).toBe(2);
  });
});
