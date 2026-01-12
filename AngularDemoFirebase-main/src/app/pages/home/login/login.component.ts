import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service'; // Asigură-te că path-ul este corect

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(form: NgForm) {
    if (form.invalid) return;

    const email = form.value.email;
    const password = form.value.password;

    this.authService.login(email, password)
      .then(result => {
        console.log("Logare reușită:", result);
        // Redirecționare către Home sau Map după logare
        this.router.navigate(['/home']); 
      })
      .catch(error => {
      // Gestionarea erorilor comune Firebase
      if (error.code === 'auth/user-not-found') alert("Utilizatorul nu există.");
      else if (error.code === 'auth/wrong-password') alert("Parolă incorectă.");
      else alert("Eroare la autentificare: " + error.message);
    });
  }
}