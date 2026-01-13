-- Script para criar petições modelo de demonstração
-- Execute este script APÓS criar um usuário demo no sistema

-- Variável: substitua pelo ID do usuário demo
-- Para encontrar: SELECT id FROM users WHERE email = 'demo@peticoesbr.com.br';

DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    -- Buscar ou criar usuário demo
    SELECT id INTO demo_user_id FROM users WHERE email = 'demo@peticoesbr.com.br';
    
    IF demo_user_id IS NULL THEN
        INSERT INTO users (email, password, full_name, role)
        VALUES ('demo@peticoesbr.com.br', '$2a$10$demopasswordhash', 'Painel Demonstração', 'admin')
        RETURNING id INTO demo_user_id;
    END IF;

    -- Petição 1: Meio Ambiente
    INSERT INTO petitions (title, description, goal, status, slug, primary_color, created_by, collect_phone, collect_city, collect_state, collect_comment)
    VALUES (
        'Proteção da Mata Atlântica',
        'A Mata Atlântica é um dos biomas mais ameaçados do Brasil, restando apenas 12% de sua cobertura original. Esta petição exige do governo federal a criação de novas unidades de conservação e o aumento da fiscalização contra desmatamento ilegal. Nosso objetivo é preservar este patrimônio natural para as futuras gerações, garantindo a sobrevivência de milhares de espécies endêmicas e a qualidade de vida das comunidades locais.',
        5000,
        'publicada',
        'protecao-mata-atlantica',
        '#22c55e',
        demo_user_id,
        false, true, true, true
    ) ON CONFLICT (slug) DO NOTHING;

    -- Petição 2: Educação
    INSERT INTO petitions (title, description, goal, status, slug, primary_color, created_by, collect_phone, collect_city, collect_state, collect_comment)
    VALUES (
        'Merenda Escolar de Qualidade',
        'Milhares de crianças dependem da merenda escolar como sua principal refeição do dia. Esta petição solicita às prefeituras o aumento do investimento per capita na alimentação escolar, priorizando alimentos frescos e orgânicos da agricultura familiar local. Queremos garantir nutrição adequada para o desenvolvimento cognitivo e físico de nossos estudantes.',
        3000,
        'publicada',
        'merenda-escolar-qualidade',
        '#f59e0b',
        demo_user_id,
        false, true, true, true
    ) ON CONFLICT (slug) DO NOTHING;

    -- Petição 3: Saúde Pública
    INSERT INTO petitions (title, description, goal, status, slug, primary_color, created_by, collect_phone, collect_city, collect_state, collect_comment)
    VALUES (
        'Mais Médicos para o Interior',
        'As regiões rurais e periféricas do Brasil sofrem com a falta de profissionais de saúde. Esta petição exige a ampliação de programas que incentivem médicos a atuarem em áreas carentes, oferecendo melhores salários, infraestrutura adequada e oportunidades de capacitação. Saúde é direito de todos, independente de onde vivam.',
        10000,
        'publicada',
        'mais-medicos-interior',
        '#ef4444',
        demo_user_id,
        true, true, true, true
    ) ON CONFLICT (slug) DO NOTHING;

    -- Petição 4: Mobilidade Urbana
    INSERT INTO petitions (title, description, goal, status, slug, primary_color, created_by, collect_phone, collect_city, collect_state, collect_comment)
    VALUES (
        'Ciclovias Seguras em Nossa Cidade',
        'O transporte por bicicleta é sustentável, saudável e econômico, mas falta infraestrutura adequada. Esta petição solicita a construção de uma rede integrada de ciclovias protegidas, conectando bairros residenciais a centros comerciais e de trabalho. Precisamos de cidades mais humanas e menos dependentes de carros.',
        2500,
        'publicada',
        'ciclovias-seguras',
        '#3b82f6',
        demo_user_id,
        false, true, false, true
    ) ON CONFLICT (slug) DO NOTHING;

    -- Petição 5: Direitos dos Animais
    INSERT INTO petitions (title, description, goal, status, slug, primary_color, created_by, collect_phone, collect_city, collect_state, collect_comment)
    VALUES (
        'Fim dos Maus-Tratos a Animais',
        'Todos os dias, animais são vítimas de abandono, negligência e crueldade. Esta petição exige a aprovação de legislação mais rigorosa contra maus-tratos, com penas mais severas para infratores e maior investimento em fiscalização. Também solicitamos a criação de abrigos públicos e programas de castração gratuita.',
        8000,
        'publicada',
        'fim-maus-tratos-animais',
        '#a855f7',
        demo_user_id,
        false, true, true, true
    ) ON CONFLICT (slug) DO NOTHING;

    -- Petição 6: Cultura e Lazer
    INSERT INTO petitions (title, description, goal, status, slug, primary_color, created_by, collect_phone, collect_city, collect_state, collect_comment)
    VALUES (
        'Mais Espaços Culturais nas Periferias',
        'A cultura transforma vidas e comunidades. Esta petição exige a descentralização dos investimentos culturais, com a construção de bibliotecas, teatros comunitários e centros culturais nas periferias. Queremos garantir que jovens tenham acesso a arte, música, literatura e expressão criativa, independente de seu CEP.',
        4000,
        'publicada',
        'espacos-culturais-periferias',
        '#ec4899',
        demo_user_id,
        false, true, true, true
    ) ON CONFLICT (slug) DO NOTHING;

    -- Petição 7: Segurança Pública
    INSERT INTO petitions (title, description, goal, status, slug, primary_color, created_by, collect_phone, collect_city, collect_state, collect_comment)
    VALUES (
        'Iluminação Pública em Áreas de Risco',
        'A falta de iluminação adequada contribui para a sensação de insegurança e facilita a ocorrência de crimes. Esta petição solicita a instalação e manutenção de iluminação LED em ruas, praças e pontos de ônibus em bairros identificados como vulneráveis. Luz é segurança.',
        6000,
        'publicada',
        'iluminacao-publica-seguranca',
        '#06b6d4',
        demo_user_id,
        false, true, true, true
    ) ON CONFLICT (slug) DO NOTHING;

    -- Petição 8: Acessibilidade
    INSERT INTO petitions (title, description, goal, status, slug, primary_color, created_by, collect_phone, collect_city, collect_state, collect_comment)
    VALUES (
        'Cidade Acessível para Todos',
        'Pessoas com deficiência enfrentam barreiras diárias para se locomover em nossas cidades. Esta petição exige o cumprimento rigoroso das normas de acessibilidade em calçadas, prédios públicos, transporte coletivo e espaços de lazer. Acessibilidade não é favor, é direito constitucional.',
        3500,
        'publicada',
        'cidade-acessivel-todos',
        '#14b8a6',
        demo_user_id,
        true, true, true, true
    ) ON CONFLICT (slug) DO NOTHING;

    -- Petição 9: Combate à Fome
    INSERT INTO petitions (title, description, goal, status, slug, primary_color, created_by, collect_phone, collect_city, collect_state, collect_comment)
    VALUES (
        'Zero Desperdício de Alimentos',
        'Enquanto milhões passam fome, toneladas de alimentos são desperdiçadas diariamente. Esta petição solicita a criação de programas municipais que conectem supermercados, restaurantes e feiras a bancos de alimentos e instituições de assistência social. Combater a fome também é combater o desperdício.',
        7500,
        'publicada',
        'zero-desperdicio-alimentos',
        '#f97316',
        demo_user_id,
        false, true, true, true
    ) ON CONFLICT (slug) DO NOTHING;

    -- Petição 10: Tecnologia e Inclusão Digital
    INSERT INTO petitions (title, description, goal, status, slug, primary_color, created_by, collect_phone, collect_city, collect_state, collect_comment)
    VALUES (
        'Internet Gratuita em Praças Públicas',
        'A inclusão digital é fundamental para o exercício da cidadania no século XXI. Esta petição solicita a instalação de pontos de Wi-Fi gratuito em praças, parques e espaços públicos, permitindo que pessoas de baixa renda acessem serviços públicos online, busquem emprego e se mantenham informadas.',
        5500,
        'publicada',
        'internet-gratuita-pracas',
        '#8b5cf6',
        demo_user_id,
        false, true, true, true
    ) ON CONFLICT (slug) DO NOTHING;

    -- Petição 11: Juventude
    INSERT INTO petitions (title, description, goal, status, slug, primary_color, created_by, collect_phone, collect_city, collect_state, collect_comment)
    VALUES (
        'Primeiro Emprego Jovem',
        'Jovens enfrentam o paradoxo de precisar de experiência para conseguir emprego, mas não conseguem emprego para adquirir experiência. Esta petição exige programas de estágio remunerado em empresas públicas e incentivos fiscais para empresas privadas que contratem jovens em seu primeiro emprego.',
        4500,
        'publicada',
        'primeiro-emprego-jovem',
        '#0ea5e9',
        demo_user_id,
        true, true, true, true
    ) ON CONFLICT (slug) DO NOTHING;

    -- Petição 12: Moradia
    INSERT INTO petitions (title, description, goal, status, slug, primary_color, created_by, collect_phone, collect_city, collect_state, collect_comment)
    VALUES (
        'Habitação Digna para Famílias de Baixa Renda',
        'O déficit habitacional brasileiro afeta milhões de famílias que vivem em condições precárias. Esta petição exige a ampliação de programas de moradia popular, regularização fundiária em comunidades e investimento em saneamento básico. Moradia é um direito humano fundamental.',
        9000,
        'publicada',
        'habitacao-digna-baixa-renda',
        '#dc2626',
        demo_user_id,
        true, true, true, true
    ) ON CONFLICT (slug) DO NOTHING;

    RAISE NOTICE 'Petições demo criadas com sucesso para o usuário %', demo_user_id;
END $$;

-- Verificar petições criadas
SELECT title, slug, goal, status FROM petitions WHERE slug LIKE '%' ORDER BY created_date;
