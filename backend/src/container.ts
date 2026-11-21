/**
 * Composição da aplicação (Inversão de Dependência): aqui, e só aqui, as implementações
 * concretas (Prisma, bcrypt, JWT) são instanciadas e entregues aos serviços por interface.
 */
import { env } from "./config/env.js";
import { AuthController } from "./controllers/AuthController.js";
import { CatalogoController } from "./controllers/CatalogoController.js";
import { CategoriaController } from "./controllers/CategoriaController.js";
import { EnderecoController } from "./controllers/EnderecoController.js";
import { PedidoController } from "./controllers/PedidoController.js";
import { ProdutoController } from "./controllers/ProdutoController.js";
import { UsuarioController } from "./controllers/UsuarioController.js";
import { criarMiddlewareAutenticar } from "./middlewares/autenticar.js";
import { PrismaCategoriaRepository } from "./repositories/PrismaCategoriaRepository.js";
import { PrismaEnderecoRepository } from "./repositories/PrismaEnderecoRepository.js";
import { PrismaPedidoRepository } from "./repositories/PrismaPedidoRepository.js";
import { PrismaProdutoRepository } from "./repositories/PrismaProdutoRepository.js";
import { PrismaUsuarioRepository } from "./repositories/PrismaUsuarioRepository.js";
import { AutenticarUsuarioService } from "./services/AutenticarUsuarioService.js";
import { CadastrarUsuarioService } from "./services/CadastrarUsuarioService.js";
import { CategoriaService } from "./services/CategoriaService.js";
import { EditarUsuarioService } from "./services/EditarUsuarioService.js";
import { EnderecoService } from "./services/EnderecoService.js";
import { ObterUsuarioService } from "./services/ObterUsuarioService.js";
import { PedidoService } from "./services/PedidoService.js";
import { ProdutoService } from "./services/ProdutoService.js";
import { BcryptPasswordHasher } from "./services/passwordHasher.js";
import { JwtTokenService } from "./services/JwtTokenService.js";

// Infraestrutura
const senhas = new BcryptPasswordHasher();
const tokens = new JwtTokenService(env.JWT_SECRET, env.JWT_EXPIRES_IN);

// Repositórios (implementações Prisma das interfaces)
const usuarioRepository = new PrismaUsuarioRepository();
const categoriaRepository = new PrismaCategoriaRepository();
const produtoRepository = new PrismaProdutoRepository();
const enderecoRepository = new PrismaEnderecoRepository();
const pedidoRepository = new PrismaPedidoRepository();

// Serviços
const produtoService = new ProdutoService(produtoRepository, categoriaRepository);

// Middlewares
export const autenticar = criarMiddlewareAutenticar(tokens);

// Controllers
export const authController = new AuthController(new AutenticarUsuarioService(usuarioRepository, senhas, tokens));
export const usuarioController = new UsuarioController(
  new CadastrarUsuarioService(usuarioRepository, senhas),
  new ObterUsuarioService(usuarioRepository),
  new EditarUsuarioService(usuarioRepository, senhas)
);

export const categoriaController = new CategoriaController(new CategoriaService(categoriaRepository));
export const produtoController = new ProdutoController(produtoService);
export const enderecoController = new EnderecoController(new EnderecoService(enderecoRepository));
export const pedidoController = new PedidoController(
  new PedidoService(pedidoRepository, produtoRepository, enderecoRepository)
);
export const catalogoController = new CatalogoController(produtoService);
