// src/app/services/cotizacion.service.ts - CÓDIGO FINAL CON LÓGICA DE CONMUTACIÓN

import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { CotizacionData } from '../models/database.types';

// ==============================================
// 1. INTERFACES DE DATOS (Mantenidas)
// ==============================================

// Interfaz para la cotización con los campos que el frontend necesita
export interface CotizacionFront {
    id: string; // cot_id
    nombre: string; // cot_nombre (requerido para el listado)
    total: number; // cot_total
    descripcion: string | null; // cot_descripcion

    // Campos de Cliente asociados (necesarios para pre-rellenar el pedido)
    clienteNombre: string | null;
    clienteApellido: string | null;
    clienteTelefono: string | null;
    clienteInstagram: string | null

    // (Puedes agregar más campos si es necesario)
}

@Injectable({
    providedIn: 'root',
})
export class CotizacionService {
    private supabaseService = inject(SupabaseService);

    constructor() {}

    /* -------------------------------------------------------------
       LECTURA (LISTADO) - LÓGICA DE CONMUTACIÓN
       ------------------------------------------------------------- */

    /**
     * 🔑 Obtiene una lista de cotizaciones que están listas para ser convertidas a pedido.
     * @returns Promesa que resuelve a un array de CotizacionFront.
     */
    async listAvailableToConvert(): Promise<CotizacionFront[]> {
        const isOnline = await this.supabaseService.isOnline();
        if (!isOnline) {
            throw new Error('Sin conexión. Esta versión demo funciona sólo online.');
        }

        console.log('COTIZACIÓN: Obteniendo cotizaciones ONLINE (Supabase).');
        return this.listAvailableToConvertOnline();
    }


    /**
     * Lógica pura de Supabase para obtener cotizaciones disponibles (SU LÓGICA ORIGINAL)
     */
    private async listAvailableToConvertOnline(): Promise<CotizacionFront[]> {
        const { data: cotizacionesData, error } = await this.supabaseService.supabaseClient
            .from('cotizacion')
            .select(`
            id:cot_id,
            nombre:cot_nombre,
            total:cot_total
        `)
            .not('cot_nombre', 'is', null);

        if (error) {
            console.error('Supabase Error (listAvailableToConvertOnline):', error);
            throw new Error('Error al cargar la lista de cotizaciones online.');
        }

        // Mapeo adaptado: Los campos de cliente serán NULL, ya que no hay JOIN
        return cotizacionesData.map((dbCot: any) => {
            return {
                id: dbCot.id,
                nombre: dbCot.nombre,
                total: dbCot.total,
                descripcion: dbCot.descripcion || 'N/A',
                clienteNombre: null,
                clienteApellido: null,
                clienteTelefono: null,
                clienteInstagram: null
            } as CotizacionFront;
        });
    }

    /* -------------------------------------------------------------
       ESCRITURA (CREAR) - Lógica Existente (SIN CAMBIOS)
       ------------------------------------------------------------- */

    async createCotizacion(data: CotizacionData): Promise<any> {
        const isOnline = await this.supabaseService.isOnline();
        if (!isOnline) {
            throw new Error('Sin conexión. Esta versión demo funciona sólo online.');
        }

        const sanitizedData = {
            cot_id: (data as any).cot_id, // Usamos 'as any' porque CotizacionData no se definió
            cot_nombre: (data as any).cot_nombre,
            cot_total: (data as any).cot_total,
            cot_fecha: (data as any).cot_fecha || new Date().toISOString(),

            // Asumimos que los detalles también se adjuntan para Sync Down
            detalles: (data as any).cotizacion_detalle || (data as any).detalles,
        };


        console.log('COTIZACIÓN: Creando cotización ONLINE en Supabase.');
        return this.supabaseService.createCotizacion(sanitizedData);
    }
}