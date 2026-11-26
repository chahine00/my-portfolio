// The home page's Products section, right under the hero: Axihex's own apps, tools and services,
// the studio's main highlight. Not there at all while there's no product to show (see
// src/data/products.ts: only "published" ones on the live site).

import ProductCard from './ProductCard.tsx'
import { shownProducts } from './shownProducts.ts'
import { useReveal } from '../../utils/useReveal.ts'

function Products() {
  // The cards fade in one after another as you scroll to them, like the Work cards.
  const gridRef = useReveal<HTMLDivElement>('.work-card')
  if (!shownProducts.length) return null

  return (
    <section id="products" className="section work-section products-section" aria-labelledby="products-title">
      <header className="work-heading">
        <div>
          <p className="eyebrow">Products</p>
          <h2 id="products-title">
            Made by <em>Axihex.</em>
          </h2>
        </div>
        <p>Launched by Axihex and still growing. Try them, share them, and tell us what you think.</p>
      </header>
      <div className="work-grid" ref={gridRef}>
        {shownProducts.map((product, index) => (
          // A single product takes the full width.
          <ProductCard key={product.slug} product={product} featured={index === 0 && shownProducts.length % 2 === 1} />
        ))}
      </div>
    </section>
  )
}

export default Products
