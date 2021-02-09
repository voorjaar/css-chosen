import sortMediaQuery from "./sortMediaQuery";
import sortSelector from "./sortSelector";
import { Style } from "../style/base";
import { wrapit, hash, isSpace } from "../utils";
import type { AnyObject } from "../interfaces";

export function combineObject(
  a: { [key: string]: unknown },
  b: { [key: string]: unknown }
): { [key: string]: unknown } {
  const output = { ...a };
  for (const [key_of_b, value_of_b] of Object.entries(b)) {
    if (key_of_b in a) {
      const value_of_a = a[key_of_b];
      if (value_of_a !== value_of_b) {
        if (
          value_of_b !== null &&
          (value_of_b as string).constructor !== Object
        ) {
          output[key_of_b] = [value_of_a, value_of_b];
        } else if (
          value_of_a !== null &&
          (value_of_a as { [key: string]: unknown }).constructor === Object
        ) {
          output[key_of_b] = combineObject(
            value_of_a as { [key: string]: unknown },
            value_of_b as { [key: string]: unknown }
          );
        } else {
          output[key_of_b] = [
            value_of_a,
            combineObject(
              value_of_a as { [key: string]: unknown },
              value_of_b as { [key: string]: unknown }
            ),
          ];
        }
      }
    } else {
      output[key_of_b] = value_of_b;
    }
  }
  return output;
}

export function deepList<T>(
  list: string[],
  value?: T
): { [key: string]: unknown } {
  const key = list.pop();
  const current = value ? value : {};
  if (!key) return current;
  const dict: { [key: string]: AnyObject } = {};
  dict[key] = current;
  return deepList(list, dict);
}

export function handleNest(item: unknown): unknown[] {
  let output: unknown[] = [];
  if (Array.isArray(item)) {
    item.forEach((i) => {
      output = [...output, ...handleNest(i)];
    });
  } else {
    if ((item as { build?: () => "" }).build)
      output.push((item as { build: () => "" }).build());
  }
  return output;
}

export function buildMap(obj: unknown, minify = false): string {
  let output: unknown[] = [];
  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      if (item.constructor === Object) {
        output.push(buildMap(item));
      } else if (Array.isArray(item)) {
        output = [...output, ...handleNest(item)];
      } else {
        if (item.build) output.push(item.build(minify));
      }
    });
  } else if (obj && typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      const _gstyle = (v: string) =>
        (minify ? key.replace(/\n/g, "") : key + " ") +
        wrapit(v, undefined, undefined, undefined, minify);
      if (value instanceof Style) {
        output.push(_gstyle(value.build(minify)));
      } else if (value && typeof value === "object") {
        output.push(_gstyle(buildMap(value, minify)));
      }
    }
  }
  return output.join(minify ? "" : "\n");
}

export function combineSelector(styleList: Style[]): Style[] {
  const styleMap: { [key: string]: Style } = {};
  const passed: Style[] = [];
  styleList.forEach((style) => {
    const rule = style.rule;
    if (rule) {
      const hashValue = hash(rule);
      if (hashValue in styleMap) {
        styleMap[hashValue] = styleMap[hashValue].extend(style, true);
      } else {
        styleMap[hashValue] = style;
      }
    } else {
      passed.push(style);
    }
  });
  return [...passed, ...Object.values(styleMap).map((style) => style.clean())];
}

export default function compileStyleSheet(
  styleList: Style[],
  minify = false
): string {
  const head = combineSelector(
    styleList.filter((i) => !(i.selector && i.atRules))
  )
    .sort(sortSelector)
    .map((i) => i.build(minify))
    .join(minify ? "" : "\n");
  const body = buildMap(
    styleList
      .filter((i) => i.selector && i.atRules)
      .map((i) => {
        const list = [
          ...(i.atRules ?? []).sort(sortMediaQuery).reverse(),
          i.rule,
        ];
        const style = new Style(undefined, i.property, i.important)
        i.wrapProperties && i.wrapProperties.forEach(wrap => style.wrapProperty(wrap))
        return deepList(list, style);
      })
      .sort((a, b) => {
        const akey = Object.keys(a)[0];
        const bkey = Object.keys(b)[0];
        return sortMediaQuery(akey, bkey);
      })
      .reduce(
        (previousValue, currentValue) =>
          combineObject(previousValue, currentValue),
        {}
      ),
    minify
  );
  return minify
    ? (head + body).replace(/;\}/g, "}")
    : [head, body].filter((i) => !isSpace(i)).join("\n");
}
