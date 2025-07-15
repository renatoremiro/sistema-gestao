# ⚡ TESTE RÁPIDO - SISTEMA BIAPO v8.12.2

## 🎯 **TESTE ESSENCIAL (5 minutos)**

### 1. **Login** (1 min)
- [ ] Abrir `index.html`
- [ ] Fazer login com: **renatoremiro@biapo.com.br**
- [ ] Verificar se vai para tela principal

### 2. **Criar Evento** (1 min)
- [ ] Clicar em "Novo Evento"
- [ ] Preencher: Título, Data, Participantes
- [ ] Salvar e verificar se aparece na lista

### 3. **Criar Tarefa** (1 min)
- [ ] Clicar em "Nova Tarefa" (se disponível)
- [ ] Preencher: Título, Responsável, Data
- [ ] Salvar e verificar se aparece

### 4. **Calendário** (1 min)
- [ ] Abrir `agenda.html`
- [ ] Verificar se eventos/tarefas aparecem
- [ ] Clicar em um dia para ver resumo

### 5. **Participantes** (1 min)
- [ ] Editar evento/tarefa criado
- [ ] Adicionar outro usuário como participante
- [ ] Fazer login com outro usuário e verificar se vê o item

---

## 🚨 **SE ALGO NÃO FUNCIONAR**

### Problemas Comuns:
- **Login não funciona**: Verificar se Firebase está configurado
- **Eventos não salvam**: Verificar console do navegador (F12)
- **Calendário não carrega**: Verificar se `agenda.html` existe
- **Participantes não aparecem**: Verificar se Auth.js carregou

### Comandos de Debug:
```javascript
// No console do navegador (F12):
console.log('App:', App);
console.log('Auth:', Auth);
console.log('Events:', Events);
console.log('Calendar:', Calendar);
```

---

## ✅ **SISTEMA FUNCIONANDO SE:**

- ✅ Login funciona
- ✅ Eventos são criados e salvos
- ✅ Tarefas são criadas e salvos  
- ✅ Calendário mostra eventos/tarefas
- ✅ Participantes funcionam
- ✅ Dados persistem ao recarregar

---

## 📞 **SUPORTE**

Se encontrar problemas:
1. Verificar console do navegador (F12)
2. Anotar mensagens de erro
3. Testar em navegador diferente
4. Verificar conexão com internet

**Versão testada**: v8.12.2
**Data**: ___/___/___ 