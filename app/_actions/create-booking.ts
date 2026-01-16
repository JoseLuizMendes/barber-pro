"use server"

import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { authOptions } from "../_lib/auth"
import { createAppointment } from "../_services/api"

interface CreateBookingParams {
  serviceId: string
  barbershopId: string
  employeeId: string
  date: Date
}

export const createBooking = async (params: CreateBookingParams) => {
  const session = await getServerSession(authOptions)

  if (!session?.user || !("id" in session.user)) {
    throw new Error("Usuário não autenticado")
  }

  const user = session.user as { id: string; name?: string | null }

  console.log("=== CREATE BOOKING PARAMS ===", params)
  console.log("=== USER ===", user)

  try {
    // Map frontend data to backend API format
    const appointmentData = {
      customerName: user.name || "Cliente", // Map User.name to customerName
      customerPhone: "+5500000000000", // Hardcoded for now (as per requirements)
      serviceId: params.serviceId, // Map Service.id to serviceId
      startTime: params.date.toISOString(), // Map Date to ISO string
    }

    console.log("🚀 Criando appointment via API:", appointmentData)

    // Call external API to create appointment
    const appointment = await createAppointment(appointmentData)

    console.log("✅ APPOINTMENT CRIADO COM SUCESSO:", appointment.id)

    // Revalidate paths after success
    revalidatePath(`/barbershops/${params.barbershopId}`, "page")
    revalidatePath("/bookings", "page")

    return {
      id: appointment.id,
      scheduledAt: new Date(appointment.startTime),
      employee: {
        id: params.employeeId,
        user: { name: "Barbeiro" }, // Simplified since API doesn't return employee info
      },
    }
  } catch (error) {
    console.error("❌ ERRO AO CRIAR APPOINTMENT:", error)

    if (error instanceof Error) {
      throw error
    }

    throw new Error("Erro ao criar o agendamento")
  }
}

// NOTE: This function still uses Prisma for real-time availability checking
// It is kept here for backward compatibility with existing UI components
// TODO: Migrate to external API when availability endpoint becomes available
export const checkRealTimeAvailability = async ({
  barbershopId, // eslint-disable-line @typescript-eslint/no-unused-vars
  employeeId, // eslint-disable-line @typescript-eslint/no-unused-vars
  scheduledAt, // eslint-disable-line @typescript-eslint/no-unused-vars
}: {
  barbershopId: string
  employeeId: string
  scheduledAt: Date
}) => {
  // For now, we'll return always available since we're using external API
  // The external API should handle conflict checking internally
  console.warn(
    "⚠️ checkRealTimeAvailability is deprecated - using external API for booking creation",
  )

  return {
    isAvailable: true,
    conflictingBooking: null,
  }
}
