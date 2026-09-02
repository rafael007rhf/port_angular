import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ContatoService } from '../contato.service';
import { Contato } from './contato';

describe('Contato', () => {
  let component: Contato;
  let fixture: ComponentFixture<Contato>;
  let enviar: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    enviar = vi.fn(() =>
      of({ sucesso: true, id: 1, mensagem: 'Contato recebido com sucesso!' }),
    );

    await TestBed.configureTestingModule({
      imports: [Contato],
      providers: [
        {
          provide: ContatoService,
          useValue: { enviar },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Contato);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not send an invalid form', () => {
    component.onSubmit();

    expect(enviar).not.toHaveBeenCalled();
    expect(component.form.controls.nome.touched).toBe(true);
  });

  it('sends and resets a valid form', () => {
    component.form.setValue({
      nome: 'Rafael',
      email: 'rafael@example.com',
      mensagem: 'Mensagem válida para teste.',
    });

    component.onSubmit();

    expect(enviar).toHaveBeenCalledOnce();
    expect(component.sucesso).toBe('Contato recebido com sucesso!');
    expect(component.form.controls.nome.value).toBe('');
    expect(component.enviando).toBe(false);
  });
});
