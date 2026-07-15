import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// 🔑 CAMBIO 1: Reemplazamos SupabaseService por IngredientesService
import { IngredientesService } from '../../services/ingredientes.service';
import { SupabaseService } from '../../services/supabase.service'; // Mantenemos para el rol y el Soft Delete
import { Router, RouterModule } from '@angular/router';
import {IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonChip,
  IonButton,
  IonSearchbar,
  IonIcon} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  addCircleOutline,
  createOutline,
  trashOutline,
  repeatOutline
} from 'ionicons/icons';

import { Ingrediente, UserRole } from '../../models/database.types';

@Component({
  selector: 'app-ingredientes',
  templateUrl: './ingredientes.page.html',
  styleUrls: ['./ingredientes.page.scss'],
  standalone: true,
  imports: [CommonModule, // Necesario para el pipe 'number' y directivas *ngIf/*ngFor
    RouterModule,
    // Lista de Componentes de Ionic:
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonList,
    IonItem,
    IonLabel,
    IonText,
    IonChip,
    IonButton,
    IonIcon,
    IonSearchbar
  ]
})
export class IngredientesPage {

  // Mantenemos SupabaseService para el getUserRole y el softDelete (operaciones remotas)
  private supabaseService = inject(SupabaseService);
  // 🔑 CAMBIO 2: Inyectamos el servicio de lectura local/remota
  private ingredientesService = inject(IngredientesService);
  private router = inject(Router);

  // Propiedades para la vista
  ingredientes: Ingrediente[] = [];
  userRole: UserRole = 'user';
  isLoading: boolean = false;

  public searchTerm: string = '';

  /**
   * Captura el evento de la barra de búsqueda y actualiza el término de búsqueda.
   */
  handleSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();

    // 🚨 Vuelve a cargar los datos con el nuevo término de búsqueda
    this.loadData();
  }

  constructor() {
    addIcons({
      'add-circle-outline': addCircleOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'repeat-outline': repeatOutline
    });
  }

  // Usamos este hook para cargar datos cada vez que la página se vuelve visible
  async ionViewWillEnter() {
    await this.loadData();
  }

  // Método para cargar los datos y el rol
  async loadData() {
    this.isLoading = true;
    try {
      // 1. Obtener el rol del usuario (Sigue siendo una operación remota, usa SupabaseService)
      this.userRole = await this.supabaseService.getUserRole();

      // 🔑 CAMBIO 3: Obtener los ingredientes del nuevo servicio (lee de SQLite primero)
      this.ingredientes = await this.ingredientesService.getIngredientes(this.searchTerm);
      // El método 'getIngredientes' en IngredientesService garantiza que:
      // A. Se lea de SQLite, eliminando la latencia.
      // B. Si SQLite falla o no es nativo, se recurra al SupabaseService original.

    } catch (error) {
      console.error('Error al cargar datos:', error);
      // Podrías mostrar una alerta o un mensaje de error aquí
    } finally {
      this.isLoading = false;
    }
  }

  // Método placeholders para las acciones del CRUD del Administrador
  public edit(id: string) {

    this.router.navigate(['/ingredientes', id]);
  }



  async softDelete(id: string, nombre: string, isCurrentlyDeleted: boolean) {
    // El nuevo estado es el opuesto al actual
    const newState = !isCurrentlyDeleted;

    // Determinar la acción para el mensaje
    const action = newState ? 'ELIMINAR suavemente' : 'RESTAURAR';

    if (confirm(`¿Estás seguro de ${action} el ingrediente "${nombre}"?`)) {
      try {
        // 1. Llamar al servicio para cambiar el estado en la DB (remoto)
        await this.supabaseService.softDeleteIngrediente(id, newState);

        // 2. Recargar la lista para que el cambio de estado se refleje en la vista
        await this.loadData();

        // 🚨 MEJORA: Después de una operación exitosa de softDelete/restore,
        // deberíamos re-sincronizar el dato o actualizar la caché local para
        // consistencia inmediata si el usuario está online. Por ahora, solo recargamos la vista.

        alert(`Ingrediente "${nombre}" ${newState ? 'ELIMINADO' : 'RESTAURADO'} con éxito.`);

      } catch (error) {
        console.error(`Error al ejecutar ${action}:`, error);
        alert(`Error al ejecutar ${action}. Verifica los permisos RLS (UPDATE para Administradores).`);
      }
    }
  }

  isAdministrador(): boolean {
    return this.userRole === 'administrador';
  }
}