export interface ClientData {
  nomeEmpresa: string;
  nif: string;
  provincia: string;
  morada: string;
  responsavelNome: string;
  responsavelCargo: string;
  responsavelEmail: string;
  responsavelTelefone: string;
  emailEmpresa: string;
}

export interface VehicleData {
  id: string;
  // Vehicle Specs
  marca: string;
  modelo: string;
  vin: string;
  matricula: string;
  anoFabrico: string;
  quilometragem: string;
  tipoOperacao: string;
  kmMensal: string;
  
  // Contract Specs (Per Vehicle)
  duracaoMeses: string;
  quilometragemTotal: string;
  dataInicio: string;
  observacoes: string;
}

export interface FormData {
  client: ClientData;
  vehicles: VehicleData[];
  // Global contract section removed
}

export const PROVINCES = [
  "Luanda", "Bengo", "Benguela", "Bié", "Cabinda", 
  "Cuando Cubango", "Cuanza Norte", "Cuanza Sul", "Cunene", 
  "Huambo", "Huíla", "Lunda Norte", "Lunda Sul", 
  "Malanje", "Moxico", "Namibe", "Uíge", "Zaire"
];

export const VEHICLE_MAKES = ["Volvo", "Dongfeng"];

export const VEHICLE_MODELS: Record<string, string[]> = {
  "Volvo": [
    "Volvo FMX 440",
    "Volvo FMX 480",
    "Volvo FMX 520",
    "Volvo FH 460",
    "Volvo FH 520",
    "Volvo FH 540",
    "Volvo FL 240",
    "Volvo FL 280",
    "Volvo FL 420",
    "Volvo FM 380",
    "Volvo FM 420"
  ],
  "Dongfeng": [
    "Dongfeng KX 560",
    "Dongfeng KL 465",
    "Dongfeng KC 450",
    "Dongfeng KC 385",
    "Dongfeng KL 450",
    "Dongfeng KR 220",
    "Dongfeng KR 190",
    "Captan 125"
  ]
};

export const OPERATION_TYPES = [
  "Transporte de Contentores",
  "Construção",
  "Mineração",
  "Distribuição",
  "Transporte de Combustível",
  "Transporte de Carga Geral",
  "Outro"
];