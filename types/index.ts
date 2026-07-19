export interface Autor {
  nome_exibicao: string;
  avatar_url: string;
  instagram_handle?: string;
}

export interface Post {
  id: string;
  conteudo: string;
  tipo: 'imagem' | 'texto' | 'video' | string;
  categoria: string;
  titulo: string;
  resposta_charada?: string;
  upvotes: number;
  downvotes: number;
  cor_fundo?: string;
  imagem_url?: string;
  video_url?: string;
  anonimo: boolean;
  autor: Autor;
  published_at?: string;
  tags?: string[];
}
