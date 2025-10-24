"use client"

import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function AuthTabs() {
  const router = useRouter()

  // estados para cadastro
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [loadingRegister, setLoadingRegister] = useState(false)
  const [loadingLogin, setLoadingLogin] = useState(false)

  const handleRegister = async () => {
    // Validações frontend
    if (!registerName || registerName.length < 2) {
      toast.error("Nome deve ter no mínimo 2 caracteres")
      return
    }

    if (!registerEmail || !registerEmail.includes("@")) {
      toast.error("Email inválido")
      return
    }

    if (!registerPassword || registerPassword.length < 6) {
      toast.error("Senha deve ter no mínimo 6 caracteres")
      return
    }

    try {
      setLoadingRegister(true)
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Erro ao criar usuário")
        return
      }

      toast.success("Usuário criado com sucesso! Fazendo login...")

      // Fazer login automático
      const result = await signIn("credentials", {
        email: registerEmail,
        password: registerPassword,
        redirect: false,
      })

      if (result?.error) {
        toast.error(
          "Erro ao fazer login automático. Por favor, faça login manualmente.",
        )
        return
      }

      // Redirecionar para onboarding
      toast.success("Login realizado! Redirecionando para onboarding...")
      router.push("/adm/barber/onboarding")
    } catch (err) {
      console.error(err)
      toast.error("Erro inesperado ao criar usuário")
    } finally {
      setLoadingRegister(false)
    }
  }

  const handleLogin = async (formData: FormData) => {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      toast.error("Preencha todos os campos")
      return
    }

    try {
      setLoadingLogin(true)
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/adm", // redireciona pós-login
      })
    } finally {
      setLoadingLogin(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-md">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Cadastro</TabsTrigger>
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="login">
            <form
              action={handleLogin}
              className="flex flex-col gap-3 rounded-md border p-6 shadow"
            >
              <Input type="email" name="email" placeholder="Email" required />
              <Input
                type="password"
                name="password"
                placeholder="Senha"
                required
              />
              <Button type="submit" disabled={loadingLogin}>
                {loadingLogin ? "Entrando..." : "Entrar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => signIn("google")}
              >
                Login com Google
              </Button>
            </form>
          </TabsContent>

          {/* CADASTRO */}
          <TabsContent value="register">
            <div className="flex flex-col gap-3 rounded-md border p-6 shadow">
              <Input
                type="text"
                placeholder="Nome"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
              />
              <Input
                type="email"
                placeholder="Email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Senha"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
              <Button onClick={handleRegister} disabled={loadingRegister}>
                {loadingRegister ? "Cadastrando..." : "Cadastrar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => signIn("google")}
              >
                Login com Google
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
