const cache = new Map<string, { __html: string }>();

/**
 * A stable `dangerouslySetInnerHTML` value. React re-applies injected markup
 * whenever this object changes, not just its string, so a fresh `{ __html }`
 * on every render swapped the SVG on each re-render (e.g. the resize when a
 * phone's address bar shows on scrolling up) and restarted its animations.
 */
export function markup(html: string) {
  let value = cache.get(html);
  if (!value) cache.set(html, (value = { __html: html }));
  return value;
}
