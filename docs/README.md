# Documentação da API

A documentação interativa do Swagger fica disponível em `/docs` (ou `/docs/`) quando o servidor estiver rodando. O documento OpenAPI em JSON fica em `/docs/openapi.json`.

## Prisma e banco de dados

1. Copie `.env.example` para `.env` na raiz do repositório e configure `DATABASE_URL` e `JWT_SECRET`.
2. Instale as dependências na raiz com `npm install`.
3. Valide o schema com `npm run db:validate`.
4. Gere o cliente com `npm run db:generate`.
5. Inicie a API com `npm start`.

O schema existente descreve tabelas já presentes no PostgreSQL; `npm run db:pull` atualiza o schema a partir do banco e pode sobrescrever alterações locais. Revise as diferenças antes de executá-lo. A API usa o Prisma Client para usuários, projetos e tarefas.

As senhas são armazenadas com scrypt no campo `usuarios.senha_hash`. No primeiro login válido, uma conta que ainda esteja apenas no antigo arquivo JSON é criada no banco com a senha já protegida por hash. Senhas antigas em texto puro que já estejam no banco também são convertidas para hash após um login válido.
