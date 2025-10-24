"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { Textarea } from "@/app/_components/ui/textarea"
import { Checkbox } from "@/app/_components/ui/checkbox"
import { Progress } from "@/app/_components/ui/progress"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card"
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  type Step1Data,
  type Step2Data,
  type Step3Data,
  type Step4Data,
} from "@/lib/validations/barber-onboarding"
import { Trash2Icon } from "lucide-react"

const SPECIALTIES = [
  "Corte Masculino",
  "Barba",
  "Cabelo e Barba",
  "Corte Infantil",
  "Coloração",
  "Tratamentos",
]

const DAYS_OF_WEEK = [
  { key: "segunda", label: "Segunda" },
  { key: "terca", label: "Terça" },
  { key: "quarta", label: "Quarta" },
  { key: "quinta", label: "Quinta" },
  { key: "sexta", label: "Sexta" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
]

export default function OnboardingForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Estado dos dados
  const [step1Data, setStep1Data] = useState<Partial<Step1Data>>({
    licenseNumber: "",
    specialties: [],
    yearsOfExperience: undefined,
  })

  const [step2Data, setStep2Data] = useState<Partial<Step2Data>>({
    name: "",
    address: "",
    phones: [""],
  })

  const [step3Data, setStep3Data] = useState<Partial<Step3Data>>({
    description: "",
    openingHours: {},
  })

  const [step4Data, setStep4Data] = useState<Partial<Step4Data>>({
    imageUrl: "",
  })

  const progress = (currentStep / 4) * 100

  const handleSpecialtyToggle = (specialty: string) => {
    setStep1Data((prev) => {
      const currentSpecialties = prev.specialties || []
      const isSelected = currentSpecialties.includes(specialty)

      return {
        ...prev,
        specialties: isSelected
          ? currentSpecialties.filter((s) => s !== specialty)
          : [...currentSpecialties, specialty],
      }
    })
  }

  const handleAddPhone = () => {
    setStep2Data((prev) => ({
      ...prev,
      phones: [...(prev.phones || []), ""],
    }))
  }

  const handleRemovePhone = (index: number) => {
    setStep2Data((prev) => ({
      ...prev,
      phones: (prev.phones || []).filter((_, i) => i !== index),
    }))
  }

  const handlePhoneChange = (index: number, value: string) => {
    setStep2Data((prev) => {
      const newPhones = [...(prev.phones || [])]
      newPhones[index] = value
      return { ...prev, phones: newPhones }
    })
  }

  const handleDayHoursChange = (
    day: string,
    field: "open" | "close",
    value: string,
  ) => {
    setStep3Data((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          open:
            field === "open"
              ? value
              : (
                  prev.openingHours?.[day] as
                    | { open: string; close: string }
                    | undefined
                )?.open || "",
          close:
            field === "close"
              ? value
              : (
                  prev.openingHours?.[day] as
                    | { open: string; close: string }
                    | undefined
                )?.close || "",
        },
      },
    }))
  }

  const validateStep1 = () => {
    try {
      // Converter yearsOfExperience para number ou null
      const years = step1Data.yearsOfExperience
      const dataToValidate = {
        ...step1Data,
        yearsOfExperience:
          years !== undefined && years !== null && typeof years === "number"
            ? years
            : null,
      }
      step1Schema.parse(dataToValidate)
      return true
    } catch (error) {
      const message =
        error instanceof Error && "errors" in error
          ? (error as { errors: { message: string }[] }).errors?.[0]?.message ||
            "Dados inválidos"
          : "Dados inválidos"
      toast.error(message)
      return false
    }
  }

  const validateStep2 = () => {
    try {
      // Filtrar telefones vazios
      const dataToValidate = {
        ...step2Data,
        phones: (step2Data.phones || []).filter((p) => p.trim() !== ""),
      }
      step2Schema.parse(dataToValidate)
      return true
    } catch (error) {
      const message =
        error instanceof Error && "errors" in error
          ? (error as { errors: { message: string }[] }).errors?.[0]?.message ||
            "Dados inválidos"
          : "Dados inválidos"
      toast.error(message)
      return false
    }
  }

  const validateStep3 = () => {
    try {
      step3Schema.parse(step3Data)
      return true
    } catch (error) {
      const message =
        error instanceof Error && "errors" in error
          ? (error as { errors: { message: string }[] }).errors?.[0]?.message ||
            "Dados inválidos"
          : "Dados inválidos"
      toast.error(message)
      return false
    }
  }

  const validateStep4 = () => {
    try {
      step4Schema.parse(step4Data)
      return true
    } catch (error) {
      const message =
        error instanceof Error && "errors" in error
          ? (error as { errors: { message: string }[] }).errors?.[0]?.message ||
            "Dados inválidos"
          : "Dados inválidos"
      toast.error(message)
      return false
    }
  }

  const handleNext = () => {
    let isValid = false

    switch (currentStep) {
      case 1:
        isValid = validateStep1()
        break
      case 2:
        isValid = validateStep2()
        break
      case 3:
        isValid = validateStep3()
        break
      case 4:
        isValid = validateStep4()
        break
    }

    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep4()) return

    try {
      setLoading(true)

      // Preparar dados completos
      const years = step1Data.yearsOfExperience
      const completeData = {
        licenseNumber:
          step1Data.licenseNumber && step1Data.licenseNumber.trim() !== ""
            ? step1Data.licenseNumber
            : null,
        specialties: step1Data.specialties || [],
        yearsOfExperience:
          years !== undefined && years !== null && typeof years === "number"
            ? years
            : null,
        name: step2Data.name || "",
        address: step2Data.address || "",
        phones: (step2Data.phones || []).filter((p) => p.trim() !== ""),
        description: step3Data.description || "",
        openingHours: step3Data.openingHours || {},
        imageUrl: step4Data.imageUrl || "",
      }

      const res = await fetch("/api/barber/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(completeData),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Erro ao completar onboarding")
        return
      }

      toast.success("Cadastro concluído com sucesso!")
      router.push("/adm/barber")
    } catch (error) {
      console.error(error)
      toast.error("Erro inesperado ao completar onboarding")
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="licenseNumber">Número de Licença (Opcional)</Label>
        <Input
          id="licenseNumber"
          type="text"
          value={step1Data.licenseNumber || ""}
          onChange={(e) =>
            setStep1Data({ ...step1Data, licenseNumber: e.target.value })
          }
          placeholder="Ex: 12345"
        />
      </div>

      <div>
        <Label>Especialidades *</Label>
        <p className="mb-2 text-sm text-muted-foreground">
          Selecione pelo menos uma especialidade
        </p>
        <div className="space-y-2">
          {SPECIALTIES.map((specialty) => (
            <div key={specialty} className="flex items-center space-x-2">
              <Checkbox
                id={specialty}
                checked={step1Data.specialties?.includes(specialty)}
                onCheckedChange={() => handleSpecialtyToggle(specialty)}
              />
              <Label htmlFor={specialty} className="cursor-pointer font-normal">
                {specialty}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="yearsOfExperience">
          Anos de Experiência (Opcional)
        </Label>
        <Input
          id="yearsOfExperience"
          type="number"
          min="0"
          max="70"
          value={step1Data.yearsOfExperience || ""}
          onChange={(e) =>
            setStep1Data({
              ...step1Data,
              yearsOfExperience: e.target.value
                ? Number(e.target.value)
                : undefined,
            })
          }
          placeholder="Ex: 5"
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Nome da Barbearia *</Label>
        <Input
          id="name"
          type="text"
          value={step2Data.name || ""}
          onChange={(e) => setStep2Data({ ...step2Data, name: e.target.value })}
          placeholder="Ex: Barbearia do João"
          required
        />
      </div>

      <div>
        <Label htmlFor="address">Endereço *</Label>
        <Input
          id="address"
          type="text"
          value={step2Data.address || ""}
          onChange={(e) =>
            setStep2Data({ ...step2Data, address: e.target.value })
          }
          placeholder="Ex: Rua das Flores, 123"
          required
        />
      </div>

      <div>
        <Label>Telefones *</Label>
        <p className="mb-2 text-sm text-muted-foreground">
          Adicione pelo menos um telefone
        </p>
        <div className="space-y-2">
          {(step2Data.phones || []).map((phone, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="text"
                value={phone}
                onChange={(e) => handlePhoneChange(index, e.target.value)}
                placeholder="Ex: (11) 98765-4321"
              />
              {(step2Data.phones || []).length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemovePhone(index)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAddPhone}
          className="mt-2"
        >
          Adicionar Telefone
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="description">Descrição da Barbearia *</Label>
        <Textarea
          id="description"
          value={step3Data.description || ""}
          onChange={(e) =>
            setStep3Data({ ...step3Data, description: e.target.value })
          }
          placeholder="Descreva sua barbearia, serviços oferecidos, diferenciais..."
          rows={4}
          maxLength={500}
          required
        />
        <p className="mt-1 text-sm text-muted-foreground">
          {(step3Data.description || "").length}/500 caracteres
        </p>
      </div>

      <div>
        <Label>Horários de Funcionamento (Opcional)</Label>
        <p className="mb-2 text-sm text-muted-foreground">
          Configure os horários para cada dia da semana
        </p>
        <div className="space-y-3">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day.key} className="flex items-center gap-2">
              <Label className="w-20 text-sm">{day.label}</Label>
              <Input
                type="time"
                value={
                  (
                    step3Data.openingHours?.[day.key] as
                      | { open: string; close: string }
                      | undefined
                  )?.open || ""
                }
                onChange={(e) =>
                  handleDayHoursChange(day.key, "open", e.target.value)
                }
                placeholder="Abertura"
                className="flex-1"
              />
              <span className="text-muted-foreground">às</span>
              <Input
                type="time"
                value={
                  (
                    step3Data.openingHours?.[day.key] as
                      | { open: string; close: string }
                      | undefined
                  )?.close || ""
                }
                onChange={(e) =>
                  handleDayHoursChange(day.key, "close", e.target.value)
                }
                placeholder="Fechamento"
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="imageUrl">URL da Imagem da Barbearia *</Label>
        <Input
          id="imageUrl"
          type="url"
          value={step4Data.imageUrl || ""}
          onChange={(e) =>
            setStep4Data({ ...step4Data, imageUrl: e.target.value })
          }
          placeholder="https://exemplo.com/imagem.jpg"
          required
        />
        {step4Data.imageUrl && (
          <div className="mt-4">
            <p className="mb-2 text-sm text-muted-foreground">
              Pré-visualização:
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={step4Data.imageUrl}
              alt="Preview"
              className="h-48 w-full rounded-lg object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = "none"
              }}
            />
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <h3 className="mb-3 font-semibold">Resumo do Cadastro</h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Especialidades:</strong>{" "}
            {step1Data.specialties?.join(", ") || "Nenhuma"}
          </div>
          {step1Data.yearsOfExperience && (
            <div>
              <strong>Anos de Experiência:</strong>{" "}
              {step1Data.yearsOfExperience}
            </div>
          )}
          <div>
            <strong>Nome da Barbearia:</strong> {step2Data.name || "N/A"}
          </div>
          <div>
            <strong>Endereço:</strong> {step2Data.address || "N/A"}
          </div>
          <div>
            <strong>Telefones:</strong>{" "}
            {step2Data.phones?.filter((p) => p.trim()).join(", ") || "N/A"}
          </div>
          <div>
            <strong>Descrição:</strong>{" "}
            {step3Data.description
              ? step3Data.description.substring(0, 100) + "..."
              : "N/A"}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Etapa {currentStep} de 4: {currentStep === 1 && "Dados Profissionais"}
          {currentStep === 2 && "Dados da Barbearia"}
          {currentStep === 3 && "Descrição e Horários"}
          {currentStep === 4 && "Imagem e Revisão"}
        </CardTitle>
        <Progress value={progress} className="mt-2" />
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Anterior
          </Button>

          {currentStep < 4 ? (
            <Button type="button" onClick={handleNext}>
              Próximo
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? "Finalizando..." : "Finalizar Cadastro"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
