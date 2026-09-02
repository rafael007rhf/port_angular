import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ProjetoService } from '../projeto.service';
import { Projetos } from './projetos';

describe('Projetos', () => {
  let component: Projetos;
  let fixture: ComponentFixture<Projetos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Projetos],
      providers: [
        {
          provide: ProjetoService,
          useValue: { listar: () => of([]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Projetos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
