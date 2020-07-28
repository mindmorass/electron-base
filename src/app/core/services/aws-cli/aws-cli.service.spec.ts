import { TestBed } from '@angular/core/testing';

import { AwsCliService } from './aws-cli.service';

describe('AwsCliService', () => {
  let service: AwsCliService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AwsCliService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
