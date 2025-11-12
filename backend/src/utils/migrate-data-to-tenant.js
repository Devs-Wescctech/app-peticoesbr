import pool from '../config/database.js';

/**
 * Script de migração: Associa dados existentes ao tenant padrão
 * 
 * Este script:
 * 1. Busca o tenant padrão (slug='default')
 * 2. Atualiza todos os registros sem tenant_id para apontarem para o tenant padrão
 * 3. Garante isolamento de dados por tenant
 * 
 * IMPORTANTE: Execute apenas uma vez após adicionar as colunas tenant_id
 */

export async function migrateDataToTenant() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando migração de dados para tenant padrão...');
    
    await client.query('BEGIN');
    
    // 1. Busca tenant padrão
    const tenantResult = await client.query(
      `SELECT id, name FROM tenants WHERE slug = 'default' LIMIT 1`
    );
    
    if (tenantResult.rows.length === 0) {
      throw new Error('Tenant padrão não encontrado! Execute migrate-to-multi-tenant.js primeiro.');
    }
    
    const defaultTenantId = tenantResult.rows[0].id;
    console.log(`✅ Tenant padrão encontrado: ${tenantResult.rows[0].name} (${defaultTenantId})`);
    
    // 2. Migra petitions
    const petitionsResult = await client.query(
      `UPDATE petitions 
       SET tenant_id = $1 
       WHERE tenant_id IS NULL
       RETURNING id`,
      [defaultTenantId]
    );
    console.log(`✅ Petições migradas: ${petitionsResult.rowCount}`);
    
    // 3. Migra campaigns
    const campaignsResult = await client.query(
      `UPDATE campaigns 
       SET tenant_id = $1 
       WHERE tenant_id IS NULL
       RETURNING id`,
      [defaultTenantId]
    );
    console.log(`✅ Campanhas migradas: ${campaignsResult.rowCount}`);
    
    // 4. Migra message_templates
    const templatesResult = await client.query(
      `UPDATE message_templates 
       SET tenant_id = $1 
       WHERE tenant_id IS NULL
       RETURNING id`,
      [defaultTenantId]
    );
    console.log(`✅ Templates migrados: ${templatesResult.rowCount}`);
    
    // 5. Migra linkbio_pages
    const linkbioResult = await client.query(
      `UPDATE linkbio_pages 
       SET tenant_id = $1 
       WHERE tenant_id IS NULL
       RETURNING id`,
      [defaultTenantId]
    );
    console.log(`✅ Páginas LinkBio migradas: ${linkbioResult.rowCount}`);
    
    // 6. Migra linktree_pages
    const linktreeResult = await client.query(
      `UPDATE linktree_pages 
       SET tenant_id = $1 
       WHERE tenant_id IS NULL
       RETURNING id`,
      [defaultTenantId]
    );
    console.log(`✅ Páginas LinkTree migradas: ${linktreeResult.rowCount}`);
    
    await client.query('COMMIT');
    
    console.log('\n📊 Resumo da migração:');
    console.log(`   📦 Tenant padrão: ${defaultTenantId}`);
    console.log(`   📄 Petições: ${petitionsResult.rowCount}`);
    console.log(`   📧 Campanhas: ${campaignsResult.rowCount}`);
    console.log(`   📝 Templates: ${templatesResult.rowCount}`);
    console.log(`   🔗 LinkBio: ${linkbioResult.rowCount}`);
    console.log(`   🌳 LinkTree: ${linktreeResult.rowCount}`);
    console.log('\n✅ Migração de dados concluída com sucesso!');
    
    return {
      success: true,
      tenantId: defaultTenantId,
      migrated: {
        petitions: petitionsResult.rowCount,
        campaigns: campaignsResult.rowCount,
        templates: templatesResult.rowCount,
        linkbio: linkbioResult.rowCount,
        linktree: linktreeResult.rowCount,
      },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na migração:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Se executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateDataToTenant()
    .then(() => {
      console.log('🎉 Migração completa!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na migração:', error);
      process.exit(1);
    });
}
