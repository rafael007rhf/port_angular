import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../auth.service';

import { ProjetoService } from '../projeto.service';
import { Gestao } from './gestao';

describe('Gestao', () => {
  let component: Gestao;
  let fixture: ComponentFixture<Gestao>;
  let criar: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    criar = vi.fn(() => of({ id: 1 }));

    await TestBed.configureTestingModule({
      imports: [Gestao],
      providers: [
        { provide: AuthService, useValue: { autenticado: () => true, sair: vi.fn() } },
        {
          provide: ProjetoService,
          useValue: {
            listar: () => of([]),
            criar,
            atualizar: () => of({ mensagem: 'Projeto atualizado' }),
            excluir: () => of(undefined),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Gestao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not create a project with an invalid name', () => {
    component.form.controls.nome.setValue('');
    component.salvar();

    expect(criar).not.toHaveBeenCalled();
    expect(component.form.controls.nome.touched).toBe(true);
  });
});
