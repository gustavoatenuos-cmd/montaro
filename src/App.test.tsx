import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import App from './App';

describe('Montaro premium watch site', () => {
  it('renders a premium home with story, collections and trust proof', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /relógios masculinos com presença/i })).toBeInTheDocument();
    expect(screen.getByText(/relógios para homens que valorizam elegância/i)).toBeInTheDocument();
    expect(screen.getByText(/um bom relógio não grita/i)).toBeInTheDocument();
    expect(screen.getAllByText('Couro clássico').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Aço sofisticado').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Casual elegante').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Presentes masculinos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Envio rastreado').length).toBeGreaterThan(0);
    expect(screen.getByText('Garantia de funcionamento')).toBeInTheDocument();
    expect(screen.getByText(/até 10x sem juros/i)).toBeInTheDocument();
    expect(screen.getAllByText(/10% no Pix/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /relógios com maior saída/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /condições especiais/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /whatsapp|falar com consultor|chamar no whatsapp/i })[0]).toHaveAttribute('href', expect.stringContaining('wa.me'));
  });

  it('navigates to collection, product detail and cart checkout', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /comprar coleção/i }));
    expect(screen.getByRole('heading', { level: 1, name: /relógios masculinos selecionados/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Filtrar' })).toBeInTheDocument();
    expect(screen.getByText('6 modelos')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: 'Montaro Alden' }).length).toBeGreaterThan(0);

    await user.click(screen.getAllByRole('button', { name: /ver montaro cavendish/i })[0]);
    expect(screen.getByRole('heading', { level: 1, name: 'Montaro Cavendish' })).toBeInTheDocument();
    expect(screen.getByText(/aço escovado/i)).toBeInTheDocument();
    expect(screen.getByText(/10x de R\$ 56,90 sem juros/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /adicionar à sacola/i }));
    expect(screen.getByRole('button', { name: /sacola com 1 itens/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /finalizar pelo whatsapp/i })).toHaveAttribute('href', expect.stringContaining('Montaro%20Cavendish'));
    expect(screen.getByRole('link', { name: /comprar pelo whatsapp/i })).toHaveAttribute('href', expect.stringContaining('Montaro%20Cavendish'));
  });

  it('has about and contact pages with human support positioning', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Sobre' }));
    expect(screen.getByRole('heading', { level: 1, name: /elegância madura/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Curadoria' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Contato' }));
    expect(screen.getByRole('heading', { level: 1, name: /escolha com calma/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /iniciar conversa/i })).toHaveAttribute('href', expect.stringContaining('wa.me'));
    expect(screen.getByText(/sem catálogo infinito/i)).toBeInTheDocument();
  });
});
