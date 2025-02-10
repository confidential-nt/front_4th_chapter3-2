import { screen } from '@testing-library/react';

import App from '../App';
import { setup } from './rtl-utils';

describe.only('반복 유형 선택', () => {
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
    await user.selectOptions(repeatTypeSelect, '매월');

    const repeatRuleSelect = (await screen.findByLabelText('반복 규칙')) as HTMLSelectElement;
    const repeatRuleOptions = Array.from(repeatRuleSelect.options).map(
      (option) => option.textContent
    );

    const expectedOptions = ['29일', '5번째 목요일', '마지막 목요일', '미자막 날'];

    expectedOptions.forEach((option) => {
      expect(repeatRuleOptions).toContain(option);
    });
  });

  it('윤년의 2월 29일에 매년 반복 설정 시, 다음 옵션 중 하나를 선택할 수 있다: 매년 2월 29일, 해당 연도의 2월에서 29일이 속한 주차의 같은 요일, 해당 연도의 2월 마지막 동일 요일, 해당 연도의 2월 마지막 날.', () => {});

  it('31일에 매월 반복 설정 시, 다음 옵션 중 하나를 선택할 수 있다: 매월 31일, 해당 월에서 31일이 속한 주차의 같은 요일, 해당 월의 마지막 동일 요일, 해당 월의 마지막 날.', () => {});

  it('31일에 매년 반복 설정 시, 다음 옵션 중 하나를 선택할 수 있다: 매년 동일 월의 31일, 해당 연도의 동일 월에서 31일이 속한 주차의 같은 요일, 해당 연도의 동일 월 마지막 동일 요일, 해당 연도의 동일 월 마지막 날.', () => {});

  it('그외 날짜에 매월 반복 설정 시, 다음 옵션 중 하나를 선택할 수 있다: 매월 o일, 해당 월에서 o일이 속한 주차의 같은 요일', () => {});

  it('그외 날짜에 매년 반복 설정 시, 다음 옵션 중 하나를 선택할 수 있다: 매년 o월 o일, 해당 연도의 o월에서 o일이 속한 주차의 같은 요일', () => {});
});
