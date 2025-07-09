# 🧪 CHECKLIST - TESTE MANUAL SISTEMA BIAPO v8.12.2

## 📋 **INSTRUÇÕES GERAIS**
- ✅ = Funcionando | ❌ = Com problema | ⚠️ = Precisa atenção
- Teste cada item e marque o resultado
- Se encontrar problemas, anote na seção "PROBLEMAS ENCONTRADOS"

---

## 🔐 **1. TESTE DE AUTENTICAÇÃO**

### 1.1 Login do Sistema
- [ ] **Abrir `index.html`** - Tela de login aparece corretamente
- [ ] **Logo BIAPO** - Imagem carrega sem erro
- [ ] **Campos de login** - Email e senha funcionam
- [ ] **Login com usuário válido** - Acesso concedido
- [ ] **Login com usuário inválido** - Mensagem de erro aparece
- [ ] **Botão "Lembrar usuário"** - Funciona corretamente
- [ ] **Link "Esqueci minha senha"** - Funciona (se implementado)

### 1.2 Usuários para Teste
- [ ] **Renato Remiro** (renatoremiro@biapo.com.br) - Admin
- [ ] **Bruna Britto** (brunabritto@biapo.com.br) - Usuário normal
- [ ] **Alex** (alex@biapo.com.br) - Usuário normal

### 1.3 Funcionalidades Pós-Login
- [ ] **Redirecionamento** - Vai para tela principal após login
- [ ] **Informações do usuário** - Nome e email aparecem no header
- [ ] **Botão logout** - Funciona corretamente
- [ ] **Sessão mantida** - Não desloga ao recarregar página

---

## 📅 **2. TESTE DE EVENTOS**

### 2.1 Criação de Eventos
- [ ] **Botão "Novo Evento"** - Abre modal de criação
- [ ] **Formulário de evento** - Todos os campos funcionam:
  - [ ] Título (obrigatório)
  - [ ] Descrição
  - [ ] Data e hora
  - [ ] Tipo de evento (reunião, entrega, prazo, etc.)
  - [ ] Local/localização
  - [ ] Participantes (lista de usuários)
  - [ ] Status (agendado, confirmado, etc.)
- [ ] **Salvar evento** - Evento é criado e aparece na lista
- [ ] **Cancelar criação** - Modal fecha sem salvar

### 2.2 Edição de Eventos
- [ ] **Clicar em evento existente** - Abre modal de edição
- [ ] **Alterar dados** - Modificações são salvas
- [ ] **Adicionar/remover participantes** - Lista atualiza
- [ ] **Mudar status** - Status é atualizado
- [ ] **Excluir evento** - Evento é removido com confirmação

### 2.3 Visualização de Eventos
- [ ] **Lista de eventos** - Todos os eventos aparecem
- [ ] **Filtros por tipo** - Funcionam corretamente
- [ ] **Busca por texto** - Encontra eventos
- [ ] **Ordenação por data** - Eventos ordenados corretamente

---

## 📋 **3. TESTE DE TAREFAS**

### 3.1 Criação de Tarefas
- [ ] **Botão "Nova Tarefa"** - Abre modal de criação
- [ ] **Formulário de tarefa** - Todos os campos funcionam:
  - [ ] Título (obrigatório)
  - [ ] Descrição
  - [ ] Data de início e fim
  - [ ] Prioridade (baixa, média, alta)
  - [ ] Status (pendente, em andamento, concluída)
  - [ ] Responsável
  - [ ] Participantes
  - [ ] Progresso (0-100%)
- [ ] **Salvar tarefa** - Tarefa é criada e aparece na lista
- [ ] **Cancelar criação** - Modal fecha sem salvar

### 3.2 Gerenciamento de Tarefas
- [ ] **Editar tarefa** - Modificações são salvas
- [ ] **Marcar como concluída** - Status muda para 100%
- [ ] **Marcar em andamento** - Status muda para "em andamento"
- [ ] **Atualizar progresso** - Barra de progresso funciona
- [ ] **Excluir tarefa** - Tarefa é removida com confirmação

### 3.3 Visualização de Tarefas
- [ ] **Lista de tarefas** - Todas as tarefas aparecem
- [ ] **Filtros por status** - Pendentes, em andamento, concluídas
- [ ] **Filtros por prioridade** - Baixa, média, alta
- [ ] **Filtros por responsável** - Mostra tarefas do usuário
- [ ] **Busca por texto** - Encontra tarefas

---

## 📅 **4. TESTE DE CALENDÁRIO**

### 4.1 Visualização do Calendário
- [ ] **Abrir `agenda.html`** - Calendário carrega corretamente
- [ ] **Navegação entre meses** - Botões anterior/próximo funcionam
- [ ] **Ano atual** - Ano correto é exibido
- [ ] **Dias da semana** - Cabeçalho correto

### 4.2 Eventos no Calendário
- [ ] **Eventos aparecem** - Eventos criados aparecem nos dias corretos
- [ ] **Cores por tipo** - Diferentes tipos têm cores diferentes
- [ ] **Clicar em evento** - Abre detalhes/edição
- [ ] **Criar evento no dia** - Funciona ao clicar em dia vazio

### 4.3 Tarefas no Calendário
- [ ] **Tarefas aparecem** - Tarefas com data aparecem no calendário
- [ ] **Clicar em tarefa** - Abre detalhes/edição
- [ ] **Criar tarefa no dia** - Funciona ao clicar em dia vazio
- [ ] **Tarefas sem data** - Não aparecem no calendário

### 4.4 Resumo do Dia
- [ ] **Clicar em dia** - Abre resumo com eventos e tarefas
- [ ] **Contadores** - Número correto de itens por dia
- [ ] **Ações rápidas** - Criar evento/tarefa no dia

---

## 👥 **5. TESTE DE PARTICIPANTES**

### 5.1 Seleção de Participantes
- [ ] **Lista de usuários** - Todos os usuários aparecem
- [ ] **Seleção múltipla** - Pode selecionar vários participantes
- [ ] **Remoção de participantes** - Pode remover da lista
- [ ] **Busca de usuários** - Encontra usuários por nome

### 5.2 Compartilhamento
- [ ] **Evento com participantes** - Participantes veem o evento
- [ ] **Tarefa com participantes** - Participantes veem a tarefa
- [ ] **Permissões de edição** - Apenas criador/responsável pode editar
- [ ] **Notificações** - Participantes são notificados (se implementado)

---

## 🔄 **6. TESTE DE SINCRONIZAÇÃO**

### 6.1 Firebase (se configurado)
- [ ] **Salvamento automático** - Dados são salvos no Firebase
- [ ] **Carregamento** - Dados são carregados do Firebase
- [ ] **Sincronização em tempo real** - Mudanças aparecem em outras abas
- [ ] **Modo offline** - Sistema funciona sem internet

### 6.2 LocalStorage
- [ ] **Backup local** - Dados são salvos localmente
- [ ] **Recuperação** - Dados são recuperados ao recarregar
- [ ] **Limpeza de cache** - Funciona corretamente

---

## 🎛️ **7. TESTE DE FILTROS E BUSCA**

### 7.1 Filtros Gerais
- [ ] **Filtro por período** - Funciona corretamente
- [ ] **Filtro por tipo** - Eventos e tarefas separados
- [ ] **Filtro por status** - Pendentes, em andamento, concluídos
- [ ] **Filtro por responsável** - Mostra itens do usuário

### 7.2 Busca
- [ ] **Busca por texto** - Encontra eventos e tarefas
- [ ] **Busca em tempo real** - Resultados aparecem enquanto digita
- [ ] **Limpar busca** - Botão limpa os resultados

---

## 📊 **8. TESTE DE ESTATÍSTICAS**

### 8.1 Dashboard
- [ ] **Total de eventos** - Número correto
- [ ] **Total de tarefas** - Número correto
- [ ] **Tarefas pendentes** - Número correto
- [ ] **Tarefas em andamento** - Número correto
- [ ] **Tarefas concluídas** - Número correto
- [ ] **Tarefas com horário** - Número correto

### 8.2 Atualização em Tempo Real
- [ ] **Contadores atualizam** - Números mudam ao criar/excluir itens
- [ ] **Gráficos** - Se houver, funcionam corretamente

---

## 🔧 **9. TESTE DE PERFORMANCE**

### 9.1 Carregamento
- [ ] **Página inicial** - Carrega em menos de 3 segundos
- [ ] **Agenda** - Carrega em menos de 5 segundos
- [ ] **Modais** - Abrem instantaneamente
- [ ] **Listas** - Scroll suave

### 9.2 Responsividade
- [ ] **Desktop** - Interface funciona bem
- [ ] **Tablet** - Interface se adapta
- [ ] **Mobile** - Interface responsiva (se aplicável)

---

## 🚨 **10. TESTE DE ERROS**

### 10.1 Tratamento de Erros
- [ ] **Conexão perdida** - Sistema funciona offline
- [ ] **Dados inválidos** - Mensagens de erro claras
- [ ] **Campos obrigatórios** - Validação funciona
- [ ] **Permissões** - Acesso negado quando apropriado

### 10.2 Recuperação
- [ ] **Recarregar página** - Dados são mantidos
- [ ] **Fechar/abrir navegador** - Sessão é mantida
- [ ] **Backup automático** - Dados não são perdidos

---

## 📝 **PROBLEMAS ENCONTRADOS**

### Problema 1
- **Descrição**: 
- **Página/Seção**: 
- **Passos para reproduzir**: 
- **Comportamento esperado**: 
- **Comportamento atual**: 

### Problema 2
- **Descrição**: 
- **Página/Seção**: 
- **Passos para reproduzir**: 
- **Comportamento esperado**: 
- **Comportamento atual**: 

---

## ✅ **RESULTADO FINAL**

- **Total de itens testados**: ___ / ___
- **Itens funcionando**: ___ / ___
- **Itens com problemas**: ___ / ___
- **Porcentagem de sucesso**: ___%

### Status Geral
- [ ] 🟢 **EXCELENTE** (90-100%)
- [ ] 🟡 **BOM** (75-89%)
- [ ] 🟠 **REGULAR** (60-74%)
- [ ] 🔴 **CRÍTICO** (<60%)

---

## 💡 **OBSERVAÇÕES E SUGESTÕES**

### Pontos Positivos
- 

### Melhorias Sugeridas
- 

### Bugs Críticos
- 

---

**Data do teste**: ___/___/___
**Testado por**: ________________
**Versão do sistema**: v8.12.2 