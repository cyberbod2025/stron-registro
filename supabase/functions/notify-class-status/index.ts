import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID') || ""
const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY') || ""

serve(async (req) => {
  try {
    const payload = await req.json()
    console.log("Webhook payload received:", payload)

    // Solo procesamos UPDATE o INSERT en la tabla classes
    if (payload.table !== 'classes') {
      return new Response("Not a class update", { status: 200 })
    }

    const newRow = payload.record
    const oldRow = payload.old_record

    let messageHeading = ""
    let messageContent = ""

    if (payload.type === 'INSERT') {
      messageHeading = "¡Nueva Clase Disponible! 💪"
      messageContent = `Reserva tu lugar para la clase del ${newRow.date_str} a las ${newRow.time_str}.`
    } else if (payload.type === 'UPDATE' && newRow.status !== oldRow.status) {
      if (newRow.status === 'confirmada') {
        messageHeading = "✅ ¡Clase Confirmada!"
        messageContent = `La clase del ${newRow.date_str} a las ${newRow.time_str} está confirmada. ¡Te esperamos!`
      } else if (newRow.status === 'suspendida') {
        messageHeading = "❌ Clase Cancelada"
        messageContent = `La clase del ${newRow.date_str} a las ${newRow.time_str} ha sido cancelada por no alcanzar el mínimo. ¡Nos vemos en la próxima!`
      } else {
        // No enviamos notificaciones para otros estados
        return new Response("No notification required for this status", { status: 200 })
      }
    } else {
      return new Response("No relevant change", { status: 200 })
    }

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      console.warn("OneSignal credentials not set. Skipping push notification.")
      return new Response("Credentials missing, but processed OK", { status: 200 })
    }

    // Call OneSignal API
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["Subscribed Users"], // Puedes enviar a todos los usuarios, o filtrar por player_ids
        headings: { "en": messageHeading, "es": messageHeading },
        contents: { "en": messageContent, "es": messageContent },
      })
    })

    const result = await response.json()
    console.log("OneSignal Response:", result)

    return new Response(JSON.stringify({ success: true, message: "Notification sent" }), { 
      headers: { 'Content-Type': 'application/json' },
      status: 200 
    })

  } catch (error) {
    console.error("Error processing webhook:", error)
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { 'Content-Type': 'application/json' },
      status: 400 
    })
  }
})
