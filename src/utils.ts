export function indent(code: string, tab = 2): string {
  const spaces = Array(tab).fill(" ").join("");
  return code
    .split("\n")
    .map((line) => spaces + line)
    .join("\n");
}

export function wrapit(
  code: string,
  start = "{",
  end = "}",
  tab = 2,
  minify = false
): string {
  if (minify) return `${start}${code}${end}`;
  return `${start}\n${indent(code, tab)}\n${end}`;
}

export function hash(str: string): string {
  str = str.replace(/\r/g, "");
  let hash = 5381;
  let i = str.length;

  while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
  return (hash >>> 0).toString(36);
}

export function isSpace(str: string): boolean {
  return /^\s*$/.test(str);
}

export function searchFrom(
  text: string,
  target: string | RegExp,
  startIndex = 0,
  endIndex?: number
): number {
  // search from partial of string
  const subText = text.substring(startIndex, endIndex);
  const relativeIndex = subText.search(target);
  return relativeIndex === -1 ? -1 : startIndex + relativeIndex;
}

export function connectList<T = string>(a?: T[], b?: T[], append = true): T[] {
  return append ? [...(a ?? []), ...(b ?? [])] : [...(b ?? []), ...(a ?? [])];
}

export function isTagName(name: string): boolean {
  return ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embd', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'svg', 'table', 'tbody', 'td', 'template', 'textarea','tfoot', 'th','thead','time','title','tr','track','u','ul','var','video','wbr'].includes(name);
}

export function camelToDash(str: string): string {
  return str.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
}

export function deepCopy<T>(source: T): T {
  return Array.isArray(source)? 
    source.map(item => deepCopy(item))
    : source instanceof Date
    ? new Date(source.getTime())
    : source && typeof source === "object"
    ? Object.getOwnPropertyNames(source).reduce((o, prop) => {
        const descriptor = Object.getOwnPropertyDescriptor(source, prop);
        if (descriptor) {
          Object.defineProperty(o, prop, descriptor);
          if (source && typeof source === "object") {
            o[prop] = deepCopy(
              ((source as unknown) as { [key: string]: unknown })[prop]
            );
          }
        }
        return o;
      }, Object.create(Object.getPrototypeOf(source)))
    : (source as T);
}