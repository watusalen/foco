# 🎯 FOCO - Sistema Inteligente de Estudos

> Sistema desenvolvido como principal atividade da disciplina de **Engenharia de Software II** e **Banco de Dados II** do Instituto Federal de Educação, Ciência e Tecnologia do Piauí (IFPI), durante o terceiro módulo de Análise e Desenvolvimento de Sistemas.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)

Um **agente inteligente** para organizar cronogramas de estudo, lembretes e quizzes personalizados, utilizando **Inteligência Artificial** para criar conteúdo educativo adaptado às necessidades do usuário.

## 🌟 Principais Funcionalidades

### 🤖 **Geração Inteligente com IA**
- **Quizzes Personalizados**: Questões automáticas sobre qualquer tema
- **Cronogramas Adaptativos**: Planejamento estruturado baseado em objetivos
- **Textos Educativos**: Resumos e explicações didáticas
- **Conversas Contínuas**: Chat interativo sobre conteúdo gerado

### 📊 **Sistema de Quizzes Avançado**
- Formato intuitivo "acertos/total" em vez de percentuais complexos
- Prevenção inteligente de respostas duplicadas
- Reset automático de estado visual entre sessões
- Tracking completo de progresso por usuário

### 📅 **Gestão de Cronogramas**
- Criação manual ou automática via IA
- Visualização detalhada de atividades
- Acompanhamento de progresso por período
- Interface organizada por datas

### 📚 **Biblioteca de Conteúdo**
- Sistema de textos e resumos gerados por IA
- Conversas contínuas para aprofundamento
- Sistema de favoritos para conteúdo importante
- Renderização inteligente de markdown

### 📈 **Dashboard Analítico**
- Visão geral de progresso em tempo real
- Estatísticas detalhadas de desempenho
- Navegação intuitiva em cards coloridos
- Interface responsiva e moderna

## 🏗️ Arquitetura Técnica

### **Stack Principal**
```
Frontend:  TypeScript + Tailwind CSS + Parcel
Backend:   Supabase (PostgreSQL + Auth)
IA:        Google Gemini API (gemini-1.5-flash)
Testes:    Jest + TypeScript
Deploy:    Vercel
```

### **Estrutura do Projeto**
```
src/
├── model/           # Modelos de dados (Usuario, Quiz, Cronograma, etc.)
├── repository/      # Camada de acesso a dados (CRUD + Supabase)
├── view/            # Interface do usuário (Views + Componentes)
│   ├── components/  # Componentes de tela individuais
│   └── utils/       # Utilitários de interface
├── llm/             # Cliente Gemini AI + tipos
├── supabase/        # Configuração e autenticação
└── index.ts         # Ponto de entrada da aplicação
```

### **Padrões Arquiteturais**
- **Repository Pattern**: Abstração da camada de dados
- **Single Page Application (SPA)**: Navegação fluida entre telas
- **Component-Based**: Componentes reutilizáveis e modulares

## 🎨 Design System

### **Paleta Temática**
Cada seção possui sua identidade visual única:

- 🟢 **Metas**: `emerald` - Foco e objetivos
- 🟣 **Quizzes**: `violet` - Conhecimento e avaliação  
- 🔵 **Cronogramas**: `sky` - Planejamento e organização
- 🟡 **Textos**: `amber` - Conteúdo e aprendizado
- 🟪 **Gerador**: `fuchsia` - Criatividade e IA

## 🗄️ Modelo de Dados

### **Entidades Principais**
```sql
usuarios          # Autenticação e perfis
├── cronogramas   # Planejamentos de estudo
│   └── atividades    # Tarefas específicas
├── metas         # Objetivos de aprendizado
├── textos        # Conteúdo gerado por IA
│   └── conversas     # Chat contínuo
└── quizzes       # Avaliações interativas
    ├── questoes      # Perguntas individuais
    └── respostas     # Histórico de respostas
```

### **Recursos Avançados**
- **Relacionamentos Complexos**: Foreign keys + joins otimizados
- **Validação de Dados**: Constraints e triggers automáticos
- **Auditoria Temporal**: Timestamps em todas as operações
- **Índices Performáticos**: Consultas otimizadas para escala

## 🧪 Qualidade e Testes

### **Cobertura de Testes**
```bash
# Testes unitários
npm run test

# Modo watch para desenvolvimento
npm run test:watch

# Relatório de cobertura
npm run test:coverage

# Pipeline CI/CD
npm run test:ci
```

### **Tipos de Teste**
- **Unitários**: Lógica de negócio e repositories
- **Integração**: Fluxos completos com Supabase
- **Configuração**: Jest + TypeScript + ES Modules

## 🚀 Configuração e Deploy

### **Pré-requisitos**
- Node.js 18+
- Conta Supabase
- API Key do Google Gemini

### **Instalação Local**
```bash
# Clone o repositório
git clone https://github.com/watusalen/foco.git
cd foco

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Adicione suas chaves no arquivo .env

# Execute em desenvolvimento
npm run dev

# Build para produção
npm run build
```

### **Variáveis de Ambiente**
```env
SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
GEMINI_API_KEY=sua_chave_gemini
```

### **Deploy Automático**
O projeto está configurado para deploy automático na **Vercel**:
- Push na branch `main` → Deploy em produção
- Pull requests → Preview deploys automáticos

## 🎯 MVP vs Versão Completa

### **Funcionalidades MVP (Atual)**
✅ Sistema completo de Quizzes com IA  
✅ Geração de Textos e Cronogramas  
✅ Dashboard com estatísticas  
✅ Autenticação e perfis de usuário  
✅ Interface responsiva moderna  

### **Roadmap Futuro**
🔄 **Metas**: Sistema completo de objetivos e tracking  
🔄 **Gamificação**: Pontuação, níveis e conquistas  
🔄 **Colaboração**: Compartilhamento de cronogramas  
🔄 **Mobile App**: Versão nativa iOS/Android  
🔄 **Relatórios**: Analytics avançados de desempenho  

## 👥 Contribuição

### **Como Contribuir**
1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### **Padrões de Desenvolvimento**
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`)
- **Code Style**: TypeScript + ESLint
- **Testes**: Cobertura mínima de 80%
- **Documentação**: JSDoc em funções públicas

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
- **IFPI** - Instituto Federal de Educação, Ciência e Tecnologia do Piauí
- **Disciplinas**: Engenharia de Software II, Banco de Dados II

<div align="center">

*Sistema FOCO - Transformando estudos com Inteligência Artificial*

</div>
