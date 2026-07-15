import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ReactiveFormsModule,
    FormBuilder,
    Validators,
    FormControl,
    AbstractControl,
    ValidationErrors
} from '@angular/forms';
import {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonButtons,
    IonSelect,
    IonSelectOption,
    IonList,
    IonListHeader,
} from '@ionic/angular/standalone';
import { PedidosService, PedidoFront } from '../services/pedidos.service';
import { CotizacionService, CotizacionFront } from '../services/cotizacion.service';
import { SupabaseService } from '../services/supabase.service'; // 🔑 ADICIÓN DE IMPORT
import { CotizacionDetalleExtendida } from '../models/database.types';
import { ModalController, ToastController } from '@ionic/angular';

// -------------------------------------------------------------
// VALIDADOR: EXIGE QUE LA FECHA SEA AL MENOS MAÑANA
// (Cubre la regla de no pasado y 24h de anticipación para input de solo fecha)
// -------------------------------------------------------------

/**
 * Función auxiliar: Obtiene la fecha de mañana en formato 'YYYY-MM-DD'.
 */
const getTomorrowDateString = (): string => {
    const tomorrow = new Date();
    // Añadir un día para obtener mañana
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
}

/**
 * Validador que asegura que la fecha seleccionada no sea anterior a mañana.
 */
export function minDeliveryDateValidator(control: AbstractControl): ValidationErrors | null {
    const tomorrow = getTomorrowDateString();
    const dateValue = control.value;

    if (!dateValue) {
        return null; // El validador Validators.required se encarga de que no esté vacío.
    }

    // Si la fecha ingresada es menor (anterior) a la fecha de mañana, es inválida.
    // La comparación de strings 'YYYY-MM-DD' funciona correctamente.
    if (dateValue < tomorrow) {
        // Devolvemos el error 'minDate' con la fecha mínima requerida
        return { 'minDate': { requiredDate: tomorrow, actualDate: dateValue } };
    }

    return null; // Válido
}

// ==============================================
// MODIFICACIÓN DE INTERFAZ DEL FORMULARIO
// Eliminamos clienteDireccion y añadimos cotizacionId
// ==============================================
interface PedidoForm {
    fechaEntrega: FormControl<string | null>;

    cotizacionId: FormControl<string | null>;

    // Estos campos ahora se rellenan automáticamente desde la cotización
    descripcion: FormControl<string | null>;
    precio: FormControl<number | null>;

    clienteNombre: FormControl<string | null>;
    clienteApellido: FormControl<string | null>;
    clienteTelefono: FormControl<string | null>;
    clienteInstagram: FormControl<string | null>;
}

@Component({
    selector: 'app-pedido-form',
    standalone: true,
    imports: [CommonModule,
        ReactiveFormsModule,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonButton,
        IonItem,
        IonLabel,
        IonInput,
        IonTextarea,
        IonButtons,
        IonSelect,
        IonSelectOption,
        IonList,
        IonListHeader,
    ],
    templateUrl: 'pedido-form.component.html',
    providers: [
        ModalController,
        ToastController
    ]
})
export class PedidoFormComponent implements OnInit {
    @Input() pedido?: PedidoFront;


    private fb = inject(FormBuilder);
    private modalCtrl = inject(ModalController);
    private pedidos = inject(PedidosService);
    private cotizacionesService = inject(CotizacionService);
    private toastCtrl= inject(ToastController);
    private supabaseService = inject(SupabaseService);


    async showToast(message: string) {
        const toast = await this.toastCtrl.create({
            message: message,
            duration: 2500, // Duración en milisegundos (2.5 segundos)
            position: 'bottom', // o 'top'
            color: 'success' // Color de fondo verde para éxito
        });
        toast.present();
    }

    editable = true;
    today = new Date().toISOString().split('T')[0];

    availableQuotes: CotizacionFront[] = [];

    // Inicialización de Formulario (Tipado con la interfaz)
    form = this.fb.group<PedidoForm>({
        fechaEntrega: new FormControl(this.today, [
            Validators.required,
            minDeliveryDateValidator]),
        cotizacionId: new FormControl(null, [Validators.required]),
        descripcion: new FormControl(null),
        precio: new FormControl(null),
        clienteNombre: new FormControl(null, [Validators.required]),
        clienteApellido: new FormControl(null),
        clienteTelefono: new FormControl(null),
        clienteInstagram: new FormControl(null),
    });

    async ngOnInit() {
        // 🟦 CASO 1: CREAR pedido desde cotización
        if (!this.pedido) {
            await this.loadAvailableQuotes();

            // Cuando cambia la cotización, se rellenan campos automáticamente
            this.form.controls.cotizacionId.valueChanges.subscribe(cotId => {
                if (cotId) {
                    this.prefillFromQuote(cotId);
                }
            });

            this.editable = true; // Todos los campos pueden editarse
            return;
        }

        // 🟩 CASO 2: EDITAR pedido existente
        // Cargar datos del pedido en el formulario
        this.form.patchValue({
            fechaEntrega: this.pedido.fechaEntrega,
        });

        // Verificar si el pedido es editable según tu lógica (menos de 24h)
        try {
            this.editable = this.pedidos.isEditable(this.pedido);
        } catch {
            this.editable = false;
        }

        // 🔥 DESHABILITAR todos los campos excepto fechaEntrega
        (Object.keys(this.form.controls) as Array<keyof PedidoForm>).forEach(key => {
            if (key !== 'fechaEntrega') {
                this.form.controls[key].disable();
            }
        });

        // Si no es editable, deshabilitar también la fecha de entrega
        if (!this.editable) {
            this.form.disable();
        }
    }

    async loadAvailableQuotes() {
        try {
            this.availableQuotes = await this.cotizacionesService.listAvailableToConvert();
        } catch (e) {
            console.error("Error al cargar cotizaciones:", e);
            this.availableQuotes = [];
        }
    }

    async prefillFromQuote(cotId: string) {
        const quote = this.availableQuotes.find(c => c.id === cotId);
        if (quote) {
            this.form.controls.precio.setValue(quote.total);
            //this.form.controls.descripcion.setValue(quote.descripcion);
            this.form.controls.clienteNombre.setValue(quote.clienteNombre);
            this.form.controls.clienteApellido.setValue(quote.clienteApellido);
            this.form.controls.clienteTelefono.setValue(quote.clienteTelefono);
            this.form.controls.clienteInstagram.setValue(quote.clienteInstagram);
        }

        try {
            const detalles = await this.supabaseService.getCotizacionDetailsByCotId(cotId);

            if (detalles.length > 0) {
                // Formatear los datos como un string multilinea
                const descriptionString = detalles.map((d: CotizacionDetalleExtendida) => {
                    const ingNombre = d.ingredientes?.ing_nombre || 'Ingrediente Desconocido';
                    const unmedNombre = d.ingredientes?.unidad_medida?.unmed_nombre || 'un.';
                    const cantidad = d.cantidad_usada;

                    // Formato deseado: - Ingrediente | cantidad usada | unidad_medida
                    return `- ${ingNombre} | ${cantidad} | ${unmedNombre}`;
                }).join('\n'); // Unir cada línea con un salto de línea

                // Establecer el valor en el control de descripción
                this.form.controls.descripcion.setValue(descriptionString);
            } else {
                this.form.controls.descripcion.setValue('Cotización sin detalles de ingredientes.');
            }

        } catch (e) {
            console.error("Error al cargar detalles de la cotización:", e);
            this.form.controls.descripcion.setValue('ERROR: No se pudieron cargar los detalles de la cotización.');
        }
    }

    async submit() {

        if (this.form.invalid || !this.editable) return;
        const v = this.form.value;
        try {

            if (!this.pedido) {
                // ... (Flujo de CREACIÓN que ya funciona)
                const precio = v.precio!;
                await this.pedidos.createPedidoFromCotizacion(
                    v.cotizacionId!,
                    v.fechaEntrega!,
                    precio,
                    v.clienteNombre!,
                    v.clienteApellido || null,
                    v.clienteTelefono || null,
                    v.clienteInstagram || null


                );
                await this.showToast('Pedido creado con éxito.');

            } else {
                // 🔑 FLUJO DE EDICIÓN (Solo actualizar Fecha de Entrega)

                // 1. Crear el payload MÍNIMO y limpio
                const updatePedidoPayload = {
                    ped_fecha_entrega: v.fechaEntrega!, // ⬅️ El único campo que se puede editar
                };

                // 2. Llamar al servicio (asumiendo que updatePedido espera el ID y el payload)
                await this.pedidos.updatePedido(this.pedido.id, updatePedidoPayload as any);

                await this.showToast('Pedido actualizado con éxito.');

            }

            await this.modalCtrl.dismiss({ updated: true });
        } catch (e: any) {
            alert(e.message || 'Error al guardar el pedido');
        }
    }

    cancel() {
        this.modalCtrl.dismiss({ updated: false });
    }

    // ... (cancelPedido) ...
    async cancelPedido() {
        if (!this.pedido) return;
        try {
            await this.pedidos.cancelPedido(this.pedido.id);
            await this.modalCtrl.dismiss({ updated: true });
        } catch (e: any) {
            alert(e.message || 'Error al cancelar el pedido');
        }
    }
}