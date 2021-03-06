# Synopsis
VF Remote is an angular 2 service that will automatically hook all available @RemoteAction methods that are available in your VisualForce Page. 

## Dependencies
The service is only dependent upon Injectable from the angular 2 package (@angular/core). You just need to make sure you have angular installed.

The only other dependency is that all the files are within the same folder in your project.

## Usage
You use this service by providing the window object in your ngModule of your app:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    { provide: 'Window', useValue: window }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

and then injecting the service where you need it:

```typescript
import { Component } from '@angular/core';
import { VfRemoteService } from "./path/to/vf-remote.service";

@Component({
    selector: 'example-app',
    templateUrl: './example-app.component.html',
    styleUrls: ['./example-app.component.css']
})
export class ExampleAppComponent { 
    constructor(private vfRemote: VfRemoteService) {

    }
}
```
and calling the controller/method by
dynamically getting it from the service: 

```typescript
let fn = vfRemote["controller"]["method"]
fn().then(result => { return result }).catch(reason => console.log(reason));
```
or

using the provided getter methods:

```typescript
let ctrl: VfRemoteController = vfRemote.getCtrl("Controller");
let fn = vfRemote.getFn("Controller", "method");
```
