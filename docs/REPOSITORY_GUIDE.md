# 🏗️ Sistema de Repository - Guia de Uso

Este documento demonstra como utilizar o sistema de Repository implementado para o projeto Foco.

## 📋 Repositories Disponíveis

✅ **Implementados:**
- `UsuarioRepository` - Gerenciamento de usuários
- `CronogramaRepository` - Cronogramas de estudo
- `AtividadeRepository` - Atividades dos cronogramas
- `MetaRepository` - Metas dos usuários
- `ProgressoRepository` - Progresso diário de estudos
- `QuizRepository` - Quizzes de avaliação
- `QuestaoRepository` - Questões dos quizzes
- `RespostaRepository` - Respostas dos usuários

## 🚀 Como Usar

### 1. Inicialização

```typescript
import { supabase } from '../supabase/client';
import { 
  UsuarioRepository,
  CronogramaRepository,
  AtividadeRepository,
  MetaRepository,
  ProgressoRepository,
  QuizRepository,
  QuestaoRepository,
  RespostaRepository
} from '../repository';

// Inicializar repositories
const usuarioRepo = new UsuarioRepository(supabase);
const cronogramaRepo = new CronogramaRepository(supabase);
const atividadeRepo = new AtividadeRepository(supabase);
const metaRepo = new MetaRepository(supabase);
const progressoRepo = new ProgressoRepository(supabase);
const quizRepo = new QuizRepository(supabase);
const questaoRepo = new QuestaoRepository(supabase);
const respostaRepo = new RespostaRepository(supabase);
```

### 2. Operações CRUD Básicas

```typescript
// CREATE - Criar usuário
const novoUsuario = await usuarioRepo.create({
  nome: 'João Silva',
  email: 'joao@example.com'
});

// READ - Buscar por ID
const usuario = await usuarioRepo.findById('uuid-here');

// READ - Buscar com filtros
const usuarios = await usuarioRepo.findWhere({ 
  nome: 'João Silva' 
});

// UPDATE - Atualizar
const atualizado = await usuarioRepo.updateById('uuid-here', {
  nome: 'João Silva Santos'
});

// DELETE - Deletar
await usuarioRepo.deleteById('uuid-here');
```

### 3. Operações Específicas por Repository

#### 👤 UsuarioRepository

```typescript
// Buscar por email
const usuario = await usuarioRepo.findByEmail('joao@example.com');

// Verificar se email existe
const existe = await usuarioRepo.emailExists('joao@example.com');

// Buscar com relacionamentos
const usuarioCompleto = await usuarioRepo.findByIdWithRelations('uuid-here');

// Estatísticas do usuário
const stats = await usuarioRepo.getUserStats('uuid-here');
console.log(`Total de cronogramas: ${stats.totalCronogramas}`);
```

#### 📅 CronogramaRepository

```typescript
// Buscar cronogramas de um usuário
const cronogramas = await cronogramaRepo.findByUserId('user-uuid');

// Buscar com atividades
const cronogramaCompleto = await cronogramaRepo.findByIdWithActivities('cronograma-uuid');

// Estatísticas do cronograma
const stats = await cronogramaRepo.getCronogramaStats('cronograma-uuid');
```

#### ✅ AtividadeRepository

```typescript
// Buscar atividades por status
const pendentes = await atividadeRepo.findByStatus('pendente');

// Atividades que vencem hoje
const vencendoHoje = await atividadeRepo.findDueToday();

// Marcar como concluída
await atividadeRepo.markAsCompleted('atividade-uuid');
```

#### 🎯 MetaRepository

```typescript
// Buscar metas não atingidas
const naoAtingidas = await metaRepo.findNotAchieved();

// Marcar como atingida
await metaRepo.markAsAchieved('meta-uuid');

// Estatísticas de metas do usuário
const stats = await metaRepo.getUserMetaStats('user-uuid');
```

#### 📈 ProgressoRepository

```typescript
// Progresso dos últimos 7 dias
const ultimosDias = await progressoRepo.findLastDays('user-uuid', 7);

// Total de horas estudadas
const totalHoras = await progressoRepo.getTotalHorasByUserId('user-uuid');

// Criar/atualizar progresso de hoje
await progressoRepo.upsertTodayProgress('user-uuid', 3);

// Estatísticas completas
const stats = await progressoRepo.getUserProgressStats('user-uuid');
```

#### 📝 QuizRepository

```typescript
// Quiz com questões
const quizCompleto = await quizRepo.findByIdWithQuestoes('quiz-uuid');

// Estatísticas do quiz
const stats = await quizRepo.getQuizStats('quiz-uuid');

// Duplicar quiz
const novoQuiz = await quizRepo.duplicateQuiz('quiz-uuid', 'Novo Título', 'user-uuid');
```

#### ❓ QuestaoRepository

```typescript
// Questões de um quiz
const questoes = await questaoRepo.findByQuizId('quiz-uuid');

// Questão com respostas
const questaoCompleta = await questaoRepo.findByIdWithRespostas('questao-uuid');

// Estatísticas da questão
const stats = await questaoRepo.getQuestaoStats('questao-uuid');
```

#### 💬 RespostaRepository

```typescript
// Registrar resposta com validação automática
const resposta = await respostaRepo.createWithValidation(
  'user-uuid', 
  'questao-uuid', 
  'A'
);

// Estatísticas do usuário
const userStats = await respostaRepo.getUserStats('user-uuid');

// Progresso em quizzes
const progressoQuizzes = await respostaRepo.getQuizProgress('user-uuid');
```

## 🔄 Exemplos de Fluxos Completos

### Fluxo 1: Criar Cronograma Completo

```typescript
async function criarCronogramaCompleto(userId: string) {
  // 1. Criar cronograma
  const cronograma = await cronogramaRepo.create({
    usuario_id: userId,
    titulo: 'Plano de Estudos 2024',
    descricao: 'Cronograma anual de estudos'
  });

  // 2. Adicionar atividades
  const atividades = await Promise.all([
    atividadeRepo.create({
      cronograma_id: cronograma.id,
      titulo: 'Estudar Matemática',
      data_inicio: '2024-01-01',
      data_fim: '2024-01-31'
    }),
    atividadeRepo.create({
      cronograma_id: cronograma.id,
      titulo: 'Estudar Física',
      data_inicio: '2024-02-01',
      data_fim: '2024-02-28'
    })
  ]);

  return { cronograma, atividades };
}
```

### Fluxo 2: Sistema de Quiz Completo

```typescript
async function criarQuizCompleto(userId: string) {
  // 1. Criar quiz
  const quiz = await quizRepo.create({
    usuario_id: userId,
    titulo: 'Quiz de Matemática'
  });

  // 2. Adicionar questões
  const questoes = await Promise.all([
    questaoRepo.create({
      quiz_id: quiz.id,
      enunciado: 'Quanto é 2 + 2?',
      alternativa_a: '3',
      alternativa_b: '4',
      alternativa_c: '5',
      alternativa_d: '6',
      correta: 'B'
    }),
    questaoRepo.create({
      quiz_id: quiz.id,
      enunciado: 'Quanto é 5 × 3?',
      alternativa_a: '15',
      alternativa_b: '12',
      alternativa_c: '18',
      alternativa_d: '20',
      correta: 'A'
    })
  ]);

  return { quiz, questoes };
}

async function responderQuiz(userId: string, quizId: string) {
  const questoes = await questaoRepo.findByQuizId(quizId);
  
  for (const questao of questoes) {
    // Simular resposta (em um app real, viria do usuário)
    const respostaUsuario = 'A'; 
    
    await respostaRepo.createWithValidation(
      userId,
      questao.id,
      respostaUsuario
    );
  }

  // Obter estatísticas finais
  return respostaRepo.getUserQuizStats(userId, quizId);
}
```

### Fluxo 3: Dashboard de Progresso

```typescript
async function obterDashboardUsuario(userId: string) {
  const [
    statsUsuario,
    progressoStats,
    metasStats,
    cronogramasAtivos,
    atividadesPendentes,
    quizzesRecentes
  ] = await Promise.all([
    usuarioRepo.getUserStats(userId),
    progressoRepo.getUserProgressStats(userId),
    metaRepo.getUserMetaStats(userId),
    cronogramaRepo.findByUserId(userId),
    atividadeRepo.findByStatus('pendente'),
    respostaRepo.getQuizProgress(userId)
  ]);

  return {
    usuario: statsUsuario,
    progresso: progressoStats,
    metas: metasStats,
    cronogramasAtivos: cronogramasAtivos.length,
    atividadesPendentes: atividadesPendentes.length,
    quizzesProgresso: quizzesRecentes
  };
}
```

## ⚡ Dicas de Performance

1. **Use índices apropriados** no banco para campos frequentemente filtrados
2. **Evite N+1 queries** usando JOINs quando necessário
3. **Implemente cache** para dados que não mudam frequentemente
4. **Use paginação** para listas grandes
5. **Selecione apenas campos necessários** em queries específicas

## 🔒 Tratamento de Erros

Todos os repositories incluem tratamento de erro robusto:

```typescript
try {
  const usuario = await usuarioRepo.findById('uuid-invalido');
} catch (error) {
  console.error('Erro ao buscar usuário:', error.message);
}
```

## 📊 Monitoramento

Para monitorar performance, adicione logs:

```typescript
console.time('buscar-usuario');
const usuario = await usuarioRepo.findById('uuid');
console.timeEnd('buscar-usuario');
```

---

**Última atualização:** Agosto 2025  
**Versão dos Repositories:** 1.0
