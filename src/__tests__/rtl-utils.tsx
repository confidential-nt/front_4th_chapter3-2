import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

import { Event } from '../types';

// eslint-disable-next-line no-unused-vars
type Setup = (element: ReactElement) => any;
// ! Hard 여기 제공 안함
export const setup: Setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Med: 왜 ChakraProvider로 감싸는지 물어보자
};

// ! Hard 여기 제공 안함
export const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
};

export const saveScheduleWithRepeat = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime'>
) => {
  const { title, date, startTime, endTime, location, description, category, repeat } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);
  await user.selectOptions(screen.getByLabelText('반복 유형'), repeat.type);

  if (repeat.type === 'yearly' || repeat.type === 'monthly') {
    const repeatRuleSelect = await screen.findByLabelText('반복 규칙');
    await user.selectOptions(repeatRuleSelect, repeat.rule);
  }

  const intervalInput = screen.getByLabelText('반복 간격');
  await user.clear(intervalInput);
  await user.type(intervalInput, String(repeat.interval));

  await user.click(screen.getByTestId('event-submit-button'));
};
