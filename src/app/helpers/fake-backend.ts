import {Injectable} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {delay, dematerialize, materialize, mergeMap} from 'rxjs/operators';
import {User} from '../models/user';

const users: User[] = [{ id: 1, username: 'test', password: 'test', firstName: 'Test', lastName: 'User'}];

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
        token: 'fake-jwt-token'
      });
    }

    function getUsers() {
      if (!isLoggedIn()) { return unauthorized(); }
      return ok(users);
    }

    // helper functions
    // tslint:disable-next-line:no-shadowed-variable
    function ok(body?) {
      return of(new HttpResponse({status: 200, body}));
    }

    function error(message) {
      return throwError({error: {message}});
    }

    function unauthorized() {
      return throwError({status: 401, error: {message: 'Unauthorized'}});
    }

    function isLoggedIn() {
      return headers.get('Authorization') === 'Bearer fake-jwt-token';
    }
  }
}

export let fakeBackendProvider = {
  //
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};
