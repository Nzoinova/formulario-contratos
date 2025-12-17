import React from 'react';
import { Trash2, Truck, ChevronDown, ChevronUp, Calculator, FileText } from 'lucide-react';
import { VehicleData, VEHICLE_MAKES, VEHICLE_MODELS, OPERATION_TYPES } from '../types';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';

interface VehicleCardProps {
  vehicle: VehicleData;
  index: number;
  onUpdate: (id: string, field: keyof VehicleData, value: string) => void;
  onBlur: (id: string, field: keyof VehicleData, value: string) => void;
  onRemove: (id: string) => void;
  errors: Record<string, string>;
  canRemove: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ 
  vehicle, 
  index, 
  onUpdate,
  onBlur,
  onRemove, 
  errors,
  canRemove,
  isExpanded,
  onToggle
}) => {
  const handleChange = (field: keyof VehicleData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    onUpdate(vehicle.id, field, e.target.value);
  };

  const handleBlur = (field: keyof VehicleData) => (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    onBlur(vehicle.id, field, e.target.value);
  };

  // Check if this specific vehicle has any errors
  const hasErrors = Object.keys(errors).some(key => key.startsWith(`vehicles.${index}.`));

  // Determine model options based on selected make
  const currentModels = vehicle.marca ? VEHICLE_MODELS[vehicle.marca] || [] : [];

  return (
    <div className={`bg-white rounded-xl border mb-4 transition-all duration-300 overflow-hidden group relative
      ${hasErrors 
        ? 'border-red-200 shadow-md' // Base visual for error state
        : isExpanded 
          ? 'border-slate-200 shadow-lg' 
          : 'border-slate-100 hover:border-slate-300 shadow-sm'
      }`}>
      
      {/* Visual Highlight for Errors (Pulsing Red Border) */}
      {hasErrors && (
        <div className="absolute inset-0 rounded-xl border-2 border-red-400/40 pointer-events-none animate-pulse z-10"></div>
      )}

      {/* Header / Summary Bar - Always Visible */}
      <div 
        onClick={onToggle}
        className={`relative flex items-center justify-between p-4 cursor-pointer select-none transition-colors z-20
          ${isExpanded ? 'bg-slate-50 border-b border-slate-100' : 'bg-white hover:bg-slate-50'}`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg transition-colors shadow-sm
            ${hasErrors 
              ? 'bg-red-100 text-red-600' 
              : isExpanded ? 'bg-nors-dark text-white' : 'bg-slate-100 text-slate-600'}`}>
            <Truck size={20} strokeWidth={1.5} />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <h3 className={`font-bold text-lg tracking-tight ${hasErrors ? 'text-red-600' : 'text-slate-900'}`}>
              Viatura #{index + 1}
            </h3>
            
            {!isExpanded && (vehicle.marca || vehicle.matricula) && (
              <div className="flex items-center gap-2 text-sm text-slate-500 animate-in fade-in duration-300">
                <span className="hidden md:inline">•</span>
                <span className="font-medium text-slate-700">{vehicle.marca || 'Marca n/d'}</span>
                {vehicle.modelo && <span>{vehicle.modelo}</span>}
                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-xs border border-slate-200">
                  {vehicle.matricula || 'Matrícula n/d'}
                </span>
                {vehicle.duracaoMeses && (
                   <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100 flex items-center gap-1">
                     <FileText size={10} />
                     {vehicle.duracaoMeses} Meses
                   </span>
                )}
              </div>
            )}

            {!isExpanded && !vehicle.marca && !vehicle.matricula && (
              <span className="text-sm text-slate-400 italic font-light hidden md:inline animate-in fade-in duration-300">
                Clique para preencher os detalhes
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasErrors && !isExpanded && (
            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full border border-red-100 animate-pulse">
              Corrigir Erros
            </span>
          )}
          {canRemove && (
            <Button 
              variant="outline" 
              onClick={(e) => { e.stopPropagation(); onRemove(vehicle.id); }}
              className="!px-2 !py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 border-transparent hover:border-red-100"
              icon={<Trash2 size={16} />}
              title="Remover viatura"
            >
            </Button>
          )}
          <div className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown size={20} />
          </div>
        </div>
        
        {/* Active Indicator Line */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-nors-dark transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}></div>
      </div>

      {/* Expanded Form Content with Smooth Accordion Animation */}
      <div 
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out
          ${isExpanded ? 'grid-rows-[1fr] opacity-100 visible' : 'grid-rows-[0fr] opacity-0 invisible'}`}
      >
        <div className="overflow-hidden">
          <div className="p-6">
            
            {/* Subsection Title: Tech Specs */}
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dados Técnicos</span>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Select
                label="Marca"
                options={VEHICLE_MAKES}
                value={vehicle.marca}
                onChange={handleChange('marca')}
                onBlur={handleBlur('marca')}
                error={errors[`vehicles.${index}.marca`]}
                required
              />
              <Select
                label="Modelo"
                options={currentModels}
                value={vehicle.modelo}
                onChange={handleChange('modelo')}
                onBlur={handleBlur('modelo')}
                error={errors[`vehicles.${index}.modelo`]}
                required
                disabled={!vehicle.marca}
                placeholder={!vehicle.marca ? "Selecione a marca primeiro" : "Selecione..."}
              />
              <Input
                label="Matrícula"
                placeholder="Ex: LD-50-06-IF"
                value={vehicle.matricula}
                onChange={handleChange('matricula')}
                onBlur={handleBlur('matricula')}
                error={errors[`vehicles.${index}.matricula`]}
                required
              />
              <Input
                label="Ano de Fabrico"
                type="number"
                min="2000"
                max="2030"
                placeholder="Ex: 2024"
                value={vehicle.anoFabrico}
                onChange={handleChange('anoFabrico')}
                onBlur={handleBlur('anoFabrico')}
                error={errors[`vehicles.${index}.anoFabrico`]}
                required
              />
              
              <div className="md:col-span-2">
                <Input
                  label="VIN (17 Caracteres)"
                  placeholder="Ex: LGAG4DY30P8830799"
                  maxLength={17}
                  value={vehicle.vin}
                  onChange={(e) => onUpdate(vehicle.id, 'vin', e.target.value.toUpperCase())}
                  onBlur={handleBlur('vin')}
                  error={errors[`vehicles.${index}.vin`]}
                  required
                  className="font-mono tracking-wider"
                />
              </div>
            
              <Input
                label="Km Atual"
                placeholder="Ex: 50000"
                type="number"
                value={vehicle.quilometragem}
                onChange={handleChange('quilometragem')}
                onBlur={handleBlur('quilometragem')}
                error={errors[`vehicles.${index}.quilometragem`]}
                required
              />
              
              <Input
                label="Km Mensal Estimado"
                placeholder="Ex: 5000"
                type="number"
                value={vehicle.kmMensal}
                onChange={handleChange('kmMensal')}
                onBlur={handleBlur('kmMensal')}
                error={errors[`vehicles.${index}.kmMensal`]}
                required
              />

              <Select
                label="Tipo de Operação"
                options={OPERATION_TYPES}
                value={vehicle.tipoOperacao}
                onChange={handleChange('tipoOperacao')}
                onBlur={handleBlur('tipoOperacao')}
                error={errors[`vehicles.${index}.tipoOperacao`]}
                fullWidth
                className="lg:col-span-4"
                required
              />
            </div>

            {/* Subsection Title: Contract Specs */}
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Condições do Contrato</span>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input
                label="Duração (Meses)"
                type="number"
                min="1"
                max="60"
                value={vehicle.duracaoMeses}
                onChange={handleChange('duracaoMeses')}
                onBlur={handleBlur('duracaoMeses')}
                error={errors[`vehicles.${index}.duracaoMeses`]}
                required
                title="Insira a duração do contrato em meses (1 a 60)."
              />
              
              <div className="relative">
                <Input
                  label="Quilometragem Total Contrato"
                  type="number"
                  step="1000"
                  value={vehicle.quilometragemTotal}
                  onChange={handleChange('quilometragemTotal')}
                  onBlur={handleBlur('quilometragemTotal')}
                  error={errors[`vehicles.${index}.quilometragemTotal`]}
                  icon={<Calculator size={18} />}
                  placeholder="Calculado automaticamente..."
                  title="Total de quilómetros previstos para o período do contrato. Calculado automaticamente com base na duração."
                />
              </div>

              <Input
                label="Data Pretendida de Início"
                type="date"
                value={vehicle.dataInicio}
                onChange={handleChange('dataInicio')}
                onBlur={handleBlur('dataInicio')}
                error={errors[`vehicles.${index}.dataInicio`]}
                required
                title="Selecione a data de início desejada. Não pode ser uma data passada."
              />

              <div className="col-span-full group">
                <label className="text-sm font-medium text-slate-600 mb-2 block group-focus-within:text-nors-primary transition-colors">
                  Observações desta Viatura
                </label>
                <textarea
                  name="observacoes"
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-nors-primary focus:ring-4 focus:ring-nors-primary/10 transition-all shadow-sm placeholder:text-slate-300"
                  placeholder="Requisitos específicos para esta viatura..."
                  value={vehicle.observacoes}
                  onChange={handleChange('observacoes')}
                ></textarea>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};