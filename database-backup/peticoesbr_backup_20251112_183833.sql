--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (415ebe8)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.tenant_users DROP CONSTRAINT IF EXISTS tenant_users_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tenant_users DROP CONSTRAINT IF EXISTS tenant_users_tenant_id_fkey;
ALTER TABLE IF EXISTS ONLY public.signatures DROP CONSTRAINT IF EXISTS signatures_petition_id_fkey;
ALTER TABLE IF EXISTS ONLY public.signatures DROP CONSTRAINT IF EXISTS signatures_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.petitions DROP CONSTRAINT IF EXISTS petitions_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.message_templates DROP CONSTRAINT IF EXISTS message_templates_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.linktree_pages DROP CONSTRAINT IF EXISTS linktree_pages_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.linkbio_pages DROP CONSTRAINT IF EXISTS linkbio_pages_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.campaigns DROP CONSTRAINT IF EXISTS campaigns_petition_id_fkey;
ALTER TABLE IF EXISTS ONLY public.campaigns DROP CONSTRAINT IF EXISTS campaigns_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.campaign_logs DROP CONSTRAINT IF EXISTS campaign_logs_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.campaign_logs DROP CONSTRAINT IF EXISTS campaign_logs_campaign_id_fkey;
DROP TRIGGER IF EXISTS update_users_updated_date ON public.users;
DROP TRIGGER IF EXISTS update_tenants_updated_date ON public.tenants;
DROP TRIGGER IF EXISTS update_tenant_users_updated_date ON public.tenant_users;
DROP TRIGGER IF EXISTS update_signatures_updated_date ON public.signatures;
DROP TRIGGER IF EXISTS update_petitions_updated_date ON public.petitions;
DROP TRIGGER IF EXISTS update_message_templates_updated_date ON public.message_templates;
DROP TRIGGER IF EXISTS update_linktree_pages_updated_date ON public.linktree_pages;
DROP TRIGGER IF EXISTS update_linkbio_pages_updated_date ON public.linkbio_pages;
DROP TRIGGER IF EXISTS update_campaigns_updated_date ON public.campaigns;
DROP TRIGGER IF EXISTS update_campaign_logs_updated_date ON public.campaign_logs;
DROP TRIGGER IF EXISTS update_auth_users_updated_date ON public.auth_users;
DROP INDEX IF EXISTS public.idx_users_role;
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_tenants_status;
DROP INDEX IF EXISTS public.idx_tenants_slug;
DROP INDEX IF EXISTS public.idx_tenant_users_user_id;
DROP INDEX IF EXISTS public.idx_tenant_users_tenant_id;
DROP INDEX IF EXISTS public.idx_signatures_state;
DROP INDEX IF EXISTS public.idx_signatures_petition_id;
DROP INDEX IF EXISTS public.idx_signatures_email;
DROP INDEX IF EXISTS public.idx_signatures_created_date;
DROP INDEX IF EXISTS public.idx_signatures_city;
DROP INDEX IF EXISTS public.idx_refresh_tokens_user_id;
DROP INDEX IF EXISTS public.idx_refresh_tokens_token;
DROP INDEX IF EXISTS public.idx_petitions_tenant_id;
DROP INDEX IF EXISTS public.idx_petitions_status;
DROP INDEX IF EXISTS public.idx_petitions_slug;
DROP INDEX IF EXISTS public.idx_petitions_created_by;
DROP INDEX IF EXISTS public.idx_message_templates_type;
DROP INDEX IF EXISTS public.idx_message_templates_tenant_id;
DROP INDEX IF EXISTS public.idx_message_templates_is_default;
DROP INDEX IF EXISTS public.idx_linktree_pages_tenant_id;
DROP INDEX IF EXISTS public.idx_linktree_pages_status;
DROP INDEX IF EXISTS public.idx_linktree_pages_slug;
DROP INDEX IF EXISTS public.idx_linkbio_pages_tenant_id;
DROP INDEX IF EXISTS public.idx_linkbio_pages_status;
DROP INDEX IF EXISTS public.idx_linkbio_pages_slug;
DROP INDEX IF EXISTS public.idx_campaigns_type;
DROP INDEX IF EXISTS public.idx_campaigns_tenant_id;
DROP INDEX IF EXISTS public.idx_campaigns_status;
DROP INDEX IF EXISTS public.idx_campaigns_petition_id;
DROP INDEX IF EXISTS public.idx_campaign_logs_status;
DROP INDEX IF EXISTS public.idx_campaign_logs_created_date;
DROP INDEX IF EXISTS public.idx_campaign_logs_campaign_id;
DROP INDEX IF EXISTS public.idx_auth_users_google_id;
DROP INDEX IF EXISTS public.idx_auth_users_email;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_slug_key;
ALTER TABLE IF EXISTS ONLY public.tenants DROP CONSTRAINT IF EXISTS tenants_pkey;
ALTER TABLE IF EXISTS ONLY public.tenant_users DROP CONSTRAINT IF EXISTS tenant_users_tenant_id_user_id_key;
ALTER TABLE IF EXISTS ONLY public.tenant_users DROP CONSTRAINT IF EXISTS tenant_users_pkey;
ALTER TABLE IF EXISTS ONLY public.signatures DROP CONSTRAINT IF EXISTS signatures_pkey;
ALTER TABLE IF EXISTS ONLY public.signatures DROP CONSTRAINT IF EXISTS signatures_petition_id_email_key;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_token_key;
ALTER TABLE IF EXISTS ONLY public.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.petitions DROP CONSTRAINT IF EXISTS petitions_slug_key;
ALTER TABLE IF EXISTS ONLY public.petitions DROP CONSTRAINT IF EXISTS petitions_pkey;
ALTER TABLE IF EXISTS ONLY public.message_templates DROP CONSTRAINT IF EXISTS message_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.linktree_pages DROP CONSTRAINT IF EXISTS linktree_pages_slug_key;
ALTER TABLE IF EXISTS ONLY public.linktree_pages DROP CONSTRAINT IF EXISTS linktree_pages_pkey;
ALTER TABLE IF EXISTS ONLY public.linkbio_pages DROP CONSTRAINT IF EXISTS linkbio_pages_slug_key;
ALTER TABLE IF EXISTS ONLY public.linkbio_pages DROP CONSTRAINT IF EXISTS linkbio_pages_pkey;
ALTER TABLE IF EXISTS ONLY public.campaigns DROP CONSTRAINT IF EXISTS campaigns_pkey;
ALTER TABLE IF EXISTS ONLY public.campaign_logs DROP CONSTRAINT IF EXISTS campaign_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_users DROP CONSTRAINT IF EXISTS auth_users_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_users DROP CONSTRAINT IF EXISTS auth_users_google_id_key;
ALTER TABLE IF EXISTS ONLY public.auth_users DROP CONSTRAINT IF EXISTS auth_users_email_key;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.tenants;
DROP TABLE IF EXISTS public.tenant_users;
DROP TABLE IF EXISTS public.signatures;
DROP TABLE IF EXISTS public.refresh_tokens;
DROP TABLE IF EXISTS public.petitions;
DROP TABLE IF EXISTS public.message_templates;
DROP TABLE IF EXISTS public.linktree_pages;
DROP TABLE IF EXISTS public.linkbio_pages;
DROP TABLE IF EXISTS public.campaigns;
DROP TABLE IF EXISTS public.campaign_logs;
DROP TABLE IF EXISTS public.auth_users;
DROP FUNCTION IF EXISTS public.update_updated_date_column();
DROP FUNCTION IF EXISTS public.update_updated_date();
DROP EXTENSION IF EXISTS "uuid-ossp";
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_date(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_date() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_date = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_date_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_date_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_date = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: auth_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255),
    full_name character varying(255) NOT NULL,
    avatar_url text,
    google_id character varying(255),
    email_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    last_login timestamp without time zone,
    created_date timestamp without time zone DEFAULT now(),
    updated_date timestamp without time zone DEFAULT now(),
    is_super_admin boolean DEFAULT false
);


--
-- Name: campaign_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    campaign_id uuid NOT NULL,
    recipient_name character varying(255) NOT NULL,
    recipient_contact character varying(255) NOT NULL,
    status character varying(50) NOT NULL,
    response_status character varying(10),
    response_body text,
    error_message text,
    created_by uuid,
    created_date timestamp without time zone DEFAULT now(),
    updated_date timestamp without time zone DEFAULT now(),
    CONSTRAINT campaign_logs_status_check CHECK (((status)::text = ANY ((ARRAY['success'::character varying, 'error'::character varying])::text[])))
);


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaigns (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'rascunho'::character varying,
    petition_id uuid,
    target_petitions text[],
    target_filters jsonb DEFAULT '{}'::jsonb,
    message text NOT NULL,
    subject character varying(500),
    sender_email character varying(255),
    sender_name character varying(255),
    scheduled_date timestamp without time zone,
    sent_count integer DEFAULT 0,
    success_count integer DEFAULT 0,
    failed_count integer DEFAULT 0,
    total_recipients integer DEFAULT 0,
    api_token text,
    delay_seconds integer DEFAULT 3,
    messages_per_hour integer DEFAULT 20,
    avoid_night_hours boolean DEFAULT true,
    created_by uuid,
    created_date timestamp without time zone DEFAULT now(),
    updated_date timestamp without time zone DEFAULT now(),
    tenant_id uuid,
    CONSTRAINT campaigns_delay_seconds_check CHECK ((delay_seconds >= 1)),
    CONSTRAINT campaigns_messages_per_hour_check CHECK ((messages_per_hour > 0)),
    CONSTRAINT campaigns_status_check CHECK (((status)::text = ANY ((ARRAY['rascunho'::character varying, 'agendada'::character varying, 'enviando'::character varying, 'concluida'::character varying, 'pausada'::character varying])::text[]))),
    CONSTRAINT campaigns_type_check CHECK (((type)::text = ANY ((ARRAY['whatsapp'::character varying, 'email'::character varying])::text[])))
);


--
-- Name: linkbio_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.linkbio_pages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    avatar_url text,
    background_color character varying(7) DEFAULT '#6366f1'::character varying,
    status character varying(50) DEFAULT 'rascunho'::character varying,
    petition_ids text[],
    views_count integer DEFAULT 0,
    created_by uuid,
    created_date timestamp without time zone DEFAULT now(),
    updated_date timestamp without time zone DEFAULT now(),
    tenant_id uuid,
    CONSTRAINT linkbio_pages_status_check CHECK (((status)::text = ANY ((ARRAY['rascunho'::character varying, 'publicada'::character varying])::text[])))
);


--
-- Name: linktree_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.linktree_pages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    avatar_url text,
    background_color character varying(7) DEFAULT '#ffffff'::character varying,
    text_color character varying(7) DEFAULT '#000000'::character varying,
    links jsonb DEFAULT '[]'::jsonb,
    status character varying(50) DEFAULT 'rascunho'::character varying,
    views_count integer DEFAULT 0,
    created_by uuid,
    created_date timestamp without time zone DEFAULT now(),
    updated_date timestamp without time zone DEFAULT now(),
    tenant_id uuid,
    CONSTRAINT linktree_pages_status_check CHECK (((status)::text = ANY ((ARRAY['rascunho'::character varying, 'publicada'::character varying])::text[])))
);


--
-- Name: message_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_templates (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    subject character varying(500),
    content text NOT NULL,
    is_default boolean DEFAULT false,
    thumbnail_url text,
    created_by uuid,
    created_date timestamp without time zone DEFAULT now(),
    updated_date timestamp without time zone DEFAULT now(),
    tenant_id uuid,
    CONSTRAINT message_templates_type_check CHECK (((type)::text = ANY ((ARRAY['whatsapp'::character varying, 'email'::character varying])::text[])))
);


--
-- Name: petitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.petitions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(500) NOT NULL,
    description text NOT NULL,
    banner_url text,
    logo_url text,
    primary_color character varying(7) DEFAULT '#6366f1'::character varying,
    share_text text,
    goal integer NOT NULL,
    status character varying(50) DEFAULT 'rascunho'::character varying,
    slug character varying(255),
    collect_phone boolean DEFAULT false,
    collect_city boolean DEFAULT true,
    collect_state boolean DEFAULT false,
    collect_cpf boolean DEFAULT false,
    collect_comment boolean DEFAULT true,
    views_count integer DEFAULT 0,
    created_by uuid,
    created_date timestamp without time zone DEFAULT now(),
    updated_date timestamp without time zone DEFAULT now(),
    tenant_id uuid,
    CONSTRAINT petitions_goal_check CHECK ((goal > 0)),
    CONSTRAINT petitions_status_check CHECK (((status)::text = ANY ((ARRAY['rascunho'::character varying, 'publicada'::character varying, 'pausada'::character varying, 'concluida'::character varying])::text[])))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    token character varying(500) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_date timestamp without time zone DEFAULT now()
);


--
-- Name: signatures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.signatures (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    petition_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    city character varying(255),
    state character varying(50),
    cpf character varying(14),
    comment text,
    created_by uuid,
    created_date timestamp without time zone DEFAULT now(),
    updated_date timestamp without time zone DEFAULT now()
);


--
-- Name: tenant_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenant_users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role character varying(50) DEFAULT 'member'::character varying,
    is_active boolean DEFAULT true,
    created_date timestamp without time zone DEFAULT now(),
    updated_date timestamp without time zone DEFAULT now(),
    CONSTRAINT tenant_users_role_check CHECK (((role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'member'::character varying])::text[])))
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    database_url text NOT NULL,
    plan character varying(50) DEFAULT 'free'::character varying,
    status character varying(50) DEFAULT 'active'::character varying,
    settings jsonb DEFAULT '{}'::jsonb,
    max_petitions integer DEFAULT 10,
    max_signatures integer DEFAULT 1000,
    max_campaigns integer DEFAULT 5,
    created_date timestamp without time zone DEFAULT now(),
    updated_date timestamp without time zone DEFAULT now(),
    CONSTRAINT tenants_plan_check CHECK (((plan)::text = ANY ((ARRAY['free'::character varying, 'basic'::character varying, 'pro'::character varying, 'enterprise'::character varying])::text[]))),
    CONSTRAINT tenants_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'suspended'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying,
    phone character varying(50),
    avatar_url text,
    preferences jsonb DEFAULT '{}'::jsonb,
    email_verified boolean DEFAULT false,
    created_date timestamp without time zone DEFAULT now(),
    updated_date timestamp without time zone DEFAULT now(),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[])))
);


--
-- Data for Name: auth_users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.auth_users VALUES ('1dd33159-8381-4368-b5c4-827b518b25f6', 'user@tenant2.com', '$2b$10$R/45Yn0wK2KW1Ifp4w8wg.K7VRqiilQc0QydoTH.tzAGcYHwRtOFO', 'User Tenant 2', NULL, NULL, false, true, '2025-11-12 15:12:36.438375', '2025-11-12 15:11:49.618756', '2025-11-12 17:46:55.496681', false);
INSERT INTO public.auth_users VALUES ('690845cd-4864-45fb-ade7-3a9d0caa636f', 'teste@teste', '$2b$10$1.m/dLX.MpM7E4YV3d.1AuTbY65ubY3x49H2UUCA4ovUgjarhyj1S', 'Teste', NULL, NULL, true, true, '2025-11-12 18:17:54.119568', '2025-11-12 17:41:30.70831', '2025-11-12 18:17:54.119568', false);
INSERT INTO public.auth_users VALUES ('5dcee98a-ad3d-4b4d-aaf2-de5290d8fc15', 'tecnologia@wescctech.com.br', '$2b$10$YJApgR8o9kt4arwFrngwkuPhuMsoG698Bp303fFz8aJoyi0PT3KfS', 'Super Admin', NULL, NULL, true, true, '2025-11-12 18:19:16.502279', '2025-11-12 16:20:43.235364', '2025-11-12 18:19:16.502279', true);
INSERT INTO public.auth_users VALUES ('70700c53-08fe-4c1f-9133-e5bac6e88a94', 'politico@teste', '$2b$10$5sTGpgEi5u3MqeraVMEI..NzV/rTmNnSWRCjEl0JwptJ0T0o4Zft2', 'Politico', NULL, NULL, true, true, '2025-11-12 18:22:02.526969', '2025-11-12 18:20:32.4728', '2025-11-12 18:22:02.526969', false);


--
-- Data for Name: campaign_logs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.campaign_logs VALUES ('195abe73-5f09-470d-8dd0-27751dd67df3', '56a99b4b-51ff-4a0c-900f-ca193260f05a', 'Teste Cristian ', '51991777183', 'success', '202', '{"status":"202","msg":"Successfully added to the transmission queue","messageSentId":"69149c56fb6905ed01ff4e3a"}', NULL, NULL, '2025-11-12 14:40:25.688759', '2025-11-12 14:40:25.688759');


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.campaigns VALUES ('56a99b4b-51ff-4a0c-900f-ca193260f05a', 'Teste', 'whatsapp', 'concluida', '637009e9-9526-412e-9dcf-1cd947c2f295', '{974df4da-2479-40ae-a6af-0c6b0e726afa}', '{"city": "", "state": "", "dateTo": "", "dateFrom": ""}', 'Prezado(a) {nome},

Gostaríamos de convidá-lo(a) a apoiar nossa petição: {peticao}

Sua participação é fundamental para alcançarmos nosso objetivo.

Para assinar, acesse: {link}

Atenciosamente,
Equipe da Petição', NULL, NULL, NULL, NULL, 1, 1, 0, 1, '61d49d8b20f435a8e6631bf6', 3, 20, true, NULL, '2025-11-12 14:40:22.131624', '2025-11-12 15:04:03.589936', '28dd3d91-9a2b-4203-8e31-1d92ea43460a');


--
-- Data for Name: linkbio_pages; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.linkbio_pages VALUES ('8479eaa2-3561-43ae-8e6e-c7b80a1515f6', 'Teste', 'teste', 'Teste', '', '#6366f1', 'publicada', '{974df4da-2479-40ae-a6af-0c6b0e726afa,c8a6309f-1ebd-48f7-99d2-b2141943af48,08262ff4-2e2d-4b09-833a-f5c0ab620917,834d64ab-07e9-472c-ace5-bf3a1309e364}', 0, NULL, '2025-11-12 14:03:24.502535', '2025-11-12 15:04:03.589936', '28dd3d91-9a2b-4203-8e31-1d92ea43460a');


--
-- Data for Name: linktree_pages; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: message_templates; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: petitions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.petitions VALUES ('834d64ab-07e9-472c-ace5-bf3a1309e364', 'Salvar a Amazônia', 'Petição para proteger a Floresta Amazônica e combater o desmatamento ilegal. Nossa floresta é vital para o clima global e precisa de proteção urgente.', NULL, NULL, '#10b981', 'Assine para salvar a Amazônia!', 10000, 'publicada', 'salvar-amazonia', false, true, false, false, true, 0, NULL, '2025-11-12 11:30:03.709492', '2025-11-12 15:04:03.589936', '28dd3d91-9a2b-4203-8e31-1d92ea43460a');
INSERT INTO public.petitions VALUES ('08262ff4-2e2d-4b09-833a-f5c0ab620917', 'Mais Ciclovias na Cidade', 'Precisamos de mais ciclovias seguras para incentivar o transporte sustentável e reduzir o tráfego de carros. Vamos construir uma cidade mais verde!', NULL, NULL, '#3b82f6', 'Apoie ciclovias na nossa cidade!', 5000, 'publicada', 'mais-ciclovias', false, true, false, false, true, 0, NULL, '2025-11-12 11:30:14.415744', '2025-11-12 15:04:03.589936', '28dd3d91-9a2b-4203-8e31-1d92ea43460a');
INSERT INTO public.petitions VALUES ('974df4da-2479-40ae-a6af-0c6b0e726afa', 'A favor das mulheres teste', 'Teste', '/uploads/post-instagram-dia-internacional-das-mulheres-delicado-rosa-1762951190542-514764701.png', '/uploads/whatsapp-image-2025-05-22-at-14-56-05-1762951183327-288174510.jpg', '#6366f1', '🔥 Esta causa precisa do seu apoio! Assine agora: {link}', 1000, 'publicada', 'agoravai', true, true, false, false, true, 0, NULL, '2025-11-12 12:40:06.283618', '2025-11-12 15:04:03.589936', '28dd3d91-9a2b-4203-8e31-1d92ea43460a');
INSERT INTO public.petitions VALUES ('637009e9-9526-412e-9dcf-1cd947c2f295', 'Será ', 'teste', NULL, '/uploads/whatsapp-image-2025-05-22-at-14-56-05-1762957667214-950029898.jpg', '#6366f1', '🔥 Esta causa precisa do seu apoio! Assine agora: {link}', 1000, 'publicada', 'sera', true, true, false, false, true, 0, NULL, '2025-11-12 14:28:00.067668', '2025-11-12 15:04:03.589936', '28dd3d91-9a2b-4203-8e31-1d92ea43460a');
INSERT INTO public.petitions VALUES ('51bf9aae-6c2d-4137-a58f-f18d6deeee93', 'Teste', 'teste', NULL, NULL, '#6366f1', '🌟 Sua voz importa! Assine e compartilhe: {link}', 1000, 'publicada', 'teste', true, true, false, false, true, 0, NULL, '2025-11-12 18:22:24.61056', '2025-11-12 18:22:24.61056', '33fc1ee4-4511-46f3-84e2-32e73fcfcaad');


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.refresh_tokens VALUES ('0a356907-57c9-4db3-b697-647f3ebbd3d5', '1dd33159-8381-4368-b5c4-827b518b25f6', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZGQzMzE1OS04MzgxLTQzNjgtYjVjNC04MjdiNTE4YjI1ZjYiLCJpYXQiOjE3NjI5NjAzMDksImV4cCI6MTc2MzU2NTEwOX0.ZJ315oVL5obP9XXBcYChjUj9PqPi_VJtMD1Syi3nA7I', '2025-11-19 15:11:49.654', '2025-11-12 15:11:49.685064');
INSERT INTO public.refresh_tokens VALUES ('d9e68672-aeb5-4de4-b3b8-b67827ee1baa', '1dd33159-8381-4368-b5c4-827b518b25f6', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZGQzMzE1OS04MzgxLTQzNjgtYjVjNC04MjdiNTE4YjI1ZjYiLCJpYXQiOjE3NjI5NjAzNDEsImV4cCI6MTc2MzU2NTE0MX0.LobiPwZ5niAuM3dW9NkDoLtMFaazfqK_7nA8DA-oeNs', '2025-11-19 15:12:21.173', '2025-11-12 15:12:21.204515');
INSERT INTO public.refresh_tokens VALUES ('44707b19-49bf-4a7a-8884-68e28e34e558', '1dd33159-8381-4368-b5c4-827b518b25f6', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZGQzMzE1OS04MzgxLTQzNjgtYjVjNC04MjdiNTE4YjI1ZjYiLCJpYXQiOjE3NjI5NjAzNTYsImV4cCI6MTc2MzU2NTE1Nn0.eWH7cgKzrjWBRhxF4EEMx_wTrKrVVRIwzw4NdkH_WyQ', '2025-11-19 15:12:36.349', '2025-11-12 15:12:36.380258');
INSERT INTO public.refresh_tokens VALUES ('baa9f907-0e18-4131-b5b9-be1754ca1572', '5dcee98a-ad3d-4b4d-aaf2-de5290d8fc15', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZGNlZTk4YS1hZDNkLTRiNGQtYWFmMi1kZTUyOTBkOGZjMTUiLCJpYXQiOjE3NjI5NjQ1NDcsImV4cCI6MTc2MzU2OTM0N30.a9OvX73Zf5oqkfvD9Xwna5jtTd1bkB7RfoKn6Z195Eg', '2025-11-19 16:22:27.022', '2025-11-12 16:22:27.053517');
INSERT INTO public.refresh_tokens VALUES ('b91478da-9d33-4b89-aadb-3c5384ea7c5d', '5dcee98a-ad3d-4b4d-aaf2-de5290d8fc15', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZGNlZTk4YS1hZDNkLTRiNGQtYWFmMi1kZTUyOTBkOGZjMTUiLCJpYXQiOjE3NjI5NjQ1ODUsImV4cCI6MTc2MzU2OTM4NX0.qTEKtm0aLl4obKwG8vShLjh4-jirRvFKIsp32SaTbuQ', '2025-11-19 16:23:05.99', '2025-11-12 16:23:06.074639');
INSERT INTO public.refresh_tokens VALUES ('8cce0663-ca08-4d9f-b6a6-95fcf7afa55b', '5dcee98a-ad3d-4b4d-aaf2-de5290d8fc15', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZGNlZTk4YS1hZDNkLTRiNGQtYWFmMi1kZTUyOTBkOGZjMTUiLCJpYXQiOjE3NjI5NjQ4MjIsImV4cCI6MTc2MzU2OTYyMn0.ys6WPSJDvfGuGvaxmP7rYEbyJTuIsdu1KoN6WA7o09s', '2025-11-19 16:27:02.26', '2025-11-12 16:27:02.290888');
INSERT INTO public.refresh_tokens VALUES ('d595f8a8-823f-4c62-a873-40cac1f6c6d3', '5dcee98a-ad3d-4b4d-aaf2-de5290d8fc15', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZGNlZTk4YS1hZDNkLTRiNGQtYWFmMi1kZTUyOTBkOGZjMTUiLCJpYXQiOjE3NjI5NjQ4MzQsImV4cCI6MTc2MzU2OTYzNH0.amaSv7luWq5qyjaxFih9wfJAbzMW-rKQAxRMjRVn02g', '2025-11-19 16:27:14.826', '2025-11-12 16:27:14.857509');
INSERT INTO public.refresh_tokens VALUES ('ba83b1af-9df0-4a7f-89c2-4e4b89041ed7', '5dcee98a-ad3d-4b4d-aaf2-de5290d8fc15', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZGNlZTk4YS1hZDNkLTRiNGQtYWFmMi1kZTUyOTBkOGZjMTUiLCJpYXQiOjE3NjI5NjY4MjAsImV4cCI6MTc2MzU3MTYyMH0.lGax46dRzGWLuEqgUFBxaJwi2YDncKPMZI17XTwCNKc', '2025-11-19 17:00:20.134', '2025-11-12 17:00:20.271355');
INSERT INTO public.refresh_tokens VALUES ('bbcff8ae-ce38-4c4b-9bae-0d95cdf53fb2', '5dcee98a-ad3d-4b4d-aaf2-de5290d8fc15', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZGNlZTk4YS1hZDNkLTRiNGQtYWFmMi1kZTUyOTBkOGZjMTUiLCJpYXQiOjE3NjI5NjczNjYsImV4cCI6MTc2MzU3MjE2Nn0.mepOUk_VuNw8qBMlDBLYB_v3fCG8PwVGs-QLcB3uAlA', '2025-11-19 17:09:26.788', '2025-11-12 17:09:26.820512');
INSERT INTO public.refresh_tokens VALUES ('713e3a99-9656-4d0c-bcca-7db4e96a98c9', '5dcee98a-ad3d-4b4d-aaf2-de5290d8fc15', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZGNlZTk4YS1hZDNkLTRiNGQtYWFmMi1kZTUyOTBkOGZjMTUiLCJpYXQiOjE3NjI5Njc4NjksImV4cCI6MTc2MzU3MjY2OX0.Jq4KSmwDh1TNbaV4JVo0TlmY0cc9hlRuK3BrZBVfCwQ', '2025-11-19 17:17:49.138', '2025-11-12 17:17:49.168946');
INSERT INTO public.refresh_tokens VALUES ('46e5c98e-45f0-409c-aab2-a654f2cbe9c1', '5dcee98a-ad3d-4b4d-aaf2-de5290d8fc15', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZGNlZTk4YS1hZDNkLTRiNGQtYWFmMi1kZTUyOTBkOGZjMTUiLCJpYXQiOjE3NjI5NjgyMDEsImV4cCI6MTc2MzU3MzAwMX0.EO5yMhrk2A_iw3Biw4NcjdrWSyJt0oJbpLId-A8_JU4', '2025-11-19 17:23:21.019', '2025-11-12 17:23:21.050276');
INSERT INTO public.refresh_tokens VALUES ('a9212907-05fc-47a5-8803-4d8faa5068d1', '690845cd-4864-45fb-ade7-3a9d0caa636f', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTA4NDVjZC00ODY0LTQ1ZmItYWRlNy0zYTlkMGNhYTYzNmYiLCJpYXQiOjE3NjI5NjkzMDMsImV4cCI6MTc2MzU3NDEwM30.wf_BteZCiUnD3LmrVJa49YsShT1NlXReJ557r8AGq4A', '2025-11-19 17:41:43.648', '2025-11-12 17:41:43.67966');
INSERT INTO public.refresh_tokens VALUES ('01b2ccf9-71f9-4cf1-85e9-cceac2e32665', '5dcee98a-ad3d-4b4d-aaf2-de5290d8fc15', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZGNlZTk4YS1hZDNkLTRiNGQtYWFmMi1kZTUyOTBkOGZjMTUiLCJpYXQiOjE3NjI5NjkzMjYsImV4cCI6MTc2MzU3NDEyNn0.SXe_Rmkx6xQNEQuiPViddoyCgqta8TuHW1aBOKnpxe4', '2025-11-19 17:42:06.174', '2025-11-12 17:42:06.204529');
INSERT INTO public.refresh_tokens VALUES ('63f137c0-1ff2-4f1e-b6fc-e68c4ca0f52f', '690845cd-4864-45fb-ade7-3a9d0caa636f', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTA4NDVjZC00ODY0LTQ1ZmItYWRlNy0zYTlkMGNhYTYzNmYiLCJpYXQiOjE3NjI5NjkzODIsImV4cCI6MTc2MzU3NDE4Mn0.Vgmc1JaG3nt8u33sIaVcP1mp5aYetHkWeDJgmK5vsN4', '2025-11-19 17:43:02.739', '2025-11-12 17:43:02.770938');
INSERT INTO public.refresh_tokens VALUES ('c636bb7d-8394-41a0-bd5e-68f7e519a76f', '5dcee98a-ad3d-4b4d-aaf2-de5290d8fc15', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZGNlZTk4YS1hZDNkLTRiNGQtYWFmMi1kZTUyOTBkOGZjMTUiLCJpYXQiOjE3NjI5Njk1OTMsImV4cCI6MTc2MzU3NDM5M30.pgkIq5hSkzdLbhetW78YJukxolxkwtJ7b84j9HJX0ts', '2025-11-19 17:46:33.138', '2025-11-12 17:46:33.169312');
INSERT INTO public.refresh_tokens VALUES ('a5982b3b-dde6-4add-81a4-71afb2ef885a', '5dcee98a-ad3d-4b4d-aaf2-de5290d8fc15', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZGNlZTk4YS1hZDNkLTRiNGQtYWFmMi1kZTUyOTBkOGZjMTUiLCJpYXQiOjE3NjI5Njk5MDMsImV4cCI6MTc2MzU3NDcwM30.D9Ve0DaIIa4_AiQiHiO8cVBrlank8jCQcp2BcVNIZko', '2025-11-19 17:51:43.118', '2025-11-12 17:51:43.149885');
INSERT INTO public.refresh_tokens VALUES ('781a3e26-ae71-4048-8cce-12547e9f9bba', '690845cd-4864-45fb-ade7-3a9d0caa636f', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTA4NDVjZC00ODY0LTQ1ZmItYWRlNy0zYTlkMGNhYTYzNmYiLCJpYXQiOjE3NjI5NzAwMTAsImV4cCI6MTc2MzU3NDgxMH0.Vo9k9NCFmbbPC_gPSsQgM4s22at8bShj-_uxz3j0ubA', '2025-11-19 17:53:30.13', '2025-11-12 17:53:30.161135');
INSERT INTO public.refresh_tokens VALUES ('cd35d8e7-cabc-4de1-ba32-d99743b8468c', '690845cd-4864-45fb-ade7-3a9d0caa636f', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTA4NDVjZC00ODY0LTQ1ZmItYWRlNy0zYTlkMGNhYTYzNmYiLCJpYXQiOjE3NjI5NzAwOTMsImV4cCI6MTc2MzU3NDg5M30.iLaeahMzQLWze_FZUj9dXP6pbxrOyjvLltFgrJQjLq0', '2025-11-19 17:54:53.967', '2025-11-12 17:54:53.998304');
INSERT INTO public.refresh_tokens VALUES ('1384f4b8-aba8-4acc-887a-a2c7620504c5', '690845cd-4864-45fb-ade7-3a9d0caa636f', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTA4NDVjZC00ODY0LTQ1ZmItYWRlNy0zYTlkMGNhYTYzNmYiLCJpYXQiOjE3NjI5NzE0NzQsImV4cCI6MTc2MzU3NjI3NH0.9hY1qw1izPkjH3AXQ8YRjeSKERiK5sytszQZQ_DP7TA', '2025-11-19 18:17:54.003', '2025-11-12 18:17:54.034718');
INSERT INTO public.refresh_tokens VALUES ('4fc37985-8901-469d-ac2d-b296cd904340', '5dcee98a-ad3d-4b4d-aaf2-de5290d8fc15', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZGNlZTk4YS1hZDNkLTRiNGQtYWFmMi1kZTUyOTBkOGZjMTUiLCJpYXQiOjE3NjI5NzE1NTYsImV4cCI6MTc2MzU3NjM1Nn0.TzrOnagZjSfQ-uH_Yo_CWsIb5AzxYwew3fOu0pLOKDs', '2025-11-19 18:19:16.409', '2025-11-12 18:19:16.44047');
INSERT INTO public.refresh_tokens VALUES ('c6245f96-1572-4285-9d9d-d5cc8aca637b', '70700c53-08fe-4c1f-9133-e5bac6e88a94', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3MDcwMGM1My0wOGZlLTRjMWYtOTEzMy1lNWJhYzZlODhhOTQiLCJpYXQiOjE3NjI5NzE3MjIsImV4cCI6MTc2MzU3NjUyMn0.2Y54pD8NAyf6_OSTHAtiIiWoQKXlrqkcY3vWg05MEu0', '2025-11-19 18:22:02.435', '2025-11-12 18:22:02.465847');


--
-- Data for Name: signatures; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.signatures VALUES ('37851e97-cb40-43f6-b1c9-74d9bfb5922c', '834d64ab-07e9-472c-ace5-bf3a1309e364', 'Maria Silva', 'maria@email.com', NULL, 'São Paulo', NULL, NULL, 'Precisamos proteger nossa floresta!', NULL, '2025-11-12 11:30:26.811458', '2025-11-12 11:30:26.811458');
INSERT INTO public.signatures VALUES ('f77bbc7b-f877-41b9-8845-ee6e94eff47c', '834d64ab-07e9-472c-ace5-bf3a1309e364', 'João Santos', 'joao@email.com', NULL, 'Rio de Janeiro', NULL, NULL, 'Apoio total a esta causa!', NULL, '2025-11-12 11:30:26.92526', '2025-11-12 11:30:26.92526');
INSERT INTO public.signatures VALUES ('fa111d10-ad55-429c-9b54-408493c1c327', '08262ff4-2e2d-4b09-833a-f5c0ab620917', 'Ana Costa', 'ana@email.com', NULL, 'Belo Horizonte', NULL, NULL, 'Precisamos de mais ciclovias!', NULL, '2025-11-12 11:30:27.025411', '2025-11-12 11:30:27.025411');
INSERT INTO public.signatures VALUES ('3b371bc5-288b-4aac-9c46-140497300229', '974df4da-2479-40ae-a6af-0c6b0e726afa', 'Teste Cristian ', 'terra@gmasil', '51991777183', 'Porto Alegre', '', '', 'Teste', NULL, '2025-11-12 14:09:09.942763', '2025-11-12 14:09:09.942763');


--
-- Data for Name: tenant_users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tenant_users VALUES ('ae153029-05bd-4424-ad1d-75fb1a67eb4a', 'a026f671-7b32-4108-addc-73795c437f27', '1dd33159-8381-4368-b5c4-827b518b25f6', 'owner', true, '2025-11-12 15:12:11.394856', '2025-11-12 15:12:11.394856');
INSERT INTO public.tenant_users VALUES ('c158a974-ac12-4b1c-a54d-f0005bf9edcb', '28dd3d91-9a2b-4203-8e31-1d92ea43460a', '5dcee98a-ad3d-4b4d-aaf2-de5290d8fc15', 'admin', true, '2025-11-12 17:40:11.030398', '2025-11-12 17:40:11.030398');
INSERT INTO public.tenant_users VALUES ('a63fc6e0-22c8-49f1-8891-3cfae5dbcbee', '28dd3d91-9a2b-4203-8e31-1d92ea43460a', '690845cd-4864-45fb-ade7-3a9d0caa636f', 'member', true, '2025-11-12 17:42:52.653453', '2025-11-12 17:42:52.653453');
INSERT INTO public.tenant_users VALUES ('305b2d94-8ef0-4773-80cf-a9d468212dd3', '33fc1ee4-4511-46f3-84e2-32e73fcfcaad', '70700c53-08fe-4c1f-9133-e5bac6e88a94', 'member', true, '2025-11-12 18:21:27.511103', '2025-11-12 18:21:27.511103');


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tenants VALUES ('28dd3d91-9a2b-4203-8e31-1d92ea43460a', 'Tenant Padrão', 'default', 'postgresql://neondb_owner:npg_SOA7KJRgm8HV@ep-misty-bonus-ae98t3st.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require', 'pro', 'active', '{}', 10, 1000, 5, '2025-11-12 14:53:41.277372', '2025-11-12 14:53:41.277372');
INSERT INTO public.tenants VALUES ('a026f671-7b32-4108-addc-73795c437f27', 'Tenant 2', 'tenant-2', 'postgresql://neondb_owner:npg_SOA7KJRgm8HV@ep-misty-bonus-ae98t3st.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require', 'free', 'active', '{}', 10, 1000, 5, '2025-11-12 15:12:11.394856', '2025-11-12 15:12:11.394856');
INSERT INTO public.tenants VALUES ('33fc1ee4-4511-46f3-84e2-32e73fcfcaad', 'Politico 2', 'politico-2', 'postgresql://neondb_owner:npg_SOA7KJRgm8HV@ep-misty-bonus-ae98t3st.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require', 'free', 'active', '{}', 10, 1000, 5, '2025-11-12 18:20:04.721198', '2025-11-12 18:20:04.721198');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES ('80464b7a-4c67-483f-8a4c-620404b3d35c', 'admin@peticoes.com', 'admin123', 'Administrador', 'admin', NULL, NULL, '{}', false, '2025-11-12 11:29:55.401236', '2025-11-12 11:29:55.401236');


--
-- Name: auth_users auth_users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_users
    ADD CONSTRAINT auth_users_email_key UNIQUE (email);


--
-- Name: auth_users auth_users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_users
    ADD CONSTRAINT auth_users_google_id_key UNIQUE (google_id);


--
-- Name: auth_users auth_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_users
    ADD CONSTRAINT auth_users_pkey PRIMARY KEY (id);


--
-- Name: campaign_logs campaign_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_logs
    ADD CONSTRAINT campaign_logs_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: linkbio_pages linkbio_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.linkbio_pages
    ADD CONSTRAINT linkbio_pages_pkey PRIMARY KEY (id);


--
-- Name: linkbio_pages linkbio_pages_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.linkbio_pages
    ADD CONSTRAINT linkbio_pages_slug_key UNIQUE (slug);


--
-- Name: linktree_pages linktree_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.linktree_pages
    ADD CONSTRAINT linktree_pages_pkey PRIMARY KEY (id);


--
-- Name: linktree_pages linktree_pages_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.linktree_pages
    ADD CONSTRAINT linktree_pages_slug_key UNIQUE (slug);


--
-- Name: message_templates message_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_templates
    ADD CONSTRAINT message_templates_pkey PRIMARY KEY (id);


--
-- Name: petitions petitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.petitions
    ADD CONSTRAINT petitions_pkey PRIMARY KEY (id);


--
-- Name: petitions petitions_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.petitions
    ADD CONSTRAINT petitions_slug_key UNIQUE (slug);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- Name: signatures signatures_petition_id_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_petition_id_email_key UNIQUE (petition_id, email);


--
-- Name: signatures signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_pkey PRIMARY KEY (id);


--
-- Name: tenant_users tenant_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_users
    ADD CONSTRAINT tenant_users_pkey PRIMARY KEY (id);


--
-- Name: tenant_users tenant_users_tenant_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_users
    ADD CONSTRAINT tenant_users_tenant_id_user_id_key UNIQUE (tenant_id, user_id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_slug_key UNIQUE (slug);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_auth_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auth_users_email ON public.auth_users USING btree (email);


--
-- Name: idx_auth_users_google_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auth_users_google_id ON public.auth_users USING btree (google_id);


--
-- Name: idx_campaign_logs_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_campaign_logs_campaign_id ON public.campaign_logs USING btree (campaign_id);


--
-- Name: idx_campaign_logs_created_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_campaign_logs_created_date ON public.campaign_logs USING btree (created_date DESC);


--
-- Name: idx_campaign_logs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_campaign_logs_status ON public.campaign_logs USING btree (status);


--
-- Name: idx_campaigns_petition_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_campaigns_petition_id ON public.campaigns USING btree (petition_id);


--
-- Name: idx_campaigns_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_campaigns_status ON public.campaigns USING btree (status);


--
-- Name: idx_campaigns_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_campaigns_tenant_id ON public.campaigns USING btree (tenant_id);


--
-- Name: idx_campaigns_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_campaigns_type ON public.campaigns USING btree (type);


--
-- Name: idx_linkbio_pages_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_linkbio_pages_slug ON public.linkbio_pages USING btree (slug);


--
-- Name: idx_linkbio_pages_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_linkbio_pages_status ON public.linkbio_pages USING btree (status);


--
-- Name: idx_linkbio_pages_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_linkbio_pages_tenant_id ON public.linkbio_pages USING btree (tenant_id);


--
-- Name: idx_linktree_pages_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_linktree_pages_slug ON public.linktree_pages USING btree (slug);


--
-- Name: idx_linktree_pages_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_linktree_pages_status ON public.linktree_pages USING btree (status);


--
-- Name: idx_linktree_pages_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_linktree_pages_tenant_id ON public.linktree_pages USING btree (tenant_id);


--
-- Name: idx_message_templates_is_default; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_templates_is_default ON public.message_templates USING btree (is_default);


--
-- Name: idx_message_templates_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_templates_tenant_id ON public.message_templates USING btree (tenant_id);


--
-- Name: idx_message_templates_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_templates_type ON public.message_templates USING btree (type);


--
-- Name: idx_petitions_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_petitions_created_by ON public.petitions USING btree (created_by);


--
-- Name: idx_petitions_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_petitions_slug ON public.petitions USING btree (slug);


--
-- Name: idx_petitions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_petitions_status ON public.petitions USING btree (status);


--
-- Name: idx_petitions_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_petitions_tenant_id ON public.petitions USING btree (tenant_id);


--
-- Name: idx_refresh_tokens_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refresh_tokens_token ON public.refresh_tokens USING btree (token);


--
-- Name: idx_refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);


--
-- Name: idx_signatures_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signatures_city ON public.signatures USING btree (city);


--
-- Name: idx_signatures_created_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signatures_created_date ON public.signatures USING btree (created_date DESC);


--
-- Name: idx_signatures_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signatures_email ON public.signatures USING btree (email);


--
-- Name: idx_signatures_petition_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signatures_petition_id ON public.signatures USING btree (petition_id);


--
-- Name: idx_signatures_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signatures_state ON public.signatures USING btree (state);


--
-- Name: idx_tenant_users_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_users_tenant_id ON public.tenant_users USING btree (tenant_id);


--
-- Name: idx_tenant_users_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_users_user_id ON public.tenant_users USING btree (user_id);


--
-- Name: idx_tenants_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenants_slug ON public.tenants USING btree (slug);


--
-- Name: idx_tenants_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenants_status ON public.tenants USING btree (status);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: auth_users update_auth_users_updated_date; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_auth_users_updated_date BEFORE UPDATE ON public.auth_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_date_column();


--
-- Name: campaign_logs update_campaign_logs_updated_date; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_campaign_logs_updated_date BEFORE UPDATE ON public.campaign_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_date();


--
-- Name: campaigns update_campaigns_updated_date; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_campaigns_updated_date BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_date();


--
-- Name: linkbio_pages update_linkbio_pages_updated_date; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_linkbio_pages_updated_date BEFORE UPDATE ON public.linkbio_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_date();


--
-- Name: linktree_pages update_linktree_pages_updated_date; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_linktree_pages_updated_date BEFORE UPDATE ON public.linktree_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_date();


--
-- Name: message_templates update_message_templates_updated_date; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_message_templates_updated_date BEFORE UPDATE ON public.message_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_date();


--
-- Name: petitions update_petitions_updated_date; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_petitions_updated_date BEFORE UPDATE ON public.petitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_date();


--
-- Name: signatures update_signatures_updated_date; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_signatures_updated_date BEFORE UPDATE ON public.signatures FOR EACH ROW EXECUTE FUNCTION public.update_updated_date();


--
-- Name: tenant_users update_tenant_users_updated_date; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tenant_users_updated_date BEFORE UPDATE ON public.tenant_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_date_column();


--
-- Name: tenants update_tenants_updated_date; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tenants_updated_date BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_date_column();


--
-- Name: users update_users_updated_date; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_date BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_date();


--
-- Name: campaign_logs campaign_logs_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_logs
    ADD CONSTRAINT campaign_logs_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: campaign_logs campaign_logs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_logs
    ADD CONSTRAINT campaign_logs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: campaigns campaigns_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: campaigns campaigns_petition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_petition_id_fkey FOREIGN KEY (petition_id) REFERENCES public.petitions(id) ON DELETE SET NULL;


--
-- Name: linkbio_pages linkbio_pages_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.linkbio_pages
    ADD CONSTRAINT linkbio_pages_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: linktree_pages linktree_pages_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.linktree_pages
    ADD CONSTRAINT linktree_pages_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: message_templates message_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_templates
    ADD CONSTRAINT message_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: petitions petitions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.petitions
    ADD CONSTRAINT petitions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.auth_users(id) ON DELETE CASCADE;


--
-- Name: signatures signatures_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: signatures signatures_petition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_petition_id_fkey FOREIGN KEY (petition_id) REFERENCES public.petitions(id) ON DELETE CASCADE;


--
-- Name: tenant_users tenant_users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_users
    ADD CONSTRAINT tenant_users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: tenant_users tenant_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenant_users
    ADD CONSTRAINT tenant_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.auth_users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

