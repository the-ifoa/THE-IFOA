import {
  SITE_NAME,
  SITE_NOINDEX,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
  clampDescription
} from '@/lib/seo'

/**
 * Per-route document head. React 19 hoists title/meta/link rendered anywhere in
 * the tree into <head>, so pages can drop this in at their top level.
 *
 * `path` must be the canonical path for the route (no query string, no trailing
 * slash) - duplicate canonicals across routes are what split ranking signals.
 */
export function Seo({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  noindex = false,
  jsonLd = null
}) {
  const url = absoluteUrl(path)
  const desc = clampDescription(description)
  const ogImage = image ? absoluteUrl(image) : DEFAULT_OG_IMAGE

  return (
    <>
      <title>{title}</title>
      {desc && <meta name="description" content={desc} />}
      <link rel="canonical" href={url} />
      <meta
        name="robots"
        content={noindex || SITE_NOINDEX ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}
      />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      {desc && <meta property="og:description" content={desc} />}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="en" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {desc && <meta name="twitter:description" content={desc} />}
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && (
        <script
          type="application/ld+json"
          // Structured data is generated from our own content, never user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  )
}

export default Seo
