import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Todo } from '../todos/todo';
import { TodoService } from '../todos/todo.service';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {

  // public statusString: string;

  public serverFilteredTodos: Todo[];
  public filteredTodos: Todo[];

  public todoOwner: string;
  public todoStatus: 'complete' | 'incomplete' | 'all' = 'all';
  public todoCategory: string;
  public todoBody: string;
  public viewType: 'card' | 'list' = 'card';

  constructor(private todoService: TodoService, private snackBar: MatSnackBar) { }


  getTodosFromServer() {
    this.todoService.getTodos({
      owner: this.todoOwner,
      category: this.todoCategory,
      body: this.todoBody
    }).subscribe(returnedTodos => {
      this.serverFilteredTodos = returnedTodos;
      this.updateFilter();
    }, err => {
      console.error('We couldn\'t get the list of todos; the server might be down');
      this.snackBar.open(
        'Problem contacting the server – try again',
        'OK',
        {duration: 3000});
    });
  }

  // public checkStatus() {
  //   return this.statusString === 'complete';
  // }

  public updateFilter() {
    let statusAsBoolean;
    switch (this.todoStatus) {
      case 'all': {
        statusAsBoolean = undefined;
        break;
      }
      case 'complete': {
        statusAsBoolean = true;
        break;
      }
      case 'incomplete': {
        statusAsBoolean = false;
        break;
      }
    }
    this.filteredTodos = this.todoService.filterTodos(
      this.serverFilteredTodos,
      {
        owner: this.todoOwner,
        status: statusAsBoolean,
        category: this.todoCategory,
        body: this.todoBody
      }
    );
  }

  ngOnInit(): void {
    this.getTodosFromServer();
  }

}
