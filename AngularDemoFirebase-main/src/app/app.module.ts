import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms"; // [cite: 78, 92]
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout'; // 

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module"; // [cite: 4]

// Firebase [cite: 4, 11, 84]
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireAuthModule } from '@angular/fire/compat/auth'; // Necesar pentru AuthService 

// Servicii [cite: 83, 85, 92]
import { FirebaseService } from './services/firebase';
import { AuthService } from './services/auth.service';
import { ReportsService } from './services/reports.service';
import { SuperheroFactoryService } from "./services/superhero-factory";

// Componente Pagini 
import { HomeComponent } from "./pages/home/home.component";
import { LoginComponent } from "./pages/home/login/login.component";
import { RegisterComponent } from "./pages/home/register/register.component";
// import { ProfileComponent } from "./pages/profile/profile.component";
// import { EsriMapComponent } from "./pages/esri-map/esri-map.component";

// Angular Material 
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card'; // Rezolvă eroarea mat-card
import { MatFormFieldModule } from '@angular/material/form-field'; // Rezolvă eroarea mat-form-field
import { MatInputModule } from '@angular/material/input'; // Necesar pentru input-urile Material
import { EsriMapComponent } from "./pages/home/map/esri-map.component";
import { MatIconModule } from '@angular/material/icon';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    // ProfileComponent,
    EsriMapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule, // Important pentru logica de Login/Register [cite: 78, 92]
    FlexLayoutModule,
    // Configurare Firebase [cite: 4, 11]
    AngularFireModule.initializeApp(environment.firebase, 'AngularDemoFirebase'),
    AngularFireDatabaseModule,
    AngularFireAuthModule, // Modulul de autentificare 
    // Material Design 
    MatTabsModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  providers: [
    FirebaseService,
    AuthService,
    ReportsService,
    SuperheroFactoryService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }