import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../../components/theme-provider';
import { AuthProvider } from '../auth';

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>{ui}</ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
