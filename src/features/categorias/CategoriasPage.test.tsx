import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CategoriasPage } from './CategoriasPage';
import { BrowserRouter } from 'react-router-dom';

describe('CategoriasPage', () => {
  it('deve renderizar sem quebrar', () => {
    const { container } = render(
      <BrowserRouter>
        <CategoriasPage />
      </BrowserRouter>
    );
    expect(container).toBeTruthy();
  });
});
