import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);

  getBarbeiros(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(
      `${this.apiConfig.baseUrl}/Usuarios/barbeiros`
    );
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiConfig.baseUrl}/Usuarios`);
  }

  findUsuarioByEmail(email: string): Observable<Usuario | null> {
    return this.getUsuarios().pipe(
      map(
        (usuarios) =>
          usuarios.find((usuario) => usuario.email === email) || null
      )
    );
  }
}
