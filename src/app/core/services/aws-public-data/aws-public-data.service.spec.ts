import { TestBed } from '@angular/core/testing';

import { AwsPublicDataService } from './aws-public-data.service';

describe('AwsPublicDataService', () => {
  let service: AwsPublicDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AwsPublicDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
