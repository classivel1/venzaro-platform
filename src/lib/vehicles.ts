export type Vehicle = { id:string; title:string; brand:string; model:string; year:number; price:number; mileage:number; fuel:string; transmission:string; city:string; category:"Carro"|"Moto"; description:string };
export const vehicles:Vehicle[] = [
{id:"corolla-2022",title:"Toyota Corolla XEi 2.0",brand:"Toyota",model:"Corolla",year:2022,price:119900,mileage:43000,fuel:"Flex",transmission:"Automático",city:"Cascavel - PR",category:"Carro",description:"Sedã confortável, com transmissão automática e ótimo espaço interno."},
{id:"onix-2021",title:"Chevrolet Onix LT 1.0",brand:"Chevrolet",model:"Onix",year:2021,price:62900,mileage:59000,fuel:"Flex",transmission:"Manual",city:"Toledo - PR",category:"Carro",description:"Hatch econômico para o dia a dia."},
{id:"civic-2020",title:"Honda Civic EX 2.0",brand:"Honda",model:"Civic",year:2020,price:104900,mileage:68000,fuel:"Flex",transmission:"Automático",city:"Curitiba - PR",category:"Carro",description:"Sedã com bom espaço e acabamento."},
{id:"fazer-2023",title:"Yamaha Fazer FZ25",brand:"Yamaha",model:"Fazer FZ25",year:2023,price:21900,mileage:12000,fuel:"Gasolina",transmission:"Manual",city:"Cascavel - PR",category:"Moto",description:"Motocicleta versátil para deslocamentos urbanos."},
{id:"cg-2024",title:"Honda CG 160 Titan",brand:"Honda",model:"CG 160 Titan",year:2024,price:18900,mileage:8500,fuel:"Gasolina",transmission:"Manual",city:"Maringá - PR",category:"Moto",description:"Motocicleta leve e econômica."}
];
export const brl=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(n);
export const km=(n:number)=>new Intl.NumberFormat("pt-BR").format(n)+" km";
