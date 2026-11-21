import { defineConfig } from "vitest/config";

// Os testes unitários não usam banco nem .env: as variáveis abaixo são fictícias e só
// satisfazem a validação de src/config/env.ts.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "mysql://teste:teste@localhost:3306/solutec_teste",
      JWT_SECRET: "segredo-de-teste-com-mais-de-32-caracteres",
      JWT_EXPIRES_IN: "2h",
      BCRYPT_ROUNDS: "10"
    }
  }
});
