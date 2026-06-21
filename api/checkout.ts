import { createHash } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

const PIX_PRICE = 790;
const CREDIT_CARD_PRICE = 819.04;

type CheckoutRequest = {
  name?: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  businessName?: string;
  siteType?: string;
  objective?: string;
  billingType?: string;
  installmentCount?: number;
  website?: string;
  formStartedAt?: number;
};

type ApiRequest = IncomingMessage & {
  body?: CheckoutRequest;
};

function json(response: ServerResponse, body: unknown, status = 200) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.end(JSON.stringify(body));
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLength)
    : '';
}

function onlyDigits(value: unknown) {
  return cleanText(value, 20).replace(/\D/g, '');
}

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitStore = new Map<string, RateLimitEntry>();

function requestIpKey(request: IncomingMessage) {
  const forwarded = request.headers['x-forwarded-for'];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const ip = value?.split(',')[0]?.trim() || request.socket.remoteAddress || 'unknown';
  return createHash('sha256').update(ip).digest('hex');
}

function isRateLimited(ip: string) {
  const now = Date.now();

  if (rateLimitStore.size > 1_000) {
    for (const [key, entry] of rateLimitStore) {
      if (entry.resetAt <= now) rateLimitStore.delete(key);
    }
  }

  const current = rateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, retryAfter: 0 };
  }

  current.count += 1;
  if (current.count <= RATE_LIMIT_MAX_REQUESTS) {
    return { limited: false, retryAfter: 0 };
  }

  return {
    limited: true,
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

function allowedOrigins() {
  const configured = [
    process.env.SITE_URL,
    ...(process.env.ALLOWED_ORIGINS || '').split(','),
    'https://infraestruturadigital.vercel.app',
  ];

  if (process.env.NODE_ENV !== 'production') {
    configured.push('http://localhost:3000', 'http://127.0.0.1:3000');
  }

  return new Set(configured.filter(Boolean).map((origin) => origin!.replace(/\/$/, '')));
}

export default async function handler(request: ApiRequest, response: ServerResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return json(response, { error: 'Método não permitido.' }, 405);
  }

  const contentType = request.headers['content-type'] || '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return json(response, { error: 'Formato de requisição inválido.' }, 415);
  }

  const contentLength = Number(request.headers['content-length'] || 0);
  if (!Number.isFinite(contentLength) || contentLength > 12_000) {
    return json(response, { error: 'Requisição muito grande.' }, 413);
  }

  const origin = cleanText(request.headers.origin, 300).replace(/\/$/, '');
  if (!origin || !allowedOrigins().has(origin)) {
    return json(response, { error: 'Origem da requisição não autorizada.' }, 403);
  }

  const fetchSite = cleanText(request.headers['sec-fetch-site'], 30);
  if (fetchSite && fetchSite !== 'same-origin') {
    return json(response, { error: 'Requisição não autorizada.' }, 403);
  }

  const rateLimit = isRateLimited(requestIpKey(request));
  if (rateLimit.limited) {
    response.setHeader('Retry-After', String(rateLimit.retryAfter));
    return json(response, { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }, 429);
  }

  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) {
    return json(response, { error: 'O pagamento ainda não foi configurado.' }, 503);
  }

  const input = request.body;
  if (!input || typeof input !== 'object') {
    return json(response, { error: 'Dados inválidos.' }, 400);
  }

  if (cleanText(input.website, 200)) {
    return json(response, { error: 'Não foi possível processar a solicitação.' }, 400);
  }

  const formStartedAt = typeof input.formStartedAt === 'number' ? input.formStartedAt : 0;
  const formAge = Date.now() - formStartedAt;
  if (!formStartedAt || formAge < 1_000 || formAge > 2 * 60 * 60 * 1000) {
    return json(response, { error: 'Atualize a página e tente novamente.' }, 400);
  }

  if (JSON.stringify(input).length > 10_000) {
    return json(response, { error: 'Dados inválidos.' }, 400);
  }

  const name = cleanText(input.name, 100);
  const email = cleanText(input.email, 150);
  const phone = onlyDigits(input.phone);
  const cpfCnpj = onlyDigits(input.cpfCnpj);
  const postalCode = onlyDigits(input.postalCode);
  const address = cleanText(input.address, 150);
  const addressNumber = cleanText(input.addressNumber, 20);
  const complement = cleanText(input.complement, 80);
  const province = cleanText(input.province, 80);
  const businessName = cleanText(input.businessName, 120);
  const siteType = cleanText(input.siteType, 80);
  const objective = cleanText(input.objective, 500);
  const billingType = input.billingType === 'CREDIT_CARD' || input.billingType === 'PIX'
    ? input.billingType
    : '';
  const installmentCount = billingType === 'CREDIT_CARD' && Number.isInteger(input.installmentCount)
    ? Number(input.installmentCount)
    : 1;
  const allowedSiteTypes = new Set([
    'Landing page',
    'Site institucional',
    'Loja virtual',
    'Produto digital ou sistema',
    'Ainda não sei',
  ]);

  if (!name || !email || !address || !addressNumber || !province || !businessName || !siteType || !objective || !billingType) {
    return json(response, { error: 'Preencha todos os campos obrigatórios.' }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json(response, { error: 'Informe um e-mail válido.' }, 400);
  }

  if (!allowedSiteTypes.has(siteType)) {
    return json(response, { error: 'Selecione um tipo de projeto válido.' }, 400);
  }

  if (installmentCount < 1 || installmentCount > 3) {
    return json(response, { error: 'Selecione um parcelamento válido entre 1 e 3 vezes.' }, 400);
  }

  if (postalCode.length !== 8) {
    return json(response, { error: 'Informe um CEP válido.' }, 400);
  }

  if (![11, 14].includes(cpfCnpj.length)) {
    return json(response, { error: 'Informe um CPF ou CNPJ válido.' }, 400);
  }

  if (phone.length < 10 || phone.length > 11) {
    return json(response, { error: 'Informe um telefone válido com DDD.' }, 400);
  }

  const siteUrl = (process.env.SITE_URL || 'https://infraestruturadigital.vercel.app').replace(/\/$/, '');
  const isProductionKey = apiKey.startsWith('$aact_prod_');
  const apiUrl = (process.env.ASAAS_API_URL
    || (isProductionKey ? 'https://api.asaas.com/v3' : 'https://api-sandbox.asaas.com/v3'))
    .replace(/\/$/, '');
  const checkoutBaseUrl = process.env.ASAAS_CHECKOUT_URL
    || (!isProductionKey && apiUrl.includes('sandbox')
      ? 'https://sandbox.asaas.com/checkoutSession/show'
      : 'https://asaas.com/checkoutSession/show');
  const checkoutValue = billingType === 'CREDIT_CARD' ? CREDIT_CARD_PRICE : PIX_PRICE;

  let asaasResponse: Response;
  try {
    asaasResponse = await fetch(`${apiUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_token: apiKey,
        'User-Agent': 'Estrutura Digital Checkout',
      },
      signal: AbortSignal.timeout(12_000),
      body: JSON.stringify({
      billingTypes: [billingType],
      chargeTypes: billingType === 'CREDIT_CARD' && installmentCount > 1
        ? ['DETACHED', 'INSTALLMENT']
        : ['DETACHED'],
      minutesToExpire: 120,
      callback: {
        successUrl: `${siteUrl}/?pagamento=sucesso#contato`,
        cancelUrl: `${siteUrl}/?pagamento=cancelado#contato`,
        expiredUrl: `${siteUrl}/?pagamento=expirado#contato`,
      },
      items: [
        {
          name: 'Entrada do projeto digital',
          description: `${siteType} para ${businessName}: ${objective}`,
          quantity: 1,
          value: checkoutValue,
        },
      ],
      ...(billingType === 'CREDIT_CARD' && {
        installment: {
          maxInstallmentCount: installmentCount,
        },
      }),
      customerData: {
        name,
        cpfCnpj,
        email,
        phone,
        postalCode,
        address,
        addressNumber,
        complement,
        province,
      },
      }),
    });
  } catch {
    return json(response, { error: 'O serviço de pagamento não respondeu. Tente novamente em instantes.' }, 504);
  }

  const data = await asaasResponse.json() as {
    id?: string;
    errors?: Array<{ description?: string }>;
  };

  if (!asaasResponse.ok || !data.id) {
    const knownValidationError = asaasResponse.status >= 400 && asaasResponse.status < 500
      ? data.errors?.[0]?.description
      : '';
    const message = knownValidationError || 'Não foi possível criar o checkout. Tente novamente.';
    return json(response, { error: message }, asaasResponse.status >= 400 ? asaasResponse.status : 502);
  }

  return json(response, {
    checkoutUrl: `${checkoutBaseUrl}?id=${encodeURIComponent(data.id)}`,
  });
}
