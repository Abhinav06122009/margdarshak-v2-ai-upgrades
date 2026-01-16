import { createClient } from '@supabase/supabase-js';

// ==========================================
// ⚠️ PASTE YOUR CREDENTIALS HERE TO TEST
// ==========================================
const SUPABASE_URL = 'https://orkoqwrdfygfkqqerqvh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ya29xd3JkZnlnZmtxcWVycXZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTY2NTUyMywiZXhwIjoyMDYxMjQxNTIzfQ.jQN1dOvqz-Bm6uQM074YlLOp2LLl6oBGyRMNsuUPcC8'; 

async function testConnection() {
  console.log("\n🏥 Running Margdarshak Connection Doctor...\n");

  // 1. VALIDATE URL FORMAT
  if (!SUPABASE_URL.startsWith("https://") || !SUPABASE_URL.includes(".supabase.co")) {
    console.error("❌ ERROR: Invalid URL Format!");
    console.error(`   Current: ${SUPABASE_URL}`);
    console.error("   Expected: https://<project_id>.supabase.co");
    return;
  }

  // 2. VALIDATE KEY FORMAT
  if (!SUPABASE_KEY.startsWith("ey")) {
    console.error("❌ ERROR: Invalid Key Format!");
    console.error("   Supabase keys must start with 'ey...' (JWT format).");
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log("📡 Attempting to contact Supabase Database...");

  // 3. TRY A SIMPLE SELECT (Tests Connection & Table Existence)
  const { data, error } = await supabase.from('ai_knowledge').select('*').limit(1);

  if (error) {
    console.error("❌ CONNECTION FAILED");
    console.error("---------------------------------------------------");
    // Print the FULL error object to see the real issue
    console.dir(error, { depth: null }); 
    console.error("---------------------------------------------------");
    
    if (error.code === '42P01') {
      console.error("💡 DIAGNOSIS: The table 'ai_knowledge' DOES NOT EXIST.");
      console.error("   Action: Go to Supabase SQL Editor and run the table creation script.");
    } else if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
      console.error("💡 DIAGNOSIS: Permission Denied.");
      console.error("   Action: You are likely using the ANON Key. Use the SERVICE_ROLE_KEY.");
    }
  } else {
    console.log("✅ SUCCESS! Connected to Supabase.");
    console.log("✅ Table 'ai_knowledge' exists and is accessible.");
    console.log(`📊 Current Row Count: ${data.length} (If 0, table is empty but ready)`);
    console.log("\n👉 You can now run 'node train-ai.js' with confidence.");
  }
}

testConnection();