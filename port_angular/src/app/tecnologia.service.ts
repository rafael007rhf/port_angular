import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
  private readonly apiUrl = 'http://localhost:8000/api/tecnologias.php';

  listar(): Observable<Tecnologia[]> {
    return this.http.get<Tecnologia[]>(this.apiUrl);
  }
}
