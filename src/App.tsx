import {
  ArrowRight,
  BadgeCheck,
  Check,
  CreditCard,
  LockKeyhole,
  Menu,
  MessageCircle,
  PackageCheck,
  Percent,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  UserRoundCheck,
} from 'lucide-react';
import { useState } from 'react';
import { buildWhatsappUrl, collections, getProduct, products, type Product } from './data/products';

type Page = 'home' | 'collection' | 'about' | 'contact' | 'product';

type CartItem = {
  product: Product;
  quantity: number;
};

const trustItems = [
  { icon: Truck, title: 'Envio rastreado', text: 'Acompanhamento claro do pedido até a entrega.' },
  { icon: BadgeCheck, title: 'Garantia de funcionamento', text: 'Peça conferida antes do envio e suporte após a compra.' },
  { icon: LockKeyhole, title: 'Compra segura', text: 'Atendimento e confirmação sem etapas confusas.' },
  { icon: UserRoundCheck, title: 'Atendimento humano', text: 'Conversa direta para escolher com calma.' },
] as const;

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function SectionHeading({ eyebrow, title, text, light = false }: {
  eyebrow: string;
  title: string;
  text?: string;
  light?: boolean;
}) {
  return (
    <div className={`section-heading${light ? ' section-heading--light' : ''}`}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {text && <p>{text}</p>}
    </div>
  );
}

function WhatsAppButton({ label, message, tone = 'gold' }: { label: string; message: string; tone?: 'gold' | 'dark' | 'ghost' }) {
  return (
    <a className={`button button--${tone}`} href={buildWhatsappUrl(message)} target="_blank" rel="noreferrer">
      <MessageCircle aria-hidden="true" />
      {label}
    </a>
  );
}

function ProductCard({ product, onOpen, onAdd }: {
  product: Product;
  onOpen: (product: Product) => void;
  onAdd: (product: Product) => void;
  key?: string;
}) {
  return (
    <article className="product-card">
      <button type="button" className="product-card__image" onClick={() => onOpen(product)} aria-label={`Ver ${product.name}`}>
        {product.badge && <span className="product-card__badge">{product.badge}</span>}
        <img src={product.image} alt={product.name} />
      </button>
      <div className="product-card__body">
        <span>{product.collectionName}</span>
        <h3>{product.name}</h3>
        <p>{product.tagline}</p>
        <div className="product-price">
          {product.oldPrice && <del>{product.oldPrice}</del>}
          <strong>{product.price}</strong>
          <small>{product.pixPrice} no Pix</small>
          <em>{product.installments}</em>
        </div>
        <div className="product-card__actions">
          <button type="button" onClick={() => onOpen(product)}>
            Detalhes <ArrowRight aria-hidden="true" />
          </button>
          <button type="button" className="add-button" onClick={() => onAdd(product)}>
            <ShoppingBag aria-hidden="true" />
            Adicionar
          </button>
        </div>
      </div>
    </article>
  );
}

function Header({ page, cartCount, onNavigate }: { page: Page; cartCount: number; onNavigate: (page: Page) => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const goTo = (nextPage: Page) => {
    setIsMenuOpen(false);
    onNavigate(nextPage);
  };

  return (
    <>
      <div className="commerce-topbar" aria-label="Condições comerciais">
        <span><Truck aria-hidden="true" /> Envio rastreado</span>
        <span><CreditCard aria-hidden="true" /> 10x sem juros</span>
        <span><Percent aria-hidden="true" /> 10% no Pix</span>
        <span><UserRoundCheck aria-hidden="true" /> Atendimento</span>
      </div>
      <header className="site-header">
        <button className="brand" type="button" onClick={() => goTo('home')} aria-label="Ir para a Home Montaro">
          <img src="/brand/montaro-symbol.png" alt="" />
          <span className="brand__text">
            <strong>Montaro</strong>
            <small>Relógios masculinos</small>
          </span>
        </button>
        <nav className="site-nav" aria-label="Navegação principal">
          {[
            ['home', 'Início'],
            ['collection', 'Relógios'],
            ['collection', 'Couro'],
            ['collection', 'Aço'],
            ['collection', 'Ofertas'],
            ['about', 'Sobre'],
            ['contact', 'Contato'],
          ].map(([key, label]) => (
            <button key={`${key}-${label}`} type="button" className={page === key ? 'is-active' : ''} onClick={() => goTo(key as Page)}>
              {label}
            </button>
          ))}
        </nav>
        <button className="search-pill" type="button" onClick={() => goTo('collection')} aria-label="Buscar relógios">
          <Search aria-hidden="true" />
          <span>Buscar modelo</span>
        </button>
        <button className="cart-pill" type="button" onClick={() => goTo('collection')} aria-label={`Sacola com ${cartCount} itens`}>
          <ShoppingBag aria-hidden="true" />
          <span>{cartCount}</span>
        </button>
        <WhatsAppButton label="WhatsApp" tone="ghost" message="Olá, Montaro. Gostaria de escolher um relógio masculino." />
        <button
          className="menu-button"
          type="button"
          aria-label="Menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          <Menu aria-hidden="true" />
        </button>
        {isMenuOpen && (
          <div className="mobile-panel">
            <button type="button" onClick={() => goTo('home')}>Início</button>
            <button type="button" onClick={() => goTo('collection')}>Relógios</button>
            <button type="button" onClick={() => goTo('collection')}>Ofertas</button>
            <button type="button" onClick={() => goTo('about')}>Sobre</button>
            <button type="button" onClick={() => goTo('contact')}>Contato</button>
            <WhatsAppButton label="Falar no WhatsApp" tone="gold" message="Olá, Montaro. Quero conhecer os relógios disponíveis." />
          </div>
        )}
      </header>
    </>
  );
}

function HomePage({ onNavigate, onOpenProduct, onAddProduct }: {
  onNavigate: (page: Page) => void;
  onOpenProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
}) {
  const heroProduct = products[1];
  const quickProducts = products.filter((product) => product.bestseller).slice(0, 3);
  const shelfProducts = products.filter((product) => product.bestseller || product.featured).slice(0, 6);

  return (
    <>
      <section className="hero">
        <div className="hero__media" aria-hidden="true">
          <img src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1800&q=82" alt="" />
        </div>
        <div className="hero__content">
          <img className="hero__wordmark" src="/brand/montaro-wordmark.png" alt="Montaro" />
          <p className="eyebrow">Loja oficial | Premium acessível</p>
          <h1>
            <span>Relógios masculinos</span>
            <span>com presença,</span>
            <span>preço claro e</span>
            <span>compra assistida.</span>
          </h1>
          <p>Relógios para homens que valorizam elegância, maturidade e confiança em cada detalhe.</p>
          <div className="hero__actions">
            <button className="button button--gold" type="button" onClick={() => onNavigate('collection')}>
              Comprar relógios <ArrowRight aria-hidden="true" />
            </button>
            <WhatsAppButton tone="ghost" label="Falar com consultor" message="Olá, Montaro. Quero conhecer a coleção de relógios." />
          </div>
          <div className="hero__category-strip" aria-label="Categorias rápidas">
            {collections.map((collection) => (
              <button key={collection.key} type="button" onClick={() => onNavigate('collection')}>
                {collection.name}
              </button>
            ))}
          </div>
        </div>
        <div className="hero__commerce" aria-label="Vitrine principal">
          <article className="hero__deal">
            <span>{heroProduct.badge}</span>
            <img src={heroProduct.image} alt={heroProduct.name} />
            <div>
              <small>Destaque da semana</small>
              <h2>{heroProduct.name}</h2>
              <p>{heroProduct.tagline}</p>
              <strong>{heroProduct.price}</strong>
              <em>{heroProduct.pixPrice} no Pix</em>
              <button type="button" onClick={() => onOpenProduct(heroProduct)}>
                Ver produto <ArrowRight aria-hidden="true" />
              </button>
            </div>
          </article>
          <div className="hero__mini-grid">
            {quickProducts.map((product) => (
              <button key={product.id} type="button" onClick={() => onOpenProduct(product)}>
                <img src={product.image} alt="" />
                <span>{product.collectionName}</span>
                <strong>{product.name}</strong>
                <small>{product.price}</small>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="store-benefits" aria-label="Benefícios de compra">
        <span><Truck aria-hidden="true" /> Envio rastreado</span>
        <span><CreditCard aria-hidden="true" /> Até 10x sem juros</span>
        <span><Percent aria-hidden="true" /> 10% no Pix</span>
        <span><ShieldCheck aria-hidden="true" /> Compra assistida</span>
      </section>

      <section className="storefront" aria-label="Vitrine de compra Montaro">
        <div className="storefront__bar">
          <div>
            <p className="eyebrow">Loja Montaro</p>
            <h2>Compre por estilo, acabamento ou ocasião.</h2>
          </div>
          <button className="store-search" type="button" onClick={() => onNavigate('collection')}>
            <Search aria-hidden="true" />
            <span>Buscar por couro, aço, presente...</span>
          </button>
        </div>

        <div className="storefront__layout">
          <aside className="storefront__filters" aria-label="Filtros rápidos">
            <strong>Comprar por</strong>
            {collections.map((collection) => (
              <button key={collection.key} type="button" onClick={() => onNavigate('collection')}>
                {collection.name}
              </button>
            ))}
            <strong>Condição</strong>
            <button type="button" onClick={() => onNavigate('collection')}>Ofertas da semana</button>
            <button type="button" onClick={() => onNavigate('collection')}>Mais vendidos</button>
            <button type="button" onClick={() => onNavigate('collection')}>Até R$ 500</button>
          </aside>

          <div className="storefront__products">
            <div className="shelf-heading">
              <div>
                <span>{products.length} modelos curados</span>
                <h3>Prateleira principal</h3>
              </div>
              <button type="button" onClick={() => onNavigate('collection')}>
                Ver todos <ArrowRight aria-hidden="true" />
              </button>
            </div>
            <div className="product-grid product-grid--storefront">
              {shelfProducts.map((product) => (
                <ProductCard key={product.id} product={product} onOpen={onOpenProduct} onAdd={onAddProduct} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="collections">
        <SectionHeading
          eyebrow="Coleções principais"
          title="Poucos modelos. Escolhas mais seguras."
          text="A coleção foi pensada para evitar excesso: cada linha resolve uma intenção de estilo."
        />
        <div className="collection-grid">
          {collections.map((collection) => (
            <button key={collection.key} type="button" className="collection-card" onClick={() => onNavigate('collection')}>
              <img src={collection.image} alt="" />
              <span>{collection.name}</span>
              <p>{collection.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="offers">
        <SectionHeading
          eyebrow="Ofertas da semana"
          title="Condições especiais sem empurrar excesso."
          text="Poucos modelos com desconto real e compra orientada pelo WhatsApp."
        />
        <div className="offer-grid">
          {products.filter((product) => product.offer).map((product) => (
            <article key={product.id} className="offer-card">
              <img src={product.image} alt={product.name} />
              <div>
                <span>{product.badge}</span>
                <h3>{product.name}</h3>
                <p>{product.tagline}</p>
                <strong>{product.price}</strong>
                <small>{product.pixPrice} no Pix ou {product.installments}</small>
                <button type="button" onClick={() => onOpenProduct(product)}>
                  Ver oferta <ArrowRight aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="story">
        <div>
          <p className="eyebrow">Postura antes da palavra</p>
          <h2>Um bom relógio não grita. Ele comunica postura, história e bom gosto antes mesmo da primeira palavra.</h2>
        </div>
        <p>
          A Montaro nasce para homens que já passaram da fase de provar tudo para todos. Nossa curadoria privilegia modelos sóbrios, versáteis e bem acabados, feitos para acompanhar trabalho, família, encontros e conquistas com naturalidade.
        </p>
      </section>

      <TrustSection />
      <FinalCta onNavigate={onNavigate} />
    </>
  );
}

function CollectionPage({ onOpenProduct, onAddProduct }: {
  onOpenProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
}) {
  return (
    <main className="page">
      <section className="page-hero page-hero--collection">
        <p className="eyebrow">Loja Montaro</p>
        <h1>Relógios masculinos selecionados.</h1>
        <p>Categoria enxuta com filtros essenciais: estilo, pulseira, preço e ocasião. Sem catálogo infinito.</p>
      </section>
      <section className="catalog">
        <div className="catalog__aside">
          <h2>Filtrar</h2>
          <strong>Estilo</strong>
          {collections.map((collection) => (
            <a key={collection.key} href={`#${collection.key}`}>{collection.name}</a>
          ))}
          <strong>Pulseira</strong>
          <a href="#couro">Couro legítimo</a>
          <a href="#aco">Aço inoxidável</a>
          <strong>Faixa de preço</strong>
          <a href="#produtos">Até R$ 500</a>
          <a href="#produtos">R$ 500 a R$ 700</a>
        </div>
        <div className="catalog__list">
          <div id="produtos" className="catalog-toolbar">
            <div>
              <span>{products.length} modelos</span>
              <strong>Ordenado por curadoria Montaro</strong>
            </div>
            <WhatsAppButton tone="ghost" label="Ajuda para escolher" message="Olá, Montaro. Quero ajuda para escolher um relógio." />
          </div>
          <div className="product-grid product-grid--shop">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onOpen={onOpenProduct} onAdd={onAddProduct} />
            ))}
          </div>
          {collections.map((collection) => (
            <div id={collection.key} key={collection.key} className="catalog__group">
              <SectionHeading eyebrow="Linha" title={collection.name} text={collection.description} />
              <div className="product-grid product-grid--light">
                {products.filter((product) => product.collection === collection.key).map((product) => (
                  <ProductCard key={product.id} product={product} onOpen={onOpenProduct} onAdd={onAddProduct} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function ProductPage({ product, onAddProduct }: { product: Product; onAddProduct: (product: Product) => void }) {
  return (
    <main className="product-page">
      <section className="product-detail">
        <div className="product-detail__image">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-detail__copy">
          <p className="eyebrow">{product.collectionName}</p>
          <h1>{product.name}</h1>
          <p className="product-detail__tagline">{product.tagline}</p>
          <div className="product-detail__commerce">
            {product.oldPrice && <del>{product.oldPrice}</del>}
            <strong className="product-detail__price">{product.price}</strong>
            <span>{product.pixPrice} no Pix</span>
            <small>{product.installments}</small>
          </div>
          <p>{product.description}</p>
          <div className="product-meta">
            <span><Star aria-hidden="true" /> {product.style}</span>
            <span>{product.diameter}</span>
            <span><PackageCheck aria-hidden="true" /> {product.stock} em estoque</span>
          </div>
          <ul>
            {product.specs.map((spec) => <li key={spec}><Check aria-hidden="true" /> {spec}</li>)}
          </ul>
          <button type="button" className="button button--gold" onClick={() => onAddProduct(product)}>
            <ShoppingBag aria-hidden="true" />
            Adicionar à sacola
          </button>
          <WhatsAppButton
            tone="ghost"
            label="Comprar pelo WhatsApp"
            message={`Olá, Montaro. Tenho interesse no ${product.name}. Pode me orientar?`}
          />
        </div>
      </section>
    </main>
  );
}

function AboutPage() {
  return (
    <main className="page">
      <section className="about-hero">
        <div>
          <p className="eyebrow">Sobre a Montaro</p>
          <h1>Elegância madura, sem exagero e sem promessa vazia.</h1>
          <p>
            A Montaro foi construída para ocupar um espaço claro: relógios masculinos premium acessíveis, com curadoria cuidadosa, atendimento humano e visual confiável para homens que preferem consistência a ostentação.
          </p>
        </div>
        <img src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1300&q=80" alt="Homem ajustando relógio em ambiente executivo" />
      </section>
      <section className="values">
        {[
          ['Curadoria', 'Não vendemos dezenas de opções parecidas. Selecionamos modelos que realmente conversam com maturidade, trabalho e presença.'],
          ['Confiança', 'Cada compra deve ser simples de entender, acompanhar e resolver com uma pessoa real do outro lado.'],
          ['Storytelling', 'Um relógio carrega memória, postura e intenção. A Montaro trata esse acessório com o respeito que ele merece.'],
        ].map(([title, text]) => (
          <article key={title}>
            <Sparkles aria-hidden="true" />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

function ContactPage() {
  return (
    <main className="page">
      <section className="contact-page">
        <div>
          <p className="eyebrow">Contato</p>
          <h1>Escolha com calma. Fale com uma pessoa.</h1>
          <p>
            Conte o estilo que procura, a ocasião e sua preferência entre couro, aço ou casual elegante. A Montaro responde pelo WhatsApp com orientação objetiva.
          </p>
          <div className="contact-actions">
            <WhatsAppButton label="Iniciar conversa" message="Olá, Montaro. Gostaria de ajuda para escolher um relógio." />
            <a href="mailto:contato@montaro.com.br">contato@montaro.com.br</a>
          </div>
        </div>
        <div className="contact-panel">
          <ShieldCheck aria-hidden="true" />
          <h2>Atendimento humano</h2>
          <p>Sem catálogo infinito, sem urgência artificial e sem aparência genérica. A orientação parte do seu uso real.</p>
        </div>
      </section>
    </main>
  );
}

function TrustSection() {
  return (
    <section className="trust">
      {trustItems.map((item) => {
        const Icon = item.icon;
        return (
          <article key={item.title}>
            <Icon aria-hidden="true" />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        );
      })}
    </section>
  );
}

function FinalCta({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <section className="final-cta">
      <PackageCheck aria-hidden="true" />
      <h2>Pronto para escolher um relógio com presença?</h2>
      <p>A coleção Montaro foi feita para homens que valorizam tempo, postura e bom gosto.</p>
      <div>
        <button type="button" className="button button--dark" onClick={() => onNavigate('collection')}>
          Ver coleção <ArrowRight aria-hidden="true" />
        </button>
        <WhatsAppButton tone="gold" label="Chamar no WhatsApp" message="Olá, Montaro. Quero conhecer os modelos disponíveis." />
      </div>
    </section>
  );
}

function CartSummary({ items }: { items: CartItem[] }) {
  if (items.length === 0) {
    return null;
  }

  const message = items
    .map((item) => `${item.quantity}x ${item.product.name} - ${item.product.price}`)
    .join('\n');

  return (
    <aside className="cart-summary cart-summary--active">
      <div>
        <strong>Sacola Montaro</strong>
        <span>{items.reduce((sum, item) => sum + item.quantity, 0)} item(ns)</span>
      </div>
      {items.map((item) => (
        <p key={item.product.id}>
          {item.quantity}x {item.product.name}
          <small>{item.product.price}</small>
        </p>
      ))}
      <WhatsAppButton
        label="Finalizar pelo WhatsApp"
        message={`Olá, Montaro. Quero finalizar este pedido:\n${message}`}
      />
    </aside>
  );
}

export default function App() {
  const [page, setPage] = useStateFromHash();
  const [activeProductId, setActiveProductId] = useStateProduct();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const activeProduct = getProduct(activeProductId);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navigate = (nextPage: Page) => {
    window.history.pushState(null, '', nextPage === 'home' ? '/' : `#${nextPage}`);
    setPage(nextPage);
    scrollTop();
  };

  const openProduct = (product: Product) => {
    window.history.pushState(null, '', `#produto/${product.id}`);
    setActiveProductId(product.id);
    setPage('product');
    scrollTop();
  };

  const addProduct = (product: Product) => {
    setCartItems((items) => {
      const existing = items.find((item) => item.product.id === product.id);
      if (existing) {
        return items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...items, { product, quantity: 1 }];
    });
  };

  return (
    <div className="site-shell">
      <Header page={page} cartCount={cartCount} onNavigate={navigate} />
      {page === 'home' && <HomePage onNavigate={navigate} onOpenProduct={openProduct} onAddProduct={addProduct} />}
      {page === 'collection' && <CollectionPage onOpenProduct={openProduct} onAddProduct={addProduct} />}
      {page === 'product' && <ProductPage product={activeProduct} onAddProduct={addProduct} />}
      {page === 'about' && <AboutPage />}
      {page === 'contact' && <ContactPage />}
      <CartSummary items={cartItems} />
      <footer className="site-footer">
        <strong>Montaro</strong>
        <span>Relógios masculinos premium acessíveis.</span>
        <WhatsAppButton tone="ghost" label="WhatsApp" message="Olá, Montaro. Vim pelo site." />
      </footer>
    </div>
  );
}

function parseHash(): { page: Page; productId: string } {
  const hash = window.location.hash.replace('#', '');
  if (hash.startsWith('produto/')) return { page: 'product', productId: hash.replace('produto/', '') };
  if (hash === 'collection' || hash === 'about' || hash === 'contact') return { page: hash, productId: products[0].id };
  return { page: 'home', productId: products[0].id };
}

function useStateFromHash() {
  const initial = parseHash();
  return useState<Page>(initial.page);
}

function useStateProduct() {
  const initial = parseHash();
  return useState(initial.productId);
}
