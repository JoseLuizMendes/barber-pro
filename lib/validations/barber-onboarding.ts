import { z } from "zod"

// Schema para Etapa 1: Dados Profissionais
export const step1Schema = z.object({
  licenseNumber: z
    .string()
    .min(1, "Número de licença é obrigatório")
    .optional()
    .or(z.literal("")),
  specialties: z
    .array(z.string())
    .min(1, "Selecione pelo menos uma especialidade"),
  yearsOfExperience: z
    .number()
    .min(0, "Anos de experiência deve ser maior ou igual a 0")
    .max(70, "Anos de experiência não pode exceder 70")
    .optional()
    .or(z.literal(null)),
})

// Schema para Etapa 2: Dados da Barbearia
export const step2Schema = z.object({
  name: z.string().min(3, "Nome da barbearia deve ter no mínimo 3 caracteres"),
  address: z.string().min(5, "Endereço deve ter no mínimo 5 caracteres"),
  phones: z
    .array(z.string().min(10, "Telefone inválido"))
    .min(1, "Adicione pelo menos um telefone"),
})

// Schema para Etapa 3: Descrição e Horários
export const step3Schema = z.object({
  description: z
    .string()
    .min(10, "Descrição deve ter no mínimo 10 caracteres")
    .max(500, "Descrição não pode exceder 500 caracteres"),
  openingHours: z
    .record(
      z.object({
        open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
        close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
      }),
    )
    .optional(),
})

// Schema para Etapa 4: Imagem
export const step4Schema = z.object({
  imageUrl: z.string().url("URL da imagem inválida"),
})

// Schema completo para o onboarding
export const completeOnboardingSchema = z.object({
  licenseNumber: z.string().optional().nullable(),
  specialties: z.array(z.string()).min(1),
  yearsOfExperience: z.number().optional().nullable(),
  name: z.string().min(3),
  address: z.string().min(5),
  phones: z.array(z.string()).min(1),
  description: z.string().min(10).max(500),
  imageUrl: z.string().url(),
  openingHours: z.record(z.object({
    open: z.string(),
    close: z.string(),
  })).optional(),
})

// Types exportados
export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
export type Step4Data = z.infer<typeof step4Schema>
export type CompleteOnboardingData = z.infer<typeof completeOnboardingSchema>
