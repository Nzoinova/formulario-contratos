# 📋 Formulário de Pedido de Contrato de Manutenção
## NORS Trucks and Buses Angola VT

Sistema web moderno e responsivo para solicitação de contratos de manutenção de frotas de veículos pesados.

---

## 🚀 **DEPLOY NO GITHUB PAGES - GUIA COMPLETO**

### **PASSO 1: Criar Repositório no GitHub**

1. Vai a: https://github.com/Nzoinova
2. Clica em **"New repository"** (botão verde)
3. Preenche:
   - **Repository name:** `formulario-contratos`
   - **Description:** "Formulário de Pedido de Contrato de Manutenção - NORS Angola"
   - **Visibilidade:** Public
   - ✅ **NÃO** marques "Add a README file" (já temos)
   - ✅ **NÃO** marques "Add .gitignore" (já temos)
4. Clica em **"Create repository"**

---

### **PASSO 2: Upload dos Ficheiros**

**OPÇÃO A: GitHub Web Interface (Mais Fácil)**

1. No repositório recém-criado, clica em **"uploading an existing file"**
2. Arrasta TODOS os ficheiros desta pasta
3. Na mensagem de commit, escreve: `Initial commit - Formulário NORS`
4. Clica em **"Commit changes"**

**OPÇÃO B: Git Command Line (Se tiveres Git instalado)**

```bash
cd /caminho/para/formulario-contratos
git init
git add .
git commit -m "Initial commit - Formulário NORS"
git branch -M main
git remote add origin https://github.com/Nzoinova/formulario-contratos.git
git push -u origin main
```

---

### **PASSO 3: Activar GitHub Pages**

1. No repositório, vai a **Settings** (tab no topo)
2. No menu lateral esquerdo, clica em **Pages**
3. Em **"Source"**, selecciona:
   - Source: **GitHub Actions**
4. Guarda as alterações

---

### **PASSO 4: Deploy Automático**

Após o upload dos ficheiros, o GitHub Actions vai:
1. Detectar automaticamente o workflow
2. Fazer build do projeto
3. Fazer deploy para GitHub Pages

**Acompanhar o progresso:**
1. Vai ao tab **Actions** no repositório
2. Verás um workflow "Deploy to GitHub Pages" a correr
3. Aguarda 2-5 minutos até ficar verde ✅

---

### **PASSO 5: Aceder ao Formulário**

**URL Final:**
```
https://nzoinova.github.io/formulario-contratos/
```

⚠️ **NOTA:** Pode demorar 1-2 minutos após o deploy estar completo para o site ficar acessível.

---

## 🔄 **FAZER ACTUALIZAÇÕES**

Quando quiseres actualizar o formulário:

**Via GitHub Web:**
1. Vai ao ficheiro que queres editar
2. Clica no ícone de lápis (Edit)
3. Faz as alterações
4. Clica em "Commit changes"
5. GitHub Actions faz deploy automático em 2-3 minutos

**Via Git:**
```bash
git add .
git commit -m "Descrição da actualização"
git push
```

---

## 🎨 **CARACTERÍSTICAS**

- ✅ Formulário multi-secção (Cliente + Frota + Contratos)
- ✅ Validação em tempo real
- ✅ Export para Excel (.xlsx)
- ✅ Design responsivo (mobile/tablet/desktop)
- ✅ Identidade visual NORS
- ✅ Cálculos automáticos (quilometragem total)
- ✅ Gestão dinâmica de múltiplas viaturas
- ✅ Interface moderna e intuitiva

---

## 💻 **DESENVOLVIMENTO LOCAL** (Opcional)

Se quiseres testar localmente antes de fazer deploy:

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Aceder em: http://localhost:3000
```

---

## 🛠️ **ESTRUTURA DO PROJETO**

```
formulario-contratos/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions workflow
├── components/
│   ├── ui/
│   │   ├── Button.tsx          # Componente de botão
│   │   ├── ConfirmDialog.tsx   # Diálogo de confirmação
│   │   ├── Input.tsx           # Componente de input
│   │   └── Select.tsx          # Componente de select
│   └── VehicleCard.tsx         # Card de viatura
├── utils/
│   └── excelExport.ts          # Lógica de export Excel
├── App.tsx                     # Componente principal
├── types.ts                    # Definições TypeScript
├── index.tsx                   # Entry point
├── index.html                  # HTML base
├── package.json                # Dependências
├── tsconfig.json               # Config TypeScript
├── vite.config.ts              # Config Vite
├── .gitignore                  # Ficheiros ignorados
└── README.md                   # Este ficheiro
```

---

## 📱 **INTEGRAÇÃO COM SHAREPOINT**

### **Opção 1: Link Directo (Recomendada)**

Na tua página de Suporte ao Negócio:

1. Clica em **"Editar"**
2. Adiciona secção "Ferramentas Digitais"
3. Adiciona **Link** ou **Botão** com:
   - Texto: "📋 Pedido de Contrato de Manutenção"
   - URL: `https://nzoinova.github.io/formulario-contratos/`
   - Abrir em: Novo separador

### **Opção 2: Incorporar na Página**

1. Editar página SharePoint
2. Adicionar Web Part **"Embed"**
3. Colar:
```html
<iframe 
  src="https://nzoinova.github.io/formulario-contratos/" 
  width="100%" 
  height="1200px" 
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
></iframe>
```

---

## 🎯 **PRÓXIMOS PASSOS**

Após deploy bem-sucedido:

1. ✅ Testa o formulário completamente
2. ✅ Verifica export Excel
3. ✅ Testa em mobile/tablet
4. ✅ Adiciona link no SharePoint
5. ✅ Partilha com equipa para feedback

---

## 📞 **SUPORTE**

**Desenvolvido por:**
- Sidney Maia
- Técnico de Suporte ao Negócio
- NORS Trucks and Buses Angola VT
- Email: simaia@nors.com

**Assistência Técnica:**
- NEXO v5.1 - NORS Excellence & Optimization

---

## 📝 **CHANGELOG**

### v1.0.0 - 17/12/2024
- ✅ Lançamento inicial
- ✅ Formulário completo (Cliente + Frota)
- ✅ Export Excel funcional
- ✅ Deploy GitHub Pages configurado
- ✅ Design responsivo implementado

---

**NORS Angola** | *Making it work.*
