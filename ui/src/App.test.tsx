import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders OpsTracker brand', () => {
  render(<App />);
  const brand = screen.getByText(/OpsTracker/i);
  expect(brand).toBeInTheDocument();
});

test('renders navigation items', () => {
  render(<App />);
  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Work Orders/i)).toBeInTheDocument();
  expect(screen.getByText(/Employees/i)).toBeInTheDocument();
});
