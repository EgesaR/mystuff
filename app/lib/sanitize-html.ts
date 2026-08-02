import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "strike",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "sub",
  "sup",
  "span",
  "div",
  "input",
  "mark",
  "iframe",
  "video",
  "audio",
];

const ALLOWED_ATTR = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "class",
  "type",
  "checked",
  "controls",
  "width",
  "height",
  "frameborder",
  "allowfullscreen",
  "style",
];

/**
 * Strips anything that isn't plain rich-text markup — scripts, event
 * handler attributes (onerror, onload, etc.), forms. `style` is allowed
 * so inline color/font-size/highlight formatting survives save/reload —
 * DOMPurify still filters dangerous CSS constructs (expression(), url(javascript:...))
 * out of whatever style content it lets through.
 */
export function sanitizeNoteHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}
