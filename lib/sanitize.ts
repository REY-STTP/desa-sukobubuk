import sanitizeHtml from 'sanitize-html'

/**
 * Server-side rich-text sanitization.
 *
 * Defense-in-depth against stored XSS in Tiptap-edited content
 * (Berita.konten, ProfilDesa.sejarah_konten).
 *
 * Allowlist is aligned with Tiptap StarterKit extensions configured in
 * `components/admin/TiptapEditor.tsx`:
 *   StarterKit (paragraph, bold, italic, strike, code, heading, lists,
 *   blockquote, hard-break, horizontal-rule, link)
 *   + Underline + TextAlign + Placeholder (placeholders are not stored)
 *   + Link (with rel/target enforcement via transformTags)
 *
 * Render path also calls this in `app/(public)/berita/[slug]/page.tsx`
 * and `app/(public)/profil/sejarah/page.tsx` (SEC-002).
 */

const SAFE_URL_REGEX = /^(https?:\/\/|\/|#|mailto:|tel:)/i

const baseOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'h2',
    'h3',
    'h4',
    'strong',
    'em',
    'u',
    's',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'br',
    'img',
    'hr',
    'code',
  ],
  allowedAttributes: {
    a: ['href', 'rel', 'target'],
    img: ['src', 'alt', 'width', 'height', 'loading'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
  },
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowProtocolRelative: false,
  // Disallow all URI values that are not safe schemes
  disallowedTagsMode: 'discard',
  // Forbid any attribute that contains a javascript: / data: / vbscript: payload
  // by validating via transformTags (defense in depth on top of allowedSchemes).
  transformTags: {
    a: (_tagName, attribs) => {
      const href = attribs.href ?? ''
      if (!SAFE_URL_REGEX.test(href)) {
        // Drop the href entirely; keep the anchor text.
        return { tagName: 'a', attribs: {} as Record<string, string> }
      }
      return {
        tagName: 'a',
        attribs: {
          href,
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }
    },
    img: (_tagName, attribs) => {
      const src = attribs.src ?? ''
      // Only http(s) and data: are allowed for img (data: handled by allowedSchemesByTag)
      if (!/^(https?:\/\/|\/)/i.test(src) && !src.startsWith('data:image/')) {
        return { tagName: 'img', attribs: {} as Record<string, string> }
      }
      return {
        tagName: 'img',
        attribs: {
          src,
          alt: attribs.alt ?? '',
          loading: attribs.loading ?? 'lazy',
        },
      }
    },
  },
}

export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return ''
  return sanitizeHtml(html, baseOptions)
}
