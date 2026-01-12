import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
// 1. Importă serviciul pentru baza de date
import { AngularFireDatabase } from '@angular/fire/compat/database'; 

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  constructor(
    private authService: AuthService, 
    private router: Router,
    // 2. Injectează-l aici în constructor ca 'db'
    private db: AngularFireDatabase 
  ) {}

  onRegister(form: NgForm) {
    if (form.invalid) return;

    const email = form.value.email;
    const password = form.value.password;

    this.authService.register(email, password)
      .then(credential => {
        console.log("Cont creat în Auth:", credential.user.uid);

        // 3. Acum 'this.db' va funcționa fără erori
        const uid = credential.user.uid;
        
        this.db.object(`users/${uid}`).set({
          email: email,
          data_inregistrare: Date.now(),
          role: 'user' // Rol implicit conform documentației [cite: 3]
        }).then(() => {
          console.log("Datele profilului au fost salvate în Realtime DB");
          this.router.navigate(['/home']);
        });

      })
      .catch(error => {
        console.error("Eroare la înregistrare:", error);
        alert("Eroare: " + error.message);
      });
  }
}