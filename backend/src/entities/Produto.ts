import { Entidade, type DadosEntidade } from "./Entidade.js";
import { arredondarMoeda, erroDeCampo, textoObrigatorio, textoOpcional } from "./validacoes.js";

export interface ProdutoProps extends DadosEntidade {
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagemUrl: string | null;
  ativo: boolean;
  categoriaId: string;
  /** Preenchido pelo repositório quando a categoria vem junto na consulta. */
  categoriaNome?: string | undefined;
}

export type DadosProduto = Omit<ProdutoProps, keyof DadosEntidade | "categoriaNome">;

export interface ProdutoResposta {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagemUrl: string | null;
  ativo: boolean;
  disponivel: boolean;
  categoriaId: string;
  categoria: { id: string; nome: string } | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

const PRECO_MAXIMO = 99_999_999.99;
const IMAGEM_URL_REGEX = /^(\/|https?:\/\/)\S+$/;

export class Produto extends Entidade<ProdutoResposta> {
  #nome!: string;
  #descricao!: string;
  #preco!: number;
  #estoque!: number;
  #imagemUrl!: string | null;
  #ativo!: boolean;
  #categoriaId!: string;
  readonly #categoriaNome: string | undefined;

  constructor(props: ProdutoProps) {
    super(props);
    this.#categoriaNome = props.categoriaNome;
    this.atualizar(props);
  }

  get nome(): string { return this.#nome; }
  get descricao(): string { return this.#descricao; }
  get imagemUrl(): string | null { return this.#imagemUrl; }
  get ativo(): boolean { return this.#ativo; }
  get categoriaId(): string { return this.#categoriaId; }

  get preco(): number {
    return this.#preco;
  }

  /** Setter com regra: preço positivo, com no máximo 2 casas decimais. */
  set preco(valor: number) {
    if (!Number.isFinite(valor) || valor <= 0 || valor > PRECO_MAXIMO) {
      throw erroDeCampo("preco", "O preço deve ser maior que zero.");
    }
    if (Math.abs(valor * 100 - Math.round(valor * 100)) > 1e-6) {
      throw erroDeCampo("preco", "O preço deve ter no máximo 2 casas decimais.");
    }
    this.#preco = arredondarMoeda(valor);
  }

  get estoque(): number {
    return this.#estoque;
  }

  /** Setter com regra: estoque é inteiro e nunca negativo. */
  set estoque(valor: number) {
    if (!Number.isInteger(valor) || valor < 0) {
      throw erroDeCampo("estoque", "O estoque deve ser um número inteiro maior ou igual a zero.");
    }
    this.#estoque = valor;
  }

  /** Getter derivado: só existe leitura. */
  get disponivel(): boolean {
    return this.#ativo && this.#estoque > 0;
  }

  ativar(): void { this.#ativo = true; }
  desativar(): void { this.#ativo = false; }

  atualizar(dados: DadosProduto): void {
    this.#nome = textoObrigatorio(dados.nome, "nome", "Nome", 2, 120);
    this.#descricao = textoObrigatorio(dados.descricao, "descricao", "Descrição", 2, 2000);
    this.preco = dados.preco;
    this.estoque = dados.estoque;
    this.#imagemUrl = this.#validarImagem(dados.imagemUrl);
    this.#categoriaId = textoObrigatorio(dados.categoriaId, "categoriaId", "Categoria", 1, 191);
    if (dados.ativo) this.ativar();
    else this.desativar();
  }

  #validarImagem(url: string | null): string | null {
    const valor = textoOpcional(url, "imagemUrl", "URL da imagem", 255);
    if (valor !== null && !IMAGEM_URL_REGEX.test(valor)) {
      throw erroDeCampo("imagemUrl", "Use um caminho iniciado por / ou uma URL http(s).");
    }
    return valor;
  }

  paraPersistencia(): DadosProduto {
    return {
      nome: this.#nome,
      descricao: this.#descricao,
      preco: this.#preco,
      estoque: this.#estoque,
      imagemUrl: this.#imagemUrl,
      ativo: this.#ativo,
      categoriaId: this.#categoriaId
    };
  }

  paraResposta(): ProdutoResposta {
    return {
      ...this.metadados(),
      ...this.paraPersistencia(),
      disponivel: this.disponivel,
      categoria: this.#categoriaNome ? { id: this.#categoriaId, nome: this.#categoriaNome } : null
    };
  }
}
