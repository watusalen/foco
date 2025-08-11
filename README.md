# 🎯 Foco - Sistema Inteligente de Estudos

Sistema desenvolvido como principal atividade da disciplina de **Engenharia de Software II**, durante o terceiro módulo de Análise e Desenvolvimento de Sistemas no Instituto Federal de Educação, Ciência e Tecnologia do Piauí.

## 🚀 Sobre o Projeto

O **Foco** é uma aplicação web moderna que utiliza inteligência artificial para organizar cronogramas de estudo, criar quizzes personalizados e gerar conteúdo educativo. O sistema foi desenvolvido com foco na experiência do usuário e na produtividade nos estudos.

## ✨ Funcionalidades

### 📊 Dashboard Inteligente
- Visão geral de estatísticas de estudo
- Acesso rápido a todas as funcionalidades
- Atividades recentes e progressos

### 🎯 Gerenciamento de Metas
- Criação e acompanhamento de metas de estudo
- Sistema de progresso visual
- Organização por prioridades

### 📝 Cronogramas de Estudo
- **Criação** de cronogramas personalizados
- **Edição** e **exclusão** de cronogramas existentes
- Status automático (futuro, ativo, finalizado)
- Validação de datas e campos obrigatórios
- Contador de dias restantes

### 🧠 Quizzes Interativos
- Biblioteca de quizzes organizados
- Sistema de pontuação e feedback
- Criação de quizzes personalizados

### 🤖 Gerador de Conteúdo IA
- Geração de **quizzes** automatizados
- Criação de **textos educativos**
- Interface intuitiva com prompts personalizados

## 🛠️ Tecnologias

### Frontend
- **TypeScript** - Linguagem principal
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização responsiva
- **Parcel** - Bundler e dev server

### Arquitetura
- **SPA (Single Page Application)** - Navegação fluida
- **Component-based** - Estrutura modular
- **Event-driven** - Comunicação por callbacks
- **Router Pattern** - Gerenciamento de telas

### Integrações Futuras
- **Supabase** - Banco de dados e autenticação
- **Google Gemini** - IA para geração de conteúdo
- **Vercel** - Deploy e hosting

## 🏗️ Estrutura do Projeto

```
src/
├── view/
│   ├── main-view.ts           # Coordenador principal
│   ├── components/            # Componentes de tela
│   │   ├── login-view.ts      # Autenticação
│   │   ├── dashboard-view.ts  # Dashboard principal
│   │   ├── metas-view.ts      # Gerenciamento de metas
│   │   ├── quizzes-view.ts    # Sistema de quizzes
│   │   ├── cronogramas-view.ts # Cronogramas (CRUD completo)
│   │   ├── gerador-view.ts    # Geração de conteúdo IA
│   │   └── confirm-view.ts    # Modal de confirmação
│   └── utils/
│       └── screen-router.ts   # Roteador de telas
├── crud/                      # Operações de dados
├── model/                     # Modelos de dados
├── repository/                # Camada de persistência
└── supabase/                  # Configurações do banco
```

## 🚦 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone https://github.com/watusalen/foco.git

# Entre no diretório
cd foco

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:1234`

### Scripts Disponíveis
```bash
npm run dev       # Servidor de desenvolvimento
npm run build     # Build de produção
npm run preview   # Preview do build
npm run test      # Executar testes
npm run clean     # Limpar cache e build
```

## 🎨 Interface

O sistema possui uma interface moderna e intuitiva com:
- **Design responsivo** para desktop e mobile
- **Navegação fluida** entre telas
- **Feedback visual** para todas as ações
- **Validação em tempo real** de formulários
- **Tema claro** com cores suaves e profissionais

## 📱 Funcionalidades Detalhadas

### Cronogramas de Estudo
- ✅ **Criar** novos cronogramas com validação
- ✅ **Editar** cronogramas existentes
- ✅ **Excluir** com confirmação
- ✅ **Status automático** baseado em datas
- ✅ **Contador de dias** restantes
- ✅ **Validação** de campos e datas

### Gerador de Conteúdo
- ✅ **Quiz personalizado** baseado em prompts
- ✅ **Texto educativo** gerado por IA
- ✅ **Interface intuitiva** com feedback visual
- ✅ **Redirecionamento** automático para quizzes

## 🔧 Próximas Implementações

- [ ] Integração com banco de dados Supabase
- [ ] Sistema de autenticação real
- [ ] Geração de conteúdo com Google Gemini
- [ ] Sistema de notificações
- [ ] Modo escuro/claro
- [ ] Exportação de cronogramas
- [ ] Estatísticas avançadas

## 👨‍💻 Autor

**Matusalen C. Alves**
- Instituto Federal do Piauí (IFPI)
- Curso: Análise e Desenvolvimento de Sistemas
- Disciplina: Engenharia de Software II

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

*Desenvolvido com 💚 no IFPI*
