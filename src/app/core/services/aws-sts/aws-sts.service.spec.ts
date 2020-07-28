import { TestBed } from '@angular/core/testing';

import { AwsStsService } from './aws-sts.service';

describe('AwsStsService', () => {
  let service: AwsStsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AwsStsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
