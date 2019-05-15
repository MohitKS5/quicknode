import {Component, OnInit} from '@angular/core';
import {map} from 'rxjs/operators';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public user;
  public data;

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.user = this.userService.user;
    this.fetchUsers();
  }

  fetchUsers() {
    if (this.user.isAdmin) this.data = this.userService.getAllUsers().pipe(map((resp: any) => resp.data));
  }

  makeAdmin(username){
    this.userService.makeAdmin(username).subscribe(res => {
      this.fetchUsers();
      console.log(res);
    });
  }

  deleteUser(username){
    this.userService.deleteUser(username).subscribe(res=> {
      this.fetchUsers();
      console.log(res);
    });
  }

}
