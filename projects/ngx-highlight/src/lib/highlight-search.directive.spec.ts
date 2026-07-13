import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HighlightGroupDirective } from './highlight-group.directive';
import { HighlightSearchDirective } from './highlight-search.directive';

@Component({
  template: `
    <div [ngxHighlightGroup]="'test-highlight'">
      <div [ngxHighlightSearch]="searchName()" [highlightSearchTerm]="searchTerm()"></div>
    </div>
  `,
  selector: 'ngx-host-component',
  imports: [HighlightGroupDirective, HighlightSearchDirective],
})
class HostComponent {
  readonly searchName = signal('column1');
  readonly searchTerm = signal<string | null | undefined>('test');
}

describe('HighlightSearchDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let groupDirective: HighlightGroupDirective;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
    });

    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();

    const groupEl = fixture.debugElement.children[0];
    groupDirective = groupEl.injector.get(HighlightGroupDirective);
  });

  it('should call registerNamedSearch when search term is a non-empty string', async () => {
    const spy = vi.spyOn(groupDirective, 'registerNamedSearch');

    fixture.componentInstance.searchTerm.set('hello');
    await fixture.whenStable();

    expect(spy).toHaveBeenCalledWith('column1', 'hello');
  });

  it('should call unregisterNamedSearch when search term is null', async () => {
    const spy = vi.spyOn(groupDirective, 'unregisterNamedSearch');

    fixture.componentInstance.searchTerm.set(null);
    await fixture.whenStable();

    expect(spy).toHaveBeenCalledWith('column1');
  });

  it('should call unregisterNamedSearch when search term is undefined', async () => {
    const spy = vi.spyOn(groupDirective, 'unregisterNamedSearch');

    fixture.componentInstance.searchTerm.set(undefined);
    await fixture.whenStable();

    expect(spy).toHaveBeenCalledWith('column1');
  });

  it('should call unregisterNamedSearch when search term is empty string', async () => {
    const spy = vi.spyOn(groupDirective, 'unregisterNamedSearch');

    fixture.componentInstance.searchTerm.set('');
    await fixture.whenStable();

    expect(spy).toHaveBeenCalledWith('column1');
  });

  it('should call unregisterNamedSearch on destroy', () => {
    const spy = vi.spyOn(groupDirective, 'unregisterNamedSearch');

    fixture.destroy();

    expect(spy).toHaveBeenCalledWith('column1');
  });

  it('should update registration when search name changes', async () => {
    const registerSpy = vi.spyOn(groupDirective, 'registerNamedSearch');

    fixture.componentInstance.searchName.set('column2');
    fixture.componentInstance.searchTerm.set('world');
    await fixture.whenStable();

    expect(registerSpy).toHaveBeenCalledWith('column2', 'world');
  });
});
