import { render, screen } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios');
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />,
  Doughnut: () => <div data-testid="doughnut-chart" />,
  Line: () => <div data-testid="line-chart" />,
  Scatter: () => <div data-testid="scatter-chart" />,
}));

test('renders dashboard title', async () => {
  axios.get.mockResolvedValue({ data: [] });

  render(<App />);
  const heading = await screen.findByRole('heading', {
    name: /operations dashboard/i,
  });

  expect(heading).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /forecasting/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /slic trainer/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /import center/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /trailer cube/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /ai companion/i })).toBeInTheDocument();
});
