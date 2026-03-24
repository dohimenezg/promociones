# Sistema de Asignación de Promociones - TELE-Iquitos

## 1. Definición y Análisis del Problema 

### Descripción de la situación a resolver 

TELE-Iquitos es una empresa que ofrece a sus clientes servicios de telecomunicaciones. Dentro de sus labores de mercadeo, la empresa diseña promociones mensuales aplicables a un mercado objetivo. Estas promociones básicamente están soportadas en el concepto de fidelización, cuyo objetivo es que los clientes sean fieles a la empresa y no busquen los servicios en las empresas competidoras. 

Se necesita realizar la asignación de las promociones disponibles a los clientes, de acuerdo a unos criterios y condiciones preestablecidas. 

**La información con que se cuenta es la siguiente:**

#### Clientes 
- Los clientes tienen un plan comercial con la empresa (Ej.: Platino, Oro, estándar, etc.) 
- Los clientes se encuentran en una ubicación geográfica (Ej.: Cali, Jamundí, Yumbo, Palmira, Armenia, etc.) 
- Los clientes tienen un promedio de facturación mensual (Ej.: el cliente factura en promedio $55.000 al mes) 
- Los clientes están agrupados por su actividad económica (Ej.: Residencial, Restaurante, Bar, Hospital, Universidad, etc.) 
- Los clientes son calificados de acuerdo al comportamiento respecto a su obligación financiera con la empresa (Ej.: Excelente , Bueno, Regular, Malo) 

#### Promociones 
- Cada promoción maneja un rango de fechas de vigencia. Este rango de fechas indica si la promoción está o no vigente en un día determinado. 
- La promoción cuenta con un % de descuento que se da al cliente con respecto al valor que normalmente paga. 

### Consideraciones para la asignación
Para asignar una promoción a un cliente, la empresa usa los siguientes criterios: 
- El plan comercial del cliente, la ciudad en donde habita, la calificación de su obligación financiera, su promedio de facturación mensual y su actividad económica. 
- Las promociones **solo se asignan a los clientes que se encuentren al día** con sus pagos (sin saldo vencido). 
- Una promoción **solo se puede asignar una vez al cliente** durante la vigencia de la misma. 
- Si varias promociones aplican, se **debe asignar aquella que sea más favorable** (mayor valor del descuento). En caso de empate, debe asignarse la de **vigencia más antigua**. 
- La empresa quiere que el **número de veces por año** que una misma promoción se asigne a un cliente se permita diferenciar de acuerdo a la actividad económica del cliente (Ej: Límite anual).

*Ejemplo clásico de la lógica implementada:*
**Promoción de descuento de 10% sobre el cargo básico que se cobra al cliente.**
- Aplica para clientes de cualquier plan comercial.
- Solamente para clientes de Cali o Palmira. 
- Calificación Financiera Excelente o Buena. 
- Promedio de facturación mensual mayor o igual a $80.000. 
- Clientes de actividad económica Restaurantes o Bares (Con sus propios topes por año).

---

## 2. Análisis de la Solución Arquitectónica

Para resolver esta profunda red de reglas de negocio, se diseñó e implementó una "Single Page Application" (SPA) relacional y robusta. 

La aplicación permite al usuario (normalmente perfiles de gerencia o mercadeo) diseñar las promociones y establecer sus condiciones de forma dinámica usando una interfaz amigable. A su vez, provee un "Motor de Asignaciones" inteligente capaz de barrer en cuestión de milisegundos toda la base de datos de clientes, cruzando todos los parámetros restrictivos y aplicando asignaciones masivas de un solo clic.

**Principales características del Motor Analítico:**
1. **Verificación Estricta (Al día)**: El sistema excluye nativamente a cualquier usuario con una mora `> 0`.
2. **Hidratación Automática Explicita**: Cuando se registra una promoción y el mercadólogo marca "Permitir a todos los planes" o "A todas las ciudades", el sistema inserta de inmediato docenas de relaciones explícitas en las tablas puente. Esto simplifica de raíz los algoritmos de verificación.
3. **Mecanismo de Desempate (Sorting)**: Todos los candidatos viables para una asignación pasan el filtro de favorabilidad. El arreglo ordenado prioriza el mayor `%` de descuento y subsecuentemente la fecha de creación más temprana antes de entregarle el triunfo.
4. **Idempotencia Transaccional**: El botón de asignación mensual se puede presionar cuántas veces se desee sin peligro. El motor bloquea la segunda ejecución sobre el mismo cliente demostrando cero duplicidades en el mes gracias a su heurística anti-colisión.

---

## 3. Tecnologías Utilizadas

- **ReactJS (Vite)**: Ecosistema principal para renderizado de la UI.
- **Dexie.js (IndexedDB)**: Motor robusto Base de Datos NoSQL integrado directamente en el navegador del usuario pero diseñado con arquitecturas relacionales avanzadas (Primary Keys compuestas + índices de consulta). Mantiene resiliencia total y velocidad óptima.
- **React-Router-Dom**: Encargado del ecosistema de navegación e inyección transitoria del "State".
- **Lucide-React**: Set de Iconografía minimalista.

---

## 4. Estructura de la Base de Datos

El sistema se cimenta sobre cimientos de datos compuestos por **15 tablas altamente interconectadas y normalizadas**:

- `tipoIdentificacion`, `tipoPersona`, `departamento`, `ciudad`, `planComercial`, `actividadEconomica`, `calificacionFinanciera`.
- **Entidades de Negocio:** `cliente`, `promocion`, `vigenciaPromocion`.
- **Tablas Puente (Filtros explícitos Parametrizados):** `promocionAdmiteCiudad`, `promocionAdmitePlanComercial`, `promocionAdmiteActividadEconomica` (Que aloja la restricción opcional de `limite_anual`), `promocionAdmiteCalificacionFinanciera`.
- **Registro Central Histórico:** `clienteAplicaPromocion` (Contiene todos los registros inmutables de las victorias del motor asíncrono).

---

## 5. Instrucciones de Arranque Rápido

Para levantar el entorno desarrollo del proyecto, ejecuta la siguiente secuencia de comandos desde la carpeta raíz:

```bash
# Instalar bibliotecas y módulos de Node
npm install

# Lanzar el servidor en caliente
npm run dev
```

**Generación Integrada de Datos de Prueba (Seed):**
Cortesía de la configuración técnica integrada, al abrir la aplicación y montar la Base de Datos IndexedDB por primera vez, un "Seed" automático poblará todas las 15 tablas descritas con **información completamente realista**, de tal manera que puedas simular el comportamiento de 20 clientes dispares y múltiples vigencias históricas y futuras sin necesidad de ingreso manual.

*En caso de necesitar restaurar este set de configuración inicial luego de experimentos, la pantalla de "Asignaciones" incluye un botón especial llamado **Resincronizar BD**.*
