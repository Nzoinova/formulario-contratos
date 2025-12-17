import { FormData } from '../types';
import * as XLSX from 'xlsx';

export const exportToCSV = (data: FormData) => {
  // Use XLSX directly as it is the namespace for the ESM module
  const utils = XLSX.utils;
  const wb = utils.book_new();

  // --- 1. Prepare Data Structure (Array of Arrays) ---
  const wsData: (string | number | null)[][] = [];

  // Title
  wsData.push(["PEDIDO DE CONTRATO DE MANUTENÇÃO - NORS ANGOLA"]);
  wsData.push([""]); // Empty row

  // Client Section
  wsData.push(["DADOS DO CLIENTE"]);
  wsData.push(["Nome da Empresa", data.client.nomeEmpresa]);
  wsData.push(["NIF", data.client.nif]);
  wsData.push(["Província", data.client.provincia]);
  wsData.push(["Morada", data.client.morada]);
  wsData.push(["Email Geral", data.client.emailEmpresa || '-']);
  wsData.push([""]);
  wsData.push(["Responsável", data.client.responsavelNome]);
  wsData.push(["Cargo", data.client.responsavelCargo]);
  wsData.push(["Email Responsável", data.client.responsavelEmail]);
  wsData.push(["Telefone Responsável", data.client.responsavelTelefone]);
  wsData.push([""]); // Empty row

  // Vehicles & Contract Section
  wsData.push(["FROTA DE VIATURAS & CONDIÇÕES CONTRATUAIS"]);
  // Headers for the table (Consolidated)
  wsData.push([
    "Nº", 
    "Marca", 
    "Modelo", 
    "Matrícula", 
    "VIN", 
    "Ano", 
    "Km Atual", 
    "Tipo Operação",
    "|", // Separator
    "Duração (Meses)",
    "Km Total Contrato",
    "Data Início",
    "Observações"
  ]);

  // Vehicle Rows
  data.vehicles.forEach((v, index) => {
    wsData.push([
      index + 1,
      v.marca,
      v.modelo,
      v.matricula,
      v.vin,
      v.anoFabrico,
      v.quilometragem,
      v.tipoOperacao,
      "|",
      v.duracaoMeses,
      v.quilometragemTotal,
      v.dataInicio,
      v.observacoes || '-'
    ]);
  });
  wsData.push([""]); // Empty row

  // --- 2. Create Worksheet ---
  const ws = utils.aoa_to_sheet(wsData);

  // --- 3. Styling / Column Widths ---
  // Set column widths (approximate character count)
  const wscols = [
    { wch: 5 },  // Index
    { wch: 15 }, // Marca
    { wch: 20 }, // Modelo
    { wch: 15 }, // Matricula
    { wch: 22 }, // VIN
    { wch: 8 },  // Ano
    { wch: 12 }, // Km
    { wch: 25 }, // Operação
    { wch: 3 },  // Separator
    { wch: 15 }, // Duracao
    { wch: 18 }, // Km Total
    { wch: 15 }, // Data Inicio
    { wch: 40 }, // Obs
  ];
  ws['!cols'] = wscols;

  // Append sheet to workbook
  utils.book_append_sheet(wb, ws, "Pedido de Contrato");

  // --- 4. Generate File Name & Download ---
  const companySlug = data.client.nomeEmpresa.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'cliente';
  const timestamp = new Date().toISOString().slice(0, 10);
  const fileName = `Pedido_Contrato_${companySlug}_${timestamp}.xlsx`;

  // Trigger download
  XLSX.writeFile(wb, fileName);
};