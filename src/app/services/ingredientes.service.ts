import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Ingrediente, UnidadMedida } from '../models/database.types';

@Injectable({
    providedIn: 'root'
})
export class IngredientesService {

    private supabaseService = inject(SupabaseService);

    constructor() {}



    /* -------------------------------------------------------------
       LECTURA PRINCIPAL DE INGREDIENTES
       ------------------------------------------------------------- */

    /**
     * Obtiene la lista de ingredientes activos desde Supabase.
     */
    public async getIngredientes(searchText?: string): Promise<Ingrediente[]> {
        const ingredientesRemotos = await this.supabaseService.getIngredientes(searchText);
        console.log(`[IngredientesService] 🌐 Leyendo ${ingredientesRemotos.length} ingredientes desde Supabase.`);
        return ingredientesRemotos;
    }

    /* -------------------------------------------------------------
       LECTURA DE UNIDADES DE MEDIDA
       ------------------------------------------------------------- */

    /**
     * Obtiene la lista de unidades de medida desde Supabase.
     */
    public async getUnidadesMedida(): Promise<UnidadMedida[]> {
        const unidadesRemotas = await this.supabaseService.getUnidadesMedida();
        console.log('[IngredientesService] 🌐 Leyendo unidades desde Supabase.');
        return unidadesRemotas;
    }
}