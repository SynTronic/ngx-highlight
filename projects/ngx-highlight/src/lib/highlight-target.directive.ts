import { Directive, DOCUMENT, ElementRef, inject, input } from '@angular/core';

/**
 * Marks an element as a highlight search target.
 *
 * Walks through all text nodes within the host element and collects
 * {@link Range} objects for each occurrence of the search term.
 *
 * Can optionally be given a name via `ngxHighlightTarget` input to pair
 * with a specific {@link HighlightSearchDirective} named search.
 *
 * @example
 * ```html
 * <!-- Unnamed target (matches group-level search term) -->
 * <span ngxHighlightTarget>Text to highlight</span>
 *
 * <!-- Named target (matches only the "column" named search) -->
 * <span ngxHighlightTarget="column">Column text</span>
 * ```
 */
@Directive({
  selector: '[ngxHighlightTarget]',
})
export class HighlightTargetDirective {
  readonly highlightSearchTargetName = input('', {
    alias: 'ngxHighlightTarget',
  });

  readonly #nativeElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly #document = inject<Document>(DOCUMENT);

  collectRanges(normalizedSearchTerm: string): Range[] {
    if (!normalizedSearchTerm) {
      return [];
    }

    const hostElement = this.#nativeElement;
    if (!hostElement) {
      return [];
    }

    const ranges: Range[] = [];
    const treeWalker = this.#document.createTreeWalker(hostElement, NodeFilter.SHOW_TEXT);

    let currentNode: Node | null;
    while ((currentNode = treeWalker.nextNode())) {
      const textContent = currentNode.textContent;
      if (!textContent) {
        continue;
      }

      const normalizedText = textContent.toLowerCase();
      let startIndex = 0;

      while ((startIndex = normalizedText.indexOf(normalizedSearchTerm, startIndex)) !== -1) {
        const range = this.#document.createRange();
        range.setStart(currentNode, startIndex);
        range.setEnd(currentNode, startIndex + normalizedSearchTerm.length);
        ranges.push(range);
        startIndex += normalizedSearchTerm.length;
      }
    }

    return ranges;
  }
}
