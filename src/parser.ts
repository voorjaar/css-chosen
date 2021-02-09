import { Property, Style, StyleSheet, InlineAtRule } from "./style";
import { searchFrom } from "./utils";

export default class CSSParser {
  css?: string;
  constructor(css?: string) {
    this.css = css;
  }

  private _removeComment(css: string) {
    let commentOpen = css.search(/\/\*/);
    let commentClose = css.search(/\*\//);
    while (commentOpen !== -1 && commentClose !== -1) {
      css = css.substring(0, commentOpen) + css.substring(commentClose + 2);
      commentOpen = css.search(/\/\*/);
      commentClose = css.search(/\*\//);
    }
    return css;
  }

  private _searchGroup(text: string, startIndex = 0) {
    let level = 1;
    let endBracket = searchFrom(text, "}", startIndex);
    while (endBracket !== -1) {
      const nextBracket = searchFrom(text, "{", startIndex);
      if (endBracket < nextBracket || nextBracket === -1) {
        level--;
        startIndex = endBracket + 1;
        if (level == 0) return endBracket;
      } else {
        level++;
        startIndex = nextBracket + 1;
      }
      endBracket = searchFrom(text, "}", startIndex);
    }
    return -1;
  }

  private _generateStyle(css: string, selector?: string) {
    let parsed = Property.parse(css);
    if (!parsed) return;
    if (!Array.isArray(parsed)) parsed = [parsed];
    const properties: Property[] = parsed.filter(
      (i) => !(i instanceof InlineAtRule)
    );
    return new Style(selector, parsed, false);
  }

  parse(css = this.css): StyleSheet {
    const styleSheet = new StyleSheet();

    if (!css) return styleSheet;
    let index = 0;
    let firstLetter = searchFrom(css, /\S/, index);
    css = this._removeComment(css);

    while (firstLetter !== -1) {
      if (css.charAt(firstLetter) === "@") {
        // atrule
        const ruleEnd = searchFrom(css, ";", firstLetter);
        const nestStart = searchFrom(css, "{", firstLetter);

        if (nestStart === -1 || (ruleEnd !== -1 && ruleEnd < nestStart)) {
          // inline atrule
          let atrule = css.substring(firstLetter, ruleEnd).trim();
          // if (this.processor) {
            // const directives = this._handleDirectives(atrule);
            // if (directives?.atrule) atrule = directives.atrule;
          // }
          const parsed = InlineAtRule.parse(atrule);
          if (parsed) styleSheet.add(parsed.toStyle(undefined));
          index = ruleEnd + 1;
        } else {
          // nested atrule
          const nestEnd = this._searchGroup(css, nestStart + 1);
          const atrule = css.substring(firstLetter, nestStart).trim();
          styleSheet.add(
            this.parse(
              css.substring(nestStart + 1, nestEnd)
            ).children.map((i) => i.atRule(atrule))
          );
          index = nestEnd + 1;
        }
      } else {
        const nestStart = searchFrom(css, "{", firstLetter);
        const nestEnd = this._searchGroup(css, nestStart + 1);
        if (nestStart === -1) {
          // inline properties
          styleSheet.add(this._generateStyle(css, undefined));
          break;
        }
        // nested selector
        styleSheet.add(
          this._generateStyle(
            css.substring(nestStart + 1, nestEnd),
            css.substring(firstLetter, nestStart).trim()
          )
        );
        index = nestEnd + 1;
      }
      firstLetter = searchFrom(css, /\S/, index);
    }
    return styleSheet;
  }
}
