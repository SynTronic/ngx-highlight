# @syntronic/ngx-highlight

Angular directives for highlighting search matches in text, built on the native [CSS Custom Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API). No DOM mutation, no wrapping matched text in `<mark>` elements — ranges are painted directly by the browser.

- Works across nested text nodes and multiple elements.
- Supports a single group-wide search term, or several independent named searches within one group (e.g. per-column filters in a table).
- Zoneless-friendly: built entirely on Angular signals (`input()`, `contentChildren()`, `afterRenderEffect()`).

## Requirements

- Angular `^22.0.0`
- A browser with [`CSS.highlights`](https://developer.mozilla.org/en-US/docs/Web/API/CSS/highlights_static) support (Chromium, Safari; Firefox behind a flag as of writing). The directives no-op silently when unsupported.

## Installation

```bash
npm install @syntronic/ngx-highlight
```

## Usage

### Basic: single search term

Wrap the searchable area with `ngxHighlightGroup`, pass it a unique highlight name and the current search term, then mark each searchable element with `ngxHighlightTarget`.

```ts
import { Component, signal } from '@angular/core';
import { HighlightGroupDirective, HighlightTargetDirective } from '@syntronic/ngx-highlight';

@Component({
  selector: 'app-example',
  imports: [HighlightGroupDirective, HighlightTargetDirective],
  template: `
    <input [value]="searchTerm()" (input)="searchTerm.set($event.target.value)" />

    <ul [ngxHighlightGroup]="'device-list'" [highlightSearchTerm]="searchTerm()">
      @for (device of devices; track device.id) {
        <li ngxHighlightTarget>{{ device.name }}</li>
      }
    </ul>
  `,
})
export class ExampleComponent {
  readonly searchTerm = signal('');
  readonly devices = [
    { id: 1, name: 'Water meter A1' },
    { id: 2, name: 'Water meter B2' },
  ];
}
```

Style the highlight with the [`::highlight()`](https://developer.mozilla.org/en-US/docs/Web/CSS/::highlight) pseudo-element, using the same name passed to `ngxHighlightGroup`:

```css
::highlight(device-list) {
  background-color: yellow;
  color: black;
}
```

### Minimum match length

Avoid highlighting on very short, noisy terms with `highlightMinLength` (default `1`):

```html
<div [ngxHighlightGroup]="'device-list'" [highlightSearchTerm]="searchTerm()" [highlightMinLength]="3">
  <span ngxHighlightTarget>{{ device.name }}</span>
</div>
```

With `highlightMinLength="3"`, a search term of `"he"` produces no highlight; `"hel"` does.

### Named searches: independent terms per column

When a table (or any layout) needs a different search term per column, register each one with `ngxHighlightSearch` and pair it with a matching `ngxHighlightTarget` name. Unnamed targets keep matching the group-level `highlightSearchTerm` as before.

```html
<table [ngxHighlightGroup]="'device-table'">
  <thead>
    <tr>
      <th>
        <input ngxHighlightSearch="name" [highlightSearchTerm]="nameFilter()" (input)="nameFilter.set($event.target.value)" />
      </th>
      <th>
        <input ngxHighlightSearch="location" [highlightSearchTerm]="locationFilter()" (input)="locationFilter.set($event.target.value)" />
      </th>
    </tr>
  </thead>
  <tbody>
    @for (device of devices; track device.id) {
      <tr>
        <td [ngxHighlightTarget]="'name'">{{ device.name }}</td>
        <td [ngxHighlightTarget]="'location'">{{ device.location }}</td>
      </tr>
    }
  </tbody>
</table>
```

A named search unregisters itself automatically when its term becomes empty/`null`/`undefined`, or when the directive is destroyed.

## API

### `HighlightGroupDirective` (`[ngxHighlightGroup]`)

| Input                 | Alias             | Type      | Default | Description                                                              |
| ---------------------- | ----------------- | --------- | ------- | -------------------------------------------------------------------------- |
| `highlightName`        | `ngxHighlightGroup` | `string` (required) | —       | The name registered in `CSS.highlights` — pair with `::highlight(name)`. |
| `highlightSearchTerm`  | —                  | `string`  | `''`    | Group-wide search term applied to unnamed targets.                       |
| `highlightMinLength`   | —                  | `number`  | `1`     | Minimum term length (after trim) before any highlighting occurs.         |

### `HighlightTargetDirective` (`[ngxHighlightTarget]`)

| Input                        | Alias               | Type      | Default | Description                                                                    |
| ----------------------------- | -------------------- | --------- | ------- | ---------------------------------------------------------------------------------- |
| `highlightSearchTargetName`  | `ngxHighlightTarget`  | `string`  | `''`    | When set, only matches the named search registered under the same name.          |

### `HighlightSearchDirective` (`[ngxHighlightSearch]`)

| Input                   | Alias              | Type                              | Default | Description                                        |
| ------------------------ | -------------------- | ---------------------------------- | ------- | ----------------------------------------------------- |
| `highlightSearchName`    | `ngxHighlightSearch`  | `string` (required)                | —       | Name shared with the matching `ngxHighlightTarget`. |
| `highlightSearchTerm`    | —                    | `string \| null \| undefined` (required) | —       | The term for this named search.                    |

## Development

This repository is an Angular CLI workspace containing a single library project (`projects/ngx-highlight`).

```bash
npm install
npm run build   # ng build ngx-highlight -> dist/ngx-highlight
npm run test    # ng test ngx-highlight (Vitest + real Chromium via vitest-browser-angular)
npm run lint    # ng lint ngx-highlight
```

Tests run against real Chromium (not jsdom) because they assert against the live `CSS.highlights` registry, which jsdom does not implement.

### Publishing

```bash
npm run build
cd dist/ngx-highlight
npm publish
```

## License

MIT
