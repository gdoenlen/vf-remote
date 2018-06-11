import { TestBed, inject } from '@angular/core/testing';

import { VfRemoteService } from './vf-remote.service';

describe('VfRemoteService', () => {
  beforeEach(() => {
    (window as any).Visualforce = { remoting: { last: { actions: { testCtrl: { } } } } };
    
    for (const controller in (window as any).Visualforce.remoting.last.actions) {
      window[controller] = { testFunc: () => {} }
    }

    TestBed.configureTestingModule({
      providers: [
        { provide: 'Window', useValue: window},
        VfRemoteService
      ]
    });
  });

  afterAll(() => {
    delete window['Visualforce'];
  });  

  it('should find all controllers declared on Visualforce.remoting.last.actions', inject([VfRemoteService], (service: VfRemoteService) => {
    for (const controller in (window as any).Visualforce.remoting.last.actions) {
      expect(service[controller]).not.toBe(undefined);  
    }
  }));

  it('should find all functions on all controllers', inject([VfRemoteService], (service: VfRemoteService) => {
    for (const controller in (window as any).Visualforce.remoting.last.actions) {
      const wCtrl = window[controller];
      for (const prop in wCtrl) {
        if (typeof wCtrl[prop] === 'function') {
          expect(service[controller][prop]).not.toBe(undefined);
        } else {
          expect(service[controller][prop].toBe(undefined));
        }
      }      
    }
  }));

  it('should throw if the controller does not exist', inject([VfRemoteService], (service: VfRemoteService) => {
    const controller = 'does not exist';
    expect(() => { service.getCtrl(controller); }).toThrow(new Error(`${controller} is not an available remoting controller`));
  }));

  it('should throw if a function does not exist on a controller', inject([VfRemoteService], (service: VfRemoteService) => {
      const controller = 'testCtrl';
      const method = 'does not exist';
      expect(() => { service.getFn(controller, method) }).toThrow(new Error(`${method} is not an available remote action on ${controller}`));
  }));
});
