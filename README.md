# Molab Studio

Aplicación de laboratorio molecular en español, adaptable a móvil, con una interfaz de vidrio translúcido inspirada en Liquid Glass.

**App pública:** https://camilo31-svg.github.io/molab-studio/

## Funcionalidad

- Búsqueda y navegación fabricante → técnica → protocolo.
- Catálogo v2.6.0: 37 métodos agrupados y 76 procedimientos con receta: 56 comerciales, 18 publicados en papers y 2 de laboratorio. Las citas bibliográficas se anexan al método; los documentos sin receta extraída no generan tarjetas.
- Selector de versiones: GoldenBraid, Golden Gate, Loop/uLoop, floral dip y Lipofectamine 3000. Filtros Todos / Comerciales / Publicados en papers según el origen de la receta, no el fabricante de una enzima. Addgene conserva el origen «laboratorio».
- Competencia química de E. coli, transformación química/electroporación, levadura, Agrobacterium, floral dip, agroinfiltración y transfección no viral de líneas animales y humanas.
- Modificaciones publicadas con autores y finalidad. Diseño/domesticación GoldenBraid enlazados en el paso correspondiente, sin crear otra tarjeta.
- Phusion HF/GC y Hot Start Flex; Q5 Hot Start, OneTaq, LongAmp, iProof, SuperFi II, GoTaq G2 y MyTaq HS, conservando stocks y condiciones por producto.
- Miniprep agrupada con selector para QIAGEN, MACHEREY-NAGEL, Thermo Fisher, NEB, Promega, Geneaid, Zymo, Sigma y Norgen.
- Extracción por material: GeneJET Genomic (Gram negativas/positivas, levaduras, células, tejidos y sangre), DNeasy Plant (plantas/hongos), tres versiones CTAB, TRIzol (tejidos, células y alternativa salina vegetal), Direct-zol Plus y extracción RIPA.
- Cantidades por etapa editables con totales por muestra; ratios ligados al volumen real medido del lisado. Selección de material en cada experimento.
- Versión visible y modo claro/oscuro persistente con preferencia inicial del sistema.
- Favoritos de protocolos, compuestos y medios. Notas personales por protocolo y medio.
- Mis protocolos: guarda una configuración modificada con reactivos, muestras, programa, pasos y fuente; las digestiones conservan su propio proveedor, enzimas, buffer y concentraciones al reabrirlas.
- Sesión: sincronización opcional entre dispositivos mediante un repositorio privado de GitHub. Combina favoritos, notas, configuraciones, protocolos, compuestos, banco de trabajo y cuaderno; conserva las copias de ediciones simultáneas para resolverlas expresamente.
- Fuentes se abre con un botón dentro de Mis protocolos; la navegación principal conserva Mis protocolos como sección activa. Los buffers con color documentado muestran círculos junto al recomendado, elegido, individual y matriz (B azul, G verde, O naranja, R rojo, Tango amarillo; FastDigest Green indica azul y amarillo).
- Cambio de fabricante en digestiones corregido: los controles del cálculo general ya no sustituyen los de restricción. Los desplegables muestran únicamente buffers y enzimas del proveedor seleccionado.
- Master mix ligada a cada protocolo, muestras, controles, exceso y agua hasta volumen final. DNA separado de la mezcla común.
- Programa térmico visual, editable, ciclos, temperaturas, tiempos y conservación. Descarga independiente en texto/Markdown, CSV, Excel y gráfica SVG; también se exportan condiciones no térmicas.
- Competentes de A. tumefaciens desde placa (MOG301/EHA105/LBA4404) y electroporación; A. rhizogenes K599 con CaCl₂ y transformación por congelación/choque. Especies filtrables y bibliografía anexa; GV3101 mantiene su propia versión.
- Digestiones en Cálculos → Restricción y Protocolos → Restricción: NEB, Thermo convencional, Thermo FastDigest y Promega; 198 productos con matrices revisadas. Hasta 3 enzimas, selección de buffer por actividad común, colorantes declarados y temperaturas. No se asume compatibilidad entre fabricantes ni entre versiones estándar/HF.
- Thermo convencional: 162 enzimas, B azul / G verde / O naranja / R rojo / Tango amarillo a 1X o 2X y buffers específicos EcoRI, BamHI y KpnI. Muestra el buffer individual y recomienda el común para 1–3 enzimas por los rangos publicados, evitando star y NR. Los códigos de color no se presentan como colorantes de carga. Tango 2X calcula el doble de stock 10X. Fuentes por producto y datos de compatibilidad se incluyen en Excel/cuaderno.
- Thermo convencional: 162 enzimas, B azul / G verde / O naranja / R rojo / Tango amarillo a 1X o 2X y buffers específicos EcoRI, BamHI y KpnI. Muestra el buffer individual y recomienda el común para 1–3 enzimas por los rangos publicados, evitando star y NR. Los códigos de color no se presentan como colorantes de carga. Tango 2X calcula el doble de stock 10X. Fuentes por producto y datos de compatibilidad se incluyen en Excel/cuaderno.
- Masa objetivo (ng), stocks de DNA (ng/µL), volúmenes editables de enzimas y reacción final. Hasta 3 muestras manuales o importación local de Excel .xlsx con hoja, columnas, fila de cabecera y unidades elegibles. Los valores inválidos y duplicados se muestran para corregirlos.
- Tabla por muestra, pool físico opcional con igual masa de cada muestra, mezcla común con exceso y BSA cuando corresponde. Exportación .xlsx con fórmulas y datos originales; guardar y ejecutar con una instantánea de la receta.
- Las combinaciones con temperaturas diferentes, actividad insuficiente, agua negativa o >10 % de enzima no se inician como digestión simultánea. Actividad parcial requiere revisar la ficha y confirmar; tiempos y stocks modificados quedan indicados.
- Ejecución guiada con siguiente/anterior, condiciones, cronómetros, reanudación y registro del experimento.
- Soluciones molares, masa/volumen, pureza, diluciones, DNA molar, ratios de cloning, RPM/RCF y ΔΔCt.
- 30 fichas de medios para microbiología, hongos, plantas y células animales/humanas. 13 dosis comerciales calculables; el resto enlaza la formulación sin inventar dosis.
- 29 formas químicas en la base. Preparación de stocks de reguladores vegetales por producto: IAA, IBA, NAA, BAP, kinetina, GA3, TDZ, zeatina y 2iP. Seguridad y SDS cuando se han verificado; los campos pendientes se identifican expresamente. Compuestos personales con CAS, proveedor, disolvente, diluyente, preparación y datos de seguridad.
- Registros de experimentos en curso o finalizados: copiar texto o descargar Markdown, TXT, CSV y JSON con cantidades editadas, parámetros, pasos, notas, fuente y marcas de avance. Copias personales e impresión.
- PWA con acceso sin conexión después de la primera carga (los documentos externos requieren Internet).

## Banco de trabajo v2

En Cálculos → Banco de trabajo: stocks con balance del predisolvente, constructor de buffers/medios, diluciones seriadas, Neubauer/viabilidad/siembra y duplicación, conteo manual de colonias y células sobre imagen, calibración de distancias, placas de 6/12/24/96/384 pozos con etiquetas y CSV, multicronómetros, curva patrón lineal, contadores por clase, reverse, complement, reverse complement de DNA, GC, Tm estimada y enlace a NCBI BLAST, inventario por lote y agenda con exportación ICS.

Inspiración funcional: [Lab Laps](https://www.lablaps.com/). Implementación propia: sin copiar código, interfaz o recursos. El conteo es manual; no incluye detección por IA ni interpretación clínica. Las imágenes y marcas no persisten tras recargar (exportar PNG/CSV); los datos del banco que se guardan sí se incluyen en la sesión. Los temporizadores recuperan la hora de vencimiento, pero el navegador puede suspender los avisos en segundo plano.

Los favoritos, notas y registros v1 se conservan. La copia personal v1 incluye también los nuevos datos de banco; importar/exportar permite trasladarlos entre dispositivos. La app no controla el equipo de laboratorio.

## Ejecutar y verificar

Node.js 20 o posterior, sin dependencias npm de producción:

```sh
npm start
npm test
```

Abre `http://127.0.0.1:4173`. El sitio sirve archivos estáticos; puede desplegarse directamente desde la raíz de `main` en GitHub Pages.

## Datos personales

Los datos siguen guardándose en `localStorage` sin alterar la clave anterior `molab-personal-v1`. En **Sesión** puedes conectar un repositorio **privado**, distinto del repositorio público que aloja la app, para sincronizarlos automáticamente al terminar de editar, al volver a la app y cada minuto mientras está abierta. Sin conexión siguen disponibles localmente.

1. Crea un repositorio privado como `usuario/molab-datos` e inicialízalo con README.
2. Crea un token fine-grained limitado a ese repositorio con **Contents: Read and write**. [Guía oficial](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).
3. Introduce el repositorio y token en **Sesión**. Conecta el mismo repositorio en cada dispositivo; puedes usar tokens distintos.

El token solo se envía a `https://api.github.com`; por defecto se conserva en `sessionStorage` durante la pestaña. La casilla **Recordar acceso** lo conserva en `localStorage` del dispositivo. No se incluye en exportaciones personales, documentos de sincronización ni código publicado. Cerrar sesión elimina el acceso guardado en ese dispositivo, conservando los datos locales y remotos. Para revocar el token, utiliza GitHub.

La app verifica que el repositorio sea privado antes de intercambiar el archivo `molab/personal-v1.json`. La API usa el SHA para actualizarlo y reintenta tras colisiones. Cada dato tiene un vector de versiones: las modificaciones independientes se combinan y las modificaciones simultáneas del mismo dato conservan sus copias en **Sesión → Copias de cambios simultáneos**. Puedes descargarlas antes de elegir. El repositorio conserva además el historial Git. Los datos se guardan en JSON dentro del repositorio privado; esta versión no añade cifrado de extremo a extremo. El archivo admite hasta 5 MB.

Esta versión requiere configurar el acceso en la app: la conexión de GitHub del asistente no funciona como sesión de usuarios de Molab ni se incrusta en el sitio público. Las pruebas de sincronización usan una API simulada; no se ha conectado un token personal real del usuario durante el desarrollo. Los límites del navegador y borrar sus datos pueden eliminar la copia local: exporta copias cuando corresponda.

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

## Biblioteca Excel

SheetJS Community Edition 0.20.3 (mini, solo .xlsx) se conserva en vendor/ con licencia Apache 2.0. Descargada de https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.mini.min.js. SHA-256: 0cb353f830d7288385492c83d277b058ddeac664ca51cf1393aa1fd3e2b70939. No se envían archivos de muestras a servidores ni se ejecutan macros o fórmulas importadas. Las fórmulas de salida recalculan cantidades; la compatibilidad biológica debe reevaluarse en Molab si se cambian enzimas o buffers.

## Preparación de medios · v2.6.0

29 formulaciones para las 29 entradas de medios definidos del catálogo: ocho microbiológicos, seis para hongos, diez vegetales y cinco celulares; ATCC conserva su función de guía. Selección comercial/clásica, volumen final, edición por componente, suplementos, pH, lote y notas. Las variantes se identifican y no se igualan por nombre.

Stocks de glucosa, MgSO4, CaCl2, fosfato TB y hierro/EDTA: enlace a Soluciones con alícuota exacta, lote de stock escalable y regreso al medio con el borrador conservado. Guardar y cerrar registra una instantánea finalizada en Sesión → Cuaderno. Excel con fórmulas y hojas de componentes, preparación y stocks; CSV, Markdown, JSON y copia de texto. Borradores y registros utilizan la sincronización privada existente. Cuaderno se abre desde el botón de Sesión.

Fuentes: tablas de PhytoTechnology y Gibco, fichas Sigma y HiMedia, DSMZ 191 y recetas de laboratorio identificadas. Cada receta enlaza su fuente. Las tablas que no precisan hidratación la señalan; IMDM conserva la advertencia sobre la discrepancia del selenito en la tabla oficial. Ninguna equivalencia molar se calcula a partir de esa discrepancia.
