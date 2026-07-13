import { DestroyRef, Directive, effect, inject, input } from '@angular/core';
import { HighlightGroupDirective } from './highlight-group.directive';

/**
 * Registers a named search term with the parent {@link HighlightGroupDirective}.
 *
 * Allows multiple independent search terms to highlight different
 * {@link HighlightTargetDirective} targets within the same group.
 *
 * Automatically unregisters the search on destruction or when the term becomes empty.
 *
 * @example
 * ```html
 * <div ngxHighlightGroup="my-highlight">
 *   <input ngxHighlightSearch="column" [highlightSearchTerm]="columnFilter()" />
 *   <span ngxHighlightTarget="column">Filtered text</span>
 * </div>
 * ```
 */
@Directive({
  selector: '[ngxHighlightSearch]',
})
export class HighlightSearchDirective {
  readonly highlightSearchName = input.required<string>({
    alias: 'ngxHighlightSearch',
  });
  readonly highlightSearchTerm = input.required<string | null | undefined>();

  readonly #group = inject(HighlightGroupDirective);
  readonly #destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const name = this.highlightSearchName();
      const searchTerm = this.highlightSearchTerm();

      if (!name) {
        return;
      }

      if (typeof searchTerm === 'string' && searchTerm) {
        this.#group.registerNamedSearch(name, searchTerm);
      } else {
        this.#group.unregisterNamedSearch(name);
      }
    });

    this.#destroyRef.onDestroy(() => {
      const name = this.highlightSearchName();
      if (name) {
        this.#group.unregisterNamedSearch(name);
      }
    });
  }
}
