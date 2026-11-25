// The products this copy of the site shows: the published ones on the live site, and the drafts
// too while developing (npm run dev), so a product can be previewed before it goes public.
// See src/data/products.ts.

import { products, publishedProducts } from '../../data/products.ts'

export const shownProducts = import.meta.env.DEV ? products : publishedProducts
export const hasProducts = shownProducts.length > 0
