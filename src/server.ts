import fastify from 'fastify'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import cors from 'cors'

const app = fastify()

app.addHook('onRequest', (request, reply, done) => {
    // Defina os cabeçalhos CORS para permitir solicitações de qualquer origem
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Continue com o fluxo da requisição
    done();
});

const prisma = new PrismaClient()

// Lista usuários
app.get('/users', async () => {
    const users = await prisma.user.findMany()

    return { users }
})

// Cria usuários
app.post('/users', async (request, reply) => {
    const createUserSchema = z.object({
        user_name: z.string(),
        user_cpf: z.string(),
        user_email: z.string().email(),
    })

    const { user_name, user_cpf, user_email } = createUserSchema.parse(request.body)

    await prisma.user.create({
        data: {
            user_name,
            user_cpf,
            user_email,
        }
    })

    return reply.status(201).send()
})

// Atualiza usuários
app.put('/users/:userId', async (request, reply) => {
    const paramsSchema = z.object({
        userId: z.string(),
    })
    const updateUserSchema = z.object({
        user_name: z.string().optional(),
        user_cpf: z.string().optional(),
        user_email: z.string().email().optional(),
    })

    const { userId } =  paramsSchema.parse(request.params)

    const { user_name, user_cpf, user_email } = updateUserSchema.parse(request.body)

    await prisma.user.update({
        where: {
            user_id: userId,
        },
        data: {
            user_name,
            user_cpf,
            user_email,
        },
    })

    return reply.status(200).send('Usuário atualizado com sucesso')
})

// Deleta usuários
app.delete('/users', async () => {
    
    return 'Deletar usuário'
})


app.listen({
    host: typeof process.env.HOST === 'string' ? process.env.HOST : '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
}).then( () => {
    console.log(`HTTP Server running http://${process.env.HOST}:${process.env.PORT}`)
})