import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TodoService } from 'src/app/todos/todo.service';
import { Todo } from '../app/todos/todo';

@Injectable()
export class MockTodoService extends TodoService {
  //pulled from Lab 3
  static testTodos: Todo[] = [
    {
      _id: '58895985a22c04e761776d54',
      owner: 'Blanche',
      status: false,
      body: 'In sunt ex non tempor cillum commodo amet incididunt anim qui commodo quis. Cillum non labore ex sint esse.',
      category: 'software design'
    },
    {
      _id: '58895985c1849992336c219b',
      owner: 'Fry',
      status: false,
      body: 'Ipsum esse est ullamco magna tempor anim laborum non officia deserunt veniam commodo. Aute minim incididunt ex commodo.',
      category: 'video games'
    },
    {
      _id: '58895985ae3b752b124e7663',
      owner: 'Fry',
      status: true,
      body: 'Ullamco irure laborum magna dolor non. Anim occaecat adipisicing cillum eu magna in.',
      category: 'homework'
    },
    {
      _id: '58895985186754887e0381f5',
      owner: 'Blanche',
      status: true,
      body: 'Incididunt enim ea sit qui esse magna eu. Nisi sunt exercitation est Lorem consectetur incididunt'
      + 'cupidatat laboris commodo veniam do ut sint.',
      category: 'software design'
    }
  ];

  constructor() {
    super(null);
  }

  getTodos(filters: {owner?: string; status: boolean; category?: string; body?: string }): Observable<Todo[]> {
    return of(MockTodoService.testTodos);
  }

  getTodoById(id: string): Observable<Todo> {
    if (id === MockTodoService.testTodos[0]._id) {
      return of(MockTodoService.testTodos[0]);
    } else {
      return of(null);
    }
  }
}
