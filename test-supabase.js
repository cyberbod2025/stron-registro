const url = "https://uvnetpnjinxzhggoqmwz.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2bmV0cG5qaW54emhnZ29xbXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNzEzMzksImV4cCI6MjA4MTg0NzMzOX0.JyWCrAGDvaKpmcn3HRJHjoJmdbTg7VfaCXkomeyUBNw";

async function runTest() {
  console.log("=== PRUEBA DE RED SUPABASE ===");
  console.log(`URL Consultada: ${url}/rest/v1/classes?select=*`);
  
  const res = await fetch(`${url}/rest/v1/classes?select=*`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  
  const data = await res.json();
  console.log(`Status Recibido: ${res.status} ${res.statusText}`);
  console.log(`Registros de clases encontrados en producción: ${data.length}`);
  if(data.length > 0) {
    console.log("- " + data[0].title + " / " + data[0].date_str);
  }
}

runTest();
