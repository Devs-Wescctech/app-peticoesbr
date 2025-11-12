-- Schema completo para o sistema de petições
-- Baseado no documento fornecido pelo usuário

-- Habilitar extensão UUID (se não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABELA 1: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    phone VARCHAR(50),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    email_verified BOOLEAN DEFAULT false,
    created_date TIMESTAMP DEFAULT NOW(),
    updated_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- TABELA 2: petitions
CREATE TABLE IF NOT EXISTS petitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    banner_url TEXT,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#6366f1',
    share_text TEXT,
    goal INTEGER NOT NULL CHECK (goal > 0),
    status VARCHAR(50) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicada', 'pausada', 'concluida')),
    slug VARCHAR(255) UNIQUE,
    collect_phone BOOLEAN DEFAULT false,
    collect_city BOOLEAN DEFAULT true,
    collect_state BOOLEAN DEFAULT false,
    collect_cpf BOOLEAN DEFAULT false,
    collect_comment BOOLEAN DEFAULT true,
    views_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_date TIMESTAMP DEFAULT NOW(),
    updated_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_petitions_status ON petitions(status);
CREATE INDEX IF NOT EXISTS idx_petitions_slug ON petitions(slug);
CREATE INDEX IF NOT EXISTS idx_petitions_created_by ON petitions(created_by);

-- TABELA 3: signatures
CREATE TABLE IF NOT EXISTS signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    petition_id UUID REFERENCES petitions(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    city VARCHAR(255),
    state VARCHAR(50),
    cpf VARCHAR(14),
    comment TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_date TIMESTAMP DEFAULT NOW(),
    updated_date TIMESTAMP DEFAULT NOW(),
    UNIQUE(petition_id, email)
);

CREATE INDEX IF NOT EXISTS idx_signatures_petition_id ON signatures(petition_id);
CREATE INDEX IF NOT EXISTS idx_signatures_email ON signatures(email);
CREATE INDEX IF NOT EXISTS idx_signatures_city ON signatures(city);
CREATE INDEX IF NOT EXISTS idx_signatures_state ON signatures(state);
CREATE INDEX IF NOT EXISTS idx_signatures_created_date ON signatures(created_date DESC);

-- TABELA 4: campaigns
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('whatsapp', 'email')),
    status VARCHAR(50) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'agendada', 'enviando', 'concluida', 'pausada')),
    petition_id UUID REFERENCES petitions(id) ON DELETE SET NULL,
    target_petitions TEXT[],
    target_filters JSONB DEFAULT '{}',
    message TEXT NOT NULL,
    subject VARCHAR(500),
    sender_email VARCHAR(255),
    sender_name VARCHAR(255),
    scheduled_date TIMESTAMP,
    sent_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    total_recipients INTEGER DEFAULT 0,
    api_token TEXT,
    delay_seconds INTEGER DEFAULT 3 CHECK (delay_seconds >= 1),
    messages_per_hour INTEGER DEFAULT 20 CHECK (messages_per_hour > 0),
    avoid_night_hours BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_date TIMESTAMP DEFAULT NOW(),
    updated_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(type);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_petition_id ON campaigns(petition_id);

-- TABELA 5: campaign_logs
CREATE TABLE IF NOT EXISTS campaign_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_contact VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'error')),
    response_status VARCHAR(10),
    response_body TEXT,
    error_message TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_date TIMESTAMP DEFAULT NOW(),
    updated_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_logs_campaign_id ON campaign_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_status ON campaign_logs(status);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_created_date ON campaign_logs(created_date DESC);

-- TABELA 6: linkbio_pages
CREATE TABLE IF NOT EXISTS linkbio_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    avatar_url TEXT,
    background_color VARCHAR(7) DEFAULT '#6366f1',
    status VARCHAR(50) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicada')),
    petition_ids TEXT[],
    views_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_date TIMESTAMP DEFAULT NOW(),
    updated_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_linkbio_pages_slug ON linkbio_pages(slug);
CREATE INDEX IF NOT EXISTS idx_linkbio_pages_status ON linkbio_pages(status);

-- TABELA 7: linktree_pages (não estava no documento, mas mantendo compatibilidade)
CREATE TABLE IF NOT EXISTS linktree_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    avatar_url TEXT,
    background_color VARCHAR(7) DEFAULT '#ffffff',
    text_color VARCHAR(7) DEFAULT '#000000',
    links JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicada')),
    views_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_date TIMESTAMP DEFAULT NOW(),
    updated_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_linktree_pages_slug ON linktree_pages(slug);
CREATE INDEX IF NOT EXISTS idx_linktree_pages_status ON linktree_pages(status);

-- TABELA 8: message_templates
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('whatsapp', 'email')),
    subject VARCHAR(500),
    content TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    thumbnail_url TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_date TIMESTAMP DEFAULT NOW(),
    updated_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_templates_type ON message_templates(type);
CREATE INDEX IF NOT EXISTS idx_message_templates_is_default ON message_templates(is_default);

-- TRIGGERS para updated_date
CREATE OR REPLACE FUNCTION update_updated_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers em todas as tabelas
DROP TRIGGER IF EXISTS update_users_updated_date ON users;
CREATE TRIGGER update_users_updated_date BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_date();

DROP TRIGGER IF EXISTS update_petitions_updated_date ON petitions;
CREATE TRIGGER update_petitions_updated_date BEFORE UPDATE ON petitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_date();

DROP TRIGGER IF EXISTS update_signatures_updated_date ON signatures;
CREATE TRIGGER update_signatures_updated_date BEFORE UPDATE ON signatures
    FOR EACH ROW EXECUTE FUNCTION update_updated_date();

DROP TRIGGER IF EXISTS update_campaigns_updated_date ON campaigns;
CREATE TRIGGER update_campaigns_updated_date BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_date();

DROP TRIGGER IF EXISTS update_campaign_logs_updated_date ON campaign_logs;
CREATE TRIGGER update_campaign_logs_updated_date BEFORE UPDATE ON campaign_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_date();

DROP TRIGGER IF EXISTS update_linkbio_pages_updated_date ON linkbio_pages;
CREATE TRIGGER update_linkbio_pages_updated_date BEFORE UPDATE ON linkbio_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_date();

DROP TRIGGER IF EXISTS update_linktree_pages_updated_date ON linktree_pages;
CREATE TRIGGER update_linktree_pages_updated_date BEFORE UPDATE ON linktree_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_date();

DROP TRIGGER IF EXISTS update_message_templates_updated_date ON message_templates;
CREATE TRIGGER update_message_templates_updated_date BEFORE UPDATE ON message_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_date();
