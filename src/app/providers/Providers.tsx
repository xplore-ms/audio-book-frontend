import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { queryClient } from '../queryClient';
import { UserProvider } from '../../context/UserContext';
import { BackendProvider } from '../../context/BackendContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <BackendProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </BackendProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
