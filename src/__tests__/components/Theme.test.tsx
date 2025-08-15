import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ThemeSelector } from '@/components/ui/theme-selector';

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    themes: ['light', 'dark', 'system'],
  }),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {component}
    </ThemeProvider>
  );
};

describe('Theme Components', () => {
  describe('ThemeToggle', () => {
    it('renders theme toggle button', () => {
      renderWithTheme(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('title');
    });

    it('toggles theme when clicked', () => {
      renderWithTheme(<ThemeToggle />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Should not throw any errors
      expect(button).toBeInTheDocument();
    });
  });

  describe('ThemeSelector', () => {
    it('renders theme selector dropdown', () => {
      renderWithTheme(<ThemeSelector />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Light');
    });

    it('opens dropdown when clicked', () => {
      renderWithTheme(<ThemeSelector />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Should show theme options
      expect(screen.getByText('system')).toBeInTheDocument();
      expect(screen.getByText('dark')).toBeInTheDocument();
    });
  });
});
