import sanitizeHtml from "sanitize-html";

const BLOG_ALLOWLIST: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr",
    "ul", "ol", "li",
    "strong", "em", "s", "code", "pre", "blockquote",
    "a", "img",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "width", "height"],
    code: ["class"],
    pre: ["class"],
  },
  allowedSchemes: ["https", "http", "mailto"],
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, rel: "noopener noreferrer", target: "_blank" },
    }),
  },
};

export function sanitizeBlogContent(html: string): string {
  return sanitizeHtml(html, BLOG_ALLOWLIST);
}
