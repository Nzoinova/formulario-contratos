import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltam variáveis de ambiente do Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Cliente = {
  id: string;
  nif: string;
  nome_empresa: string;
  provincia: string;
  morada: string;
  email_empresa?: string;
  created_at: string;
  updated_at: string;
};

export type Responsavel = {
  id: string;
  cliente_id: string;
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  is_primary: boolean;
  created_at: string;
};

export type Viatura = {
  id: string;
  cliente_id: string;
  vin: string;
  matricula: string;
  marca: 'Volvo' | 'Dongfeng';
  modelo: string;
  ano_fabrico: number;
  tipo_operacao: string;
  km_atual: number;
  km_mensal_estimado: number;
  contrato_ativo_id?: string;
  status: 'Ativo' | 'Inativo' | 'Vendido' | 'Sinistrado';
  created_at: string;
  updated_at: string;
};

export type Contrato = {
  id: string;
  numero_contrato: string;
  tipo: 'CM' | 'APV';
  cliente_id: string;
  data_inicio: string;
  data_fim: string;
  duracao_meses: number;
  alerta_apv_date?: string;
  alerta_apv_enviado: boolean;
  valor_total?: number;
  valor_mensal?: number;
  km_total?: number;
  status: 'Ativo' | 'Pendente' | 'Fechado' | 'Cortesia';
  observacoes?: string;
  created_at: string;
  updated_at: string;
};
