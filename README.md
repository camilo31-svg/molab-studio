# Molab Studio

Aplicación de laboratorio molecular en español, adaptable a móvil, con una interfaz de vidrio translúcido inspirada en Liquid Glass.

**App pública:** https://camilo31-svg.github.io/molab-studio/

## Funcionalidad

- Búsqueda y navegación fabricante → técnica → protocolo.
- Catálogo inicial de 21 fichas de 12 fuentes oficiales: 7 protocolos con parámetros revisados desde PDF y 14 referencias pendientes de estructurar.
- Favoritos de protocolos, compuestos y medios. Notas personales por protocolo y medio.
- Master mix ligada a cada protocolo, muestras, controles, exceso y agua hasta volumen final. DNA separado de la mezcla común.
- Programa térmico visual, editable, ciclos, temperaturas, tiempos y conservación.
- Ejecución guiada con siguiente/anterior, condiciones, cronómetros, reanudación y registro del experimento.
- Soluciones molares, masa/volumen, pureza, diluciones, DNA molar, ratios de cloning, RPM/RCF y ΔΔCt.
- 13 referencias de medios agrupadas en microbiológicos, hongos, plantas y células animales/humanas. Once dosis de polvo comercial revisadas; las demás conservan enlace a su formulación y no generan cantidades inventadas.
- Compuestos personalizados con sal/hidratación y masa molecular editable.
- Exportación/importación de copia personal, CSV de master mix y JSON de registros. Impresión.
- PWA con acceso sin conexión después de la primera carga (los documentos externos requieren Internet).

## Ejecutar y verificar

Node.js 20 o posterior, sin dependencias npm de producción:

```sh
npm start
npm test
```

Abre `http://127.0.0.1:4173`. El sitio sirve archivos estáticos; puede desplegarse directamente desde la raíz de `main` en GitHub Pages.

## Datos personales

Favoritos, notas, configuraciones, protocolos propios y experimentos se almacenan exclusivamente en `localStorage` de este navegador. No hay cuentas, servidor de usuarios ni sincronización automática. Exporta una copia e impórtala en tu móvil para trasladar tus datos. No se publican notas personales en GitHub. Los límites del navegador y el borrado de sus datos pueden eliminar la copia local.

Start inicia la guía y sus temporizadores, sin conectarse al termociclador. Revisa parámetros y programa el equipo por separado. Los tiempos térmicos no incluyen rampas. Los temporizadores se recuperan por hora de finalización, pero una pestaña cerrada no emite alarmas en segundo plano.

## Fuentes y cobertura

Los documentos se enlazan desde sus sitios oficiales. `data.js` identifica origen, versión, páginas, estado y fecha de revisión. El catálogo es **inicial y no exhaustivo**: no se afirma haber indexado todos los protocolos, fabricantes, papers, redes sociales o medios existentes. Las fichas pendientes no habilitan ejecución ni cálculos de cantidades no verificadas. Los resúmenes son breves y no sustituyen los manuales completos.

Las condiciones de PCR que dependen de Tm, longitud y molde se marcan como valores iniciales editables. Q5 se basa en E0555 v5.0 (07/2025), DreamTaq en MAN0012702 Rev. B.00, GoTaq en TM318 (10/2024), NEBuilder en E2621/E5520, Western blot en Bulletin 7431 y Quick-DNA Plus en su protocolo rápido v1.3.0.

Los tips iniciales enlazan fabricantes y artículos originales (MIQE, Gibson y Livak); no hay consejos de RRSS presentados como evidencia revisada. Los medios con dosis corresponden al **producto comercial** indicado, no a una formulación universal.

## Indexador ampliable

```sh
npm run index
npm run index -- --discover --limit 100
```

`scripts/index-sources.mjs` recorre las fuentes permitidas, respeta robots y límites, verifica los documentos enlazados y genera `catalog-index.json` con tipo, URL final, hash y estado. `--discover` añade enlaces oficiales a PDFs encontrados en páginas de fabricantes. No convierte automáticamente texto extraído en pasos ejecutables: requiere revisión científica.

Los PDFs y textos completos se guardan únicamente en `.index-work/` (ignorado por Git). Para extracción local:

```sh
python -m pip install pypdf
python scripts/extract-pdfs.py
```

Los enlaces pueden cambiar, redirigir a páginas de búsqueda o bloquear robots. El índice conserva esos fallos para revisión. La automatización no intenta superar restricciones de acceso ni interpreta un enlace caído como un protocolo confirmado.

## Ampliaciones pendientes

Cobertura de más productos, mayor estructuración de medios y cultivo in vitro, revisión de nuevas fuentes, importación asistida de PDFs y sincronización opcional entre dispositivos requieren desarrollo adicional. La infraestructura de indexación y las adaptaciones personales permiten ampliar el catálogo sin fingir cobertura completa.

## Licencia

Código propio: MIT. Marcas, artículos y manuales enlazados pertenecen a sus respectivos titulares y no quedan relicenciados.
