import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Operations Tracker header', () => {
  render(<App />);
  const heading = screen.getByText(/Operations Tracker/i);
  expect(heading).toBeInTheDocument();
});

test('renders navigation buttons', () => {
  render(<App />);
  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Work Orders/i)).toBeInTheDocument();
  expect(screen.getByText(/Employees/i)).toBeInTheDocument();
});
