import React, { useState, useCallback } from 'react';
import { contratoService } from './services/contratoService';
import { Loader2 } from 'lucide-react';
import { 
  Building2, 
  Plus, 
  Download, 
  RotateCcw, 
  CheckCircle2,
  Info,
  ShieldCheck,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Car,
  Database,
  AlertCircle
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Input } from './components/ui/Input';
import { Select } from './components/ui/Select';
import { Button } from './components/ui/Button';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { VehicleCard } from './components/VehicleCard';
import { exportToCSV } from './utils/excelExport';
import { FormData, PROVINCES, ClientData, VehicleData } from './types';

// Initial States
const initialVehicle: VehicleData = {
  id: 'init-1',
  marca: '',
  modelo: '',
  vin: '',
  matricula: '',
  anoFabrico: '',
  quilometragem: '',
  tipoOperacao: '',
  kmMensal: '',
  duracaoMeses: '',
  quilometragemTotal: '',
  dataInicio: '',
  observacoes: ''
};

const initialClient: ClientData = {
  nomeEmpresa: '',
  nif: '',
  provincia: '',
  morada: '',
  responsavelNome: '',
  responsavelCargo: '',
  responsavelEmail: '',
  responsavelTelefone: '',
  emailEmpresa: ''
};

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    client: initialClient,
    vehicles: [{ ...initialVehicle }]
  });

  // UX State
  const [expandedVehicleId, setExpandedVehicleId] = useState<string | null>(initialVehicle.id);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  
  // NEW: Supabase State
  const [isSavingCM, setIsSavingCM] = useState(false);
  const [isSavingAPV, setIsSavingAPV] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Confirmation Dialog State
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

  // --- Validation Logic ---

  const validateField = (name: string, value: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (['nomeEmpresa', 'nif', 'morada', 'responsavelNome', 'responsavelCargo', 'responsavelTelefone', 'provincia'].includes(name)) {
      if (!value.trim()) return 'Este campo é obrigatório';
    }

    if (name === 'responsavelEmail' || name === 'emailEmpresa') {
      if (name === 'responsavelEmail' && !value.trim()) return 'Este campo é obrigatório';
      if (value.trim() && !emailRegex.test(value)) return 'Por favor, insira um email válido';
    }
    
    return ''; 
  };

  const validateVehicleField = (field: keyof VehicleData, value: string): string => {
    if (field === 'vin') {
      if (!value.trim()) return 'VIN é obrigatório';
      if (value.length !== 17) return `O VIN deve ter 17 caracteres (Atual: ${value.length})`;
    }
    
    const requiredSpecs: (keyof VehicleData)[] = ['marca', 'modelo', 'matricula', 'anoFabrico', 'quilometragem', 'tipoOperacao', 'kmMensal'];
    if (requiredSpecs.includes(field) && !value.trim()) {
      return 'Este campo é obrigatório';
    }

    if (field === 'duracaoMeses') {
      if (!value.trim()) return 'Este campo é obrigatório';
    }

    if (field === 'dataInicio') {
      if (!value.trim()) return 'Este campo é obrigatório';
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [year, month, day] = value.split('-').map(Number);
      const selectedDate = new Date(year, month - 1, day);
      
      if (selectedDate < today) {
        return 'A data não pode ser no passado';
      }
    }

    return '';
  };

  // --- Handlers ---

  const handleBlur = (section: 'client') => (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  const handleChange = (section: 'client') => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev };
      if (section === 'client') {
        newData.client = { ...newData.client, [name]: value } as ClientData;
      }
      return newData;
    });

    if (errors[name]) {
      const error = validateField(name, value);
      if (!error) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const addVehicle = () => {
    const newId = uuidv4();
    setFormData(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, { ...initialVehicle, id: newId }]
    }));
    setExpandedVehicleId(newId);
  };

  const toggleVehicle = (id: string) => {
    setExpandedVehicleId(prevId => prevId === id ? null : id);
  };

  const initiateRemoveVehicle = (id: string) => {
    setVehicleToDelete(id);
  };

  const confirmRemoveVehicle = () => {
    if (vehicleToDelete) {
      setFormData(prev => ({
        ...prev,
        vehicles: prev.vehicles.filter(v => v.id !== vehicleToDelete)
      }));
      
      setErrors(prev => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach(key => {
          if (key.startsWith('vehicles.')) delete newErrors[key];
        });
        return newErrors;
      });

      if (expandedVehicleId === vehicleToDelete) {
        setExpandedVehicleId(null); 
      }

      setVehicleToDelete(null);
    }
  };

  const updateVehicle = (id: string, field: keyof VehicleData, value: string) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.map(v => {
        if (v.id === id) {
          if (field === 'marca') {
            return { ...v, [field]: value, modelo: '' };
          }

          if (field === 'duracaoMeses') {
             const months = parseInt(value);
             let calculatedKm = '';
             if (!isNaN(months) && months > 0) {
                const standardAnnualKm = 80000;
                calculatedKm = Math.round((months / 12) * standardAnnualKm).toString();
             }
             return { ...v, [field]: value, quilometragemTotal: calculatedKm };
          }

          return { ...v, [field]: value };
        }
        return v;
      })
    }));
    
    const index = formData.vehicles.findIndex(v => v.id === id);
    const errorKey = `vehicles.${index}.${field}`;

    if (errors[errorKey]) {
      const error = validateVehicleField(field, value);
      if (!error) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          if (field === 'marca') {
            delete newErrors[`vehicles.${index}.modelo`];
          }
          return newErrors;
        });
      }
    }
  };

  const handleVehicleBlur = (id: string, field: keyof VehicleData, value: string) => {
    const index = formData.vehicles.findIndex(v => v.id === id);
    const errorKey = `vehicles.${index}.${field}`;
    const error = validateVehicleField(field, value);

    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[errorKey] = error;
      } else {
        delete newErrors[errorKey];
      }
      return newErrors;
    });
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    let firstErrorVehicleId: string | null = null;

    Object.keys(formData.client).forEach(key => {
      const error = validateField(key, (formData.client as any)[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    formData.vehicles.forEach((v, index) => {
      Object.keys(v).forEach(key => {
        if (key === 'id') return;
        if (key === 'observacoes') return;
        
        const error = validateVehicleField(key as keyof VehicleData, (v as any)[key]);
        if (error) {
          newErrors[`vehicles.${index}.${key}`] = error;
          isValid = false;
          if (!firstErrorVehicleId) firstErrorVehicleId = v.id;
        }
      });
    });

    setErrors(newErrors);
    
    if (!isValid) {
      if (firstErrorVehicleId) {
        setExpandedVehicleId(firstErrorVehicleId);
      }
      setTimeout(() => {
        const errorElement = document.querySelector('.text-red-600'); 
        errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }

    return isValid;
  };

  const handleExport = useCallback(() => {
    if (validateAll()) {
      setIsExporting(true);
      setShowSuccess(true);
      setTimeout(() => {
        exportToCSV(formData);
        setIsExporting(false);
      }, 1500);
    } else {
      setShowSuccess(false);
    }
  }, [formData]);

  // NEW: Save to Supabase handlers
  const handleSaveContrato = async (tipo: 'CM' | 'APV') => {
    // Validate first
    if (!validateAll()) {
      setSaveMessage({ type: 'error', text: 'Por favor corrija os erros no formulário antes de salvar.' });
      setTimeout(() => setSaveMessage(null), 5000);
      return;
    }

    const setLoading = tipo === 'CM' ? setIsSavingCM : setIsSavingAPV;
    
    setLoading(true);
    setSaveMessage(null);

    try {
      const result = await contratoService.criarContratoCompleto(formData, tipo);
      
      if (result.success) {
        setSaveMessage({ 
          type: 'success', 
          text: `${result.message} (ID: ${result.numero_contrato})` 
        });
        
        // Reset form after 3 seconds
        setTimeout(() => {
          const newId = uuidv4();
          setFormData({
            client: initialClient,
            vehicles: [{ ...initialVehicle, id: newId }],
          });
          setExpandedVehicleId(newId);
          setErrors({});
          setSaveMessage(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 3000);
      } else {
        setSaveMessage({ 
          type: 'error', 
          text: `Erro ao criar contrato: ${result.error}` 
        });
      }
    } catch (error: any) {
      setSaveMessage({ 
        type: 'error', 
        text: `Erro inesperado: ${error.message}` 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setSaveMessage(null), 8000);
    }
  };

  const resetForm = () => {
    if (window.confirm('Tem a certeza que deseja limpar todo o formulário?')) {
      const newId = uuidv4();
      setFormData({
        client: initialClient,
        vehicles: [{ ...initialVehicle, id: newId }],
      });
      setExpandedVehicleId(newId);
      setErrors({});
      setShowSuccess(false);
      setSaveMessage(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalVehicles = formData.vehicles.length;
  const summaryTitle = `Resumo do Contrato: ${formData.client.nomeEmpresa || 'Nova Empresa'}`;

  return (
    <div className="min-h-screen pb-20 font-sans text-slate-800 bg-slate-50">
      
      <ConfirmDialog 
        isOpen={!!vehicleToDelete}
        title="Remover Viatura?"
        description="Tem a certeza que deseja remover esta viatura? Todos os dados (técnicos e contratuais) associados a esta viatura serão perdidos."
        confirmLabel="Sim, Remover"
        cancelLabel="Cancelar"
        onConfirm={confirmRemoveVehicle}
        onCancel={() => setVehicleToDelete(null)}
      />

      {/* HEADER */}
      <header className="bg-nors-dark text-white pt-12 pb-24 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-800/50 to-transparent"></div>
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-nors-primary/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 relative z-10 max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3 text-nors-primary font-medium tracking-wide text-sm uppercase">
                <ShieldCheck size={16} />
                <span>Portal de Serviços</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight leading-tight">
                Pedido de Contrato
              </h1>
              <p className="text-slate-400 font-light text-lg">
                NORS Trucks and Buses Angola
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-sm font-medium shadow-xl">
              <span className="text-slate-300">Válido para: </span> 
              <span className="text-white ml-1">Volvo & Dongfeng</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 -mt-16 relative z-20 max-w-5xl space-y-8">
        
        {/* INSTRUCTIONS CARD */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 flex flex-col md:flex-row items-start gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-nors-primary"></div>
          <div className="p-3 bg-blue-50 text-nors-primary rounded-xl shrink-0">
            <Info size={28} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-slate-900 mb-2">Instruções de Preenchimento</h3>
            <p className="text-slate-600 leading-relaxed">
              Preencha os dados da empresa. Para cada viatura, deve especificar tanto os detalhes técnicos como as condições contratuais desejadas (Duração, Km, Data de Início). 
            </p>
          </div>
        </div>

        {/* SUCCESS MESSAGE */}
        {showSuccess && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center gap-4 text-emerald-900 shadow-md animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h4 className="font-bold">Sucesso!</h4>
              <p className="text-sm text-emerald-700 mt-1">Dados validados com sucesso. O download do seu ficheiro começará em breve.</p>
            </div>
          </div>
        )}

        {/* NEW: SAVE MESSAGE */}
        {saveMessage && (
          <div className={`border rounded-2xl p-6 flex items-center gap-4 shadow-md animate-in slide-in-from-top-4 fade-in duration-500 ${
            saveMessage.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
              : 'bg-red-50 border-red-100 text-red-900'
          }`}>
            <div className={`p-2 rounded-full ${
              saveMessage.type === 'success' 
                ? 'bg-emerald-100 text-emerald-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {saveMessage.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <div>
              <h4 className="font-bold">{saveMessage.type === 'success' ? 'Contrato Salvo!' : 'Erro'}</h4>
              <p className="text-sm mt-1">{saveMessage.text}</p>
            </div>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="space-y-10">
          
          {/* SECTION 1: CLIENT DETAILS */}
          <section className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
            <div className="bg-white px-8 py-6 border-b border-slate-100 flex items-center gap-4">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                 <Building2 className="text-nors-dark" size={24} />
              </div>
              <div>
                <h2 className="font-bold text-xl text-slate-900">Dados do Cliente</h2>
                <p className="text-sm text-slate-500 mt-0.5">Informações fiscais e de contacto</p>
              </div>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <Input
                label="Nome Oficial da Empresa"
                name="nomeEmpresa"
                value={formData.client.nomeEmpresa}
                onChange={handleChange('client')}
                onBlur={handleBlur('client')}
                error={errors.nomeEmpresa}
                fullWidth
                required
              />
              <Input
                label="NIF"
                name="nif"
                value={formData.client.nif}
                onChange={handleChange('client')}
                onBlur={handleBlur('client')}
                error={errors.nif}
                required
              />
              <Select
                label="Província"
                name="provincia"
                options={PROVINCES}
                value={formData.client.provincia}
                onChange={handleChange('client')}
                onBlur={handleBlur('client')}
                error={errors.provincia}
                required
              />
              <Input
                label="Morada Completa"
                name="morada"
                value={formData.client.morada}
                onChange={handleChange('client')}
                onBlur={handleBlur('client')}
                error={errors.morada}
                fullWidth
                required
              />
              
              <div className="col-span-full py-4 flex items-center gap-4">
                <div className="h-px bg-slate-100 flex-1"></div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Responsável</span>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>
              
              <Input
                label="Nome do Responsável"
                name="responsavelNome"
                value={formData.client.responsavelNome}
                onChange={handleChange('client')}
                onBlur={handleBlur('client')}
                error={errors.responsavelNome}
                required
              />
              <Input
                label="Cargo do Responsável"
                name="responsavelCargo"
                value={formData.client.responsavelCargo}
                onChange={handleChange('client')}
                onBlur={handleBlur('client')}
                error={errors.responsavelCargo}
                required
              />
              <Input
                label="Email do Responsável"
                type="email"
                name="responsavelEmail"
                value={formData.client.responsavelEmail}
                onChange={handleChange('client')}
                onBlur={handleBlur('client')}
                error={errors.responsavelEmail}
                required
              />
              <Input
                label="Telefone do Responsável"
                type="tel"
                name="responsavelTelefone"
                value={formData.client.responsavelTelefone}
                onChange={handleChange('client')}
                onBlur={handleBlur('client')}
                error={errors.responsavelTelefone}
                required
              />
              <Input
                label="Email Geral da Empresa (Opcional)"
                type="email"
                name="emailEmpresa"
                value={formData.client.emailEmpresa}
                onChange={handleChange('client')}
                onBlur={handleBlur('client')}
                error={errors.emailEmpresa}
                fullWidth
              />
            </div>
          </section>

          {/* SECTION 2: VEHICLES */}
          <section>
            <div className="flex items-end justify-between mb-6 px-2">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Frota & Contratos</h2>
                <p className="text-slate-500 mt-1">Gerir viaturas e definir condições individuais</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <span className="bg-nors-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {formData.vehicles.length}
                </span>
                <span>Total de Viaturas</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {formData.vehicles.map((vehicle, index) => (
                <VehicleCard
                  key={vehicle.id}
                  index={index}
                  vehicle={vehicle}
                  onUpdate={updateVehicle}
                  onBlur={handleVehicleBlur}
                  onRemove={initiateRemoveVehicle}
                  errors={errors}
                  canRemove={formData.vehicles.length > 1}
                  isExpanded={expandedVehicleId === vehicle.id}
                  onToggle={() => toggleVehicle(vehicle.id)}
                />
              ))}
            </div>

            <Button 
              type="button" 
              onClick={addVehicle} 
              variant="outline" 
              className="w-full mt-6 border-dashed border-2 py-6 text-slate-500 hover:text-nors-primary hover:border-nors-primary hover:bg-white group transition-all duration-300"
            >
               <div className="flex flex-col items-center gap-2">
                 <div className="bg-slate-100 p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                   <Plus size={24} className="text-slate-400 group-hover:text-nors-primary" />
                 </div>
                 <span className="font-semibold">Adicionar Outra Viatura</span>
               </div>
            </Button>
          </section>

          {/* SECTION 3: CONTRACT SUMMARY */}
          <section className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800 text-slate-200 transition-all duration-300">
            <div 
              onClick={() => setIsSummaryOpen(!isSummaryOpen)}
              className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="bg-nors-primary p-2.5 rounded-lg text-white">
                  <ClipboardList size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{summaryTitle}</h3>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {totalVehicles} {totalVehicles === 1 ? 'viatura incluída' : 'viaturas incluídas'} no pedido
                  </p>
                </div>
              </div>
              <div className="text-slate-400 bg-slate-800/80 p-2 rounded-full">
                {isSummaryOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {isSummaryOpen && (
              <div className="border-t border-slate-800 bg-slate-900/50 animate-in slide-in-from-top-2">
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-800 text-xs uppercase font-semibold text-slate-400">
                      <tr>
                        <th className="px-6 py-3">#</th>
                        <th className="px-6 py-3">Viatura</th>
                        <th className="px-6 py-3">Matrícula</th>
                        <th className="px-6 py-3 text-right">Contrato</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {formData.vehicles.map((v, i) => (
                        <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 text-slate-500 font-mono">{i + 1}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Car size={16} className="text-slate-500" />
                              <div className="flex flex-col">
                                <span className="font-medium text-white">{v.marca || '---'}</span>
                                <span className="text-xs text-slate-500">{v.modelo}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-300">
                             {v.matricula || '---'}
                          </td>
                          <td className="px-6 py-4 text-right">
                             {v.duracaoMeses ? (
                               <span className="inline-flex items-center px-2 py-1 rounded bg-blue-900/30 text-blue-200 text-xs border border-blue-800">
                                 {v.duracaoMeses} Meses
                               </span>
                             ) : (
                               <span className="text-slate-600 italic">Pendente</span>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-slate-800/50 text-center text-xs text-slate-500 border-t border-slate-800">
                   Revise os dados acima antes de exportar ou salvar na base de dados.
                </div>
              </div>
            )}
          </section>

          {/* ACTIONS - MODIFIED */}
          <div className="sticky bottom-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 p-6 -mx-6 md:mx-0 md:rounded-2xl md:static md:bg-transparent md:border-0 md:p-0">
             <div className="flex flex-col gap-4">
              
              {/* Row 1: Supabase Buttons */}
              <div className="flex flex-col md:flex-row gap-4">
                <Button 
                  type="button" 
                  onClick={() => handleSaveContrato('CM')}
                  disabled={isSavingCM || isSavingAPV}
                  isLoading={isSavingCM}
                  icon={<Database size={20} />}
                  className="w-full md:flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                >
                  Salvar Contrato CM
                </Button>
                <Button 
                  type="button" 
                  onClick={() => handleSaveContrato('APV')}
                  disabled={isSavingCM || isSavingAPV}
                  isLoading={isSavingAPV}
                  icon={<Database size={20} />}
                  className="w-full md:flex-1 bg-purple-600 hover:bg-purple-700 text-white py-4 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all"
                >
                  Salvar Contrato APV
                </Button>
              </div>

              {/* Row 2: Original Buttons */}
              <div className="flex flex-col-reverse md:flex-row gap-4">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={resetForm}
                  icon={<RotateCcw size={18} />}
                  className="w-full md:w-auto text-slate-600 hover:text-slate-900"
                >
                  Limpar Formulário
                </Button>
                <div className="flex-1"></div>
                <Button 
                  type="button" 
                  variant="success" 
                  onClick={handleExport}
                  isLoading={isExporting}
                  icon={<Download size={20} />}
                  className="w-full md:w-auto min-w-[280px] text-lg py-4 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-1"
                >
                  Exportar Excel (.xlsx)
                </Button>
              </div>
            </div>
          </div>
          
        </form>
      </main>
    </div>
  );
};

export default App;
