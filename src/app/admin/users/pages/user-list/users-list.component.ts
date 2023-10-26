import { AfterViewInit, Component, ElementRef, EventEmitter, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { HttpParams } from '@angular/common/http';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';

import { merge, startWith, switchMap, map, catchError, of, Subject } from 'rxjs';

import { Users } from '../../shared/interfaces/admin-users-grid.interface';
import { AdminUserService } from '../../shared/services/admin-user.service';
import { DeleteDialogComponent } from 'src/core/components/delete-dialog/delete-dialog.component';
import { NotificationService } from 'src/core/services/notification.service';

@Component({
  selector: 'app-users',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements AfterViewInit {

  displayedColumns: string[] = ['name', 'email', 'phone', 'website', 'action'];
  dataSource: Users[] | any = [];
  rowCount = 0;
  loading = false;
  users: any[] = [];

  show_create_edit: boolean = false;
  table_data: any;
  page_create: any;

  reloadGrid = new EventEmitter<boolean>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  filterSubject: Subject<string> = new Subject<string>();
  @ViewChild('userGridSearch') userGridSearch: ElementRef | any;

  constructor(private adminUserService: AdminUserService, private toastr: NotificationService, public dialog: MatDialog) { }

  // After the component initialization it will call and load the data
  ngAfterViewInit(): void {
    this.getUserData();
  }

  // API call and fetch the data to the table
  getUserData() {
    merge()
      .pipe(
        startWith({}),
        switchMap(() => {
          this.loading = true;
          const params = new HttpParams()
          return this.adminUserService.getUserData(params)
        }),
        map((res: any) => {
          this.loading = false;
          this.rowCount = res && res.length ? res.length : '';
          return res;
        }),
        catchError(() => {
          this.loading = false;
          return of([]);
        })
      ).subscribe(data => {
        this.dataSource = data;
        this.loading = false;
      });
  }

  // Create and Edit passing data to thir component
  createEditUser(data: any = '', page: any = ''): void {
    this.show_create_edit = true;
    if (page == 'edit') {
      this.table_data = data;
      this.page_create = false;
    } else {
      this.page_create = true;
    }

  }

  // When user hit from the create or edit page it will return to the list
  BacktoList(event: any) {
    this.getUserData();
    this.show_create_edit = false;
  }

  // Delete the user from the list
  deleteConfirmModel(data: any) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '350px',
      panelClass: 'respmodelscroll',
      data: {
        id: data.id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.modalConfirm === 'yes') {
        this.adminUserService.deleteUser(data.id).subscribe((res: any) => {
          this.toastr.success({ title: 'Success', message: res.message ? res.message : 'User deleted successfully!' });
        },
          (error: any) => {
            this.loading = false;
            this.toastr.error({
              message: error.error.message ? error.error.message : 'Something went wrong',
              title: 'Error'
            });
          });
      } else {
        this.loading = false;
      }
    });
  }
}