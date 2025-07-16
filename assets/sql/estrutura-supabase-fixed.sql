-- 🏗️ ESTRUTURA DE BANCO SUPABASE - SISTEMA BIAPO v2.1 CORRIGIDA
-- 📋 Script para criar/verificar tabelas necessárias
-- 🚀 Execute este script no painel SQL do Supabase
-- ✅ COMPATÍVEL com todas as versões do Supabase

-- ===== TABELA DE USUÁRIOS =====
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    perfil VARCHAR(50) DEFAULT 'usuario',
    admin BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== TABELA DE EVENTOS =====
CREATE TABLE IF NOT EXISTS eventos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data DATE NOT NULL,
    hora_inicio TIME,
    hora_fim TIME,
    local VARCHAR(255),
    tipo VARCHAR(100) DEFAULT 'evento',
    prioridade VARCHAR(50) DEFAULT 'media',
    visibilidade VARCHAR(50) DEFAULT 'publica',
    criado_por INTEGER REFERENCES usuarios(id),
    responsavel INTEGER REFERENCES usuarios(id),
    participantes TEXT[], -- Array de emails/IDs
    status VARCHAR(50) DEFAULT 'agendado',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== TABELA DE TAREFAS =====
CREATE TABLE IF NOT EXISTS tarefas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(100) DEFAULT 'pessoal',
    prioridade VARCHAR(50) DEFAULT 'media',
    status VARCHAR(50) DEFAULT 'pendente',
    data_inicio DATE,
    data_fim DATE,
    data_conclusao DATE,
    progresso INTEGER DEFAULT 0,
    criado_por INTEGER REFERENCES usuarios(id),
    responsavel INTEGER REFERENCES usuarios(id),
    area VARCHAR(255),
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== TABELA DE BACKUPS DO SISTEMA =====
CREATE TABLE IF NOT EXISTS backups_sistema (
    id SERIAL PRIMARY KEY,
    usuario_email VARCHAR(255) NOT NULL,
    dados JSONB NOT NULL,
    versao VARCHAR(50),
    checksum VARCHAR(255),
    timestamp TIMESTAMP DEFAULT NOW(),
    tipo VARCHAR(50) DEFAULT 'automatico'
);

-- ===== ÍNDICES PARA PERFORMANCE =====
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_eventos_data ON eventos(data);
CREATE INDEX IF NOT EXISTS idx_eventos_criado_por ON eventos(criado_por);
CREATE INDEX IF NOT EXISTS idx_tarefas_responsavel ON tarefas(responsavel);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas(status);
CREATE INDEX IF NOT EXISTS idx_backups_usuario ON backups_sistema(usuario_email);
CREATE INDEX IF NOT EXISTS idx_backups_timestamp ON backups_sistema(timestamp);

-- ===== VIEWS PARA CONSULTAS COMPLEXAS =====

-- View de eventos completos (com dados do usuário)
CREATE OR REPLACE VIEW eventos_completos AS
SELECT 
    e.*,
    u1.nome as criador_nome,
    u1.email as criador_email,
    u2.nome as responsavel_nome,
    u2.email as responsavel_email
FROM eventos e
LEFT JOIN usuarios u1 ON e.criado_por = u1.id
LEFT JOIN usuarios u2 ON e.responsavel = u2.id;

-- View de tarefas completas (com dados do usuário)
CREATE OR REPLACE VIEW tarefas_completas AS
SELECT 
    t.*,
    u1.nome as criador_nome,
    u1.email as criador_email,
    u2.nome as responsavel_nome,
    u2.email as responsavel_email
FROM tarefas t
LEFT JOIN usuarios u1 ON t.criado_por = u1.id
LEFT JOIN usuarios u2 ON t.responsavel = u2.id;

-- ===== FUNÇÃO PARA ATUALIZAR TIMESTAMP =====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===== TRIGGERS PARA ATUALIZAR UPDATED_AT =====
-- Remover triggers existentes se houver
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
DROP TRIGGER IF EXISTS update_eventos_updated_at ON eventos;
DROP TRIGGER IF EXISTS update_tarefas_updated_at ON tarefas;

-- Criar triggers novamente
CREATE TRIGGER update_usuarios_updated_at 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_eventos_updated_at 
    BEFORE UPDATE ON eventos 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_tarefas_updated_at 
    BEFORE UPDATE ON tarefas 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ===== DADOS INICIAIS =====

-- Inserir usuário admin padrão (se não existir)
INSERT INTO usuarios (email, nome, perfil, admin)
VALUES ('admin@biapo.com.br', 'Administrador BIAPO', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Inserir usuário Renato (se não existir)
INSERT INTO usuarios (email, nome, perfil, admin)
VALUES ('renatoremiro@biapo.com.br', 'Renato Remiro', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- ===== CONFIGURAÇÃO RLS (Row Level Security) =====
-- Ativar RLS nas tabelas principais
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups_sistema ENABLE ROW LEVEL SECURITY;

-- ===== REMOVER POLÍTICAS EXISTENTES (se houver) =====
-- Para usuários
DROP POLICY IF EXISTS "Usuários podem ver próprios dados" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar próprios dados" ON usuarios;
DROP POLICY IF EXISTS "Admins podem ver todos usuários" ON usuarios;

-- Para eventos
DROP POLICY IF EXISTS "Eventos públicos visíveis a todos" ON eventos;
DROP POLICY IF EXISTS "Usuários podem criar eventos" ON eventos;
DROP POLICY IF EXISTS "Criadores podem editar eventos" ON eventos;

-- Para tarefas
DROP POLICY IF EXISTS "Tarefas visíveis ao criador e responsável" ON tarefas;
DROP POLICY IF EXISTS "Usuários podem criar tarefas" ON tarefas;
DROP POLICY IF EXISTS "Criadores podem editar tarefas" ON tarefas;

-- Para backups
DROP POLICY IF EXISTS "Backups visíveis apenas ao próprio usuário" ON backups_sistema;

-- ===== CRIAR NOVAS POLÍTICAS =====

-- Políticas para usuários
CREATE POLICY "usuarios_select_own" ON usuarios
    FOR SELECT USING (auth.email() = email OR EXISTS (
        SELECT 1 FROM usuarios WHERE email = auth.email() AND admin = true
    ));

CREATE POLICY "usuarios_update_own" ON usuarios
    FOR UPDATE USING (auth.email() = email);

CREATE POLICY "usuarios_insert" ON usuarios
    FOR INSERT WITH CHECK (auth.email() = email);

-- Políticas para eventos
CREATE POLICY "eventos_select" ON eventos
    FOR SELECT USING (
        visibilidade = 'publica' OR 
        EXISTS (SELECT 1 FROM usuarios WHERE id = eventos.criado_por AND email = auth.email()) OR
        EXISTS (SELECT 1 FROM usuarios WHERE id = eventos.responsavel AND email = auth.email())
    );

CREATE POLICY "eventos_insert" ON eventos
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM usuarios WHERE id = eventos.criado_por AND email = auth.email())
    );

CREATE POLICY "eventos_update" ON eventos
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM usuarios WHERE id = eventos.criado_por AND email = auth.email())
    );

CREATE POLICY "eventos_delete" ON eventos
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM usuarios WHERE id = eventos.criado_por AND email = auth.email())
    );

-- Políticas para tarefas
CREATE POLICY "tarefas_select" ON tarefas
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM usuarios WHERE id = tarefas.criado_por AND email = auth.email()) OR
        EXISTS (SELECT 1 FROM usuarios WHERE id = tarefas.responsavel AND email = auth.email())
    );

CREATE POLICY "tarefas_insert" ON tarefas
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM usuarios WHERE id = tarefas.criado_por AND email = auth.email())
    );

CREATE POLICY "tarefas_update" ON tarefas
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM usuarios WHERE id = tarefas.criado_por AND email = auth.email()) OR
        EXISTS (SELECT 1 FROM usuarios WHERE id = tarefas.responsavel AND email = auth.email())
    );

CREATE POLICY "tarefas_delete" ON tarefas
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM usuarios WHERE id = tarefas.criado_por AND email = auth.email())
    );

-- Políticas para backups
CREATE POLICY "backups_all" ON backups_sistema
    FOR ALL USING (usuario_email = auth.email());

-- ===== VERIFICAÇÃO FINAL =====
-- Query para verificar se tudo foi criado corretamente
SELECT 
    'usuarios' as tabela,
    COUNT(*) as registros
FROM usuarios
UNION ALL
SELECT 
    'eventos' as tabela,
    COUNT(*) as registros
FROM eventos
UNION ALL
SELECT 
    'tarefas' as tabela,
    COUNT(*) as registros
FROM tarefas
UNION ALL
SELECT 
    'backups_sistema' as tabela,
    COUNT(*) as registros
FROM backups_sistema;

-- ===== COMENTÁRIOS E DOCUMENTAÇÃO =====
COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema BIAPO';
COMMENT ON TABLE eventos IS 'Eventos e compromissos da equipe';
COMMENT ON TABLE tarefas IS 'Tarefas e atividades individuais';
COMMENT ON TABLE backups_sistema IS 'Backups automáticos dos dados do sistema';

COMMENT ON VIEW eventos_completos IS 'View com eventos e dados dos usuários relacionados';
COMMENT ON VIEW tarefas_completas IS 'View com tarefas e dados dos usuários relacionados';

-- ===== STATUS FINAL =====
SELECT 'Estrutura de banco criada com sucesso! 🎉 v2.1-fixed' as status;