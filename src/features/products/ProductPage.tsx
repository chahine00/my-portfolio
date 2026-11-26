// One product's page, at /products/<slug>: often the first page a visitor sees, arriving from a
// link to the product (shared on social media, for example). So it says what the product is, where
// it stands (its status), how to open it, that Axihex made it, and what else Axihex makes.
// Every part only appears if the product has the data for it (src/data/products.ts).

import { useLayoutEffect } from 'react'
import { Link, useParams } from 'react-router'
import { statusLabel } from '../../data/products.ts'
import { productDescription, productTitle } from '../../data/seo.ts'
import Gallery from '../../components/Gallery.tsx'
import BackLink from '../../components/BackLink.tsx'
import ScrollUpBack from '../../components/ScrollUpBack.tsx'
import AxihexMark from '../../components/AxihexMark.tsx'
import { useBack } from '../../utils/pageHistory.ts'
import { useDocumentTitle } from '../../utils/useDocumentTitle.ts'
import ProductCard from './ProductCard.tsx'
import { shownProducts } from './shownProducts.ts'

function ProductPage() {
  const { slug } = useParams()
  // Only products this copy of the site shows: a hidden draft is "not found" on the live site.
  const product = shownProducts.find((item) => item.slug === slug)
  useDocumentTitle(product ? productTitle(product) : 'Product not found', {
    description: product && productDescription(product),
    noindex: !product,
  })
  const back = useBack(`/products/${slug}`, '/')

  // Start at the top whenever a product opens (also from "More from Axihex").
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [slug])

  if (!product) {
    return (
      <section className="section">
        <h1>Product not found</h1>
        <p>This product doesn't exist or isn't public yet.</p>
        <BackLink back={back} />
      </section>
    )
  }

  const others = shownProducts.filter((item) => item.slug !== product.slug)
  const paragraphs = product.description ? product.description.split(/\n\s*\n/) : []
  const facts = [
    { label: 'Status', value: statusLabel[product.status] },
    { label: 'Type', value: product.kind },
    { label: 'Available on', value: product.platforms?.join(', ') },
  ].filter((fact) => fact.value)

  return (
    <article className="section project-page product-page page-enter" key={product.slug}>
      <BackLink back={back} />

      <header className="project-page__header">
        {/* Many visitors arrive here first: say right away who made it. */}
        <p className="eyebrow product-page__by">
          <AxihexMark className="product-page__mark" /> Built by Axihex
        </p>
        <h1>{product.name}</h1>
        <p className="project-page__lead">{product.tagline}</p>

        <dl className="project-facts">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>
                {fact.label === 'Status' ? (
                  <span className={`product-status product-status--${product.status}`}>{fact.value}</span>
                ) : (
                  fact.value
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className="project-page__links">
          {product.url ? (
            <a href={product.url} target="_blank" rel="noreferrer" className="button">
              {product.urlLabel ?? `Open ${product.name}`} <span aria-hidden="true">↗</span>
            </a>
          ) : (
            // Not out yet: a way to hear about it or to talk about it.
            <Link to="/#contact" className="button">
              Ask about it
            </Link>
          )}
          <Link to="/studio" className="button button-outline">
            About Axihex
          </Link>
        </div>
      </header>

      {product.images && product.images.length > 0 && (
        <Gallery key={product.slug} images={product.images} title={product.name} descriptions={product.imageDescriptions} />
      )}

      {paragraphs.length > 0 && (
        <section className="project-page__block">
          <h2>About {product.name}</h2>
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </section>
      )}

      {product.features && product.features.length > 0 && (
        <section className="project-page__block">
          <h2>What it does</h2>
          <ul className="check-list">
            {product.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>
      )}

      {/* The way into the rest of Axihex, for visitors who came for this product. */}
      {others.length > 0 && (
        <section className="project-page__block">
          <h2>More from Axihex</h2>
          <div className="work-grid">
            {others.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      )}

      <aside className="product-page__studio">
        <AxihexMark className="product-page__studio-mark" />
        <p>
          <strong>Axihex</strong> is an independent software studio. Where we see an opportunity, we build it: products of our
          own, and software for clients.
        </p>
        <Link to="/" className="forward-link">
          Visit axihex.com <span aria-hidden="true">→</span>
        </Link>
      </aside>

      <ScrollUpBack key={product.slug} label={back.label} onClick={() => back.go()} />
    </article>
  )
}

export default ProductPage
