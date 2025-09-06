import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function seedDatabase() {
  try {
    const images = [
      "https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png",
      "https://utfs.io/f/45331760-899c-4b4b-910e-e00babb6ed81-16q.png",
      "https://utfs.io/f/5832df58-cfd7-4b3f-b102-42b7e150ced2-16r.png",
      "https://utfs.io/f/7e309eaa-d722-465b-b8b6-76217404a3d3-16s.png",
      "https://utfs.io/f/178da6b6-6f9a-424a-be9d-a2feb476eb36-16t.png",
      "https://utfs.io/f/2f9278ba-3975-4026-af46-64af78864494-16u.png",
      "https://utfs.io/f/988646ea-dcb6-4f47-8a03-8d4586b7bc21-16v.png",
      "https://utfs.io/f/60f24f5c-9ed3-40ba-8c92-0cd1dcd043f9-16w.png",
      "https://utfs.io/f/f64f1bd4-59ce-4ee3-972d-2399937eeafc-16x.png",
      "https://utfs.io/f/e995db6d-df96-4658-99f5-11132fd931e1-17j.png",
      "https://utfs.io/f/3bcf33fc-988a-462b-8b98-b811ee2bbd71-17k.png",
      "https://utfs.io/f/5788be0e-2307-4bb4-b603-d9dd237950a2-17l.png",
      "https://utfs.io/f/6b0888f8-b69f-4be7-a13b-52d1c0c9cab2-17m.png",
      "https://utfs.io/f/ef45effa-415e-416d-8c4a-3221923cd10f-17n.png",
      "https://utfs.io/f/ef45effa-415e-416d-8c4a-3221923cd10f-17n.png",
      "https://utfs.io/f/a55f0f39-31a0-4819-8796-538d68cc2a0f-17o.png",
      "https://utfs.io/f/5c89f046-80cd-4443-89df-211de62b7c2a-17p.png",
      "https://utfs.io/f/23d9c4f7-8bdb-40e1-99a5-f42271b7404a-17q.png",
      "https://utfs.io/f/9f0847c2-d0b8-4738-a673-34ac2b9506ec-17r.png",
      "https://utfs.io/f/07842cfb-7b30-4fdc-accc-719618dfa1f2-17s.png",
      "https://utfs.io/f/0522fdaf-0357-4213-8f52-1d83c3dcb6cd-18e.png",
    ]

    // Nomes criativos para as barbearias
    const creativeNames = [
      "Barbearia Vintage",
      "Corte & Estilo",
      "Barba & Navalha",
      "The Dapper Den",
      "Cabelo & Cia.",
      "Machado & Tesoura",
      "Barbearia Elegance",
      "Aparência Impecável",
      "Estilo Urbano",
      "Estilo Clássico",
    ]

    // Endereços fictícios para as barbearias
    const addresses = [
      "Rua da Barbearia, 123",
      "Avenida dos Cortes, 456",
      "Praça da Barba, 789",
      "Travessa da Navalha, 101",
      "Alameda dos Estilos, 202",
      "Estrada do Machado, 303",
      "Avenida Elegante, 404",
      "Praça da Aparência, 505",
      "Rua Urbana, 606",
      "Avenida Clássica, 707",
    ]

    const services = [
      {
        name: "Corte de Cabelo",
        description: "Estilo personalizado com as últimas tendências.",
        price: 60.0,
        imageUrl:
          "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
      },
      {
        name: "Barba",
        description: "Modelagem completa para destacar sua masculinidade.",
        price: 40.0,
        imageUrl:
          "https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png",
      },
      {
        name: "Pézinho",
        description: "Acabamento perfeito para um visual renovado.",
        price: 35.0,
        imageUrl:
          "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
      },
      {
        name: "Sobrancelha",
        description: "Expressão acentuada com modelagem precisa.",
        price: 20.0,
        imageUrl:
          "https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png",
      },
      {
        name: "Massagem",
        description: "Relaxe com uma massagem revigorante.",
        price: 50.0,
        imageUrl:
          "https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png",
      },
      {
        name: "Hidratação",
        description: "Hidratação profunda para cabelo e barba.",
        price: 25.0,
        imageUrl:
          "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
      },
    ]

    // 🔹 PRIMEIRO: Criar um usuário para o barbeiro
    const user = await prisma.user.create({
      data: {
        id: "test-user-id-123", // ID fixo para teste
        name: "João Silva",
        email: "joao.barberpro@gmail.com",
        //senha: admbarberpro
        password: "123456",
      },
    })

    // 🔹 SEGUNDO: Criar a primeira barbearia
    const firstBarbershop = await prisma.barbershop.create({
      data: {
        name: creativeNames[0], // "Barbearia Vintage"
        address: addresses[0],
        imageUrl: images[0],
        phones: ["(11) 99999-9999", "(11) 99999-9999"],
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ac augue ullamcorper, pharetra orci mollis, auctor tellus. Phasellus pharetra erat ac libero efficitur tempus. Donec pretium convallis iaculis. Etiam eu felis sollicitudin, cursus mi vitae, iaculis magna. Nam non erat neque. In hac habitasse platea dictumst. Pellentesque molestie accumsan tellus id laoreet.",
      },
    })

    // 🔹 TERCEIRO: Criar o barbeiro ligado à primeira barbearia
    const barber = await prisma.barber.create({
      data: {
        userId: user.id,
        barbershopId: firstBarbershop.id,
        licenseNumber: "BR123456789",
        specialties: ["Corte Masculino", "Barba", "Bigode"],
        yearsOfExperience: 5,
      },
    })

    // 🔹 QUARTO: Criar usuários para os funcionários
    const employee1User = await prisma.user.create({
      data: {
        id: "employee-user-id-001",
        name: "Carlos Pereira",
        email: "carlos.empbarberpro@gmail.com",
        //empbarberpro
        password: "123456",
      },
    })

    const employee2User = await prisma.user.create({
      data: {
        id: "employee-user-id-002",
        name: "Ricardo Santos",
        email: "ricardo.empbarberpro@gmail.com",
        //empbarberpro
        password: "123456",
      },
    })

    // 🔹 QUINTO: Criar os 2 funcionários
    const employee1 = await prisma.employee.create({
      data: {
        userId: employee1User.id,
        barberId: barber.id,
        barbershopId: firstBarbershop.id,
        employeeCode: "EMP001", // ← CAMPO OBRIGATÓRIO que está faltando!
        position: "Barbeiro", // ← Use position ao invés de role
        salary: 2500.0,
        hireDate: new Date("2023-01-15"),
        isActive: true,
      },
    })

    const employee2 = await prisma.employee.create({
      data: {
        userId: employee2User.id,
        barberId: barber.id,
        barbershopId: firstBarbershop.id,
        employeeCode: "EMP002", // ← CAMPO OBRIGATÓRIO que está faltando!
        position: "Assistente", // ← Use position ao invés de role
        salary: 1800.0,
        hireDate: new Date("2023-03-10"),
        isActive: true,
      },
    })

    console.log(`✅ Barbeiro criado: ${barber.id}`)
    console.log(`✅ Ligado à barbearia: ${firstBarbershop.name}`)
    console.log(
      `✅ Funcionário 1 criado: ${employee1.id} - ${employee1User.name}`,
    )
    console.log(
      `✅ Funcionário 2 criado: ${employee2.id} - ${employee2User.name}`,
    )

    // 🔹 Adicionar serviços à primeira barbearia
    for (const service of services) {
      await prisma.barbershopService.create({
        data: {
          name: service.name,
          description: service.description,
          price: service.price,
          barbershop: {
            connect: {
              id: firstBarbershop.id,
            },
          },
          imageUrl: service.imageUrl,
        },
      })
    }

    // 🔹 Criar as outras 9 barbearias SEM barbeiro (só pra teste)
    for (let i = 1; i < 10; i++) {
      const name = creativeNames[i]
      const address = addresses[i]
      const imageUrl = images[i]

      const barbershop = await prisma.barbershop.create({
        data: {
          name,
          address,
          imageUrl: imageUrl,
          phones: ["(11) 99999-9999", "(11) 99999-9999"],
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ac augue ullamcorper, pharetra orci mollis, auctor tellus. Phasellus pharetra erat ac libero efficitur tempus. Donec pretium convallis iaculis. Etiam eu felis sollicitudin, cursus mi vitae, iaculis magna. Nam non erat neque. In hac habitasse platea dictumst. Pellentesque molestie accumsan tellus id laoreet.",
        },
      })

      // Adicionar serviços às outras barbearias também
      for (const service of services) {
        await prisma.barbershopService.create({
          data: {
            name: service.name,
            description: service.description,
            price: service.price,
            barbershop: {
              connect: {
                id: barbershop.id,
              },
            },
            imageUrl: service.imageUrl,
          },
        })
      }
    }

    console.log("✅ Seed concluído com sucesso!")
    console.log("📊 Resultado:")
    console.log("   • 1 usuário criado")
    console.log("   • 1 barbeiro criado")
    console.log("   • 10 barbearias criadas")
    console.log("   • 60 serviços criados (6 por barbearia)")
    console.log("   • Primeira barbearia tem barbeiro dono")
    console.log("   • Outras 9 barbearias sem barbeiro")

    // Fechar a conexão com o banco de dados
    await prisma.$disconnect()
  } catch (error) {
    console.error("Erro ao criar as barbearias:", error)
  }
}

seedDatabase()
