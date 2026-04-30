import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { noAuthGuard } from '@core/guards/no-auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('@modules/auth/auth.routes').then((m) => m.AUTH_ROUTES),
    canActivate: [noAuthGuard],
  },
  {
    path: 'signup',
    loadComponent: () => import('@modules/auth/pages/signup/signup.component').then((m) => m.SignupComponent),
    canActivate: [noAuthGuard],
  },
  {
    path: 'groceries',
    loadChildren: () => import('@modules/groceries/groceries.routes').then((m) => m.GROCERIES_ROUTES),
    canActivate: [authGuard],
  },
  { path: '', redirectTo: 'groceries', pathMatch: 'full' },
  { path: '**', redirectTo: 'groceries' },
];
