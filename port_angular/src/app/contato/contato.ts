import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ContatoService } from '../contato.service';

@Component({
  selector: 'app-contato',
  imports: [MatButtonModule, MatCardModule, ReactiveFormsModule],
  templateUrl: './contato.html',
  styleUrl: './contato.css',
})
export class Contato {
  private readonly formBuilder = inject(FormBuilder);
  private readonly contatoService = inject(ContatoService);
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    mensagem: ['', [Validators.required, Validators.minLength(10)]],
  });

  enviando = false;
  sucesso = '';
  erro = '';

  onSubmit(): void {
    this.sucesso = '';
    this.erro = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focarPrimeiroCampoInvalido();
      return;
    }

    this.enviando = true;

    this.contatoService.enviar(this.form.getRawValue()).subscribe({
      next: (resposta) => {
        this.sucesso = resposta.mensagem;
        this.form.reset();
        this.enviando = false;
      },
      error: (err: HttpErrorResponse) => {
        const errosBackend = err.error?.erros;

        this.erro =
          Array.isArray(errosBackend) && errosBackend.length > 0
            ? errosBackend.join(' ')
            : 'Não foi possível enviar a mensagem. Tente novamente mais tarde.';
        this.enviando = false;
      },
    });
  }

  private focarPrimeiroCampoInvalido(): void {
    const primeiroCampo = this.elemento.nativeElement.querySelector<HTMLElement>(
      'input.ng-invalid, textarea.ng-invalid',
    );
    primeiroCampo?.focus();
  }
}
