import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthModal from './AuthModal';
import { AuthProvider } from '../context/AuthContext';

// Mock the AuthContext partially for easy testing
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      isAuthModalOpen: true, // Force it open for the test
      setIsAuthModalOpen: vi.fn(),
      login: vi.fn().mockResolvedValue(true),
      register: vi.fn().mockResolvedValue(true),
    })
  };
});

describe('AuthModal Component', () => {
  it('renders the AuthModal correctly when open', () => {
    render(<AuthModal />);
    
    // Check if the title is present (default is Login mode)
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    
    // Check if phone and password inputs are present
    expect(screen.getByPlaceholderText(/0300 1234567/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
  });

  it('switches between Login and Register modes', () => {
    render(<AuthModal />);
    
    // Initial state should be Login mode
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    
    // Click the toggle button
    const toggleBtn = screen.getByText(/Sign Up Now/i);
    fireEvent.click(toggleBtn);
    
    // Should switch to Register mode
    expect(screen.getByText(/Join the Family/i)).toBeInTheDocument();
    // Name input should now be visible
    expect(screen.getByPlaceholderText(/John Doe/i)).toBeInTheDocument();
  });

  it('contains the Google Login button', () => {
    render(<AuthModal />);
    expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
  });
});
