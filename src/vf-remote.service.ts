/*!
 *    MIT License
 *
 *    Copyright (c) 2017 George Doenlen
 *
 *    Permission is hereby granted, free of charge, to any person obtaining a copy
 *    of this software and associated documentation files (the "Software"), to deal
 *    in the Software without restriction, including without limitation the rights
 *    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *    copies of the Software, and to permit persons to whom the Software is
 *    furnished to do so, subject to the following conditions:
 *
 *    The above copyright notice and this permission notice shall be included in all
 *    copies or substantial portions of the Software.
 *
 *    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *    SOFTWARE.
 */

/**
 * This service provides accessbility to all Visualforce @RemoteAction methods that are available in the visualforce page.
 * You use this service by injecting it where you need it and calling the controller/method by
 * dynamically getting it from the service: vfRemote["controller"]["method"]
 * or
 * using the provided getter methods:
 * let ctrl: VfRemoteController = vfRemote.getCtrl("Controller");
 * let fn = vfRemote.getFn("Controller", "method");
 * 
 * @author George Doenlen
 */
///<reference path="./visual-force.d.ts"/>
import { Injectable } from "@angular/core";
import { SFDCEvent } from "./sfdc-event";
import { VfRemoteController } from "./vf-remote-controller";

@Injectable()
export class VfRemoteService {

    public constructor() { 
        this.registerMethods();
    }

    public getCtrl(controller: string): VfRemoteController {
        if(!this.hasOwnProperty(controller)) {
            throw `${controller} is not an available remoting controller`;
        }
        return this[controller];
    }

    public getFn(controller: string, method: string) : (...args: Array<any>) => Promise<any | Error> {
        const ctrl = this.getCtrl(controller);
        if(!ctrl.hasOwnProperty(method)) {
            throw `${method} is not an available remote action on ${controller}`;
        }
        return ctrl[method];
    }

    /**
     * Finds all @RemoteAction methods from available controllers and adds them as properties on the service.
     */
    private registerMethods(): void {
        /*
         * All available controllers with remoting methods sit on this 'actions' object.
         * The properties of this object will be named by the name of the controller.
         * 
         * That is if you have a page controller named: MyController there will be a property
         * called MyController.
         * actions: { MyController: { } }
         * 
         * We only use this to get the names of available controllers, the data inside of these objects
         * is not relevant.
         */
        const actions: Object = Visualforce.remoting.last.actions;
        for(const controller in actions) {
            if(!this.hasOwnProperty(controller)) {
                this[controller] = new VfRemoteController();
            }
            //the actual javascript functions for the controller sit on an object declared in the global window.
            const wCtrl: Object = window[controller];
            for(const prop in wCtrl) {
                if(wCtrl.hasOwnProperty(prop) && typeof wCtrl[prop] === "function") {
                    const fn: Function = wCtrl[prop];
                    const boundFn = fn.bind(wCtrl);
                    this[controller][prop] = this.wrap(boundFn);
                }
            }
        }
    }

    /**
     * Wraps the bound function in another function that will return a promise.
     * Sets up the arguments, callback, and options for the @RemoteAction call
     * 
     * @param fn The visualfore remoting function from the window that will be wrapped
     * @return Promise containing your result or an error.
     */
    private wrap(fn: Function): (...args: Array<any>) => Promise<any | Error> {
        return (...args: Array<any>): Promise<any | Error> => {
            let ret: Promise<any | Error> = new Promise((resolve, reject): void => {
                let callback = (result: any, event: SFDCEvent) => {
                    if(event.status) {
                        resolve(result);
                    } else {
                        let err = new Error(event.message);
                        if(event.type === "exception") {
                            err.stack = event.where;
                        }
                        reject(err);
                    }
                }
                args.push(callback);
                args.push({ buffer: true, escape: true });

                fn.apply(null, args);
            });
            
            return ret;
        }
    }
}
