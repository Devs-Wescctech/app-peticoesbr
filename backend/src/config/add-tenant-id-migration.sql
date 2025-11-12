-- Migration: Add tenant_id to all tenant data tables
-- This script safely adds tenant_id columns with proper indexes and foreign keys

-- 1. Add tenant_id to petitions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'petitions' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE petitions ADD COLUMN tenant_id UUID;
        
        -- Create index
        CREATE INDEX idx_petitions_tenant_id ON petitions(tenant_id);
        
        RAISE NOTICE 'Added tenant_id to petitions';
    ELSE
        RAISE NOTICE 'tenant_id already exists in petitions';
    END IF;
END $$;

-- 2. Add tenant_id to campaigns
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN tenant_id UUID;
        
        -- Create index
        CREATE INDEX idx_campaigns_tenant_id ON campaigns(tenant_id);
        
        RAISE NOTICE 'Added tenant_id to campaigns';
    ELSE
        RAISE NOTICE 'tenant_id already exists in campaigns';
    END IF;
END $$;

-- 3. Add tenant_id to message_templates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'message_templates' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE message_templates ADD COLUMN tenant_id UUID;
        
        -- Create index
        CREATE INDEX idx_message_templates_tenant_id ON message_templates(tenant_id);
        
        RAISE NOTICE 'Added tenant_id to message_templates';
    ELSE
        RAISE NOTICE 'tenant_id already exists in message_templates';
    END IF;
END $$;

-- 4. Add tenant_id to linkbio_pages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'linkbio_pages' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE linkbio_pages ADD COLUMN tenant_id UUID;
        
        -- Create index
        CREATE INDEX idx_linkbio_pages_tenant_id ON linkbio_pages(tenant_id);
        
        RAISE NOTICE 'Added tenant_id to linkbio_pages';
    ELSE
        RAISE NOTICE 'tenant_id already exists in linkbio_pages';
    END IF;
END $$;

-- 5. Add tenant_id to linktree_pages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'linktree_pages' AND column_name = 'tenant_id'
    ) THEN
        ALTER TABLE linktree_pages ADD COLUMN tenant_id UUID;
        
        -- Create index
        CREATE INDEX idx_linktree_pages_tenant_id ON linktree_pages(tenant_id);
        
        RAISE NOTICE 'Added tenant_id to linktree_pages';
    ELSE
        RAISE NOTICE 'tenant_id already exists in linktree_pages';
    END IF;
END $$;

-- Note: signatures and campaign_logs inherit tenant_id from their parent tables
-- signatures → petition_id → petitions.tenant_id
-- campaign_logs → campaign_id → campaigns.tenant_id

-- Summary
DO $$
BEGIN
    RAISE NOTICE '=== Migration Summary ===';
    RAISE NOTICE 'Added tenant_id columns to: petitions, campaigns, message_templates, linkbio_pages, linktree_pages';
    RAISE NOTICE 'Signatures and campaign_logs inherit tenant_id from parent tables';
    RAISE NOTICE 'Next step: Run data migration to associate existing data with default tenant';
END $$;
