const url = "https://xdtjebvfoueubortsxre.supabase.co";
const key = "sb_publishable_U1kRWqhblC_HYqMAt1dV2Q_eYNbx5oG";

async function runTest() {
  const tables = ['classes', 'students', 'registrations'];
  
  console.log("=== DIAGNÓSTICO DE RED SUPABASE (PROYECTO NUEVO) ===");
  for (let table of tables) {
    const res = await fetch(`${url}/rest/v1/${table}?select=*`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    console.log(`Tabla '${table}': ${res.status} ${res.statusText}`);
    
    if (res.status === 200 && table === 'classes') {
      const data = await res.json();
      console.log(` -> Clases encontradas: ${data.length}`);
    }
  }
}

runTest();
