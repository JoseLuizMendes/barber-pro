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

export default function AuthTabs() {
  // estados para cadastro
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    try {
      setLoading(true)
      const res = await fetch("app/api/auth/register", {
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
        alert(data.error || "Erro ao criar usuário")
        return
      }

      alert("Usuário criado com sucesso! Faça login.")
    } catch (err) {
      console.error(err)
      alert("Erro inesperado")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (formData: FormData) => {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/adm", // redireciona pós-login
    })
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
              <Button type="submit">Entrar</Button>
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
              <Button onClick={handleRegister} disabled={loading}>
                {loading ? "Cadastrando..." : "Cadastrar"}
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
