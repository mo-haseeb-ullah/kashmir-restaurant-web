import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

// Dummy component to consume context in tests
const TestComponent = () => {
  const { cartItems, cartCount, cartTotal, addToCart, removeFromCart, clearCart } = useCart();
  
  return (
    <div>
      <div data-testid="count">{cartCount}</div>
      <div data-testid="total">{cartTotal}</div>
      <button 
        data-testid="add-btn" 
        onClick={() => addToCart({ id: 1, name: 'Karahi', price: 1500 })}
      >
        Add
      </button>
      <button 
        data-testid="remove-btn" 
        onClick={() => removeFromCart(1)}
      >
        Remove
      </button>
      <button 
        data-testid="clear-btn" 
        onClick={clearCart}
      >
        Clear
      </button>
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('provides initial empty cart state', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
  });

  it('allows adding items to the cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    const addBtn = screen.getByTestId('add-btn');
    act(() => {
      addBtn.click();
    });
    
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('total')).toHaveTextContent('1500');
  });

  it('allows removing items from the cart', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    const addBtn = screen.getByTestId('add-btn');
    const removeBtn = screen.getByTestId('remove-btn');
    
    act(() => {
      addBtn.click();
    });
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    
    act(() => {
      removeBtn.click();
    });
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('clears the cart entirely', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    
    const addBtn = screen.getByTestId('add-btn');
    const clearBtn = screen.getByTestId('clear-btn');
    
    act(() => {
      addBtn.click();
      addBtn.click(); // Add twice
    });
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    
    act(() => {
      clearBtn.click();
    });
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
});
