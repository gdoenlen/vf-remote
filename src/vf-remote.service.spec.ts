import { TestBed, inject } from '@angular/core/testing';

import { VfRemoteService } from './vf-remote.service';

describe('VfRemoteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VfRemoteService]
    });
  });

  it('should ...', inject([VfRemoteService], (service: VfRemoteService) => {
    expect(service).toBeTruthy();
  }));
});
