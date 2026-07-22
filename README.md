# SIPPA Menu

Sistema de gestión para negocios de producción alimentaria desarrollado con **Ionic y Angular**, orientado a administrar ingredientes, clientes, cotizaciones y pedidos desde una única plataforma.

## Descripción

**SIPPA Menu** es una aplicación desarrollada como proyecto de software para digitalizar y organizar los procesos de gestión de un negocio de producción alimentaria.

La aplicación permite gestionar materias primas, administrar clientes, generar cotizaciones, convertir cotizaciones en pedidos y realizar el seguimiento de estos procesos desde una única plataforma.

El proyecto fue diseñado con una interfaz adaptable para dispositivos móviles y navegadores web.

Esta versión pública del proyecto corresponde a una **demo funcional conectada a Supabase**, utilizando una base de datos de demostración con información ficticia. Esto permite explorar las principales funcionalidades de la aplicación y probar el flujo de gestión sin utilizar información real.

## Demo

La aplicación cuenta con un usuario de demostración para acceder a las funcionalidades disponibles.

**Correo:**

```text
admin@admin.com
```

**Contraseña:**

```text
admin
```

> **Importante:** Las credenciales anteriores son exclusivamente para fines de demostración. La información almacenada en la aplicación corresponde a datos ficticios y de prueba.

## Características principales

* Autenticación de usuarios mediante Supabase.
* Gestión de ingredientes y materias primas.
* Administración de clientes.
* Creación y gestión de cotizaciones.
* Conversión de cotizaciones en pedidos.
* Gestión y seguimiento de pedidos.
* Control de acceso según roles de usuario.
* Interfaz responsive para dispositivos móviles y escritorio.
* Persistencia de datos mediante Supabase y PostgreSQL.
* Arquitectura orientada a la gestión integral de un negocio de producción alimentaria.

## Tecnologías utilizadas

### Frontend

* Ionic Framework
* Angular
* TypeScript
* SCSS
* HTML5

### Backend y base de datos

* Supabase
* PostgreSQL
* Supabase Authentication

## Arquitectura

### Frontend

La interfaz de usuario fue desarrollada utilizando:

* Ionic
* Angular
* TypeScript
* SCSS

### Backend

La aplicación utiliza Supabase como plataforma backend, proporcionando:

* Autenticación de usuarios.
* Base de datos PostgreSQL.
* Almacenamiento y gestión de información.
* Control de acceso mediante roles y políticas de seguridad.

La aplicación se encuentra conectada a una instancia de Supabase configurada específicamente para la demostración del proyecto.

## Requisitos

Para ejecutar el proyecto localmente se requiere:

* Node.js 18 o superior
* npm
* Angular CLI
* Ionic CLI

La configuración del proyecto incluye la conexión con el entorno de demostración de Supabase.

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/FranciscoJPV/Sippa.Test.git
```

### 2. Ingresar al proyecto

```bash
cd Sippa.Test
```

### 3. Instalar las dependencias

```bash
npm install
```

### 4. Ejecutar la aplicación

```bash
ionic serve
```

Una vez iniciada la aplicación, podrás acceder a la demo desde el navegador.

## Base de datos

La aplicación utiliza **Supabase** como plataforma backend y **PostgreSQL** como sistema de gestión de base de datos.

La base de datos de demostración contiene información ficticia creada para permitir la exploración de las funcionalidades de SIPPA Menu.

Los datos disponibles incluyen información de prueba relacionada con:

* Ingredientes.
* Materias primas.
* Clientes.
* Cotizaciones.
* Pedidos.

No se utilizan datos personales reales en la base de datos de demostración.

## Seguridad

Las credenciales utilizadas para conectar la aplicación con Supabase corresponden a una configuración pública destinada a la ejecución de la aplicación cliente.

No se incluyen en el repositorio:

* Contraseñas de bases de datos.
* Claves privadas.
* `service_role` keys.
* Secretos de servidor.
* Información personal real.

La aplicación utiliza las políticas de seguridad y control de acceso configuradas en Supabase para gestionar el acceso a los datos.

## Estado del proyecto

**Proyecto académico finalizado y publicado como parte de un portafolio personal.**

Actualmente, este repositorio contiene una versión funcional de SIPPA Menu conectada a un entorno de demostración de Supabase.

El objetivo de esta versión es permitir que otras personas puedan explorar la aplicación, revisar su código fuente y conocer su funcionamiento general.
