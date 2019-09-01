import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {AuthGuard} from './helpers/auth.guard';
import {LoginComponent} from './components/login/login.component';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },

  // de otra forma redirigimos a home
  { path: '**', redirectTo: '' }
];

export const appRoutingModule = RouterModule.forRoot(routes);
