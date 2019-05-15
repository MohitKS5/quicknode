import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {Route, Router} from '@angular/router';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public res = null;

  constructor(private userService: UserService, private router: Router) {
  }

  signin(username: string, password: string) {
    console.log(username, password);
    this.userService.signin(username,password).subscribe((resp: any) => {
      this.res = resp;
      if(resp.status==200) this.router.navigate(['/dashboard']);
    });
  }

  ngOnInit() {
  }

}
