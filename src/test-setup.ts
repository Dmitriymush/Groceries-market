import 'fake-indexeddb/auto';
import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { beforeEach } from 'vitest';

let initialized = false;

beforeEach(() => {
  if (!initialized) {
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
    initialized = true;
  }
  TestBed.resetTestingModule();
});
