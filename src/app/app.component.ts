import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/components/navbar.component';
import { AngularVlibras } from 'angular-vlibras';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, AngularVlibras],
  template: `
    <app-navbar></app-navbar>
    <main>
      <router-outlet></router-outlet>
      <angular-vlibras avatar="icaro" />
    </main>
  `,
  styles: [],
})
export class AppComponent {}
