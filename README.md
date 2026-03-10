# Sistema de Cobranza Charito

Sistema web desarrollado para la **gestión y control de cobranzas de clientes**, permitiendo registrar pagos, administrar clientes y llevar un seguimiento organizado de contratos y deudas.

El sistema fue desarrollado para **un negocio familiar real**, con el objetivo de digitalizar el proceso de cobranza y mejorar el control de los pagos realizados por los clientes.

Actualmente el sistema se encuentra **dockerizado y en uso para la gestión diaria del negocio**.

---

## Problema que resuelve el sistema

Antes de la implementación del sistema, el control de cobranzas del negocio se realizaba de forma manual, lo que dificultaba:

* Llevar un seguimiento claro de los pagos realizados por los clientes.
* Identificar rápidamente clientes con pagos pendientes.
* Generar reportes confiables sobre el estado de las cobranzas.
* Consultar el historial de pagos de cada cliente de forma organizada.

El **Sistema de Cobranza Charito** fue desarrollado para digitalizar este proceso, permitiendo centralizar la información de clientes, contratos y pagos en una sola plataforma.

Gracias a este sistema, ahora es posible:

* Registrar y consultar pagos de manera rápida.
* Identificar clientes con deudas pendientes.
* Acceder al historial completo de pagos de cada cliente.
* Generar reportes filtrados y exportarlos a Excel para análisis administrativo.
* Mantener un control organizado y confiable de las cobranzas del negocio.

Esto permitió mejorar la gestión administrativa del negocio y reducir errores asociados al manejo manual de la información.

---

# Tecnologías utilizadas

## Frontend

* React
* Next.js
* TailwindCSS
* Fetch API

## Backend

* Python
* Django
* Django REST Framework

## Base de datos

* MySQL

## Infraestructura

* Docker
* Docker Compose

---

# Arquitectura del sistema

El sistema sigue una arquitectura desacoplada **Frontend – Backend**, donde el frontend consume los servicios de una API REST.

```
Frontend (Next.js / React)
        ↓
   API REST
        ↓
Backend (Django + DRF)
        ↓
      MySQL
```

Esta arquitectura permite una mejor escalabilidad y mantenimiento del sistema.

---

# Funcionalidades principales

- Dashboard con resumen de cobranzas
- Registro de clientes
- Registro de pagos realizados por clientes
- Control de contratos o tarjetas de pago
- Identificación de clientes con pagos pendientes
- Consulta de historial de pagos por cliente
- Visualización de tarjeta digital con información del cliente
- Reportes filtrados por:
  - rango de fechas
  - número de contrato
  - cliente
- Exportación de reportes a **Excel** para análisis y control administrativo

El sistema permite mantener un **control claro del estado de pagos de cada cliente**.

---

# Características del sistema

- Interfaz moderna y responsiva
- Arquitectura frontend modular (hooks, services, utils)
- API REST desacoplada
- Exportación de reportes a Excel
* Implementación mediante contenedores Docker para facilitar despliegue

---

# Estructura del proyecto

```
charito
│
├ backend
│   ├ Dockerfile
│   ├ requirements.txt
│   └ proyecto_django
│
├ frontend
│   ├ Dockerfile
│   └ proyecto_nextjs
│
├ docker-compose.yml
├ .env.example
└ README.md
```

## Arquitectura del Frontend

El frontend fue desarrollado siguiendo una estructura modular para separar responsabilidades y mejorar la mantenibilidad del código.

src
│
├ components     # Componentes de interfaz
├ hooks          # Lógica reutilizable de React
├ services       # Consumo de API
├ utils          # Funciones auxiliares
├ config         # Configuración de API
└ app            # Rutas y páginas

Esta organización permite mantener el código más escalable y reutilizable.

---

# Instalación del proyecto

## 1 Clonar repositorio

```
git clone https://github.com/Juniors27/Sistema-Cobranza-Charito
cd charito
```

---

# Ejecutar con Docker

El sistema puede ejecutarse utilizando Docker Compose.

```
docker-compose up --build
```

Esto levantará automáticamente:

* Backend Django
* Frontend Next.js
* Base de datos MySQL

---

# Capturas del sistema

Aquí se pueden agregar imágenes del sistema:

* Dashboard
* Registro de clientes
* Registro de pagos
* Historial de pagos
* Tarjeta de cliente

---

# Futuras mejoras

* Implementación de autenticación de usuarios
* Sistema de roles y permisos

---

# Contexto del proyecto

Este sistema fue desarrollado como una solución tecnológica para **digitalizar el proceso de cobranza de un negocio familiar**, reemplazando procesos manuales y permitiendo una gestión más eficiente de clientes y pagos.

El sistema se encuentra **actualmente en uso**, facilitando el control de la información financiera del negocio.

---

# Autor

Clemente Juniors Garcia Valle

Desarrollador del sistema de gestión de cobranzas **Charito**.
