export interface ISesizare {
  key?: string;        
  userId: string;         
  titlu: string;          
  descriere: string;     
  tipProblema: 'vandalism' | 'gunoi_ilegal' | 'plin' | 'altele'; 
  lat: number;            
  long: number;          
  status: 'deschis' | 'in_lucru' | 'rezolvat';
  timestamp: number;      
  urlPoza?: string;
}

export interface ITraseu {
  key?: string;
  userId: string;
  dataStart: number;
  dataStop?: number;
  coordonate: ICoordonata[];
}

export interface ICoordonata {
  lat: number;
  long: number;
  timestamp: number;
}