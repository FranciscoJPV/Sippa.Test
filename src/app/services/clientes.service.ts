// src/app/services/clientes.service.ts

import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { ClienteInsert, Cliente } from '../models/database.types'; // Asume que este tipo existe

@Injectable({
    providedIn: 'root'
})
export class ClientesService {
    private supabaseService = inject(SupabaseService);

    constructor() {}

    /**
     * Crea un nuevo cliente en Supabase.
     */
    async createCliente(clientInfo: ClienteInsert): Promise<string> {
        const isOnline = await this.supabaseService.isOnline();
        if (!isOnline) {
            throw new Error('Sin conexión. Esta versión demo funciona sólo online.');
        }

        console.log('CLIENTE: Creando cliente ONLINE en Supabase.');
        return this.createClienteOnline(clientInfo);
    }

    /**
    * Lógica pura de Supabase para crear un cliente (usada por createCliente).
     * @param clientInfo Datos del cliente a insertar.
     * @returns Promesa que resuelve al ID del cliente creado.
     */
    public async createClienteOnline(clientInfo: ClienteInsert): Promise<string> {
        const { data: newClient, error: clientError } = await this.supabaseService.supabaseClient
            .from('cliente')
            .insert(clientInfo)
            .select('cli_id')
            .single();

        if (clientError || !newClient) {
            console.error('Error al crear cliente ONLINE:', clientError);
            throw new Error('Error al crear el cliente en Supabase.');
        }

        return (newClient as any).cli_id;
    }

    public async getClientes(): Promise<Cliente[]> {
        const isOnline = await this.supabaseService.isOnline();
        if (!isOnline) {
            throw new Error('Sin conexión. Esta versión demo funciona sólo online.');
        }

        console.log('CLIENTE: Obteniendo clientes ONLINE (Supabase).');
        return this.getClientesOnline();
    }

    /**
     * Obtiene la lista de clientes desde Supabase (usado en modo Online).
     */
    private async getClientesOnline(): Promise<Cliente[]> {
        // Reutilizamos el método de SyncDown que ya existe en SupabaseService
        const clientesRaw = await this.supabaseService.getAllClientesForSync();

        // Asumimos que getAllClientesForSync devuelve una estructura compatible con Cliente[]
        return clientesRaw as Cliente[];
    }

}