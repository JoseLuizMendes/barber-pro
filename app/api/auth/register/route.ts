import { db } from "@/app/_lib/prisma"
import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validar dados com Zod
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || "Dados inválidos"
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 },
      )
    }

    const { email, password, name } = validation.data

    // Verificar se usuário já existe
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Usuário já existe com este email" },
        { status: 400 },
      )
    }

    // Gerar hash da senha
    const hashedPassword = await hash(password, 10)

    // Criar usuário com role BARBER
    const newUser = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "BARBER", // Define automaticamente como BARBER para admins
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso",
        user: newUser,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro ao registrar usuário:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    )
  }
}