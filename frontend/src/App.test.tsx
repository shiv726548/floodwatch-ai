import { render, screen } from '@testing-library/react';
import App from './App';

describe('FloodWatch AI app shell', () => {
  it('renders the product header', () => {
    render(<App />);
    expect(screen.getByText(/FloodWatch AI/i)).toBeTruthy();
  });

  it('renders the simulated banner', async () => {
    render(<App />);
    expect(screen.getByText(/Simulated demo data/i)).toBeTruthy();
  });
});
