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
});
