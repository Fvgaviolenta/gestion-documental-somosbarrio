# Glosario de documentos — Plataforma Somos Barrio

**Documento vivo.** Aquí se definen los tipos de documento y artefactos que el sistema de gestión documental debe reconocer, para qué sirven y cómo encajan en los flujos de trabajo. Se irá refinando conforme el cliente confirme formatos, plantillas y responsables.

---

## Convenciones rápidas

| Término | Significado |
|---|---|
| **Plantilla** | Estructura fija (campos) que el usuario rellena en la plataforma. |
| **Documento generado** | Instancia concreta a partir de una plantilla (con datos, estado, historial). |
| **Rol** | En el MVP simplificado: **ADMINISTRADOR** y **COLABORADOR** (revisión de ciertos documentos solo administrador). |

---

## 1. Bitácora de salidas a terreno

**Qué es:** Bitácora donde se acumulan los relatos de las salidas a terreno del equipo Somos Barrio (territorio Miraflores Alto), organizados **por mes**, con **fecha del día** y el **evento más relevante** de cada salida.

**Para qué sirve:** Registrar de forma continua la presencia en terreno y los hitos narrativos del trabajo comunitario, dejando trazabilidad temporal y territorial.

**Formato / soporte actual:** Documento de uso interno (narrativa por entradas; agregación mensual).

**Notas para el sistema:**

- Encaja como **documento recurrente** o **registro por mes** (definir si es un solo documento “mes actual” o un documento por mes cerrado).
- Campos típicos sugeridos: `fecha`, `relato`, `evento_relevante`, `territorio`, `equipo` (a validar con plantilla real).

---

## 2. Acta de actividades

**Qué es:** Documento **oficial** con **estructura fija**, pero **reutilizable** para distintos tipos de actividad.

**Para qué sirve:** Dar constancia formal de actividades tales como:

- salidas a terreno,
- reuniones con juntas de vecinos,
- encuentros con comunidades barriales u otros actores.

**Formato / soporte actual:** Acta con formato institucional (estructura definida).

**Notas para el sistema:**

- Debe soportar **múltiples tipos de actividad** bajo la misma plantilla o variantes controladas (enumeración de “tipo de actividad”).
- Flujo de revisión acordado en negocio: elaboración (colaborador/admin) → estado **EN_REVISION** → revisión/aprobación por **ADMINISTRADOR** (detalle en módulo de documentos).

---

## 3. Registro de actividades (Excel)

**Qué es:** Hoja de cálculo (Excel) que **va acumulando** los registros de las distintas actividades.

**Para qué sirve:** Llevar un inventario operativo: **quién**, **cuándo**, **dónde** se realizó cada actividad y un **enlace directo** al acta asociada.

**Formato / soporte actual:** Excel.

**Notas para el sistema:**

- Puede modelarse de dos formas (decisión de producto):
  1. **Exportación / reporte** generado desde la plataforma a partir de actividades y documentos vinculados, o  
  2. **Adjunto** gestionado manualmente mientras no exista integración bidireccional con Excel.
- En cualquier caso, la plataforma debería ser la **fuente de verdad** de metadatos (fechas, responsables, vínculo al acta).

---

## 4. Excel de seguimiento mensual

**Qué es:** Seguimiento de actividades **ligadas a un proyecto específico**, en formato mensual.

**Para qué sirve:** Rendir **actividades** asociadas al proyecto; incluye un apartado de **rendición financiera**, pero **no es el foco principal** del documento: lo central es la **rendición de actividades**. El formato proviene de niveles superiores (plantilla institucional).

**Formato / soporte actual:** Excel con estructura impuesta “desde arriba”.

**Notas para el sistema:**

- Diferenciar explícitamente **seguimiento de actividades** vs **bloque financiero** (aunque el Excel los combine).
- El MVP puede **excluir** automatización financiera profunda, pero conviene **reservar campos** o tipo documental para no bloquear evolución futura.

---

## 5. Informe tipo

**Qué es:** Vía de comunicación del departamento Somos Barrio hacia **otra unidad** de la municipalidad para **solicitar** algo (coordinación interdepartamental).

**Para qué sirve:** Dejar constancia de **qué se observa** y **qué se necesita**; tono y estructura más **corresponsal** que un acta interna.

**Formato / soporte actual:** Documento con formato institucional “tipo” (plantilla).

**Notas para el sistema:**

- Encaja como plantilla con campos de **solicitud**, **justificación**, **destino** (unidad), **plazos** y **antecedentes** (a afinar con el Word oficial).
- En el modelo de roles acordado: uso y flujo **prioritariamente** a cargo del **ADMINISTRADOR** (revisión y envío formal).

---

## 6. Oficios a autoridad (proyectos / solicitudes)

**Qué es:** Oficio con destino a una **autoridad pertinente** para solicitudes vinculadas a **proyectos** (por ejemplo, derivado de convenios o requerimientos externos).

**Para qué sirve:** Canalizar pedidos formales hacia autoridades u otros organismos.

**Formato / soporte actual:** **Aún no definido al 100%:** puede ser **formato fijo** o redacción **libre** por el administrador.

**Notas para el sistema:**

- Diseño recomendado: **plantilla base** (campos obligatorios) + secciones de texto libre, para balancear estandarización y flexibilidad.
- Visibilidad: en principio **solo ADMINISTRADOR** (contenido sensible / representación institucional).
- Automatización de envío por correo: candidato a **M6 (mailing)** — plantilla de correo + PDF adjunto + registro de envío.

---

## 7. Documentos de compras (flujo por compra)

**Qué es:** Conjunto de documentos y pasos asociados a **una compra** (ciclo de abastecimiento).

**Para qué sirve:** Centralizar la información de una compra y su trazabilidad documental entre áreas.

**Flujo resumido (como lo describe el negocio):**

1. Se elabora una **especificación técnica** (y documentación de solicitud asociada).
2. Se **envía por correo** a la persona encargada de compras (ej. desde Dirección de Seguridad hacia **Abastecimiento**).
3. Se **recibe la orden de compra** (OC).
4. Se genera **informe de recepción conforme** y se **firma la factura** recibida.
5. Se **reenvía** a Abastecimiento (cierre del circuito documental).

**Objetivo de producto:** **Centralizar por compra** toda la información (metadatos, versiones, adjuntos, estados y envíos), aunque al inicio parte del intercambio siga siendo por correo.

**Notas para el sistema:**

- Modelar como **“expediente de compra”** o **documento padre** con hijos (solicitud, OC, recepción, factura firmada) — definición técnica en módulo de documentos.
- El correo automatizado y bitácora de envíos corresponde a **M6**; en etapas previas puede bastar con adjuntos y estados manuales.

---

## 8. Relación entre documentos (vista rápida)

```text
Actividad (operativa)
  └── Acta de actividades (oficial, reusable)
  └── Registro de actividades (Excel / export)
  └── Bitácora de salidas a terreno (relato mensual por día)

Proyecto
  └── Excel seguimiento mensual (actividades; anexo financiero secundario)

Interinstitucional
  └── Informe tipo (solicitud a otra unidad)
  └── Oficio a autoridad (admin; posible envío automático M6)

Compra
  └── Especificación técnica + OC + recepción conforme + factura firmada (centralizado por compra)
```

---

## Próximos pasos (para completar este glosario)

- Incorporar **plantillas reales** (Word/PDF) por cada ítem y extraer lista de campos.
- Confirmar con el cliente: **visibilidad por rol**, **estados** y **obligatoriedad** de adjuntos por tipo.
- Definir si “registro de actividades” y “seguimiento mensual” serán **solo exportaciones** o **entidades gestionadas** dentro de la plataforma.
