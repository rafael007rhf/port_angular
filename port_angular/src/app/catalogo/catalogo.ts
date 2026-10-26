import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Tecnologia, TecnologiaService } from '../tecnologia.service';

@Component({
  selector: 'app-catalogo',
  imports: [MatCardModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo implements OnInit {
  private readonly detector = inject(ChangeDetectorRef);
  private readonly tecnologiaService = inject(TecnologiaService);

  tecnologias: Tecnologia[] = [];
  carregando = true;
  erro = '';

  ngOnInit(): void {
    this.tecnologiaService.listar().subscribe({
      next: (tecnologias) => {
        this.detector.markForCheck();
        this.tecnologias = tecnologias;
        this.carregando = false;
      },
      error: () => {
        this.detector.markForCheck();
        this.erro = 'Não foi possível carregar as tecnologias. Tente novamente mais tarde.';
        this.carregando = false;
      },
    });
  }
}
