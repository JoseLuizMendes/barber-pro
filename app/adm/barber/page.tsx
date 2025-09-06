//import Header from "@/app/_components/header"
import HeaderAdm from "@/app/_components-adm/header-adm"
import { Card, CardContent } from "@/app/_components/ui/card"
import { db } from "@/app/_lib/prisma"
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from "date-fns"
import {
  Clock9Icon,
  CogIcon,
  TrendingUpIcon,
  User2Icon,
  UserRoundPen,
  Users2Icon,
  WalletIcon,
} from "lucide-react"
import Link from "next/link"

interface BarberPageAdmProps {
  params: {
    id: string
    employeeId: string
    scheduledAt: Date
    serviceId: string
    status: string
    userId: string
  }
}

const BarberPage = async ({}: BarberPageAdmProps) => {
  const today = new Date()

  const bookings = await db.booking.findMany({
    where: {
      scheduledAt: {
        gte: startOfDay(today),
        lte: endOfDay(today),
      },
      status: {
        in: ["CONFIRMED", "COMPLETED", "SCHEDULED"], // pega todos relevantes
      },
    },
    include: {
      service: true,
      user: true,
    },
  })

  const revenue = await db.booking.aggregate({
    _sum: {
      price: true,
    },
    where: {
      status: "COMPLETED",
      scheduledAt: {
        gte: startOfMonth(new Date()),
        lte: endOfMonth(new Date()),
      },
    },
  })

  const monthlyRevenue = revenue._sum?.price?.toNumber() ?? 0

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderAdm />

      <div className="flex-row border-b border-solid p-5">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Linha de cards principais */}
        <div className="flex gap-4 p-5 py-5 text-center sm:flex-row">
          {/* Agendamentos Hoje */}
          <Link href="/adm/barber/bookings">
            <Card className="flex min-w-48 max-w-48">
              <CardContent className="mt-2 flex items-start gap-2 px-5">
                <User2Icon className="mt-1 h-4 w-4 text-primary" />
                <div className="text-center">
                  <h3 className="whitespace-nowrap py-0.5 text-sm">
                    Agendamentos Hoje
                  </h3>
                  <span className="mr-7 text-2xl">{bookings.length}</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Receita do Mês */}
          <Link href="/adm/barber/revenues">
            <Card className="flex min-w-48 max-w-48 cursor-pointer transition hover:shadow-lg">
              <CardContent className="mt-2 flex items-start gap-2 px-5">
                <WalletIcon className="mt-1 h-4 w-4 text-primary" />
                <div>
                  <h3 className="whitespace-nowrap py-0.5 text-sm">
                    Receita do Mês
                  </h3>
                  <span className="block text-2xl">
                    {monthlyRevenue.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Linha de cards secundários */}
        <div className="flex gap-4 p-5 py-0 text-center sm:flex-row">
          {/* Clientes Ativos */}
          <Card className="flex min-w-48 max-w-48">
            <CardContent className="mt-2 flex items-start gap-2 px-5">
              <Users2Icon className="mt-1 h-4 w-4 text-primary" />
              <div>
                <h3 className="whitespace-nowrap py-0.5 text-sm">
                  Clientes Ativos
                </h3>
                <span className="block text-2xl">{bookings.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Serviços Populares */}
          <Card className="flex min-w-48 max-w-48">
            <CardContent className="mt-2 flex items-start gap-2 px-5">
              <TrendingUpIcon className="mt-1 h-4 w-4 text-primary" />
              <div>
                <h3 className="whitespace-nowrap py-0.5 text-sm">
                  Serviços Populares
                </h3>
                <span className="block text-2xl">{bookings.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex-grow">
        <div className="flex-col p-5">
          <h1 className="text-2xl font-bold">Gerenciamento</h1>
          <div className="mt-4 flex gap-4 p-5 sm:flex-row">
            <Card className="min-w-48 max-w-48">
              <CardContent className="mt-2 flex items-start gap-2 px-5">
                <Clock9Icon className="mt-1 h-4 w-4 text-primary" />
                <Link
                  href="/adm/barber/bookings"
                  className="w-full gap-0 whitespace-nowrap text-center"
                >
                  Horarios
                </Link>
              </CardContent>
            </Card>
            <Card className="min-w-48 max-w-48">
              <CardContent className="mt-2 flex items-start gap-2 px-5">
                <CogIcon className="mt-1 h-5 w-5 text-primary" />
                <Link
                  href="/adm/barber/services"
                  className="w-full text-center"
                >
                  Gerenciar Serviços
                </Link>
              </CardContent>
            </Card>
          </div>
          <div className="flex gap-4 p-5 py-0 sm:flex-row">
            <Card className="min-w-48 max-w-48">
              <CardContent className="mt-2 flex items-start gap-2 px-5">
                <UserRoundPen className="mt-1 h-5 w-5 text-primary" />
                <Link
                  href="/adm/barber/employees"
                  className="w-full text-center"
                >
                  Gerenciar Barbeiros
                </Link>
              </CardContent>
            </Card>
            <Card className="min-w-48 max-w-48">
              <CardContent className="mt-2 flex items-start gap-2 px-5">
                <Users2Icon className="mt-1 h-4 w-4 text-primary" />
                <Link href="/adm/barber/clients" className="w-full text-center">
                  Gerenciar Clientes
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BarberPage
