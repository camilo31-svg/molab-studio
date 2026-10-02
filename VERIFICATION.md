# Verificación Molab Studio v2.3.0

- 75 procedimientos con receta agrupados en 37 métodos; 55 comerciales, 18 de papers y 2 de laboratorio. Se mantienen los filtros por origen y material, la bibliografía anexa y los datos personales existentes.
- Cuatro recetas nuevas de Agrobacterium: competencia y transformación de A. tumefaciens (MOG301/EHA105/LBA4404) y A. rhizogenes K599. La transformación GV3101 continúa como versión diferenciada. En K599 se señala expresamente la temperatura de 37 °C de la placa inicial que indica Xu et al., distinta del cultivo líquido a 28 °C.
- Tres variantes comerciales de digestión, una familia: NEB, Thermo FastDigest y Promega. Matrices de compatibilidad de 36 productos y buffers con actividades exactas o rangos publicados. Se evita interpolar actividades entre fabricantes. Colores: FastDigest Green contiene azul y amarillo; los códigos de tapón sin fuente se declaran no especificados.
- Cálculos para 1–3 enzimas: DNA objetivo en ng, concentración por muestra en ng/µL, volumen final, cantidades de enzima, agua, buffer y BSA Promega. Pool físico reparte masa total por igual y usa los reactivos una sola vez.
- Importación .xlsx local con elección de hoja, cabecera, columnas y unidades. Conserva medición/unidad/fila original. Muestra datos no numéricos, ceros, duplicados y agua negativa; no elimina filas fallidas.
- Exportación de Excel real con valores tipados, fórmulas, condiciones, notas, fuentes y datos originales. Ensayo de cuatro muestras: 100/80/50/125 ng/µL; DNA 10/12,5/20/8 µL para 1.000 ng, 50 µL finales, 5 µL buffer y enzimas 0,5 + 0,5 + 1 µL. Agua: 33/30,5/23/35 µL.
- Reimportación del archivo exportado y recálculo con Artifact Tool. Cambiar 100 a 200 ng/µL produce DNA 5 µL y agua 38 µL; poner cero indica concentración inválida. Sin errores de fórmula encontrados. Hojas Digestiones y Condiciones renderizadas y revisadas; plantilla de concentraciones renderizada. No se ha comprobado con Excel nativo.
- Exportación independiente de programas antes de Start, durante una guía y desde registros: texto, CSV, XLSX y SVG para programas térmicos. Se conservan temperaturas modificadas, ciclos y fases sin duración fija.
- 56 pruebas automatizadas pasan: las 44 anteriores más cálculos por muestra/pool, compatibilidad de triple digestión, invalidaciones, colores/BSA, importación, XLSX de ida y vuelta, programas, agrupación y pantallas.

El catálogo es ampliable, no exhaustivo mundialmente. La recomendación maximiza la actividad mínima documentada, evitando buffers marcados con star; no garantiza digestión de cualquier sustrato. Metilación, pureza, sitios terminales, escala y dosis se revisan en la ficha concreta. Temperaturas diferentes requieren un protocolo secuencial y no se convierten automáticamente en una digestión simultánea.

Comprobación pública de esta versión: pendiente de publicación y revisión en navegador.
