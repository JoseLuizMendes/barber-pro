import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import OnboardingForm from "./_components/onboarding-form"

export default async function OnboardingPage() {
  // Verificar autenticação
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/adm/login")
  }

  // Verificar se já tem perfil de barbeiro
  const existingBarber = await db.barber.findUnique({
    where: { userId: session.user.id },
  })

  if (existingBarber) {
    redirect("/adm/barber")
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Bem-vindo!</h1>
          <p className="mt-2 text-muted-foreground">
            Complete seu cadastro para começar a usar a plataforma
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  )
}
