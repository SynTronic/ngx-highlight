import { Component, signal } from '@angular/core';
import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-angular';

import { HighlightGroupDirective } from './highlight-group.directive';
import { HighlightSearchDirective } from './highlight-search.directive';
import { HighlightTargetDirective } from './highlight-target.directive';

const HIGHLIGHT_NAME = 'test-highlight';

/**
 * The directive paints via the CSS Custom Highlight API, so nothing changes in
 * the DOM tree or accessibility tree. The observable output is the registered
 * highlight in `CSS.highlights` — this reads back the text each range covers.
 */
function highlightedText(name: string): string[] {
  const highlight = CSS.highlights.get(name);
  if (!highlight) {
    return [];
  }

  return [...highlight].map((range) => (range as Range).toString());
}

@Component({
  template: `
    <div
      [ngxHighlightGroup]="name"
      [highlightSearchTerm]="searchTerm()"
      [highlightMinLength]="minLength()"
    >
      <span ngxHighlightTarget>Hello World</span>
      <span ngxHighlightTarget>Hello Angular</span>
    </div>
  `,
  selector: 'ngx-host-component-highlight-group',
  imports: [HighlightGroupDirective, HighlightTargetDirective],
})
class BasicHostComponent {
  readonly name = HIGHLIGHT_NAME;
  readonly searchTerm = signal('');
  readonly minLength = signal(1);
}

@Component({
  template: `
    <div [ngxHighlightGroup]="name">
      <input ngxHighlightSearch="col1" [highlightSearchTerm]="col1Term()" />
      <input ngxHighlightSearch="col2" [highlightSearchTerm]="col2Term()" />
      <span [ngxHighlightTarget]="'col1'">Column One Text</span>
      <span [ngxHighlightTarget]="'col2'">Column Two Text</span>
      <span ngxHighlightTarget>Unnamed Target</span>
    </div>
  `,
  selector: 'ngx-host-component-named-targets',
  imports: [HighlightGroupDirective, HighlightTargetDirective, HighlightSearchDirective],
})
class NamedTargetsHostComponent {
  readonly name = HIGHLIGHT_NAME;
  readonly col1Term = signal('');
  readonly col2Term = signal('');
}

describe(HighlightGroupDirective.name, () => {
  afterEach(() => {
    CSS.highlights.clear();
  });

  describe('basic highlighting', () => {
    it('highlights every target occurrence when the search term matches', async () => {
      const { componentClassInstance, fixture } = await render(BasicHostComponent);

      componentClassInstance.searchTerm.set('hello');
      await fixture.whenStable();

      expect(highlightedText(HIGHLIGHT_NAME)).toEqual(['Hello', 'Hello']);
    });

    it('does not register a highlight when nothing matches', async () => {
      const { componentClassInstance, fixture } = await render(BasicHostComponent);

      componentClassInstance.searchTerm.set('xyz-no-match');
      await fixture.whenStable();

      expect(CSS.highlights.has(HIGHLIGHT_NAME)).toBe(false);
    });

    it('replaces stale ranges when the search term changes', async () => {
      const { componentClassInstance, fixture } = await render(BasicHostComponent);

      componentClassInstance.searchTerm.set('hello');
      await fixture.whenStable();
      expect(highlightedText(HIGHLIGHT_NAME)).toEqual(['Hello', 'Hello']);

      componentClassInstance.searchTerm.set('angular');
      await fixture.whenStable();

      expect(highlightedText(HIGHLIGHT_NAME)).toEqual(['Angular']);
    });

    it('does not highlight when the term is shorter than the minimum length', async () => {
      const { componentClassInstance, fixture } = await render(BasicHostComponent);

      componentClassInstance.minLength.set(3);
      componentClassInstance.searchTerm.set('he');
      await fixture.whenStable();

      expect(CSS.highlights.has(HIGHLIGHT_NAME)).toBe(false);
    });

    it('highlights when the term length equals the minimum length', async () => {
      const { componentClassInstance, fixture } = await render(BasicHostComponent);

      componentClassInstance.minLength.set(3);
      componentClassInstance.searchTerm.set('hel');
      await fixture.whenStable();

      expect(highlightedText(HIGHLIGHT_NAME)).toEqual(['Hel', 'Hel']);
    });

    it('trims and matches case-insensitively', async () => {
      const { componentClassInstance, fixture } = await render(BasicHostComponent);

      componentClassInstance.searchTerm.set('  HELLO  ');
      await fixture.whenStable();

      expect(highlightedText(HIGHLIGHT_NAME)).toEqual(['Hello', 'Hello']);
    });

    it('removes the highlight when the directive is destroyed', async () => {
      const { componentClassInstance, fixture } = await render(BasicHostComponent);

      componentClassInstance.searchTerm.set('hello');
      await fixture.whenStable();
      expect(CSS.highlights.has(HIGHLIGHT_NAME)).toBe(true);

      fixture.destroy();

      expect(CSS.highlights.has(HIGHLIGHT_NAME)).toBe(false);
    });
  });

  describe('named search terms', () => {
    it('highlights only the target paired with a named search', async () => {
      const { componentClassInstance, fixture } = await render(NamedTargetsHostComponent);

      componentClassInstance.col1Term.set('column');
      await fixture.whenStable();

      expect(highlightedText(HIGHLIGHT_NAME)).toEqual(['Column']);
    });

    it('stops highlighting once the named search term is cleared', async () => {
      const { componentClassInstance, fixture } = await render(NamedTargetsHostComponent);

      componentClassInstance.col1Term.set('column');
      await fixture.whenStable();
      expect(CSS.highlights.has(HIGHLIGHT_NAME)).toBe(true);

      componentClassInstance.col1Term.set('');
      await fixture.whenStable();

      expect(CSS.highlights.has(HIGHLIGHT_NAME)).toBe(false);
    });

    it('supports multiple named searches simultaneously', async () => {
      const { componentClassInstance, fixture } = await render(NamedTargetsHostComponent);

      componentClassInstance.col1Term.set('one');
      componentClassInstance.col2Term.set('two');
      await fixture.whenStable();

      expect(highlightedText(HIGHLIGHT_NAME).sort()).toEqual(['One', 'Two']);
    });
  });
});
