import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  // Creare cont nou
  register(email: string, pass: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, pass);
  }

  // Logare
  login(email: string, pass: string) {
    return this.afAuth.signInWithEmailAndPassword(email, pass);
  }

  // Delogare
  logout() {
    return this.afAuth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }

  // Verificare status utilizator
  get currentUser() {
    return this.afAuth.authState;
  }
}