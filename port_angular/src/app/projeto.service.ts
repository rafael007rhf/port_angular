import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Projeto {
  id?: number;
  nome: string;
  descricao: string;
  tecnologias: string;
  link_github: string;
  ano: number;
  status: 'rascunho' | 'publicado' | 'arquivado';
}

export interface RespostaCriacaoProjeto {
  id: number;
}

export interface RespostaAtualizacaoProjeto {
  mensagem: string;
}

@Injectable({ providedIn: 'root' })
export class ProjetoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/projetos';

  listar(todos = false): Observable<Projeto[]> {
    if (todos) {
      return this.http.get<Projeto[]>(`${this.apiUrl}/todos`);
    }

    return this.http.get<Projeto[]>(this.apiUrl);
  }

  criar(projeto: Projeto): Observable<RespostaCriacaoProjeto> {
    return this.http.post<RespostaCriacaoProjeto>(this.apiUrl, projeto);
  }

  atualizar(id: number, projeto: Projeto): Observable<RespostaAtualizacaoProjeto> {
    return this.http.put<RespostaAtualizacaoProjeto>(`${this.apiUrl}/${id}`, projeto);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
