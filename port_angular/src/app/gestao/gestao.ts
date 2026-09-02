import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Observable } from 'rxjs';
import { Projeto, ProjetoService } from '../projeto.service';

@Component({
  selector: 'app-gestao',
  imports: [MatButtonModule, MatCardModule, ReactiveFormsModule],
  templateUrl: './gestao.html',
  styleUrl: './gestao.css',
})
export class Gestao implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly projetoService = inject(ProjetoService);
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    descricao: [''],
    tecnologias: [''],
    link_github: [''],
    ano: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
    status: ['rascunho' as 'rascunho' | 'publicado', Validators.required],
  });

  projetos: Projeto[] = [];
  carregando = false;
  salvando = false;
  excluindoId: number | null = null;
  editandoId: number | null = null;
  erro = '';
  sucesso = '';

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = '';

    this.projetoService.listar(true).subscribe({
      next: (projetos) => {
        this.projetos = projetos;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar os projetos da gestão.';
        this.carregando = false;
      },
    });
  }

  salvar(): void {
    this.erro = '';
    this.sucesso = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focarPrimeiroCampoInvalido();
      return;
    }

    if (this.salvando) {
      return;
    }

    const projeto = this.form.getRawValue();
    const id = this.editandoId;
    const requisicao: Observable<unknown> =
      id === null
        ? this.projetoService.criar(projeto)
        : this.projetoService.atualizar(id, projeto);

    this.salvando = true;

    requisicao.subscribe({
      next: () => {
        this.sucesso = id === null ? 'Projeto adicionado com sucesso.' : 'Projeto atualizado com sucesso.';
        this.limparFormulario();
        this.salvando = false;
        this.carregar();
      },
      error: (err: HttpErrorResponse) => {
        this.erro = this.mensagemDoErro(err, 'Não foi possível salvar o projeto.');
        this.salvando = false;
      },
    });
  }

  editar(projeto: Projeto): void {
    if (projeto.id === undefined) {
      return;
    }

    this.editandoId = projeto.id;
    this.erro = '';
    this.sucesso = '';
    this.form.patchValue({
      nome: projeto.nome,
      descricao: projeto.descricao,
      tecnologias: projeto.tecnologias,
      link_github: projeto.link_github,
      ano: projeto.ano,
      status: projeto.status === 'publicado' ? 'publicado' : 'rascunho',
    });
    this.elemento.nativeElement.querySelector<HTMLElement>('#nome-gestao')?.focus();
  }

  cancelarEdicao(): void {
    this.limparFormulario();
    this.erro = '';
  }

  excluir(projeto: Projeto): void {
    if (projeto.id === undefined || this.excluindoId !== null) {
      return;
    }

    if (!confirm(`Excluir o projeto "${projeto.nome}"?`)) {
      return;
    }

    const id = projeto.id;
    this.erro = '';
    this.sucesso = '';
    this.excluindoId = id;

    this.projetoService.excluir(id).subscribe({
      next: () => {
        this.projetos = this.projetos.filter((item) => item.id !== id);
        this.sucesso = 'Projeto excluído com sucesso.';
        this.excluindoId = null;

        if (this.editandoId === id) {
          this.limparFormulario();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.erro = this.mensagemDoErro(err, 'Não foi possível excluir o projeto.');
        this.excluindoId = null;
      },
    });
  }

  private limparFormulario(): void {
    this.form.reset({
      nome: '',
      descricao: '',
      tecnologias: '',
      link_github: '',
      ano: new Date().getFullYear(),
      status: 'rascunho',
    });
    this.editandoId = null;
  }

  private focarPrimeiroCampoInvalido(): void {
    this.elemento.nativeElement
      .querySelector<HTMLElement>('input.ng-invalid, select.ng-invalid')
      ?.focus();
  }

  private mensagemDoErro(err: HttpErrorResponse, padrao: string): string {
    return typeof err.error?.erro === 'string' ? err.error.erro : padrao;
  }
}
