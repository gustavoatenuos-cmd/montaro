export type CollectionKey = 'couro' | 'aco' | 'casual' | 'presentes';

export type Product = {
  id: string;
  name: string;
  collection: CollectionKey;
  collectionName: string;
  price: string;
  oldPrice?: string;
  pixPrice: string;
  installments: string;
  badge?: string;
  tagline: string;
  description: string;
  image: string;
  featured?: boolean;
  bestseller?: boolean;
  offer?: boolean;
  stock: number;
  style: string;
  strap: string;
  mechanism: string;
  diameter: string;
  color: string;
  specs: string[];
};

export const whatsappNumber = '554384222822';

export const collections = [
  {
    key: 'couro' as const,
    name: 'Couro clássico',
    description: 'Pulseiras em couro, mostradores limpos e presença discreta para rotina executiva.',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=80',
  },
  {
    key: 'aco' as const,
    name: 'Aço sofisticado',
    description: 'Peças com acabamento metálico, peso visual e leitura madura para ocasiões decisivas.',
    image: 'https://images.unsplash.com/photo-1539874754764-5a96559165b0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    key: 'casual' as const,
    name: 'Casual elegante',
    description: 'Relógios versáteis para quem transita bem entre trabalho, jantar e fim de semana.',
    image: 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=1200&q=80',
  },
  {
    key: 'presentes' as const,
    name: 'Presentes masculinos',
    description: 'Curadoria segura para marcar aniversários, conquistas e momentos de reconhecimento.',
    image: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=1200&q=80',
  },
];

export const products: Product[] = [
  {
    id: 'montaro-alden',
    name: 'Montaro Alden',
    collection: 'couro',
    collectionName: 'Couro clássico',
    price: 'R$ 489',
    pixPrice: 'R$ 440,10',
    installments: '10x de R$ 48,90 sem juros',
    badge: '10% no Pix',
    tagline: 'Couro marrom, caixa grafite e presença sem excesso.',
    description: 'Um modelo para homens que preferem elegância silenciosa: combina alfaiataria, camisa social e compromissos importantes sem parecer forçado.',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    bestseller: true,
    stock: 8,
    style: 'Executivo',
    strap: 'Couro legítimo',
    mechanism: 'Quartz',
    diameter: '42 mm',
    color: 'Marrom e grafite',
    specs: ['Pulseira em couro legítimo', 'Caixa 42 mm', 'Vidro mineral reforçado', 'Resistente a respingos'],
  },
  {
    id: 'montaro-cavendish',
    name: 'Montaro Cavendish',
    collection: 'aco',
    collectionName: 'Aço sofisticado',
    price: 'R$ 569',
    oldPrice: 'R$ 629',
    pixPrice: 'R$ 512,10',
    installments: '10x de R$ 56,90 sem juros',
    badge: 'Oferta da semana',
    tagline: 'Aço escovado para uma presença firme e objetiva.',
    description: 'Desenhado para reuniões, eventos e viagens de trabalho, com acabamento sóbrio e uma leitura visual que transmite confiança imediata.',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    bestseller: true,
    offer: true,
    stock: 5,
    style: 'Premium',
    strap: 'Aço inoxidável',
    mechanism: 'Quartz',
    diameter: '43 mm',
    color: 'Prata e azul',
    specs: ['Pulseira em aço inoxidável', 'Caixa 43 mm', 'Fecho dobrável seguro', 'Movimento quartz preciso'],
  },
  {
    id: 'montaro-vale',
    name: 'Montaro Vale',
    collection: 'casual',
    collectionName: 'Casual elegante',
    price: 'R$ 429',
    pixPrice: 'R$ 386,10',
    installments: '10x de R$ 42,90 sem juros',
    badge: 'Mais versátil',
    tagline: 'Versátil, limpo e preparado para dias longos.',
    description: 'Um relógio equilibrado para quem quer sair do escritório direto para um jantar sem trocar de estilo.',
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    stock: 11,
    style: 'Casual',
    strap: 'Aço ajustável',
    mechanism: 'Quartz',
    diameter: '41 mm',
    color: 'Preto e aço',
    specs: ['Pulseira ajustável', 'Mostrador minimalista', 'Caixa 41 mm', 'Conforto para uso diário'],
  },
  {
    id: 'montaro-barrow',
    name: 'Montaro Barrow',
    collection: 'presentes',
    collectionName: 'Presentes masculinos',
    price: 'R$ 529',
    oldPrice: 'R$ 579',
    pixPrice: 'R$ 476,10',
    installments: '10x de R$ 52,90 sem juros',
    badge: 'Kit presente',
    tagline: 'Uma escolha segura para celebrar maturidade e conquista.',
    description: 'Acompanha embalagem premium e comunicação elegante, pensado para presentear sem cair no óbvio.',
    image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    offer: true,
    stock: 6,
    style: 'Presente',
    strap: 'Couro premium',
    mechanism: 'Quartz',
    diameter: '42 mm',
    color: 'Preto e dourado',
    specs: ['Embalagem Montaro', 'Ajuste antes do envio', 'Garantia de funcionamento', 'Cartão de mensagem opcional'],
  },
  {
    id: 'montaro-orion',
    name: 'Montaro Orion',
    collection: 'aco',
    collectionName: 'Aço sofisticado',
    price: 'R$ 649',
    pixPrice: 'R$ 584,10',
    installments: '10x de R$ 64,90 sem juros',
    badge: 'Lançamento',
    tagline: 'Mostrador escuro, acabamento polido e presença noturna.',
    description: 'Criado para ocasiões formais e ambientes executivos onde o detalhe certo faz diferença sem disputar atenção.',
    image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=1200&q=80',
    bestseller: true,
    stock: 4,
    style: 'Premium',
    strap: 'Aço inoxidável',
    mechanism: 'Quartz',
    diameter: '44 mm',
    color: 'Preto e prata',
    specs: ['Mostrador escuro', 'Caixa 44 mm', 'Pulseira em aço', 'Fecho com trava'],
  },
  {
    id: 'montaro-lisbon',
    name: 'Montaro Lisbon',
    collection: 'couro',
    collectionName: 'Couro clássico',
    price: 'R$ 459',
    pixPrice: 'R$ 413,10',
    installments: '10x de R$ 45,90 sem juros',
    tagline: 'Couro preto e mostrador claro para elegância diária.',
    description: 'Uma opção clássica para quem quer uma peça madura, leve e fácil de combinar com camisa, blazer ou malha fina.',
    image: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1200&q=80',
    stock: 9,
    style: 'Executivo',
    strap: 'Couro legítimo',
    mechanism: 'Quartz',
    diameter: '40 mm',
    color: 'Preto e branco',
    specs: ['Perfil fino', 'Caixa 40 mm', 'Pulseira em couro', 'Mostrador de alta leitura'],
  },
];

export function getProduct(id: string) {
  return products.find((product) => product.id === id) ?? products[0];
}

export function buildWhatsappUrl(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
