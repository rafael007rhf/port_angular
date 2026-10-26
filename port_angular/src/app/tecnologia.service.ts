import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api.config';

export interface Tecnologia {
  id: number;
  nome: string;
  categoria: string;
  descricao: string;
  ano_criacao: number;
}

@Injectable({ providedIn: 'root' })
export class TecnologiaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_URL}/tecnologias`;

  listar(): Observable<Tecnologia[]> {
    return this.http.get<Tecnologia[]>(this.apiUrl);
  }
}
