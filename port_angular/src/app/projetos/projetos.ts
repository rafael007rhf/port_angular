import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Projeto, ProjetoService } from '../projeto.service';

@Component({
  selector: 'app-projetos',
  imports: [MatButtonModule, MatCardModule],
  templateUrl: './projetos.html',
  styleUrl: './projetos.css',
})
export class Projetos implements OnInit {
  private readonly projetoService = inject(ProjetoService);

  projetos: Projeto[] = [];
  carregando = true;
  erro = '';

  ngOnInit(): void {
    this.projetoService.listar().subscribe({
      next: (projetos) => {
        this.projetos = projetos;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar os projetos. Tente novamente mais tarde.';
        this.carregando = false;
      },
    });
  }
}
