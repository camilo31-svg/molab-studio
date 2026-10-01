// Basic composition estimates, as documented by UGENE. These are not primer-design Tm.
export function dnaTools(input){
 const sequence=String(input).replace(/^>.*$/gm,'').replace(/\s/g,'').toUpperCase();
 if(!sequence||sequence.length>100000||/[^ACGT]/.test(sequence))throw new Error('Introduce entre 1 y 100000 bases A, C, G y T. Se admiten espacios y cabecera FASTA.');
 const reverse=[...sequence].reverse().join('');
 const complement=sequence.replace(/[ACGT]/g,c=>({A:'T',C:'G',G:'C',T:'A'}[c]));
 const reverseComplement=[...complement].reverse().join('');
 const gcCount=(sequence.match(/[GC]/g)||[]).length;
 const tm=sequence.length<14?2*(sequence.length-gcCount)+4*gcCount:64.9+41*(gcCount-16.4)/sequence.length;
 return {sequence,reverse,complement,reverseComplement,length:sequence.length,gc:100*gcCount/sequence.length,tm,tmMethod:sequence.length<14?'Regla de Wallace: 2(A+T) + 4(G+C)':'Estimación por composición: 64,9 + 41(G+C−16,4)/N'};
}
