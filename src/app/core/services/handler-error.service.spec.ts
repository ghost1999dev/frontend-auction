import { TestBed } from '@angular/core/testing';

import { HandlerErrorService } from './handler-error.service';

describe('HandlerErrorService', () => {
  let service: HandlerErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HandlerErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
