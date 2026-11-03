module.exports = {
    openapi: '3.0.3',
    info: {
        title: 'TaskFlow API',
        version: '1.0.0',
        description: 'Documentação da API TaskFlow.',
    },
    servers: [{ url: '/' }],
    tags: [
        { name: 'Autenticação' },
        { name: 'Usuários' },
        { name: 'Projetos' },
        { name: 'Tarefas' },
    ],
    paths: {
        '/': {
            get: {
                summary: 'Verificar se a API está ativa',
                responses: {
                    200: {
                        description: 'API disponível',
                        content: {
                            'application/json': {
                                schema: { type: 'object', properties: { mensagem: { type: 'string' } } },
                                example: { mensagem: 'API TaskFlow rodando com sucesso!' },
                            },
                        },
                    },
                },
            },
        },
        '/auth/login': {
            post: {
                tags: ['Autenticação'],
                summary: 'Entrar e obter um token JWT',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'senha'],
                                properties: {
                                    email: { type: 'string', format: 'email' },
                                    senha: { type: 'string', format: 'password' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Autenticação concluída',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        token: { type: 'string' },
                                        usuario: { $ref: '#/components/schemas/Usuario' },
                                    },
                                },
                            },
                        },
                    },
                    400: { $ref: '#/components/responses/ErroRequisicao' },
                    401: { $ref: '#/components/responses/NaoAutorizado' },
                },
            },
        },
        '/usuarios': {
            get: {
                tags: ['Usuários'],
                summary: 'Listar usuários',
                responses: {
                    200: {
                        description: 'Lista de usuários',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Usuario' },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Usuários'],
                summary: 'Cadastrar usuário',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/NovoUsuario' } } },
                },
                responses: {
                    201: {
                        description: 'Usuário criado',
                        content: {
                            'application/json': { schema: { $ref: '#/components/schemas/Usuario' } },
                        },
                    },
                    400: { $ref: '#/components/responses/ErroRequisicao' },
                    409: { $ref: '#/components/responses/Conflito' },
                },
            },
        },
        '/usuarios/{id}': {
            parameters: [{ $ref: '#/components/parameters/Id' }],
            get: {
                tags: ['Usuários'],
                summary: 'Buscar usuário',
                responses: {
                    200: {
                        description: 'Usuário encontrado',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } },
                    },
                    400: { $ref: '#/components/responses/ErroRequisicao' },
                    404: { $ref: '#/components/responses/NaoEncontrado' },
                },
            },
            put: {
                tags: ['Usuários'],
                summary: 'Atualizar nome ou email do usuário',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    nome: { type: 'string' },
                                    email: { type: 'string', format: 'email' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Usuário atualizado',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } },
                    },
                    400: { $ref: '#/components/responses/ErroRequisicao' },
                    404: { $ref: '#/components/responses/NaoEncontrado' },
                    409: { $ref: '#/components/responses/Conflito' },
                },
            },
            delete: {
                tags: ['Usuários'],
                summary: 'Excluir usuário sem tarefas associadas',
                responses: {
                    200: { description: 'Usuário removido' },
                    400: { $ref: '#/components/responses/ErroRequisicao' },
                    404: { $ref: '#/components/responses/NaoEncontrado' },
                },
            },
        },
        '/projetos': {
            get: {
                tags: ['Projetos'],
                summary: 'Listar projetos',
                responses: { 200: { description: 'Lista de projetos' } },
            },
            post: {
                tags: ['Projetos'],
                summary: 'Criar projeto',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['nome', 'usuarioId'],
                                properties: {
                                    nome: { type: 'string', maxLength: 100 },
                                    descricao: { type: 'string', maxLength: 200 },
                                    usuarioId: { type: 'integer', minimum: 1 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: 'Projeto criado' },
                    400: { $ref: '#/components/responses/ErroRequisicao' },
                    409: { $ref: '#/components/responses/Conflito' },
                },
            },
        },
        '/projetos/{id}': {
            parameters: [{ $ref: '#/components/parameters/Id' }],
            get: {
                tags: ['Projetos'],
                summary: 'Buscar projeto',
                responses: {
                    200: { description: 'Projeto encontrado' },
                    400: { $ref: '#/components/responses/ErroRequisicao' },
                    404: { $ref: '#/components/responses/NaoEncontrado' },
                },
            },
            put: {
                tags: ['Projetos'],
                summary: 'Atualizar projeto',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    nome: { type: 'string', maxLength: 100 },
                                    descricao: { type: 'string', maxLength: 200 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Projeto atualizado' },
                    400: { $ref: '#/components/responses/ErroRequisicao' },
                    404: { $ref: '#/components/responses/NaoEncontrado' },
                },
            },
            delete: {
                tags: ['Projetos'],
                summary: 'Excluir projeto sem tarefas associadas',
                responses: {
                    200: { description: 'Projeto removido' },
                    400: { $ref: '#/components/responses/ErroRequisicao' },
                    404: { $ref: '#/components/responses/NaoEncontrado' },
                },
            },
        },
        '/projetos/{id}/resumo': {
            parameters: [{ $ref: '#/components/parameters/Id' }],
            get: {
                tags: ['Projetos'],
                summary: 'Obter resumo das tarefas do projeto',
                responses: {
                    200: { description: 'Resumo do projeto' },
                    400: { $ref: '#/components/responses/ErroRequisicao' },
                    404: { $ref: '#/components/responses/NaoEncontrado' },
                },
            },
        },
        '/tarefas': {
            get: {
                tags: ['Tarefas'],
                summary: 'Listar tarefas do usuário autenticado',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'coluna',
                        in: 'query',
                        schema: { type: 'string', enum: ['afazer', 'andamento', 'concluido'] },
                    },
                    {
                        name: 'prioridade',
                        in: 'query',
                        schema: { type: 'string', enum: ['alta', 'media', 'baixa'] },
                    },
                    { name: 'usuarioId', in: 'query', schema: { type: 'integer', minimum: 1 } },
                ],
                responses: {
                    200: {
                        description: 'Lista de tarefas',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Tarefa' },
                                },
                            },
                        },
                    },
                    401: { $ref: '#/components/responses/NaoAutorizado' },
                },
            },
            post: {
                tags: ['Tarefas'],
                summary: 'Criar tarefa',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                description: 'Informe texto ou titulo.',
                                properties: {
                                    texto: { type: 'string' },
                                    titulo: { type: 'string' },
                                    coluna: { type: 'string', enum: ['afazer', 'andamento', 'concluido'] },
                                    prioridade: { type: 'string', enum: ['alta', 'media', 'baixa'] },
                                    projetoId: { type: 'integer', minimum: 1 },
                                    usuarioId: { type: 'integer', minimum: 1 },
                                    ordem: { type: 'integer', minimum: 0 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Tarefa criada',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Tarefa' } } },
                    },
                    400: { $ref: '#/components/responses/ErroRequisicao' },
                    401: { $ref: '#/components/responses/NaoAutorizado' },
                },
            },
        },
        '/tarefas/{id}': {
            parameters: [{ $ref: '#/components/parameters/Id' }],
            get: {
                tags: ['Tarefas'],
                summary: 'Buscar tarefa do usuário autenticado',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'usuarioId', in: 'query', schema: { type: 'integer', minimum: 1 } }],
                responses: {
                    200: {
                        description: 'Tarefa encontrada',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Tarefa' } } },
                    },
                    400: { $ref: '#/components/responses/ErroRequisicao' },
                    401: { $ref: '#/components/responses/NaoAutorizado' },
                    404: { $ref: '#/components/responses/NaoEncontrado' },
                },
            },
            put: {
                tags: ['Tarefas'],
                summary: 'Atualizar tarefa',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'usuarioId', in: 'query', schema: { type: 'integer', minimum: 1 } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    texto: { type: 'string' },
                                    titulo: { type: 'string' },
                                    coluna: { type: 'string', enum: ['afazer', 'andamento', 'concluido'] },
                                    prioridade: { type: 'string', enum: ['alta', 'media', 'baixa'] },
                                    projetoId: { type: 'integer', minimum: 1 },
                                    ordem: { type: 'integer', minimum: 0 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Tarefa atualizada',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Tarefa' } } },
                    },
                    400: { $ref: '#/components/responses/ErroRequisicao' },
                    401: { $ref: '#/components/responses/NaoAutorizado' },
                    404: { $ref: '#/components/responses/NaoEncontrado' },
                },
            },
            delete: {
                tags: ['Tarefas'],
                summary: 'Excluir tarefa',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'usuarioId', in: 'query', schema: { type: 'integer', minimum: 1 } }],
                responses: {
                    200: { description: 'Tarefa removida' },
                    400: { $ref: '#/components/responses/ErroRequisicao' },
                    401: { $ref: '#/components/responses/NaoAutorizado' },
                    404: { $ref: '#/components/responses/NaoEncontrado' },
                },
            },
        },
        '/tarefas/estatisticas': {
            get: {
                tags: ['Tarefas'],
                summary: 'Obter estatísticas das tarefas do usuário autenticado',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'usuarioId', in: 'query', schema: { type: 'integer', minimum: 1 } },
                    {
                        name: 'coluna',
                        in: 'query',
                        schema: { type: 'string', enum: ['afazer', 'andamento', 'concluido'] },
                    },
                ],
                responses: {
                    200: { description: 'Estatísticas de tarefas' },
                    400: { $ref: '#/components/responses/ErroRequisicao' },
                    401: { $ref: '#/components/responses/NaoAutorizado' },
                },
            },
        },
        '/tarefas/resumo': {
            get: {
                tags: ['Tarefas'],
                summary: 'Obter resumo das tarefas do usuário autenticado',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'usuarioId', in: 'query', schema: { type: 'integer', minimum: 1 } }],
                responses: {
                    200: { description: 'Resumo de tarefas' },
                    400: { $ref: '#/components/responses/ErroRequisicao' },
                    401: { $ref: '#/components/responses/NaoAutorizado' },
                },
            },
        },
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        parameters: {
            Id: {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'integer', minimum: 1 },
            },
        },
        schemas: {
            Usuario: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    nome: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                },
            },
            NovoUsuario: {
                type: 'object',
                required: ['nome', 'email', 'senha'],
                properties: {
                    nome: { type: 'string', minLength: 3 },
                    email: { type: 'string', format: 'email' },
                    senha: { type: 'string', minLength: 6, format: 'password' },
                },
            },
            Tarefa: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    titulo: { type: 'string' },
                    coluna: { type: 'string', enum: ['afazer', 'andamento', 'concluido'] },
                    ordem: { type: 'integer', nullable: true },
                    projetoId: { type: 'integer' },
                    usuarioId: { type: 'integer' },
                    prioridadeId: { type: 'integer' },
                    prioridade: { type: 'string', enum: ['alta', 'media', 'baixa'], nullable: true },
                    criadoEm: { type: 'string', format: 'date-time', nullable: true },
                    usuarioNome: { type: 'string' },
                    projetoNome: { type: 'string' },
                },
            },
            Erro: {
                type: 'object',
                properties: { erro: { type: 'string' } },
            },
        },
        responses: {
            ErroRequisicao: {
                description: 'Dados inválidos ou relacionados inexistentes',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } },
            },
            NaoAutorizado: {
                description: 'Token ausente ou inválido',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } },
            },
            NaoEncontrado: {
                description: 'Registro não encontrado',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } },
            },
            Conflito: {
                description: 'Registro duplicado',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } },
            },
        },
    },
};
