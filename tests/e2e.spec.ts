import { test, expect } from '@playwright/test';

test('2025-02-14 부터 14일 마다 매달 반복 하는 일정이 2025-06-30까지 생성되어있는지 확인한다.', async ({
  page,
}) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('textbox', { name: '제목' }).click();
  await page.getByRole('textbox', { name: '제목' }).fill('매달 14일에 반복하는 일정');
  await page.getByRole('textbox', { name: '날짜' }).fill('2025-02-14');
  await page.getByRole('textbox', { name: '시작 시간' }).click();
  await page.getByRole('textbox', { name: '시작 시간' }).press('ArrowUp');
  await page.getByRole('textbox', { name: '시작 시간' }).press('ArrowRight');
  await page.getByRole('textbox', { name: '시작 시간' }).fill('16:30');
  await page.getByRole('textbox', { name: '시작 시간' }).press('ArrowRight');
  await page.getByRole('textbox', { name: '시작 시간' }).press('Tab');
  await page.getByRole('textbox', { name: '시작 시간' }).press('Tab');
  await page.getByRole('textbox', { name: '종료 시간' }).click();
  await page.getByRole('textbox', { name: '종료 시간' }).press('ArrowUp');
  await page.getByRole('textbox', { name: '종료 시간' }).press('ArrowRight');
  await page.getByRole('textbox', { name: '종료 시간' }).fill('17:30');
  await page.getByRole('textbox', { name: '설명' }).click();
  await page.getByLabel('반복 유형').selectOption('monthly');
  await page.getByTestId('event-submit-button').click();

  const eventText = page.getByTestId('month-view').getByText('매달 14일에 반복하는 일정');

  // 첫 번째 요소를 명확하게 지정
  await expect(eventText.first()).toBeVisible();

  await page.getByLabel('Next').click({
    force: true,
  });
  await expect(eventText.first()).toBeVisible();

  await page.getByLabel('Next').click({
    force: true,
  });
  await expect(eventText.first()).toBeVisible();

  await page.getByLabel('Next').click({
    force: true,
  });
  await expect(eventText.first()).toBeVisible();

  await page.getByLabel('Next').click({
    force: true,
  });
  await expect(eventText.first()).toBeVisible();
});
