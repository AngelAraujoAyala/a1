# 7. Plan de pruebas del proyecto de software

## 7.1 Objetivo y alcance

El objetivo principal de este plan de pruebas es evaluar y asegurar la calidad, fiabilidad, seguridad y mantenibilidad del backend del sistema de reservas (*a1*), aplicando pruebas unitarias automatizadas con el patrón AAA (Arrange, Act, Assert) sobre la lógica de negocio fundamental y aislando dependencias mediante dobles de prueba (mocks).

**Alcance:**
- **Módulos incluidos:** Autenticación y gestión de perfil (`AuthService`, `AuthController`), Administración de reservas y validación de conflictos/bloqueos (`ReservationsService`, `ReservationsController`), Gestión de fechas bloqueadas (`BloqueosService`, `BloqueosController`), Catálogo de paquetes (`PackagesService`, `PackagesController`), y Adicionales/Toppings (`ToppingsService`, `ToppingsController`).
- **Nivel de prueba:** Pruebas unitarias de código (nivel componente/servicio) y pruebas de controladores de API REST.
- **Métricas evaluadas:** Tasa de éxito de pruebas unitarias (suites y casos individuales) y cobertura de código (porcentaje de declaraciones, ramas, funciones y líneas ejecutadas).

---

## 7.2 Herramientas y entorno

La infraestructura técnica y versiones de herramientas detectadas dinámicamente en el repositorio corresponden al siguiente entorno de ejecución real:

- **Sistema Operativo:** Windows 11 / x64
- **Runtime de Ejecución:** Node.js v24.13.0
- **Gestor de Dependencias:** npm v11.6.2
- **Lenguaje de Programación:** TypeScript v5.7.3
- **Framework de Desarrollo Backend:** NestJS v11.0.1
- **Mapeador Relacional de Objetos (ORM):** Prisma ORM v6.19.3
- **Framework de Pruebas Unitarias:** Jest v30.0.0 con `ts-jest` v29.2.5 y `@nestjs/testing` v11.0.1
- **Herramienta de Cobertura de Código:** Jest Coverage Collector / Istanbul (reporte LCOV/HTML)

---

## 7.3 Casos de prueba

A continuación se detalla la matriz de casos de prueba unitarios diseñados e implementados siguiendo el patrón AAA, aislando las llamadas a base de datos Prisma y servicios externos mediante mocks.

| ID | Clase.Método | Entrada de Prueba | Resultado Esperado | Tipo de Caso |
| :--- | :--- | :--- | :--- | :--- |
| `TC-AUTH-01` | `AuthService.login` | Email y contraseña válidos registrados en la BD | Retorna objeto `{ access_token }` firmado por JWT | Positivo |
| `TC-AUTH-02` | `AuthService.login` | Email inexistente en la BD (`noexiste@test.com`) | Lanza `UnauthorizedException` ('Credenciales inválidas') | Negativo |
| `TC-AUTH-03` | `AuthService.login` | Email existente pero contraseña incorrecta | Lanza `UnauthorizedException` ('Credenciales inválidas') | Negativo |
| `TC-AUTH-04` | `AuthService.login` | Email o contraseña en blanco (`""`) | Lanza `BadRequestException` ('Email y contraseña son requeridos') | Valor Límite |
| `TC-AUTH-05` | `AuthService.getProfile` | ID de administrador válido (`1`) | Retorna perfil `{ email, whatsappNumber }` | Positivo |
| `TC-AUTH-06` | `AuthService.getProfile` | ID de administrador inexistente (`999`) | Lanza `NotFoundException` ('Administrador no encontrado') | Negativo |
| `TC-AUTH-07` | `AuthService.updateProfile` | Datos de perfil y contraseña >= 8 caracteres | Retorna perfil actualizado y aplica hash bcrypt | Positivo / Seguridad |
| `TC-AUTH-08` | `AuthService.updateProfile` | Contraseña nueva de 5 caracteres (`short`) | Lanza `BadRequestException` ('al menos 8 caracteres') | Valor Límite / OWASP |
| `TC-RES-01` | `ReservationsService.create` | Reserva en fecha y horario disponible sin conflictos | Crea la reserva con estado 'PENDIENTE' | Positivo |
| `TC-RES-02` | `ReservationsService.create` | Reserva que se solapa con una existente | Lanza `ConflictException` ('Ya existe una reserva en ese horario.') | Negativo |
| `TC-RES-03` | `ReservationsService.create` | Reserva en fecha con bloqueo activo | Lanza `ConflictException` ('La fecha seleccionada está bloqueada.') | Negativo |
| `TC-RES-04` | `ReservationsService.create` | `fechaFin` es igual o anterior a `fechaInicio` | Lanza `BadRequestException` ('debe ser posterior') | Valor Límite |
| `TC-RES-05` | `ReservationsService.create` | Fechas inválidas (`"fecha-invalida"`) | Lanza `BadRequestException` ('Fechas no válidas') | Negativo |
| `TC-RES-06` | `ReservationsService.findOne` | ID de reserva existente (`1`) | Retorna la entidad de reserva completa | Positivo |
| `TC-RES-07` | `ReservationsService.findOne` | ID de reserva inexistente (`999`) | Lanza `NotFoundException` ('La reserva con ID 999 no existe.') | Negativo |
| `TC-RES-08` | `ReservationsService.remove` | ID de reserva existente (`1`) | Elimina relaciones `reservaTopping` y la reserva | Positivo |
| `TC-BLOQ-01` | `BloqueosService.create` | Fecha `2026-12-25`, motivo 'Navidad' | Crea el registro de fecha bloqueada | Positivo |
| `TC-BLOQ-02` | `BloqueosService.findAll` | Solicitud de consulta | Retorna lista ordenada por fecha ascendente | Positivo |
| `TC-BLOQ-03` | `BloqueosService.remove` | ID de bloqueo válido (`1`) | Elimina el registro de bloqueo | Positivo |
| `TC-PKG-01` | `PackagesService.create` | Paquete válido `{ nombre: 'VIP', precio: 1500 }` | Registra el nuevo paquete en la BD | Positivo |
| `TC-PKG-02` | `PackagesService.findAll` | Consulta de catálogo | Retorna paquetes ordenados por precio ascendente | Positivo |
| `TC-TOP-01` | `ToppingsService.create` | Topping válido `{ nombre: 'Globos', precio: 150 }` | Registra el nuevo topping en la BD | Positivo |
| `TC-TOP-02` | `ToppingsService.uploadImage` | Archivo de imagen válido (`Buffer`) | Sube a Supabase Storage y retorna URL pública | Positivo |
| `TC-CTRL-01` | `AuthController.signIn` | DTO de credenciales | Delega al servicio y retorna token JWT | Positivo |
| `TC-CTRL-02` | `ReservationsController.create` | DTO de reserva | Delega al servicio y retorna la reserva creada | Positivo |

---

## 7.4 Resultados de la versión inicial

La ejecución automatizada de la suite de pruebas sobre el repositorio original arrojo los siguientes resultados reales de línea base:

```text
Test Suites: 6 failed, 2 passed, 8 total
Tests:       6 failed, 2 passed, 8 total
Snapshots:   0 total
Time:        29.387 s
Ran all test suites.

-----------------------------|---------|----------|---------|---------|
File                         | % Stmts | % Branch | % Funcs | % Lines |
-----------------------------|---------|----------|---------|---------|
All files                    |   31.64 |    40.59 |    4.76 |   30.37 |
-----------------------------|---------|----------|---------|---------|
```

### Interpretación de los resultados de la versión inicial

1. **Fallo en la resolución de inyección de dependencias:** 6 de los 8 archivos de prueba auto-generados (`packages.service.spec.ts`, `reservations.service.spec.ts`, `toppings.service.spec.ts`, `packages.controller.spec.ts`, `reservations.controller.spec.ts` y `toppings.controller.spec.ts`) fallaron inmediatamente durante la fase de inicialización de NestJS (`compile()`). La causa técnica fue la ausencia de los proveedores mock de `PrismaService` dentro de la configuración de `Test.createTestingModule()`.
2. **Cobertura de código deficiente:** La cobertura de líneas se situó apenas en el **30.37%** y la de funciones en un crítico **4.76%**.
3. **Ausencia total de pruebas sobre la lógica de negocio principal:** Módulos neurálgicos como autenticación (`AuthService`), bloqueo de fechas (`BloqueosService`) y reglas de negocio complejas (prevención de reservas duplicadas y validación de rangos) no poseían ningún tipo de prueba unitaria implementada.

---

## 7.5 Defectos y mejoras aplicadas

| ID | Defecto Detectado | Causa Técnica del Problema | Corrección y Mejora Aplicada | Norma / Estándar / Buena Práctica |
| :--- | :--- | :--- | :--- | :--- |
| `DEF-01` | Inyección de dependencias rota en pruebas `.spec.ts` | El módulo de pruebas de NestJS no declaraba los proveedores mock de `PrismaService` y `JwtService`. | Se implementaron dobles de prueba (`mockPrismaService`, `mockJwtService`) con respuestas simuladas (`mockResolvedValue`) usando inyección por valor (`useValue`). | **SOLID (DIP)** - Inversión de Dependencias. **xUnit Patterns** (Test Double / Mock Object). |
| `DEF-02` | Fallo por discrepancia de huso horario al comparar fechas bloqueadas | Uso de `toDateString()` e `toISOString().split('T')[0]`, mezclando horas UTC con la hora local del servidor en Node.js. | Creación del método privado determinista `formatDateToYMD()` que extrae año, mes y día de forma neutra en UTC (`getUTCFullYear()`, `getUTCMonth()`, `getUTCDate()`). | **ISO 8601** (Estándar de representación de fechas). **Clean Code** (DRY y principio de responsabilidad única). |
| `DEF-03` | Ausencia de validación de consistencia en fechas de reserva | `ReservationsService.create` no verificaba que `fechaFin` fuera estrictamente posterior a `fechaInicio`. | Incorporación de validaciones defensivas que verifican la validez de la fecha (`isNaN`) y comprueban `fechaFin <= fechaInicio`, lanzando `BadRequestException`. | **Defensive Programming**. **OWASP Top 10 A04:2021** (Insecure Design / Input Validation). |
| `DEF-04` | Retorno de valores nulos sin manejo de excepciones en recursos inexistentes | `findOne`, `updateStatus` y `remove` retornaban `null` de Prisma sin notificar el error HTTP al cliente. | Implementación de verificación de existencia previa con lanzamiento explícito de `NotFoundException` (HTTP 404). | **RFC 9110** (HTTP Semantics / Status Codes). **Clean Code** (Manejo explícito de excepciones). |
| `DEF-05` | Falta de políticas de seguridad en credenciales y contraseñas | `AuthService` aceptaba contraseñas arbitrariamente cortas al actualizar perfil y no sanitizaba correos. | Aplicación de sanitización de email (`toLowerCase().trim()`) y validación de longitud mínima de contraseña (mínimo 8 caracteres) lanzando `BadRequestException`. | **OWASP Top 10 A07:2021** (Identification and Authentication Failures). **NIST SP 800-63B**. |

---

## 7.6 Resultados de la versión mejorada y comparación

Tras la aplicación de las correcciones arquitectónicas, refinamiento de código y adición de la suite completa de pruebas unitarias automatizadas en la rama de trabajo `feature/qa-unit-testing-and-improvements`, se volvió a ejecutar la suite completa de pruebas y análisis de cobertura. Los resultados empíricos reales obtenidos son los siguientes:

```text
Test Suites: 12 passed, 12 total
Tests:       63 passed, 63 total
Snapshots:   0 total
Time:        12.671 s
Ran all test suites.

-----------------------------|---------|----------|---------|---------|
File                         | % Stmts | % Branch | % Funcs | % Lines |
-----------------------------|---------|----------|---------|---------|
All files                    |   70.44 |    74.35 |   89.06 |   71.28 |
-----------------------------|---------|----------|---------|---------|
```

### Tabla comparativa de métricas reales (Versión Inicial vs. Versión Mejorada)

| Métrica / Indicador de Calidad | Versión Inicial (V1) | Versión Mejorada (V2) | Incremento / Variación Absoluta |
| :--- | :--- | :--- | :--- |
| **Suites de prueba totales** | 8 | 12 | +4 suites (+50.0%) |
| **Suites aprobadas (Passed)** | 2 | 12 | +10 suites (+500.0%) |
| **Suites fallidas (Failed)** | 6 | 0 | -6 suites (-100.0%) |
| **Pruebas unitarias totales** | 8 | 63 | +55 pruebas (+687.5%) |
| **Pruebas aprobadas (Passed)** | 2 | 63 | +61 pruebas (+3050.0%) |
| **Pruebas fallidas (Failed)** | 6 | 0 | -6 pruebas (-100.0%) |
| **Cobertura de Declaraciones (% Stmts)** | 31.64% | 70.44% | **+38.80%** |
| **Cobertura de Ramas (% Branch)** | 40.59% | 74.35% | **+33.76%** |
| **Cobertura de Funciones (% Funcs)** | 4.76% | 89.06% | **+84.30%** |
| **Cobertura de Líneas (% Lines)** | 30.37% | 71.28% | **+40.91%** |

### Cobertura detallada por módulo de negocio (Versión Mejorada V2)

| Módulo / Componente del Software | % Declaraciones | % Ramas | % Funciones | % Líneas |
| :--- | :--- | :--- | :--- | :--- |
| `src/reservations/reservations.service.ts` | 97.36% | 85.00% | 100.00% | **97.22%** |
| `src/auth/auth.service.ts` | 100.00% | 88.46% | 100.00% | **100.00%** |
| `src/packages/packages.service.ts` | 100.00% | 75.00% | 100.00% | **100.00%** |
| `src/bloqueos/bloqueos.service.ts` | 100.00% | 75.00% | 100.00% | **100.00%** |
| `src/toppings/toppings.service.ts` | 64.70% | 50.00% | 83.33% | **60.00%** |
| **Controladores (Auth, Res, Pkg, Bloq, Top)** | 100.00% | 75.00% | 100.00% | **100.00%** |

### Interpretación y discusión de resultados

Los datos empíricos obtenidos confirman un incremento sustancial en la calidad y robustez del software. La tasa de éxito de las pruebas pasó del **25% (2/8)** al **100% (63/63)**, eliminando la totalidad de los fallos de inyección de dependencias. En términos de cobertura de código global, la cobertura de funciones se elevó del **4.76% al 89.06%** (un incremento del +84.30%), mientras que la cobertura de líneas aumentó del **30.37% al 71.28%** (un incremento del +40.91%). Específicamente, en los módulos donde reside la lógica de negocio crítica (`ReservationsService`, `AuthService`, `PackagesService` y `BloqueosService`), la cobertura de líneas alcanzó entre el **97.22% y el 100.00%**. Estas mejoras demuestran la efectividad de combinar pruebas unitarias basadas en el patrón AAA con refractores orientados a las normas ISO/IEC 25010, principios SOLID, reglas OWASP y prácticas de programación defensiva.
