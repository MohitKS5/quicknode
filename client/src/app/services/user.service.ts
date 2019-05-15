import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public user;

  constructor(private http: HttpClient) {
  }

  signin(username: string, password: string) {
    console.log(username, password);
    return this.http.post('/api/login', {username: username, password: password}).pipe(map((resp: { status: number, data: any }) => {
      this.user = resp.data;
      return resp;
    }));
  }

  signup(name, username, password) {
    return this.http.post('/api/signup', {name: name, username: username, password: password}).pipe(map(
      resp => {
        console.log(resp);
        this.user = {name: name, username: username, password: password};
        return resp;
      }
    ));
  }

  getAllUsers(){
    return this.http.post('/api/getallusers', {});
  }

  makeAdmin(username){
    return this.http.put('/api/makeadmin/'+username, {});
  }

  deleteUser(username){
    return this.http.delete('/api/deleteuser/'+username);
  }
}
