import {Injectable} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {delay, dematerialize, materialize, mergeMap} from 'rxjs/operators';
import {User} from '../models/user';
import {Role} from '../models/role';

const users: User[] = [
  { id: 1, username: 'admin', password: 'admin', firstName: 'Admin', lastName: 'User', role: Role.Admin },
  {id: 2, username: 'user', password: 'user', firstName: 'Normal', lastName: 'User', role: Role.User}
  ];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { url, method, headers, body } = req;

    // tomamos los parametros simulando la llamada a la api
    return of(null)
      .pipe(mergeMap(handleRoute))
      .pipe(materialize()) //
      .pipe(delay(500))
      .pipe(dematerialize());

    function handleRoute() {
      switch (true) {
        case url.endsWith('/users/authenticate') && method === 'POST':
          return authenticate();
        case url.endsWith('/users') && method === 'GET':
          return getUsers();
        case url.match(/\/users\/\d+$/) && method === 'GET':
          return getUserById();
        default:
          //
          return next.handle(req);
      }
    }

    // route functions

    function authenticate() {
      const {username, password} = body;
      const user = users.find(x => x.username === username && x.password === password);
      if (!user) { return error ('Username or password is incorrect'); }
      return ok({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token: `fake-jwt-token.${user.id}`
      });
    }

    function getUsers() {
      // if (!isLoggedIn()) { return unauthorized(); }
      if (!isAdmin()) { return unauthorized(); }
      return ok(users);
    }

    function getUserById() {
      if (!isLoggedIn()) { return unauthorized(); }

      // solo admin puede acceder a otros registros de usuario
      if (!isAdmin() && currentUser().id !== idFromUrl()) { return unauthorized(); }

      const user = users.find(x => x.id === idFromUrl());
      return ok(user);
    }

    // helper functions
    // tslint:disable-next-line:no-shadowed-variable
    function ok(body) {
      return of(new HttpResponse({status: 200, body}));
    }

    function error(message) {
      return throwError({error: {message}});
    }

    function unauthorized() {
      return throwError({status: 401, error: {message: 'Unauthorized'}});
    }

    function isLoggedIn() {
      const authHeader = headers.get('Authorization') || '';
      return authHeader.startsWith('Bearer fake-jwt-token');
    }
    function isAdmin() {
      return isLoggedIn() && currentUser().role === Role.Admin;
    }
    function currentUser() {
      if (!isLoggedIn()) return;
      // tslint:disable-next-line:radix
      const id = parseInt(headers.get('Authorization').split('.')[1]);
      return users.find(x => x.id === id);
    }
    function idFromUrl() {
      const urlParts = url.split('/');
      // tslint:disable-next-line:radix
      return parseInt(urlParts[urlParts.length - 1]);
    }
  }
}

export let fakeBackendProvider = {
  //
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};
