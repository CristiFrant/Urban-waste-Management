import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './pages/home/home.component';
// Importurile acum vor fi valide deoarece componentele au fost generate
import { LoginComponent } from './pages/home/login/login.component';
import { RegisterComponent } from './pages/home/register/register.component';
// import { ProfileComponent } from './pages/profile/profile.component';
import { EsriMapComponent } from './pages/home/map/esri-map.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'map', // Corespunde routerLink="/map" din navigație
    component: EsriMapComponent,
  },
  // {
  //   path: 'profile', // Corespunde routerLink="/profile" din navigație
  //   // component: ProfileComponent,
  // },
  {
    path: '',
    redirectTo: 'login', // Redirecționare inițială către pagina de login
    pathMatch: 'full',
  },
  {
    path: '**', // Protecție pentru rute inexistente
    redirectTo: 'login'
  }
];

const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}