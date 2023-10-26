import { Component, ElementRef, Inject, Input } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AdminUserService } from '../../shared/services/admin-user.service';
import { NotificationService } from 'src/core/services/notification.service';
import { emailPattern } from 'src/core/utilites/pattern-validation.component';

@Component({
  selector: 'app-users-form',
  templateUrl: './users-form.component.html',
  styleUrls: ['./users-form.component.scss']
})
export class UsersFormComponent {
  usersForm: any;
  submitted = false;
  loading = false;

  @Input() page:any;
  @Input() tableData:any;

  constructor(private elementRef: ElementRef,private formBuilder: FormBuilder,private activatedRoute: ActivatedRoute,private adminUserService:AdminUserService,
    private toastr: NotificationService, ) {
  }

  // Initialize based on create or edit page
  ngOnInit(): void {
   if(this.page){
     this.initialize_form();
   }else{
    this.initialize_form_with_data();
   }
  }

  // When the create page data will empty so initialize the form
  initialize_form(){
    this.usersForm = this.formBuilder.group({
      Username: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      Email: new FormControl('', [Validators.required,Validators.pattern(emailPattern)]),
      Phone: new FormControl('', [Validators.required]),
      Website: new FormControl(''),
    });
  }

  // When the edit page data will pass
  initialize_form_with_data(){
    this.usersForm = this.formBuilder.group({
      Username: new FormControl(this.tableData.username?this.tableData.username:'', [Validators.required, Validators.maxLength(50)]),
      Email: new FormControl(this.tableData.email?this.tableData.email:'', [Validators.required,Validators.pattern(emailPattern)]),
      Phone: new FormControl(this.tableData.phone?this.tableData.phone:'', [Validators.required]),
      Website: new FormControl(this.tableData.website?this.tableData.website:''),
    });
  }
  get formControls() { return this.usersForm.controls; }

  // Update the user data from the form control
  update(): void {
    if (!this.usersForm.valid) {
      this.submitted = true;
      return;
    }
      this.adminUserService.sendUsersData(this.usersForm.value,this.tableData.id).subscribe((res: any) => {
        if(res.data){
          this.toastr.success({title: 'Success', message: 'Updated Successfully'});
          this.BacktoList();
        } 
      },
      (error: any) => {
      });
  }

  // Save the user data from the form control
  save(){
    if (!this.usersForm.valid) {
      this.submitted = true;
      return;
    }
      this.adminUserService.saveUsersData(this.usersForm.value).subscribe((res: any) => {
        if(res.data){
          this.toastr.success({title: 'Success', message: 'Saved Successfully'});
          this.BacktoList();
        } 
      },
      (error: any) => {

      });
  }

  // It will call hit the parent component list will load
  BacktoList(){
    this.elementRef.nativeElement.dispatchEvent(new CustomEvent('BacktoList', { bubbles: true ,detail:{}}));
  }

}
