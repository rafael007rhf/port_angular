import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api.config';

export interface NovoContato {
  nome: string;
  email: string;
  mensagem: string;
}

export interface RespostaContato {
  sucesso: boolean;
  id: number;
  mensagem: string;
}

@Injectable({ providedIn: 'root' })
export class ContatoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_URL}/contato`;

  enviar(contato: NovoContato): Observable<RespostaContato> {
    return this.http.post<RespostaContato>(this.apiUrl, contato);
  }
}
