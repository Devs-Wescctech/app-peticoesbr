import pool from '../config/database.js';
import { hashPassword } from './auth.js';

/**
 * Script de migração: users → auth_users + tenant padrão
 * 
 * Este script:
 * 1. Migra usuários existentes de `users` para `auth_users`
 * 2. Cria um tenant padrão para os dados existentes
 * 3. Associa todos os usuários migrados ao tenant padrão como owners
 * 
 * IMPORTANTE: Execute apenas uma vez!
 */

export async function migrateToMultiTenant() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando migração para multi-tenant...');
    
    await client.query('BEGIN');
    
    // 1. Verifica se já existe tenant padrão
    const tenantCheck = await client.query(
      `SELECT id FROM tenants WHERE slug = 'default' LIMIT 1`
    );
    
    let defaultTenantId;
    
    if (tenantCheck.rows.length === 0) {
      console.log('📦 Criando tenant padrão...');
      
      // Cria tenant padrão
      const tenantResult = await client.query(
        `INSERT INTO tenants (name, slug, database_url, plan, status)
         VALUES ($1, $2, $3, 'pro', 'active')
         RETURNING id`,
        ['Tenant Padrão', 'default', process.env.DATABASE_URL]
      );
      
      defaultTenantId = tenantResult.rows[0].id;
      console.log(`✅ Tenant padrão criado: ${defaultTenantId}`);
    } else {
      defaultTenantId = tenantCheck.rows[0].id;
      console.log(`✅ Tenant padrão já existe: ${defaultTenantId}`);
    }
    
    // 2. Migra usuários de `users` para `auth_users`
    console.log('👥 Migrando usuários...');
    
    const usersResult = await client.query(
      `SELECT id, email, password, full_name, avatar_url, email_verified, created_date 
       FROM users 
       WHERE email IS NOT NULL AND email != ''`
    );
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const user of usersResult.rows) {
      try {
        // Verifica se usuário já foi migrado
        const existingCheck = await client.query(
          `SELECT id FROM auth_users WHERE email = $1`,
          [user.email.toLowerCase()]
        );
        
        if (existingCheck.rows.length > 0) {
          console.log(`⏭️  Usuário ${user.email} já migrado`);
          skippedCount++;
          
          const authUserId = existingCheck.rows[0].id;
          
          // Garante que está no tenant padrão
          const tenantUserCheck = await client.query(
            `SELECT 1 FROM tenant_users WHERE tenant_id = $1 AND user_id = $2`,
            [defaultTenantId, authUserId]
          );
          
          if (tenantUserCheck.rows.length === 0) {
            await client.query(
              `INSERT INTO tenant_users (tenant_id, user_id, role, is_active)
               VALUES ($1, $2, 'owner', true)`,
              [defaultTenantId, authUserId]
            );
            console.log(`✅ Usuário ${user.email} adicionado ao tenant padrão`);
          }
          
          continue;
        }
        
        // Hash da senha (se não estiver hasheada)
        let passwordHash = user.password;
        
        // Se a senha não começa com $2, não é um hash bcrypt, então fazemos hash
        if (user.password && !user.password.startsWith('$2')) {
          passwordHash = await hashPassword(user.password);
        }
        
        // Insere em auth_users
        const authUserResult = await client.query(
          `INSERT INTO auth_users (email, password_hash, full_name, avatar_url, email_verified, created_date)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [
            user.email.toLowerCase(),
            passwordHash,
            user.full_name,
            user.avatar_url,
            user.email_verified || false,
            user.created_date
          ]
        );
        
        const authUserId = authUserResult.rows[0].id;
        
        // Adiciona ao tenant padrão como owner
        await client.query(
          `INSERT INTO tenant_users (tenant_id, user_id, role, is_active)
           VALUES ($1, $2, 'owner', true)`,
          [defaultTenantId, authUserId]
        );
        
        console.log(`✅ Migrado: ${user.email} → ${authUserId}`);
        migratedCount++;
      } catch (error) {
        console.error(`❌ Erro ao migrar ${user.email}:`, error.message);
        skippedCount++;
      }
    }
    
    await client.query('COMMIT');
    
    console.log('\n📊 Resumo da migração:');
    console.log(`   ✅ Usuários migrados: ${migratedCount}`);
    console.log(`   ⏭️  Usuários ignorados: ${skippedCount}`);
    console.log(`   📦 Tenant padrão: ${defaultTenantId}`);
    console.log('\n✅ Migração concluída com sucesso!');
    
    return {
      success: true,
      migratedCount,
      skippedCount,
      defaultTenantId,
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
  migrateToMultiTenant()
    .then(() => {
      console.log('🎉 Migração completa!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na migração:', error);
      process.exit(1);
    });
}
