# 📊 DOCUMENTAÇÃO DO BANCO DE DADOS

## 🔍 Visão Geral

Este banco de dados foi projetado para uma plataforma de aprendizagem com múltiplos recursos interconectados, incluindo gerenciamento de usuários, acompanhamento de metas, quizzes e geração de textos.

## 📂 Esquemas do Banco de Dados

O banco de dados contém os seguintes schemas:
- `public`: Tabelas principais da aplicação
- `auth`: Autenticação e gerenciamento de usuários
- `storage`: Armazenamento de arquivos e objetos
- `extensions`: Extensões do PostgreSQL

## 🧑‍💻 Usuários e Autenticação

### Tabela de Usuários (`usuarios`)

| Coluna      | Tipo      | Descrição                      | Restrições             |
|-------------|-----------|--------------------------------|------------------------|
| id          | UUID      | Chave primária                 | Gerado automaticamente |
| nome        | Text      | Nome completo do usuário       | Não nulo               |
| email       | Text      | Endereço de e-mail             | Único                  |
| criado_em   | Timestamp | Data/hora de criação da conta  | Padrão: hora atual     |

**Relacionamentos:**
- Um usuário pode ter vários:
  - Cronogramas (`cronogramas`)
  - Metas (`metas`)
  - Quizzes
  - Registros de progresso
  - Respostas
  - Textos

## 📅 Sistema de Agendamento (`cronogramas` e `atividades`)

### Tabela de Cronogramas (`cronogramas`)

| Coluna      | Tipo      | Descrição                      | Restrições             |
|-------------|-----------|--------------------------------|------------------------|
| id          | UUID      | Chave primária                 | Gerado automaticamente |
| usuario_id  | UUID      | Usuário vinculado              | Pode ser nulo          |
| titulo      | Text      | Título do cronograma           | Não nulo               |
| descricao   | Text      | Descrição                      | Pode ser nulo          |
| criado_em   | Timestamp | Data/hora de criação           | Padrão: hora atual     |

### Tabela de Atividades (`atividades`)

| Coluna        | Tipo      | Descrição                      | Restrições                                     |
|---------------|-----------|--------------------------------|------------------------------------------------|
| id            | UUID      | Chave primária                 | Gerado automaticamente                        |
| cronograma_id | UUID      | Cronograma vinculado           | Pode ser nulo                                  |
| titulo        | Text      | Título da atividade            | Não nulo                                       |
| descricao     | Text      | Descrição                      | Pode ser nulo                                  |
| data_inicio   | Date      | Data de início                 | Não nulo                                       |
| data_fim      | Date      | Data de término                | Pode ser nulo                                  |
| status        | Text      | Status                         | Padrão: 'pendente', Check: valores específicos |

## 🎯 Gestão de Metas (`metas`)

| Coluna         | Tipo      | Descrição                      | Restrições             |
|----------------|-----------|--------------------------------|------------------------|
| id             | UUID      | Chave primária                 | Gerado automaticamente |
| usuario_id     | UUID      | Usuário vinculado              | Pode ser nulo          |
| titulo         | Text      | Título da meta                 | Não nulo               |
| descricao      | Text      | Descrição da meta              | Pode ser nulo          |
| valor_esperado | Integer   | Valor esperado                 | Pode ser nulo          |
| data_limite    | Date      | Data limite                    | Pode ser nulo          |
| atingida       | Boolean   | Status de atingimento          | Padrão: false          |

## 📝 Sistema de Quiz (`quizzes`, `questoes`, `respostas`)

### Tabela de Quizzes (`quizzes`)

| Coluna      | Tipo      | Descrição                      | Restrições             |
|-------------|-----------|--------------------------------|------------------------|
| id          | UUID      | Chave primária                 | Gerado automaticamente |
| usuario_id  | UUID      | Usuário vinculado              | Pode ser nulo          |
| titulo      | Text      | Título do quiz                 | Não nulo               |
| criado_em   | Timestamp | Data/hora de criação           | Padrão: hora atual     |

### Tabela de Questões (`questoes`)

| Coluna         | Tipo      | Descrição                      | Restrições                           |
|----------------|-----------|--------------------------------|---------------------------------------|
| id             | UUID      | Chave primária                 | Gerado automaticamente               |
| quiz_id        | UUID      | Quiz vinculado                 | Pode ser nulo                         |
| enunciado      | Text      | Enunciado da questão           | Não nulo                              |
| alternativa_a  | Text      | Alternativa A                  | Não nulo                              |
| alternativa_b  | Text      | Alternativa B                  | Não nulo                              |
| alternativa_c  | Text      | Alternativa C                  | Não nulo                              |
| alternativa_d  | Text      | Alternativa D                  | Não nulo                              |
| correta        | Char      | Alternativa correta            | 'A', 'B', 'C' ou 'D'                  |

### Tabela de Respostas (`respostas`)

| Coluna         | Tipo      | Descrição                      | Restrições                           |
|----------------|-----------|--------------------------------|---------------------------------------|
| id             | UUID      | Chave primária                 | Gerado automaticamente               |
| questao_id     | UUID      | Questão vinculada              | Pode ser nulo                         |
| usuario_id     | UUID      | Usuário vinculado              | Pode ser nulo                         |
| resposta_dada  | Char      | Resposta do usuário            | 'A', 'B', 'C' ou 'D'                  |
| correta        | Boolean   | Se a resposta está correta     | Pode ser nulo                         |
| respondido_em  | Timestamp | Data/hora da resposta          | Padrão: hora atual                    |

## 📈 Acompanhamento de Progresso (`progresso`)

| Coluna          | Tipo      | Descrição                      | Restrições             |
|-----------------|-----------|--------------------------------|------------------------|
| id              | UUID      | Chave primária                 | Gerado automaticamente |
| usuario_id      | UUID      | Usuário vinculado              | Pode ser nulo          |
| data            | Date      | Data do registro               | Não nulo               |
| horas_estudadas | Integer   | Horas estudadas                | Não nulo, >= 0         |

## 📄 Sistema de Geração de Textos (`textos` e `conversas`)

### Tabela de Textos (`textos`)

| Coluna          | Tipo      | Descrição                      | Restrições                                         |
|-----------------|-----------|--------------------------------|---------------------------------------------------|
| id              | UUID      | Chave primária                 | Gerado automaticamente                           |
| usuario_id      | UUID      | Usuário vinculado              | Pode ser nulo                                     |
| titulo          | Text      | Título do texto                | Não nulo                                          |
| conteudo        | Text      | Conteúdo do texto              | Não nulo                                          |
| prompt_original | Text      | Prompt original de geração     | Não nulo                                          |
| salvo           | Boolean   | Se o texto foi salvo           | Padrão: false                                     |
| criado_em       | Timestamp | Data/hora de criação           | Padrão: hora atual                                |
| tipo            | Text      | Tipo do texto                  | Padrão: 'texto', Check: 'texto' ou 'resumo'       |

### Tabela de Conversas (`conversas`)

| Coluna      | Tipo      | Descrição                      | Restrições             |
|-------------|-----------|--------------------------------|------------------------|
| id          | UUID      | Chave primária                 | Gerado automaticamente |
| texto_id    | UUID      | Texto vinculado                | Pode ser nulo          |
| prompt      | Text      | Prompt do usuário              | Não nulo               |
| resposta    | Text      | Resposta da IA                 | Não nulo               |
| criado_em   | Timestamp | Data/hora da conversa          | Padrão: hora atual     |

## 🔒 Autenticação e Segurança

O banco utiliza o sistema de autenticação do Supabase no schema `auth`, que oferece:
- Gerenciamento de usuários
- Autenticação multifator
- Rastreamento de sessões
- Gerenciamento de identidades

## 📦 Armazenamento

O schema `storage` gerencia uploads de arquivos, com suporte para:
- Gerenciamento de buckets
- Uploads multipart
- Metadados de objetos

## 🚀 Próximos Passos Recomendados
1. Habilitar Row Level Security (RLS) em todas as tabelas
2. Criar políticas RLS apropriadas
3. Configurar fluxos de autenticação
4. Implementar validação de dados no cliente

## 📝 Notas
- Todas as tabelas usam UUID como chave primária
- Timestamps são usados para rastrear criação e modificação
- Relacionamentos por chave estrangeira garantem a integridade dos dados
