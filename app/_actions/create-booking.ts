/* eslint-disable @typescript-eslint/no-unused-vars */
"use server"

import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { validateBookingAvailability } from "./get-service-employees"

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

  const userId = (session.user as { id: string }).id

  console.log("=== CREATE BOOKING PARAMS ===", params)
  console.log("=== USER ID ===", userId)

  // ✅ SOLUÇÃO 1: VALIDAÇÃO CRÍTICA ANTES DE CRIAR O BOOKING
  // Esta validação acontece no momento exato da confirmação
  const validation = await validateBookingAvailability({
    barbershopId: params.barbershopId,
    serviceId: params.serviceId,
    employeeId: params.employeeId,
    scheduledAt: params.date,
  })

  if (!validation.isValid) {
    console.log("❌ VALIDAÇÃO FALHOU:", validation.error)
    throw new Error(validation.error)
  }

  console.log("✅ VALIDAÇÃO PASSOU - Horário disponível")

  // ✅ SOLUÇÃO 2: TRANSAÇÃO ATÔMICA PARA EVITAR RACE CONDITIONS
  // Usar uma transação garante que a verificação e criação aconteçam atomicamente
  try {
    const newBooking = await db.$transaction(async (prisma) => {
      // ✅ DOUBLE-CHECK: Verificar novamente dentro da transação
      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          employeeId: params.employeeId,
          scheduledAt: params.date,
          status: {
            in: ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"],
          },
        },
      })

      if (conflictingBooking) {
        throw new Error(
          "Horário não está mais disponível - outro agendamento foi criado",
        )
      }

      // ✅ Verificar se o employee ainda existe e está ativo
      const employee = await prisma.employee.findFirst({
        where: {
          id: params.employeeId,
          barbershopId: params.barbershopId,
          isActive: true,
        },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      })

      if (!employee) {
        throw new Error("Funcionário não encontrado ou inativo")
      }

      // ✅ Verificar se o serviço ainda existe e está ativo
      const service = await prisma.barbershopService.findFirst({
        where: {
          id: params.serviceId,
          barbershopId: params.barbershopId,
          isActive: true,
        },
      })

      if (!service) {
        throw new Error("Serviço não encontrado ou inativo")
      }

      // ✅ CRIAR O BOOKING - só chega aqui se tudo estiver OK
      const booking = await prisma.booking.create({
        data: {
          userId,
          serviceId: params.serviceId,
          barbershopId: params.barbershopId,
          employeeId: params.employeeId,
          scheduledAt: params.date,
          status: "SCHEDULED", // ✅ Status explícito
          price: service.price,
        },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
          employee: {
            include: {
              user: {
                select: { id: true, name: true },
              },
            },
          },
        },
      })

      console.log("✅ BOOKING CRIADO COM SUCESSO:", booking.id)
      return booking
    })

    // ✅ Revalidar paths após sucesso
    revalidatePath(`/barbershops/${params.barbershopId}`, "page")
    revalidatePath("/bookings", "page")

    return {
      id: newBooking.id,
      scheduledAt: newBooking.scheduledAt,
      employee: newBooking.employee,
    }
  } catch (error) {
    console.error("❌ ERRO NA TRANSAÇÃO:", error)

    // ✅ Tratamento específico de erros
    if (error instanceof Error) {
      // Se é erro de conflito, relançar com mensagem específica
      if (error.message.includes("não está mais disponível")) {
        throw new Error(
          "Este horário acabou de ser reservado por outro cliente. Por favor, escolha outro horário.",
        )
      }
      throw error
    }

    throw new Error("Erro interno do servidor ao criar o agendamento")
  }
}

// ✅ SOLUÇÃO 3: FUNÇÃO PARA VERIFICAR DISPONIBILIDADE EM TEMPO REAL
// Esta função pode ser chamada pelo frontend para atualizar a UI
export const checkRealTimeAvailability = async ({
  barbershopId,
  employeeId,
  scheduledAt,
}: {
  barbershopId: string
  employeeId: string
  scheduledAt: Date
}) => {
  const conflictingBooking = await db.booking.findFirst({
    where: {
      employeeId,
      scheduledAt,
      barbershopId,
      status: {
        in: ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"],
      },
    },
  })

  return {
    isAvailable: !conflictingBooking,
    conflictingBooking: conflictingBooking
      ? {
          id: conflictingBooking.id,
          userId: conflictingBooking.userId,
        }
      : null,
  }
}

// ✅ SOLUÇÃO 4: LIMPEZA AUTOMÁTICA DE BOOKINGS EXPIRADOS
// Executar esta função periodicamente para liberar horários
export const cleanupExpiredBookings = async () => {
  const now = new Date()

  const expiredBookings = await db.booking.updateMany({
    where: {
      scheduledAt: {
        lt: now,
      },
      status: {
        in: ["SCHEDULED", "CONFIRMED"],
      },
    },
    data: {
      status: "COMPLETED",
    },
  })

  console.log(
    `✅ ${expiredBookings.count} bookings expirados foram atualizados`,
  )
  return expiredBookings.count
}

// ===== FUNÇÃO DE DEBUG MELHORADA =====
export const debugBookingConflicts = async () => {
  console.log("🔍 DEBUGANDO CONFLITOS DE AGENDAMENTO...")

  // Buscar bookings duplicados no mesmo horário/employee
  const duplicateBookings = await db.booking.findMany({
    where: {
      status: {
        in: ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"],
      },
    },
    orderBy: [{ employeeId: "asc" }, { scheduledAt: "asc" }],
  })

  // ✅ CORRIGIDO: Tipagem adequada para o Record
  const conflicts: Record<string, typeof duplicateBookings> = {}

  duplicateBookings.forEach((booking) => {
    const key = `${booking.employeeId}-${booking.scheduledAt.toISOString()}`
    if (!conflicts[key]) {
      conflicts[key] = []
    }
    conflicts[key].push(booking)
  })

  // Filtrar apenas conflitos reais (mais de 1 booking no mesmo slot)
  const realConflicts = Object.entries(conflicts).filter(
    ([_, bookings]) => bookings.length > 1,
  )

  console.log("⚠️ CONFLITOS ENCONTRADOS:", realConflicts.length)

  realConflicts.forEach(([key, bookings]) => {
    console.log(`🚨 Conflito em ${key}:`)
    bookings.forEach((booking) => {
      console.log(`  - Booking ID: ${booking.id}, User: ${booking.userId}`)
    })
  })

  return realConflicts
}
