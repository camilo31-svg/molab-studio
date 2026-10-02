// Extracted bacterial procedures; the plant infection sections are separate methods.
const step=(title,text,seconds=0,conditions='')=>({title,text,seconds,conditions});
const tum='https://pmc.ncbi.nlm.nih.gov/articles/PMC5821610/';
const rhiz='https://en.bio-protocol.org/pdf/Bio-protocol4691.pdf';
const make=(x)=>({manufacturer:'pubmed',origin:'paper',status:'reviewed',sourceType:'paper',pages:'Materials and methods',tips:[],tags:['Agrobacterium','Competentes','Transformación'],...x});
export const agrobacteriumProtocols=[
 make({id:'agro-tum-competent-2018',family:'competent-agrobacterium',familyTitle:'Competentes de Agrobacterium',category:'Células competentes',title:'A. tumefaciens · electrocompetentes desde placa',subtitle:'MOG301 / EHA105 / LBA4404 · Kámán-Tóth 2018',materials:['Agrobacterium tumefaciens'],version:'Kámán-Tóth et al. · 2018',source:tum,doi:'10.1007/s13205-018-1171-9',duration:'16 h + preparación',description:'Preparación desde un césped bacteriano en agar.',mechanism:'El lavado con glicerol reduce sales antes del pulso.',assumptions:'Tres cepas ensayadas: MOG301, EHA105 y LBA4404. Mantener frías las suspensiones.',steps:[
  step('Crecer','Extiende células frescas en LB agar selectivo de 90 mm.',57600,'27 °C · ~16 h'),
  step('Recoger','Suspende el césped en 4 mL de glicerol estéril al 10 % v/v frío; reparte en dos tubos de 2 mL.'),
  step('Centrifugar','Retira el sobrenadante.',60,'18.000 × g · 4 °C'),
  step('Lavar','Resuspende cada pellet en 1 mL de glicerol 10 % frío; repite la centrifugación.',60,'18.000 × g · 4 °C'),
  step('Concentrar','Resuspende cada pellet en 200 µL de glicerol 10 % frío y combina: 400 µL.'),
  step('Conservar','Mantén en hielo para electroporar; congela alícuotas sobrantes en nitrógeno líquido y guarda a −70 °C.')]}),
 make({id:'agro-tum-electroporation-2018',family:'transform-agrobacterium',familyTitle:'Transformación de Agrobacterium',category:'Transformación bacteriana',title:'A. tumefaciens · electroporación desde placa',subtitle:'MOG301 / EHA105 / LBA4404',materials:['Agrobacterium tumefaciens'],version:'Kámán-Tóth et al. · 2018',source:tum,doi:'10.1007/s13205-018-1171-9',duration:'1 h + 2 días',description:'Transformación de células preparadas mediante el método de placa.',mechanism:'Entrada de DNA mediante pulso eléctrico.',assumptions:'Usa la preparación de electrocompetentes de esta fuente.',steps:[
  step('Mezclar','Combina 70–80 µL de células con 1–3 µL de plasmidio (1–100 ng).',0,'Hielo'),
  step('Pulso','Carga una cubeta fría de 2 mm; aplica 2,5 kV, 25 µF y 400 Ω.'),
  step('Recuperar','Añade inmediatamente 1 mL SOC y pasa a un tubo de 15 mL.',3600,'27 °C · rotación · 1 h'),
  step('Seleccionar','Siembra 100 µL en LB selectivo.',172800,'27 °C · 2 días'),
  step('Verificar','Comprueba colonias mediante PCR.')] }),
 make({id:'agro-rhiz-competent-2023',family:'competent-agrobacterium',familyTitle:'Competentes de Agrobacterium',category:'Células competentes',title:'A. rhizogenes K599 · competentes con CaCl₂',subtitle:'Xu et al. · Bio-protocol 2023',materials:['Agrobacterium rhizogenes'],pages:'3 · sección B',version:'Xu et al. · 2023',source:rhiz,doi:'10.21769/BioProtoc.4691',duration:'Cultivo + preparación',description:'Preparación química de K599.',mechanism:'CaCl₂ y frío favorecen la competencia.',assumptions:'La fuente indica 37 °C en la placa inicial; confirma ese punto para tu stock K599. Los cultivos líquidos son a 28 °C.',steps:[
  step('Aislar','Estría K599 en LB sin antibiótico.',57600,'37 °C · 16–20 h · condición de la fuente'),
  step('Precultivo','Inocula una colonia en 5 mL LB.',43200,'28 °C · 220 rpm · 12–16 h'),
  step('Expandir','Transfiere 2 mL a 100 mL LB; crece hasta OD600 = 0,5.',0,'28 °C · 220 rpm'),
  step('Recoger','Centrifuga y descarta sobrenadante.',300,'3.000 × g'),
  step('CaCl₂','Resuspende en 10 mL de CaCl₂ 0,1 M frío.',1200,'Hielo'),
  step('Centrifugar','Descarta sobrenadante.',300,'3.000 × g · 4 °C'),
  step('Alícuotas','Resuspende en 4 mL de CaCl₂ 0,1 M con glicerol 15 %; reparte 200 µL y congela a −80 °C.')]}),
 make({id:'agro-rhiz-transform-2023',family:'transform-agrobacterium',familyTitle:'Transformación de Agrobacterium',category:'Transformación bacteriana',title:'A. rhizogenes K599 · congelación / choque',subtitle:'Xu et al. · Bio-protocol 2023',materials:['Agrobacterium rhizogenes'],pages:'3 · sección C',version:'Xu et al. · 2023',source:rhiz,doi:'10.21769/BioProtoc.4691',duration:'2–3 h + selección',description:'Transformación de K599 químicamente competente.',mechanism:'Congelación y calentamiento permiten incorporar el plasmidio.',assumptions:'100 µL de células competentes y 1 µg de plasmidio.',steps:[
  step('Descongelar','Descongela parcialmente y añade 1 µg de DNA a 100 µL de células; mezcla suavemente.'),
  step('Hielo','Incuba.',300,'Hielo'),step('Congelar','Incuba.',300,'Nitrógeno líquido'),step('Choque','Incuba.',300,'37 °C · baño'),step('Hielo','Incuba.',300,'Hielo'),
  step('Recuperar','Añade 800 µL LB sin antibióticos.',7200,'28 °C · 200 rpm · 2–3 h'),
  step('Concentrar','Centrifuga; conserva 100 µL de sobrenadante y resuspende.',60,'3.000 × g · ambiente'),
  step('Seleccionar','Siembra en LB con antibióticos correspondientes.',172800,'28 °C · 2–3 días')]}),
];
