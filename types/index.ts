export interface Autor {
  nome_exibicao: string;
  avatar_url: string;
}

export interface Post {
  id: string;
  conteudo: string;
  tipo: 'imagem' | 'texto' | string;
  categoria: string;
  titulo: string;
  resposta_charada?: string;
  upvotes: number;
  downvotes: number;
  cor_fundo?: string;
  imagem_url?: string;
  anonimo: boolean;
  autor: Autor;
}
