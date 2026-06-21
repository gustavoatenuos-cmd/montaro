import type { IncomingMessage, ServerResponse } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';

import handler from './checkout';

type CapturedResponse = {
  body: unknown;
  headers: Record<string, string>;
  status: number;
};

function createResponse() {
  const captured: CapturedResponse = {
    body: undefined,
    headers: {},
    status: 200,
  };

  const response = {
    statusCode: 200,
    setHeader(name: string, value: string) {
      captured.headers[name.toLowerCase()] = String(value);
    },
    end(body: string) {
      captured.status = this.statusCode;
      captured.body = JSON.parse(body);
    },
  } as unknown as ServerResponse;

  return { captured, response };
}

function createRequest(overrides: Partial<IncomingMessage> & { body?: Record<string, unknown> } = {}) {
  const body = overrides.body || {};
  const { headers: overrideHeaders, body: _body, ...requestOverrides } = overrides;

  return {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'content-length': String(JSON.stringify(body).length),
      origin: 'https://infraestruturadigital.vercel.app',
      'sec-fetch-site': 'same-origin',
      'x-forwarded-for': `203.0.113.${Math.floor(Math.random() * 200) + 1}`,
      ...overrideHeaders,
    },
    socket: { remoteAddress: '203.0.113.10' },
    body,
    ...requestOverrides,
  } as unknown as IncomingMessage & { body?: Record<string, unknown> };
}

const validBody = {
  name: 'Ana Silva',
  email: 'ana@example.com',
  phone: '43999999999',
  cpfCnpj: '12345678909',
  postalCode: '86000000',
  address: 'Rua das Flores',
  addressNumber: '123',
  complement: '',
  province: 'Centro',
  businessName: 'Clínica Essencial',
  siteType: 'Site institucional',
  objective: 'Apresentar serviços e captar contatos',
  billingType: 'PIX',
  installmentCount: 1,
  website: '',
  formStartedAt: Date.now() - 2_000,
};

describe('secure checkout API', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('rejects requests from an external origin before processing customer data', async () => {
    const { captured, response } = createResponse();
    const request = createRequest({
      body: validBody,
      headers: { origin: 'https://example.com' },
    });

    await handler(request, response);

    expect(captured.status).toBe(403);
    expect(captured.body).toEqual({ error: 'Origem da requisição não autorizada.' });
    expect(captured.headers['cache-control']).toBe('no-store');
  });

  it('silently blocks bot submissions that fill the honeypot', async () => {
    vi.stubEnv('ASAAS_API_KEY', '$aact_prod_test');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { captured, response } = createResponse();
    const request = createRequest({
      body: { ...validBody, website: 'https://spam.example' },
    });

    await handler(request, response);

    expect(captured.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('sends only identification data to the hosted Asaas checkout', async () => {
    vi.stubEnv('ASAAS_API_KEY', '$aact_prod_test');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      id: 'checkout_secure',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    const { captured, response } = createResponse();

    await handler(createRequest({ body: validBody }), response);

    const asaasPayload = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));
    expect(asaasPayload.customerData).toEqual(expect.objectContaining({
      name: 'Ana Silva',
      cpfCnpj: '12345678909',
      postalCode: '86000000',
    }));
    expect(asaasPayload).not.toHaveProperty('creditCard');
    expect(captured.status).toBe(200);
    expect(captured.body).toEqual({
      checkoutUrl: 'https://asaas.com/checkoutSession/show?id=checkout_secure',
    });
  });

  it('limits a card checkout to the installment option selected by the customer', async () => {
    vi.stubEnv('ASAAS_API_KEY', '$aact_prod_test');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      id: 'checkout_installments',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    const { response } = createResponse();

    await handler(createRequest({
      body: {
        ...validBody,
        billingType: 'CREDIT_CARD',
        installmentCount: 3,
      },
    }), response);

    const asaasPayload = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));
    expect(asaasPayload.chargeTypes).toEqual(['DETACHED', 'INSTALLMENT']);
    expect(asaasPayload.installment).toEqual({ maxInstallmentCount: 3 });
    expect(asaasPayload.items[0].value).toBe(819.04);
  });

  it('rejects card installments above three', async () => {
    vi.stubEnv('ASAAS_API_KEY', '$aact_prod_test');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { captured, response } = createResponse();

    await handler(createRequest({
      body: {
        ...validBody,
        billingType: 'CREDIT_CARD',
        installmentCount: 4,
      },
    }), response);

    expect(captured.status).toBe(400);
    expect(captured.body).toEqual({
      error: 'Selecione um parcelamento válido entre 1 e 3 vezes.',
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
