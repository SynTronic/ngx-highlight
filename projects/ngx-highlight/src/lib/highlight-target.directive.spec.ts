import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { HighlightTargetDirective } from './highlight-target.directive';

@Component({
  selector: 'ngx-test-simple-host',
  template: `<span ngxHighlightTarget>Hello World</span>`,
  imports: [HighlightTargetDirective],
})
class SimpleHostComponent {
  readonly target = viewChild.required(HighlightTargetDirective);
}

@Component({
  selector: 'ngx-test-named-host',
  template: `<span ngxHighlightTarget="columnA">Column Text</span>`,
  imports: [HighlightTargetDirective],
})
class NamedHostComponent {
  readonly target = viewChild.required(HighlightTargetDirective);
}

@Component({
  selector: 'ngx-test-nested-host',
  template: `
    <div ngxHighlightTarget>
      <span>Hello</span>
      <span>World Hello</span>
    </div>
  `,
  imports: [HighlightTargetDirective],
})
class NestedHostComponent {
  readonly target = viewChild.required(HighlightTargetDirective);
}

@Component({
  selector: 'ngx-test-multiple-host',
  template: `<span ngxHighlightTarget>foo bar foo baz foo</span>`,
  imports: [HighlightTargetDirective],
})
class MultipleOccurrencesHostComponent {
  readonly target = viewChild.required(HighlightTargetDirective);
}

describe('HighlightTargetDirective', () => {
  describe('collectRanges', () => {
    let fixture: ComponentFixture<SimpleHostComponent>;
    let directive: HighlightTargetDirective;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [SimpleHostComponent],
      });

      fixture = TestBed.createComponent(SimpleHostComponent);
      await fixture.whenStable();
      directive = fixture.componentInstance.target();
    });

    it('should return empty ranges when search term is empty', () => {
      const ranges = directive.collectRanges('');
      expect(ranges).toEqual([]);
    });

    it('should find a single occurrence and set correct positions', () => {
      const ranges = directive.collectRanges('hello');
      expect(ranges).toHaveLength(1);
      expect(ranges[0].startOffset).toBe(0);
      expect(ranges[0].endOffset).toBe(5);
    });

    it('should find text case-insensitively (pre-normalized term)', () => {
      const ranges = directive.collectRanges('world');
      expect(ranges).toHaveLength(1);
      expect(ranges[0].startOffset).toBe(6);
      expect(ranges[0].endOffset).toBe(11);
    });

    it('should return empty ranges when search term does not match', () => {
      const ranges = directive.collectRanges('xyz');
      expect(ranges).toEqual([]);
    });

    it('should find partial matches within words', () => {
      const ranges = directive.collectRanges('llo');
      expect(ranges).toHaveLength(1);
      expect(ranges[0].startOffset).toBe(2);
      expect(ranges[0].endOffset).toBe(5);
    });
  });

  describe('with named target', () => {
    let fixture: ComponentFixture<NamedHostComponent>;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [NamedHostComponent],
      });

      fixture = TestBed.createComponent(NamedHostComponent);
      await fixture.whenStable();
    });

    it('should expose highlightSearchTargetName', () => {
      const directive = fixture.componentInstance.target();
      expect(directive.highlightSearchTargetName()).toBe('columnA');
    });

    it('should still collect ranges normally', () => {
      const directive = fixture.componentInstance.target();
      const ranges = directive.collectRanges('column');
      expect(ranges).toHaveLength(1);
    });
  });

  describe('with nested text nodes', () => {
    let fixture: ComponentFixture<NestedHostComponent>;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [NestedHostComponent],
      });

      fixture = TestBed.createComponent(NestedHostComponent);
      await fixture.whenStable();
    });

    it('should find occurrences across multiple text nodes', () => {
      const directive = fixture.componentInstance.target();
      const ranges = directive.collectRanges('hello');
      expect(ranges).toHaveLength(2);
    });

    it('should find text in specific nested nodes', () => {
      const directive = fixture.componentInstance.target();
      const ranges = directive.collectRanges('world');
      expect(ranges).toHaveLength(1);
    });
  });

  describe('with multiple occurrences in same node', () => {
    let fixture: ComponentFixture<MultipleOccurrencesHostComponent>;

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [MultipleOccurrencesHostComponent],
      });

      fixture = TestBed.createComponent(MultipleOccurrencesHostComponent);
      await fixture.whenStable();
    });

    it('should find all occurrences', () => {
      const directive = fixture.componentInstance.target();
      const ranges = directive.collectRanges('foo');
      expect(ranges).toHaveLength(3);
    });

    it('should set correct positions for each occurrence', () => {
      const directive = fixture.componentInstance.target();
      const ranges = directive.collectRanges('foo');
      // "foo bar foo baz foo"
      //  0       8       16
      expect(ranges[0].startOffset).toBe(0);
      expect(ranges[0].endOffset).toBe(3);
      expect(ranges[1].startOffset).toBe(8);
      expect(ranges[1].endOffset).toBe(11);
      expect(ranges[2].startOffset).toBe(16);
      expect(ranges[2].endOffset).toBe(19);
    });
  });
});
