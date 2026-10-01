# Molab Studio

Aplicación de laboratorio molecular en español, adaptable a móvil, con una interfaz de vidrio translúcido inspirada en Liquid Glass.

**App pública:** https://camilo31-svg.github.io/molab-studio/

## Funcionalidad

- Búsqueda y navegación fabricante → técnica → protocolo.
- Catálogo v2.1: 21 métodos agrupados y 28 versiones con pasos, recetas y condiciones extraídos de fuentes primarias. Los registros bibliográficos y documentos sin receta se excluyen de las tarjetas. Los metadatos relacionados se anexan por método en Bibliografía; el índice de 497 registros se conserva para trazabilidad.
- Selector de versiones: GoldenBraid, Golden Gate, Loop/uLoop, floral dip y Lipofectamine 3000. Filtros Todos / Comerciales / Publicados en papers según el origen de la receta, no el fabricante de una enzima. Addgene conserva el origen «laboratorio».
- Competencia química de E. coli, transformación química/electroporación, levadura, Agrobacterium, floral dip, agroinfiltración y transfección no viral de líneas animales y humanas.
- Modificaciones publicadas con autores y finalidad. Diseño/domesticación GoldenBraid enlazados en el paso correspondiente, sin crear otra tarjeta.
- Favoritos de protocolos, compuestos y medios. Notas personales por protocolo y medio.
- Master mix ligada a cada protocolo, muestras, controles, exceso y agua hasta volumen final. DNA separado de la mezcla común.
- Programa térmico visual, editable, ciclos, temperaturas, tiempos y conservación.
- Ejecución guiada con siguiente/anterior, condiciones, cronómetros, reanudación y registro del experimento.
- Soluciones molares, masa/volumen, pureza, diluciones, DNA molar, ratios de cloning, RPM/RCF y ΔΔCt.
- 30 fichas de medios para microbiología, hongos, plantas y células animales/humanas. 13 dosis comerciales calculables; el resto enlaza la formulación sin inventar dosis.
- 29 formas químicas en la base. Preparación de stocks de reguladores vegetales por producto: IAA, IBA, NAA, BAP, kinetina, GA3, TDZ, zeatina y 2iP. Seguridad y SDS cuando se han verificado; los campos pendientes se identifican expresamente. Compuestos personales con CAS, proveedor, disolvente, diluyente, preparación y datos de seguridad.
- Exportación/importación de copia personal, CSV de master mix y JSON de registros. Impresión.
- PWA con acceso sin conexión después de la primera carga (los documentos externos requieren Internet).

## Banco de trabajo v2

En Cálculos → Banco de trabajo: stocks con balance del predisolvente, constructor de buffers/medios, diluciones seriadas, Neubauer/viabilidad/siembra y duplicación, conteo manual de colonias y células sobre imagen, calibración de distancias, placas de 6/12/24/96/384 pozos con etiquetas y CSV, multicronómetros, curva patrón lineal, contadores por clase, reverse, complement, reverse complement de DNA, GC, Tm estimada y enlace a NCBI BLAST, inventario por lote y agenda con exportación ICS.

Inspiración funcional: [Lab Laps](https://www.lablaps.com/). Implementación propia: sin copiar código, interfaz o recursos. El conteo es manual; no incluye detección por IA, interpretación clínica ni sincronización cloud. Los datos e imágenes permanecen locales; las imágenes y marcas no persisten tras recargar (exportar PNG/CSV). Los temporizadores recuperan la hora de vencimiento, pero el navegador puede suspender los avisos en segundo plano.

Los favoritos, notas y registros v1 se conservan. La copia personal v1 incluye también los nuevos datos de banco; importar/exportar permite trasladarlos entre dispositivos. La app no controla el equipo de laboratorio.

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

Los documentos se enlazan desde sus sitios oficiales. `data.js` identifica origen, versión, páginas, estado y fecha de revisión. El catálogo es **inicial y no exhaustivo**: no se afirma haber indexado todos los protocolos, fabricantes, papers, redes sociales o medios existentes. Las entradas sin pasos extraídos no se muestran como protocolos. Las publicaciones relacionadas son metadatos, y sus modificaciones solo se describen cuando se ha revisado el texto completo. Los resúmenes son breves y no sustituyen los manuales completos.

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

## Búsqueda bibliográfica

`literature-index.json` guarda búsquedas, fecha, procedencia, metadatos y exclusiones. `literature-data.js` sirve el catálogo sin peticiones a PubMed desde el navegador. Búsquedas limitadas a 20 resultados por técnica y fecha ≤ 2026-10-01; no afirman agotar toda la literatura ni revisar cada artículo. La consulta se realizó con `ncbi-entrez-skill`; no se republican resúmenes completos o artículos. Algunas cadenas muy largas están abreviadas por el proveedor de la skill.

Reindexar requiere Python, requests y la skill NCBI Entrez. Ejemplo:

```sh
python scripts/index-pubmed.py --skill-script /ruta/ncbi-entrez-skill/scripts/ncbi_entrez.py
```

La reindexación reemplaza solamente metadatos, no los pasos revisados. Revisar cambios y exclusiones antes de publicar. El intento Europe PMC devolvió HTTP 503 y no aportó datos; `index-literature.mjs` conserva esa alternativa de consulta.
