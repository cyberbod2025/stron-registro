import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdtjebvfoueubortsxre.supabase.co';
const supabaseKey = 'sb_publishable_U1kRWqhblC_HYqMAt1dV2Q_eYNbx5oG';
const supabase = createClient(supabaseUrl, supabaseKey);

async function tryDirectDelete(ids) {
  const { error } = await supabase.from('attendance').delete().in('id', ids);
  if (error) throw new Error(`Direct delete failed (RLS): ${error.message}`);
  // Verify deletion
  const { data: check } = await supabase.from('attendance').select('id').in('id', ids);
  return check?.length === 0;
}

async function tryRpcDelete() {
  try {
    const { error } = await supabase.rpc('delete_test_data');
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log("🔍 Buscando registros de prueba...");

  const { data: testAtt, error: e1 } = await supabase
    .from('attendance')
    .select('id, full_name, mobile, class_id')
    .or('full_name.ilike.%test%,full_name.ilike.%demo%,full_name.ilike.%walk-in%');
  if (e1) { console.error("Error:", e1); return; }
  console.log(`\n📋 Attendance de prueba (${testAtt?.length || 0}):`);
  testAtt?.forEach(a => console.log(`  - ${a.full_name} | ${a.mobile} | ${a.class_id} | ${a.id}`));

  const { data: phoneAtt } = await supabase
    .from('attendance')
    .select('id, full_name, mobile, class_id')
    .eq('mobile', '5551234567');
  if (phoneAtt?.length) {
    console.log(`\n📋 Attendance con teléfono 5551234567 (${phoneAtt.length}):`);
    phoneAtt.forEach(a => console.log(`  - ${a.full_name} | ${a.mobile} | ${a.class_id} | ${a.id}`));
  }

  const allIds = new Set();
  testAtt?.forEach(a => allIds.add(a.id));
  phoneAtt?.forEach(a => allIds.add(a.id));
  const attIds = [...allIds];

  const { data: testStudents } = await supabase
    .from('students')
    .select('id, full_name, email, mobile')
    .or('full_name.ilike.%test%,email.ilike.%test%');
  console.log(`\n📋 Students de prueba (${testStudents?.length || 0}):`);
  testStudents?.forEach(s => console.log(`  - ${s.full_name} | ${s.email} | ${s.mobile} | ${s.id}`));

  if (testStudents?.length) {
    const { data: testRegs } = await supabase
      .from('registrations')
      .select('id, class_id, student_id')
      .in('student_id', testStudents.map(s => s.id));
    console.log(`\n📋 Registrations (${testRegs?.length || 0}):`);
    testRegs?.forEach(r => console.log(`  - student: ${r.student_id} | class: ${r.class_id} | id: ${r.id}`));
  }

  const confirm = process.argv.includes('--delete');
  if (!confirm) {
    console.log("\n⚠️  Para eliminar, ejecuta con --delete");
    return;
  }

  if (attIds.length === 0 && (!testStudents || testStudents.length === 0)) {
    console.log("\n✅ No hay datos de prueba que eliminar");
    return;
  }

  // Try RPC first (bypasses RLS)
  console.log("\n🔄 Intentando vía RPC...");
  const rpcOk = await tryRpcDelete();
  if (rpcOk) {
    // Verify
    const { data: check } = await supabase
      .from('students')
      .select('id')
      .or('full_name.ilike.%test%,email.ilike.%test%');
    if (!check?.length) {
      console.log("✅ Datos eliminados vía RPC");
      return;
    }
    console.log("⚠️  RPC no eliminó todo, intentando directo...");
  }

  // Try direct (may fail due to RLS)
  if (attIds.length > 0) {
    try {
      const ok = await tryDirectDelete(attIds);
      if (ok) console.log(`✅ ${attIds.length} attendance(s) eliminadas`);
      else console.log("⚠️  No se pudieron eliminar las attendances (RLS)");
    } catch (err) {
      console.log(`⚠️  ${err.message}`);
    }
  }

  const studentIds = testStudents?.map(s => s.id) || [];
  if (studentIds.length > 0) {
    const { error: er } = await supabase.from('registrations').delete().in('student_id', studentIds);
    if (er) console.log(`⚠️  No se pudieron eliminar registrations (RLS): ${er.message}`);
    else console.log(`✅ registrations eliminadas`);

    const { error: es } = await supabase.from('students').delete().in('id', studentIds);
    if (es) console.log(`⚠️  No se pudieron eliminar students (RLS): ${es.message}`);
    else console.log(`✅ students eliminadas`);
  }

  console.log("\n⚠️  Si no se eliminaron, ejecuta en Supabase SQL Editor:");
  console.log("   scripts/delete-test-data.sql");
}

main();
