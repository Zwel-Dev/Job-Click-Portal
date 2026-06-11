import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
 { path: 'auth', loadChildren: () => import('./pages/systematic/modules/auth/auth.module').then(m => m.AuthModule) },
];

@NgModule({
imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  
  exports: [RouterModule]
})
export class AppRoutingModule { }
