# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-07-13

Initial public release of `@syntronic/ngx-highlight`.

### Added

- `ngxHighlightGroup` directive — defines a highlight group with a group-wide
  search term (`highlightSearchTerm`) and a configurable minimum match length
  (`highlightMinLength`).
- `ngxHighlightSearch` directive — marks the container whose text content is
  searched and highlighted.
- `ngxHighlightTarget` directive — highlights matches for a specific named
  search (`highlightSearchTargetName`), enabling multiple independent searches
  within one group.
- Highlighting via the native [CSS Custom Highlight API][cssapi] — no DOM
  mutation and no wrapping of matched text in elements.
- Support for matches spanning nested text nodes and multiple elements.
- Zoneless-friendly implementation built entirely on Angular signals
  (`input()`, `contentChildren()`, `afterRenderEffect()`).
- Silent no-op in browsers without `CSS.highlights` support.

[cssapi]: https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API
[unreleased]: https://github.com/SynTronic/ngx-highlight/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/SynTronic/ngx-highlight/releases/tag/v1.0.0
