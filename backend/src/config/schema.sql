-- Schema para o sistema de petições

-- Tabela de petições
CREATE TABLE IF NOT EXISTS petitions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  banner_url VARCHAR(500),
  logo_url VARCHAR(500),
  primary_color VARCHAR(7) DEFAULT '#6366f1',
  share_text TEXT,
  goal INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'rascunho',
  slug VARCHAR(255) UNIQUE NOT NULL,
  collect_phone BOOLEAN DEFAULT false,
  collect_city BOOLEAN DEFAULT false,
  collect_state BOOLEAN DEFAULT false,
  collect_cpf BOOLEAN DEFAULT false,
  collect_comment BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS signatures (
  id SERIAL PRIMARY KEY,
  petition_id INTEGER REFERENCES petitions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  city VARCHAR(100),
  state VARCHAR(50),
  cpf VARCHAR(14),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de páginas LinkTree
CREATE TABLE IF NOT EXISTS linktree_pages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  avatar_url VARCHAR(500),
  background_color VARCHAR(7) DEFAULT '#ffffff',
  text_color VARCHAR(7) DEFAULT '#000000',
  links JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de páginas LinkBio
CREATE TABLE IF NOT EXISTS linkbio_pages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  avatar_url VARCHAR(500),
  background_color VARCHAR(7) DEFAULT '#ffffff',
  text_color VARCHAR(7) DEFAULT '#000000',
  bio TEXT,
  links JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de campanhas (Email e WhatsApp)
CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  petition_id INTEGER REFERENCES petitions(id) ON DELETE SET NULL,
  message TEXT,
  subject VARCHAR(255),
  status VARCHAR(50) DEFAULT 'rascunho',
  sent_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de logs de campanhas
CREATE TABLE IF NOT EXISTS campaign_logs (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
  recipient_name VARCHAR(255),
  recipient_contact VARCHAR(255),
  status VARCHAR(50),
  response_status VARCHAR(50),
  response_body TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de templates de mensagens
CREATE TABLE IF NOT EXISTS message_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_signatures_petition_id ON signatures(petition_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_petition_id ON campaigns(petition_id);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_campaign_id ON campaign_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_petitions_slug ON petitions(slug);
CREATE INDEX IF NOT EXISTS idx_linktree_pages_slug ON linktree_pages(slug);
CREATE INDEX IF NOT EXISTS idx_linkbio_pages_slug ON linkbio_pages(slug);
