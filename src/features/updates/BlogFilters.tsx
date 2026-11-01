// The search box and the category buttons above the blog posts.
// Used on the home page's Blog section and on the Blog page. It only shows the controls:
// the page that uses it keeps the search text and the category, and filters the posts.

import { categories, sortedUpdates } from '../../data/updates.ts'
import Icon from '../../components/Icon.tsx'

interface BlogFiltersProps {
  query: string
  category: string // 'All' or one of the categories
  onQueryChange: (query: string) => void
  onCategoryChange: (category: string) => void
}

// How many posts each button would show, e.g. { All: 12, Engineering: 6, … }.
const counts: Record<string, number> = { All: sortedUpdates.length }
for (const post of sortedUpdates) counts[post.category] = (counts[post.category] ?? 0) + 1

function BlogFilters({ query, category, onQueryChange, onCategoryChange }: BlogFiltersProps) {
  return (
    <div className="blog-filters">
      <label className="blog-search">
        <Icon name="search" size={18} />
        <input
          type="search"
          placeholder="Search posts…"
          aria-label="Search posts"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>

      {/* aria-pressed tells screen readers which button is on. */}
      <div className="blog-categories" role="group" aria-label="Filter by category">
        {['All', ...categories].map((name) => (
          <button
            type="button"
            key={name}
            className="blog-category"
            aria-pressed={category === name}
            onClick={() => onCategoryChange(name)}
          >
            {name} <span>{counts[name] ?? 0}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default BlogFilters
