import {
  afterRenderEffect,
  contentChildren,
  DestroyRef,
  Directive,
  DOCUMENT,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { HighlightTargetDirective } from './highlight-target.directive';

/**
 * Orchestrates text highlighting using the CSS Custom Highlight API.
 *
 * Collects all descendant {@link HighlightTargetDirective} elements, applies search term matching,
 * and registers matched ranges as a named CSS highlight.
 *
 * Supports both a single unnamed search term (via `highlightSearchTerm` input)
 * and multiple named searches registered by {@link HighlightSearchDirective}.
 *
 * @example
 * ```html
 * <div ngxHighlightGroup="my-highlight" [highlightSearchTerm]="searchTerm()">
 *   <span ngxHighlightTarget>Searchable text</span>
 * </div>
 * ```
 *
 * Style the highlight in CSS:
 * ```css
 * ::highlight(my-highlight) {
 *   color: var(--highlight-color);
 * }
 * ```
 */
@Directive({
  selector: '[ngxHighlightGroup]',
})
export class HighlightGroupDirective {
  readonly highlightSearchTerm = input('');
  readonly highlightName = input.required<string>({
    alias: 'ngxHighlightGroup',
  });

  readonly highlightMinLength = input(1, {
    transform: numberAttribute,
  });

  private readonly targets = contentChildren(HighlightTargetDirective, {
    descendants: true,
  });

  readonly #namedSearchTerms = signal<Record<string, string>>({});

  readonly #document = inject<Document>(DOCUMENT);
  readonly #destroyRef = inject(DestroyRef);

  get #css(): typeof CSS | undefined {
    return this.#document.defaultView?.CSS;
  }

  registerNamedSearch(name: string, searchTerm: string): void {
    this.#namedSearchTerms.update((current) => ({ ...current, [name]: searchTerm }));
  }

  unregisterNamedSearch(name: string): void {
    this.#namedSearchTerms.update((current) => {
      const updated = { ...current };
      delete updated[name];
      return updated;
    });
  }

  constructor() {
    afterRenderEffect(() => {
      this.#applyHighlight();
    });

    this.#destroyRef.onDestroy(() => {
      this.#deleteHighlight();
    });
  }

  #applyHighlight(): void {
    const cssHighlights = this.#css?.highlights;
    if (!cssHighlights) {
      return;
    }

    const highlightName = this.highlightName();

    if (!highlightName) {
      return;
    }

    cssHighlights.delete(highlightName);

    const minLength = this.highlightMinLength();
    const targets = this.targets();

    const namedSearchTerms = this.#namedSearchTerms();
    const hasNamedSearchTerms = Object.keys(namedSearchTerms).length > 0;

    const unnamedTargets =
      hasNamedSearchTerms ?
        targets.filter((target) => !target.highlightSearchTargetName())
      : targets;

    const ranges: Range[] = [];
    const normalizedSearchTerm = this.highlightSearchTerm().trim().toLowerCase();

    if (normalizedSearchTerm.length >= minLength) {
      ranges.push(
        ...unnamedTargets.flatMap((target) => target.collectRanges(normalizedSearchTerm))
      );
    }

    if (hasNamedSearchTerms) {
      const namedTargets = targets.filter((target) => !!target.highlightSearchTargetName());

      for (const [name, term] of Object.entries(namedSearchTerms)) {
        const normalizedTerm = term.trim().toLowerCase();
        if (normalizedTerm.length < minLength) {
          continue;
        }

        const matchingTargets = namedTargets.filter(
          (target) => target.highlightSearchTargetName() === name
        );

        for (const target of matchingTargets) {
          ranges.push(...target.collectRanges(normalizedTerm));
        }
      }
    }

    if (!ranges.length) {
      return;
    }

    cssHighlights.set(highlightName, new Highlight(...ranges));
  }

  #deleteHighlight(): void {
    const cssHighlights = this.#css?.highlights;
    if (!cssHighlights) {
      return;
    }

    const highlightName = this.highlightName();

    if (!highlightName) {
      return;
    }

    cssHighlights.delete(highlightName);
  }
}
