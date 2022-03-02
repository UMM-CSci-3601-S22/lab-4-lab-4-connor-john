import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Todo } from '../todos/todo';
import { TodoService } from '../todos/todo.service';

@Component({
  selector: 'app-add-todo',
  templateUrl: './add-todo.component.html',
  styleUrls: ['./add-todo.component.scss']
})
export class AddTodoComponent implements OnInit {

  addTodoForm: FormGroup;
  todo: Todo;

  //Add error messages for invalid form inputs.
  addTodoValidationMessages = {
    owner: [
      {type: 'required', message: 'Owner is required'},
      {type: 'minlength', message: 'Owner must be at least 2 characters long'},
      {type: 'maxlength', message: 'Owner cannot be more than 64 characters long'}
    ],

    category: [
      {type: 'required', message: 'Category is required'},
      {type: 'minlength', message: 'Category must have at least 2 characters'},
      {type: 'maxlength', message: 'Category must not have more than 128 characters'}
    ],

    body: [
      {type: 'required', message: 'Body is required'},
      {type: 'minlength', message: 'Body must have at least 2 characters'},
      {type: 'maxlength', message: 'Body must not have more than 4096 characters'}
    ]
  };


  constructor(private todoService: TodoService, private fb: FormBuilder, private snackBar: MatSnackBar, private router: Router) { }

  ngOnInit(): void {
    this.createForms();
  }

  createForms() {
    this.addTodoForm = this.fb.group({
      owner: new FormControl('', Validators.compose([
        Validators.required,
        //we assume that the shortest owner name is going to be initials, so length 2
        Validators.minLength(2),
        //We assume that most names are less than 64 characters, but that's not necessarily the case
        Validators.maxLength(64)
      ])),

      //no actual validation is necessary
      status: new FormControl(''),

      category: new FormControl('', Validators.compose([
        Validators.required,
        //most category names should have more than 2 characters
        Validators.minLength(2),
        //most category names are less than 128 characters
        Validators.maxLength(128)
      ])),

      body: new FormControl('', Validators.compose([
        Validators.required,
        //the body can't be empty
        Validators.minLength(2),
        //We don't want todo descriptions to be horrendously long,
        //but they have to be long enough to be detailed, and 4096 characters
        //seems like a good balance.
        Validators.maxLength(4096)
      ]))
    });
  }

  submitForm() {
    this.todoService.addTodo(this.addTodoForm.value).subscribe(newID => {
      this.snackBar.open(`Added Todo: ${this.addTodoForm.value.owner}`, null, {
        duration: 2000,
      });
      this.router.navigate(['/todos/', newID]);
    }, err => {
      this.snackBar.open('Failed to add the todo', 'OK', {
        duration: 5000,
      });
    });
  }

}
