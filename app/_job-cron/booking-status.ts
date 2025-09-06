import cron from "node-cron"
import { db } from "../_lib/prisma"
import { isBefore } from "date-fns"

// roda a cada 5 minutos
cron.schedule("*/5 * * * *", async () => {
  const now = new Date()

  const bookings = await db.booking.findMany({
    where: {
      status: "CONFIRMED",
    },
  })

  for (const booking of bookings) {
    if (isBefore(booking.scheduledAt, now)) {
      await db.booking.update({
        where: { id: booking.id },
        data: { status: "COMPLETED" },
      })
    }
  }

  console.log("✅ Verificação de agendamentos concluída")
})
