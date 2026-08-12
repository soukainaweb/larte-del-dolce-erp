import { describe, expect, it } from 'vitest';
import { normalizeOrder } from './orderService';

describe('normalizeOrder product images', () => {
  it('maps nested product image URLs onto order line items', () => {
    const normalized = normalizeOrder({
      id: 1,
      order_number: 'ORD-001',
      total_amount: 200,
      items: [
        {
          quantity: 2,
          subtotal: 200,
          product: {
            name: 'كيك',
            image: 'https://example.test/storage/products/cake.jpg',
          },
        },
      ],
    });

    expect(normalized.products[0].name).toBe('كيك');
    expect(normalized.products[0].image).toBe('https://example.test/storage/products/cake.jpg');
  });
});
