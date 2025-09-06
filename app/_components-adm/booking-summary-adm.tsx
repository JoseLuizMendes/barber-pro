import { BarbershopService } from "@prisma/client"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent } from "../_components/ui/card"
import { Avatar, AvatarImage } from "../_components/ui/avatar"

interface BookingSummaryAdmProps {
  service: Pick<BarbershopService, "name" | "price">
  selectedDate: Date
  // ✅ Aceitar employee de diferentes formatos
  employee?:
    | { id: string; name: string } // Formato direto do service-item
    | { id: string; user: { name: string | null } } // Formato do getServiceEmployees
    | null
  client: { name: string | null; image?: string | null }
}

const BookingSummaryAdm = ({
  service,
  selectedDate,
  employee,
  client,
}: BookingSummaryAdmProps) => {
  // ✅ Função para extrair o nome do employee independente do formato
  const getEmployeeName = (): string => {
    if (!employee) return "Não selecionado"

    // Se tem propriedade 'name' diretamente
    if ("name" in employee && employee.name) {
      return employee.name
    }

    // Se tem propriedade 'user' com 'name'
    if ("user" in employee && employee.user?.name) {
      return employee.user.name
    }

    return "Nome não informado"
  }

  const employeeName = getEmployeeName()

  const newFormatName = client.name?.toLowerCase()

  return (
    <Card>
      <CardContent className="space-y-3 p-3">
        <h2 className="border-b pb-3 text-center text-lg font-bold">
          Resumo do Agendamento
        </h2>

        {/* Cliente */}
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={client.image ?? "/default-avatar.png"} />
          </Avatar>
          <p className="font-medium capitalize">{newFormatName ?? "Cliente"}</p>
        </div>

        {/* Serviço e Preço */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold">{service.name}</h3>
          <p className="text-sm font-bold text-primary">
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Number(service.price))}
          </p>
        </div>

        {/* Data */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Data</span>
          <p className="text-sm font-medium">
            {format(selectedDate, "d 'de' MMMM", {
              locale: ptBR,
            })}
          </p>
        </div>

        {/* Horário */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Horário</span>
          <p className="text-sm font-medium">{format(selectedDate, "HH:mm")}</p>
        </div>

        {/* ✅ Barbeiro - compatível com diferentes formatos */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Barbeiro</span>
          <p
            className={`text-sm font-medium ${employeeName === "Não selecionado" ? "text-red-400" : ""}`}
          >
            {employeeName}
          </p>
        </div>

        {/* Barbearia */}
        {/* Nome do Cliente (no lugar da Barbearia) */}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Cliente</span>
          <p className="text-sm font-medium capitalize">
            {newFormatName ?? "Cliente"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingSummaryAdm
