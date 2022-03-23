import { ComponentFixture, TestBed, async, waitForAsync } from '@angular/core/testing';

import { TodosComponent } from './todos.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { TodoService } from './todo.service';
import { MockTodoService } from 'src/testing/todo.service.mock';
import { Todo } from './todo';

const COMMON_IMPORTS: any[] = [
  FormsModule,
  MatCardModule,
  MatFormFieldModule,
  MatSelectModule,
  MatOptionModule,
  MatButtonModule,
  MatInputModule,
  MatExpansionModule,
  MatTooltipModule,
  MatListModule,
  MatDividerModule,
  MatRadioModule,
  MatSnackBarModule,
  BrowserAnimationsModule,
  RouterTestingModule,
];


let todoList: TodosComponent;
async function constructTodoList() {
  await TestBed.compileComponents();
  const fixture = TestBed.createComponent(TodosComponent);
  todoList = fixture.componentInstance;
  fixture.detectChanges();

}
describe('TodoListComponent', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [COMMON_IMPORTS],
      declarations: [TodosComponent],

      providers: [{ provide: TodoService, useValue: new MockTodoService() }]
    });
  });

  beforeEach(waitForAsync(constructTodoList));

  it('contains all the todos', () => {
    expect(todoList.serverFilteredTodos.length).toBe(4);
  });

  it('contains a Todo named "video game"', () => {
    expect(todoList.serverFilteredTodos.some((todo: Todo) => todo.category === 'video games')).toBe(true);
  });

  it('contains a Todo named "software design"', () => {
    expect(todoList.serverFilteredTodos.some((todo: Todo) => todo.category === 'software design')).toBe(true);
  });

});

describe('Misbehaving Todo List', () => {

  let todoServiceStub: {
    getTodos: () => Observable<Todo[]>;
    getTodosFiltered: () => Observable<Todo[]>;
  };

  beforeEach(() => {

    todoServiceStub = {
      getTodos: () => new Observable(observer => {
        observer.error('getTodos() Observer generates an error');
      }),
      getTodosFiltered: () => new Observable(observer => {
        observer.error('getTodosFiltered() Observer generates an error');
      })
    };
    TestBed.configureTestingModule({
      imports: [COMMON_IMPORTS],
      declarations: [TodosComponent],

      providers: [{ provide: TodoService, useValue: todoServiceStub }]
    });
  });


  beforeEach(waitForAsync(constructTodoList));

  it('fails to load users if we do not set up a TodoListService', () => {

    expect(todoList.serverFilteredTodos).toBeUndefined();
  });
});
