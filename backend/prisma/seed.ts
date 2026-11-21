/**
 * Seed idempotente (pode rodar várias vezes): categorias, os 8 produtos da Solutec
 * (de -solutecinsight/importar_produtos.sql), um usuário de demonstração e um endereço.
 * Uso: npm run prisma:seed -w backend
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const USUARIO_DEMO = {
  nome: "Gestor Demonstração Solutec",
  email: "demo@solutec.test",
  senha: "Solutec@2026",
  cpf: "11144477735"
} as const;

const categorias = [
  { nome: "Câmeras", descricao: "Câmeras IP, dome, 360° e kits com gravador para monitoramento por vídeo." },
  { nome: "Alarmes", descricao: "Centrais, sirenes e sensores para detecção de intrusão." },
  { nome: "Controle de Acesso", descricao: "Leitores biométricos, teclados e fechaduras para controlar quem entra." },
  { nome: "Monitoramento", descricao: "Softwares e serviços de acompanhamento remoto e gravação em nuvem." }
] as const;

type NomeCategoria = (typeof categorias)[number]["nome"];

const produtos: ReadonlyArray<{
  nome: string;
  descricao: string;
  preco: number;
  categoria: NomeCategoria;
  imagem: string;
  estoque: number;
}> = [
  { nome: "Câmera IP Externa HD", descricao: "Câmera externa com resolução HD e visão noturna.", preco: 299.9, categoria: "Câmeras", imagem: "camera-ip-externa.webp", estoque: 18 },
  { nome: "Câmera Dome Interna", descricao: "Câmera dome discreta para ambientes internos.", preco: 189.9, categoria: "Câmeras", imagem: "camera-dome.webp", estoque: 25 },
  { nome: "Kit 4 Câmeras + DVR", descricao: "Kit completo com 4 câmeras coloridas e DVR 4 canais.", preco: 899.0, categoria: "Câmeras", imagem: "kit-4-cameras-dvr.webp", estoque: 7 },
  { nome: "Câmera 360° WiFi", descricao: "Câmera panorâmica WiFi com rotação automática.", preco: 349.9, categoria: "Câmeras", imagem: "camera-360-wifi.webp", estoque: 12 },
  { nome: "Alarme Residencial Completo", descricao: "Kit de alarme com central, sirene e 4 sensores.", preco: 459.0, categoria: "Alarmes", imagem: "alarme-residencial.webp", estoque: 9 },
  { nome: "Sensor de Presença", descricao: "Sensor infravermelho passivo para detecção de movimento.", preco: 89.9, categoria: "Alarmes", imagem: "sensor-de-presenca.webp", estoque: 40 },
  { nome: "Controle de Acesso Biométrico", descricao: "Leitor biométrico de impressão digital com teclado.", preco: 599.0, categoria: "Controle de Acesso", imagem: "controle-de-acesso-biometrico.webp", estoque: 6 },
  { nome: "Central de Monitoramento", descricao: "Software de monitoramento remoto com gravação em nuvem.", preco: 1299.0, categoria: "Monitoramento", imagem: "central-de-monitoramento.webp", estoque: 4 }
];

async function main(): Promise<void> {
  const idsCategoria = new Map<string, string>();
  for (const categoria of categorias) {
    const registro = await prisma.categoria.upsert({
      where: { nome: categoria.nome },
      update: { descricao: categoria.descricao },
      create: categoria
    });
    idsCategoria.set(categoria.nome, registro.id);
  }

  for (const produto of produtos) {
    const categoriaId = idsCategoria.get(produto.categoria);
    if (!categoriaId) throw new Error(`Categoria ausente: ${produto.categoria}`);
    const dados = {
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      estoque: produto.estoque,
      imagemUrl: `/img/produtos/${produto.imagem}`,
      ativo: true,
      categoriaId
    };
    const existente = await prisma.produto.findFirst({ where: { nome: produto.nome } });
    if (existente) await prisma.produto.update({ where: { id: existente.id }, data: dados });
    else await prisma.produto.create({ data: dados });
  }

  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
  const senhaHash = await bcrypt.hash(USUARIO_DEMO.senha, rounds);
  const usuario = await prisma.usuario.upsert({
    where: { email: USUARIO_DEMO.email },
    update: { nome: USUARIO_DEMO.nome, senhaHash },
    create: { nome: USUARIO_DEMO.nome, email: USUARIO_DEMO.email, cpf: USUARIO_DEMO.cpf, senhaHash }
  });

  if ((await prisma.endereco.count({ where: { usuarioId: usuario.id } })) === 0) {
    await prisma.endereco.create({
      data: {
        usuarioId: usuario.id,
        apelido: "Loja Centro",
        cep: "87250000",
        logradouro: "Rua Fictícia da Demonstração",
        numero: "100",
        complemento: null,
        bairro: "Centro",
        cidade: "Peabiru",
        uf: "PR"
      }
    });
  }

  console.log(`Seed concluído: ${categorias.length} categorias, ${produtos.length} produtos e usuário ${USUARIO_DEMO.email}.`);
}

main()
  .catch((error: unknown) => {
    console.error("Falha no seed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
