export function positive(value, name = 'Valor') {
  const n = Number(value); if (!Number.isFinite(n) || n <= 0) throw new Error(`${name} debe ser mayor que cero.`); return n;
}
export function nonnegative(value, name = 'Valor') {
  const n = Number(value); if (!Number.isFinite(n) || n < 0) throw new Error(`${name} no puede ser negativo.`); return n;
}
export function integer(value, name = 'Cantidad') { const n=positive(value,name); if(!Number.isInteger(n)) throw new Error(`${name} debe ser un entero.`); return n; }
export function solutionMass({concentration, unit, volume, volumeUnit, mw, purity}) {
  const c=positive(concentration,'Concentración'), v=positive(volume,'Volumen')*({L:1,mL:0.001,'µL':0.000001}[volumeUnit]??NaN);
  const p=positive(purity,'Pureza'); if(p>100) throw new Error('La pureza máxima es 100 %.');
  let mass;
  if(unit==='% m/v') mass=c*10*v;
  else if(unit==='g/L') mass=c*v;
  else {const factor={M:1,mM:0.001,'µM':0.000001,nM:0.000000001}[unit]; if(!factor) throw new Error('Unidad no admitida.'); mass=c*factor*v*positive(mw,'Masa molecular');}
  return positive(mass/(p/100),'Masa calculada');
}
export function dilution(c1,c2,v2) {c1=positive(c1,'Concentración inicial'); c2=positive(c2,'Concentración final'); v2=positive(v2,'Volumen final'); if(c2>c1) throw new Error('La concentración final supera al stock. No se puede obtener mediante dilución.'); const stock=c2*v2/c1; return {stock, solvent:v2-stock};}
export function masterMix(config, components) {
  const n=integer(config.reactions,'Reacciones'), controls=nonnegative(config.controls,'Controles'); if(!Number.isInteger(controls)) throw new Error('Controles debe ser un entero.');
  const excess=nonnegative(config.excess,'Exceso'); if(excess>100) throw new Error('El exceso máximo es 100 %.'); const volume=positive(config.volume,'Volumen de reacción');
  const rows=components.map(c=>({...c,per:nonnegative(c.volume,c.name)})); const sum=rows.reduce((a,c)=>a+c.per,0); if(sum>volume+1e-9) throw new Error('Los reactivos superan el volumen final. Reduce sus volúmenes.');
  rows.push({name:'Agua libre de nucleasas', per:Math.max(0,volume-sum),template:false});
  const count=n+controls, factor=count*(1+excess/100);
  return {count,factor,volume,rows:rows.map(c=>({...c,total:c.per*(c.template?count:factor)})),mixPer:volume-rows.filter(c=>c.template).reduce((s,c)=>s+c.per,0)};
}
export function rpmToRcf(radius,rpm) {return 1.118e-5*positive(radius,'Radio (cm)')*positive(rpm,'RPM')**2;}
export function rcfToRpm(radius,rcf) {return Math.sqrt(positive(rcf,'RCF')/(1.118e-5*positive(radius,'Radio (cm)')));}
export function insertMass(vectorMass,vectorBp,insertBp,ratio) {return positive(vectorMass,'Masa del vector')*positive(insertBp,'Longitud del inserto')/positive(vectorBp,'Longitud del vector')*positive(ratio,'Ratio molar');}
export function dnaPmol(mass,bp) {return positive(mass,'Masa')*1000/(positive(bp,'Longitud')*650);}
export function thermalSeconds(program,cycles) {return program.reduce((s,p)=>s+nonnegative(p.seconds,'Duración')*(p.repeat?integer(cycles,'Ciclos'):1),0);}
export function validateProgram(program,cycles) {integer(cycles,'Ciclos'); if(cycles>100) throw new Error('Utiliza 100 ciclos o menos.'); for(const p of program){const t=Number(p.temp); if(!Number.isFinite(t)||t<0||t>110)throw new Error('La temperatura debe estar entre 0 y 110 °C.');nonnegative(p.seconds,'Duración');} return true;}
export function expandThermal(program,cycles) {
  validateProgram(program,cycles);const phases=[];
  for(let i=0;i<program.length;){if(!program[i].repeat){phases.push({...program[i]});i++;continue;}let j=i;while(j<program.length&&program[j].repeat)j++;for(let cycle=1;cycle<=cycles;cycle++)for(const phase of program.slice(i,j))phases.push({...phase,cycle});i=j;}
  return phases;
}
