import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AlimentosPage } from './AlimentosPage';
import { BrowserRouter } from 'react-router-dom';

describe('AlimentosPage', () => {
  it('deve renderizar sem quebrar', () => {
    const { container } = render(
      <BrowserRouter>
        <AlimentosPage />
      </BrowserRouter>
    );
    expect(container).toBeTruthy();
  });
});
