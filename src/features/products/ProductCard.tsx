// One product's card: in the home page's Products section, and under "More from Axihex" on a
// product's page. The whole card links to the product's page (ProductPage.tsx).

import { Link } from 'react-router'
import { statusLabel, type Product } from '../../data/products.ts'
import { asset, fallbackTo, thumb } from '../../utils/asset.ts'
import Icon from '../../components/Icon.tsx'

function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const cover = product.images?.[0]

  return (
    <article className={featured ? 'work-card work-card--feature product-card' : 'work-card product-card'}>
      <Link className="work-card-link" to={`/products/${product.slug}`}>
        {cover ? (
          <img
            className="work-image"
            src={featured ? asset(cover) : thumb(cover)}
            onError={fallbackTo(cover)}
            alt={product.imageAlt ?? product.name}
            width={1600}
            height={900}
            loading="lazy"
            decoding="async"
          />
        ) : (
          // No picture yet (often the case before launch): the product's icon on a soft panel.
          <span className="product-card__placeholder" aria-hidden="true">
            <Icon name={product.icon ?? 'box'} size={34} />
          </span>
        )}
        <div className="work-copy">
          <p className="product-card__meta">
            <span className={`product-status product-status--${product.status}`}>{statusLabel[product.status]}</span>
            <span className="product-card__kind">{product.kind}</span>
          </p>
          <h3>{product.name}</h3>
          <p>{product.tagline}</p>
          <span className="case-link">
            {product.status === 'live' || product.status === 'beta' ? 'Discover it' : 'See what’s coming'}{' '}
            <span aria-hidden="true">↗</span>
          </span>
        </div>
      </Link>
    </article>
  )
}

export default ProductCard
