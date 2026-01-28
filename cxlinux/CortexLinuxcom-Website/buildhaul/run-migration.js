#!/usr/bin/env node

const fs = require('fs');
const https = require('https');

// Read SQL file
const sql = fs.readFileSync('./supabase/schema-updates.sql', 'utf8');

// Supabase connection details
const projectUrl = 'https://eisquevzdnlnjzgbjpsm.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpc3F1ZXZ6ZG5sbmp6Z2JqcHNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwMDMyMywiZXhwIjoyMDg0Mjc2MzIzfQ.go6xfLoEy07NUYJWiXO1J2H8tNv-2kLeKVlRmd1NPaA';

// Prepare the request
const data = JSON.stringify({
  query: sql
});

const options = {
  hostname: 'eisquevzdnlnjzgbjpsm.supabase.co',
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': serviceRoleKey,
    'Authorization': `Bearer ${serviceRoleKey}`,
    'Content-Length': data.length
  }
};

console.log('🚀 Running BuildHaul database migration...\n');
console.log('📊 SQL file size:', sql.length, 'characters');
console.log('🎯 Target:', projectUrl);
console.log('\nExecuting migration...\n');

// Try using Supabase's PostgREST API
// Since direct SQL execution via REST isn't available, we'll use the JS client
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(projectUrl, serviceRoleKey);

async function runMigration() {
  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      // Skip comments
      if (statement.startsWith('--')) continue;

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

        if (error) {
          // Some errors are OK (like "already exists")
          if (error.message.includes('already exists') ||
              error.message.includes('IF NOT EXISTS')) {
            console.log(`⚠️  Statement ${i + 1}: ${error.message.substring(0, 80)}... (OK - skipped)`);
          } else {
            console.error(`❌ Statement ${i + 1}: ${error.message}`);
            errorCount++;
          }
        } else {
          successCount++;
          if (i % 10 === 0) {
            console.log(`✅ Progress: ${i + 1}/${statements.length} statements executed`);
          }
        }
      } catch (err) {
        console.error(`❌ Error in statement ${i + 1}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with some errors (check above)');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Check if exec_sql RPC exists, if not, provide manual instructions
console.log('⚠️  Note: Supabase JS client cannot execute raw SQL directly.');
console.log('📝 You need to run the SQL in the Supabase Dashboard SQL Editor.\n');
console.log('Here\'s how:\n');
console.log('1. Open: https://supabase.com/dashboard/project/eisquevzdnlnjzgbjpsm/sql');
console.log('2. Click "New query"');
console.log('3. Copy the contents of: ./supabase/schema-updates.sql');
console.log('4. Paste into the SQL editor');
console.log('5. Click "Run" (or press Cmd/Ctrl + Enter)\n');
console.log('📁 SQL file location: ./supabase/schema-updates.sql');
console.log('📏 File size: 701 lines\n');

process.exit(0);
