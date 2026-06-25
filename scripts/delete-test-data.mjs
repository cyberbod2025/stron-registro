import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdtjebvfoueubortsxre.supabase.co';
const supabaseKey = 'sb_publishable_U1kRWqhblC_HYqMAt1dV2Q_eYNbx5oG';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("🔍 Buscando registros de prueba...");

  // 1. Find attendance with test names
  const { data: testAttendance, error: err1 } = await supabase
    .from('attendance')
    .select('id, full_name, mobile, class_id')
    .or('full_name.ilike.%test%,full_name.ilike.%demo%,full_name.ilike.%walk-in%');

  if (err1) { console.error("Error querying attendance:", err1); return; }
  console.log(`\n📋 Attendance de prueba (${testAttendance?.length || 0}):`);
  testAttendance?.forEach(a => console.log(`  - ${a.full_name} | ${a.mobile} | class: ${a.class_id} | id: ${a.id}`));

  // 2. Find attendance with phone 5551234567
  const { data: phoneAttendance, error: err1b } = await supabase
    .from('attendance')
    .select('id, full_name, mobile, class_id')
    .eq('mobile', '5551234567');

  if (err1b) { console.error("Error querying attendance by phone:", err1b); return; }
  if (phoneAttendance?.length) {
    console.log(`\n📋 Attendance con teléfono 5551234567 (${phoneAttendance.length}):`);
    phoneAttendance.forEach(a => console.log(`  - ${a.full_name} | ${a.mobile} | class: ${a.class_id} | id: ${a.id}`));
  }

  // Combine and deduplicate
  const allTestAttIds = new Set();
  testAttendance?.forEach(a => allTestAttIds.add(a.id));
  phoneAttendance?.forEach(a => allTestAttIds.add(a.id));
  const testAttIds = [...allTestAttIds];

  // 3. Find students with test names/emails
  const { data: testStudents, error: err2 } = await supabase
    .from('students')
    .select('id, full_name, email, mobile')
    .or('full_name.ilike.%test%,email.ilike.%test%');

  if (err2) { console.error("Error querying students:", err2); return; }
  console.log(`\n📋 Students de prueba (${testStudents?.length || 0}):`);
  testStudents?.forEach(s => console.log(`  - ${s.full_name} | ${s.email} | ${s.mobile} | id: ${s.id}`));

  // 4. Find registrations linked to test students
  if (testStudents?.length) {
    const studentIds = testStudents.map(s => s.id);
    const { data: testRegs, error: err3 } = await supabase
      .from('registrations')
      .select('id, class_id, student_id')
      .in('student_id', studentIds);
    if (err3) { console.error("Error querying registrations:", err3); return; }
    console.log(`\n📋 Registrations de prueba (${testRegs?.length || 0}):`);
    testRegs?.forEach(r => console.log(`  - student: ${r.student_id} | class: ${r.class_id} | id: ${r.id}`));
  }

  // Delete if any found
  const confirm = process.argv.includes('--delete');
  if (!confirm) {
    console.log("\n⚠️  Para eliminar, ejecuta con --delete");
    return;
  }

  if (testAttIds.length > 0) {
    const { error } = await supabase.from('attendance').delete().in('id', testAttIds);
    if (error) { console.error("Error deleting attendance:", error); return; }
    console.log(`\n✅ ${testAttIds.length} attendance(s) eliminadas`);
  }

  const testStudentIds = testStudents?.map(s => s.id) || [];
  if (testStudentIds.length > 0) {
    const { error: errReg } = await supabase.from('registrations').delete().in('student_id', testStudentIds);
    if (errReg) { console.error("Error deleting registrations:", errReg); return; }
    console.log(`✅ ${testStudentIds.length} registration(s) eliminadas`);

    const { error: errDel } = await supabase.from('students').delete().in('id', testStudentIds);
    if (errDel) { console.error("Error deleting students:", errDel); return; }
    console.log(`✅ ${testStudentIds.length} student(s) eliminadas`);
  }

  console.log("\n🎉 Limpieza completada");
}

main();
