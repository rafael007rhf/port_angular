import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
  private readonly apiUrl = 'http://localhost:8000/api/contato.php';

  enviar(contato: NovoContato): Observable<RespostaContato> {
    return this.http.post<RespostaContato>(this.apiUrl, contato);
  }
}
