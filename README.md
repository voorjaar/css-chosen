# css-chosen

Dead simple CSS purge tool.

## Installation

```sh
npm install css-chosen --save-dev
```

## How it works

The project was inspired by [uncss](https://github.com/uncss/uncss), we all tend to use dom's `querySelector` method. But we use [css-select](https://github.com/fb55/css-select) to select css rules, which allows us to remove the dependency of [jsdom](https://github.com/jsdom/jsdom), so it will be smaller and faster. 

The process by which **css-chosen** removes the unused rules is as follows:

1. The HTML files are loaded by [htmlparser2](https://github.com/fb55/htmlparser2) to get doms.
2. All the stylesheets are parsed by a simple build-in css parser.
3. `CSSselect.selectOne` filters out selectors that are not found in the HTML files.
4. The remaining rules are converted back to CSS.

## Usage

[windicss](https://github.com/voorjaar/windicss) uses **css-chosen** to purge base styles added by third-party plugins.
