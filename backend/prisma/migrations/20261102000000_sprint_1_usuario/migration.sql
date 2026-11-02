CREATE TABLE `usuarios` (
  `id` VARCHAR(191) NOT NULL,
  `nome` VARCHAR(120) NOT NULL,
  `email` VARCHAR(254) NOT NULL,
  `cpf` CHAR(11) NOT NULL,
  `senha_hash` VARCHAR(60) NOT NULL,
  `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `atualizado_em` DATETIME(3) NOT NULL,

  UNIQUE INDEX `usuarios_email_key`(`email`),
  UNIQUE INDEX `usuarios_cpf_key`(`cpf`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
