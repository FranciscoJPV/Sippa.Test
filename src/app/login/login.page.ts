// src/app/login/login.page.ts - CÓDIGO FINAL CORREGIDO

import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { CommonModule } from '@angular/common';

//Importo el servicio centralizado para mostrar mensajes.
import { ToastService } from 'src/app/services/toast.service';

//IMPORTACIONES INDIVIDUALES DE IONIC:
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton
} from '@ionic/angular/standalone';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  //Propiedades requeridas para Componentes Autónomos
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    IonContent,
    IonCard,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton
  ]
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private toastService = inject(ToastService);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, /*Validators.minLength(6)*/]],
  });

  /**
   * Manejo el inicio de sesión, diferenciando entre flujo online y offline.
   */
  async signIn() {
    // 1. Validación de Formulario
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.presentToast('Por favor, ingresa credenciales válidas.', 'warning');
      return;
    }

    const email = this.form.value.email;
    const password = this.form.value.password;

    try {
      await this.supabaseService.signIn(email, password);
      this.toastService.presentToast('Inicio de sesión exitoso.', 'success');
      this.router.navigate(['/home'], { replaceUrl: true });

    } catch (e: any) {
      const msg = e.message.includes('Invalid login credentials') ?
          'Credenciales inválidas. Verifica tu email y contraseña.' :
          'Error al iniciar sesión: ' + e.message;

      this.toastService.presentToast(msg, 'error');
    }
  }
}