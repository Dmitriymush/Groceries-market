import { describe, it, expect, beforeEach } from 'vitest';
import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AutoFocusDirective } from './auto-focus.directive';

@Component({
  template: `<input appAutoFocus />`,
  standalone: true,
  imports: [AutoFocusDirective],
})
class TestHostComponent {}

describe('AutoFocusDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create the directive', () => {
    const input = fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
  });
});
