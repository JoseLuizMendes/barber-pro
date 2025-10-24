import { db } from "@/app/_lib/prisma"
import { completeOnboardingSchema } from "@/lib/validations/barber-onboarding"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/_lib/auth"

export async function POST(req: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const userId = session.user.id

    // Verificar se o usuário tem role BARBER
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user || user.role !== "BARBER") {
      return NextResponse.json(
        {
          error: "Apenas usuários com role BARBER podem completar o onboarding",
        },
        { status: 403 },
      )
    }

    // Verificar se já existe um perfil de barbeiro
    const existingBarber = await db.barber.findUnique({
      where: { userId },
    })

    if (existingBarber) {
      return NextResponse.json(
        { error: "Perfil de barbeiro já existe" },
        { status: 400 },
      )
    }

    // Validar dados recebidos
    const body = await req.json()
    const validatedData = completeOnboardingSchema.parse(body)

    // Criar Barbershop e Barber em uma transação
    const result = await db.$transaction(async (tx) => {
      // Criar a Barbearia primeiro
      const barbershop = await tx.barbershop.create({
        data: {
          name: validatedData.name,
          address: validatedData.address,
          phones: validatedData.phones,
          description: validatedData.description,
          imageUrl: validatedData.imageUrl,
          openingHours: (validatedData.openingHours as object) || {},
          isActive: true,
        },
      })

      // Criar o perfil de Barbeiro vinculado ao usuário e à barbearia
      const barber = await tx.barber.create({
        data: {
          userId,
          licenseNumber: validatedData.licenseNumber,
          specialties: validatedData.specialties,
          yearsOfExperience: validatedData.yearsOfExperience,
          barbershopId: barbershop.id,
        },
      })

      return { barber, barbershop }
    })

    return NextResponse.json(
      {
        message: "Onboarding concluído com sucesso",
        data: result,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro no onboarding:", error)

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: error },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    )
  }
}
