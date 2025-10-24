export interface ResultadoBusquedaVideo {
  id: number;
  title: string;
  description?: string;
  url?: string;
  poster?: string;
  genre?: string;
  year?: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  consulta: string;
}
