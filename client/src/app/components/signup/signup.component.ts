import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  public res = null;

  constructor(private http: HttpClient, private userService: UserService, private router: Router) {
  }

  ngOnInit() {
  }

  signup(name, username, password) {
    this.userService.signup(name, username, password).subscribe(
      (resp: any) => {
        this.res = resp;
        if (resp.status == 200) this.router.navigate(['/dashboard']);
      }
    );
  }

}
