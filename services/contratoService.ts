import { supabase } from '../lib/supabase';
import type { Cliente, Viatura } from '../lib/supabase';

export const contratoService = {
  
  async buscarClientePorNIF(nif: string): Promise<Cliente | null> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('nif', nif)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }
    
    return data;
  },

  async buscarViaturaPorVIN(vin: string): Promise<Viatura | null> {
    const { data, error } = await supabase
      .from('viaturas')
      .select('*')
      .eq('vin', vin)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar viatura:', error);
      throw error;
    }
    
    return data;
  },

  async criarContratoCompleto(formData: any, tipo: 'CM' | 'APV') {
    try {
      console.log('🚀 Iniciando criação de contrato', tipo);

      // PASSO 1: CLIENTE
      let cliente = await this.buscarClientePorNIF(formData.client.nif);
      
      if (!cliente) {
        const { data: novoCliente, error } = await supabase
          .from('clientes')
          .insert({
            nif: formData.client.nif,
            nome_empresa: formData.client.nomeEmpresa,
            provincia: formData.client.provincia,
            morada: formData.client.morada,
            email_empresa: formData.client.emailEmpresa || null
          })
          .select()
          .single();
        
        if (error) throw error;
        cliente = novoCliente;

        await supabase.from('responsaveis').insert({
          cliente_id: cliente.id,
          nome: formData.client.responsavelNome,
          cargo: formData.client.responsavelCargo || null,
          email: formData.client.responsavelEmail,
          telefone: formData.client.responsavelTelefone || null,
          is_primary: true
        });
      }

      // PASSO 2: NÚMERO CONTRATO
      const { data: numeroData, error: numeroError } = await supabase
        .rpc('gerar_numero_contrato', { tipo_contrato: tipo });
      
      if (numeroError) throw numeroError;

      // PASSO 3: DATA FIM
      const primeiraViatura = formData.vehicles[0];
      const dataInicio = new Date(primeiraViatura.dataInicio);
      const dataFim = new Date(dataInicio);
      dataFim.setMonth(dataFim.getMonth() + parseInt(primeiraViatura.duracaoMeses));

      // PASSO 4: CRIAR CONTRATO
      const kmTotal = formData.vehicles.reduce(
        (sum: number, v: any) => sum + parseInt(v.quilometragemTotal || 0), 0
      );

      const { data: contrato, error: contratoError } = await supabase
        .from('contratos')
        .insert({
          numero_contrato: numeroData,
          tipo: tipo,
          cliente_id: cliente.id,
          data_inicio: primeiraViatura.dataInicio,
          data_fim: dataFim.toISOString().split('T')[0],
          duracao_meses: parseInt(primeiraViatura.duracaoMeses),
          km_total: kmTotal,
          status: 'Ativo'
        })
        .select()
        .single();
      
      if (contratoError) throw contratoError;

      // PASSO 5: VIATURAS
      for (const veiculoData of formData.vehicles) {
        let viatura = await this.buscarViaturaPorVIN(veiculoData.vin);
        
        if (!viatura) {
          const { data: novaViatura, error } = await supabase
            .from('viaturas')
            .insert({
              cliente_id: cliente.id,
              vin: veiculoData.vin,
              matricula: veiculoData.matricula,
              marca: veiculoData.marca,
              modelo: veiculoData.modelo,
              ano_fabrico: parseInt(veiculoData.anoFabrico),
              tipo_operacao: veiculoData.tipoOperacao,
              km_atual: parseInt(veiculoData.quilometragem),
              km_mensal_estimado: parseInt(veiculoData.kmMensal),
              contrato_ativo_id: contrato.id,
              status: 'Ativo'
            })
            .select()
            .single();
          
          if (error) throw error;
          viatura = novaViatura;
        } else {
          await supabase
            .from('viaturas')
            .update({ contrato_ativo_id: contrato.id })
            .eq('id', viatura.id);
        }

        await supabase.from('contrato_viaturas').insert({
          contrato_id: contrato.id,
          viatura_id: viatura.id,
          km_contrato: parseInt(veiculoData.quilometragemTotal)
        });
      }

      return {
        success: true,
        contrato_id: contrato.id,
        numero_contrato: contrato.numero_contrato,
        message: `Contrato ${tipo} ${contrato.numero_contrato} criado!`
      };

    } catch (error: any) {
      console.error('Erro:', error);
      return {
        success: false,
        error: error.message || 'Erro ao criar contrato'
      };
    }
  }
};
