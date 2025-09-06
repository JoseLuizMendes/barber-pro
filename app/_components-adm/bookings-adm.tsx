import { Avatar, AvatarImage } from "@/app/_components/ui/avatar"
import { Badge } from "@/app/_components/ui/badge"
import { Button } from "@/app/_components/ui/button"
import { Card, CardContent } from "@/app/_components/ui/card"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/_components/ui/sheet"
import { db } from "@/app/_lib/prisma"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import BookingSummaryAdm from "./booking-summary-adm"
import HeaderAdm from "./header-adm"

const BookngsAdmPage = async () => {
  const bookings = await db.booking.findMany({
    where: {
      status: {
        in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"],
      },
    },
    include: {
      user: true,

      service: { include: { barbershop: true } },
      employee: { include: { user: true } },
    },
    orderBy: { scheduledAt: "asc" },
  })

  const newFormatName = bookings[0]?.user.name?.toLowerCase()

  return (
    <div className="min-h-screen">
      <HeaderAdm />

      <div className="space-y-4 p-6">
        <h1 className="mb-4 text-xl font-bold">Agendamentos</h1>

        {bookings.map((booking) => {
          const employeeData = booking.employee
            ? {
                id: booking.employee.id,
                name: booking.employee.user?.name ?? "",
              }
            : null

          const statusLabel =
            booking.status === "CONFIRMED"
              ? "Confirmado"
              : booking.status === "IN_PROGRESS"
                ? "Em andamento"
                : "Finalizado"

          const statusVariant =
            booking.status === "CONFIRMED"
              ? "default"
              : booking.status === "IN_PROGRESS"
                ? "outline"
                : "secondary"

          return (
            <Sheet key={booking.id}>
              <SheetTrigger className="w-full min-w-[90%]">
                <Card>
                  <CardContent className="flex justify-between p-0">
                    {/* ESQUERDA */}
                    <div className="flex flex-col gap-2 py-5 pl-5">
                      <Badge className="w-fit" variant={statusVariant}>
                        {statusLabel}
                      </Badge>

                      <h3 className="font-semibold">{booking.service.name}</h3>

                      {/* Cliente */}
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={booking.user.image ?? "/default-avatar.png"}
                          />
                        </Avatar>
                        <p className="text-sm capitalize">
                          {newFormatName ?? "Cliente"}
                        </p>
                      </div>

                      {/* Barbeiro */}
                      {employeeData ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            Barbeiro:
                          </span>
                          <p className="text-xs font-medium">
                            {employeeData.name}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            Barbeiro:
                          </span>
                          <p className="text-xs font-medium text-red-400">
                            Não atribuído
                          </p>
                        </div>
                      )}
                    </div>

                    {/* DIREITA */}
                    <div className="flex flex-col items-center justify-center border-l-2 border-solid px-5">
                      <p className="text-sm capitalize">
                        {format(booking.scheduledAt, "MMMM", { locale: ptBR })}
                      </p>
                      <p className="text-2xl">
                        {format(booking.scheduledAt, "dd", { locale: ptBR })}
                      </p>
                      <p className="text-sm">
                        {format(booking.scheduledAt, "HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </SheetTrigger>

              <SheetContent className="w-[85%]">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    Informações da Reserva
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6">
                  <Badge className="w-fit" variant={statusVariant}>
                    {statusLabel}
                  </Badge>

                  <div className="mb-3 mt-6">
                    {/* ✅ Passando também o cliente */}
                    <BookingSummaryAdm
                      service={booking.service}
                      selectedDate={booking.scheduledAt}
                      employee={employeeData}
                      client={booking.user}
                    />
                  </div>
                </div>

                <SheetFooter className="mt-6">
                  <SheetClose asChild>
                    <Button variant="outline" className="w-full">
                      Voltar
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          )
        })}
      </div>
    </div>
  )
}

export default BookngsAdmPage
