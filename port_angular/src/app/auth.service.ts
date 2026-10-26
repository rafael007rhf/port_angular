import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly chave = 'portfolio.token';
  private readonly token = signal(sessionStorage.getItem(this.chave) ?? '');
  readonly autenticado = computed(() => this.token().length > 0);

  entrar(email: string, senha: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${API_URL}/login`, { email, senha }).pipe(
      tap(({ token }) => {
        sessionStorage.setItem(this.chave, token);
        this.token.set(token);
      }),
    );
  }

  headers(): HttpHeaders {
    return this.token() ? new HttpHeaders({ Authorization: `Bearer ${this.token()}` }) : new HttpHeaders();
  }

  sair(): void {
    sessionStorage.removeItem(this.chave);
    this.token.set('');
  }
}
