import { db } from "@/app/_lib/prisma"
import { hash } from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 },
      )
    }

    // já checa se existe
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Usuário já existe" }, { status: 400 })
    }

    // gera hash da senha
    const hashedPassword = await hash(password, 10)

    // Adapte para incluir role ou outros campos obrigatórios do seu schema
    const newUser = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "USER", // ou "ADMIN", "BARBER", etc, conforme seu schema
      },
    })

    return NextResponse.json(
      { message: "Usuário criado com sucesso", user: newUser },
      { status: 201 },
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
