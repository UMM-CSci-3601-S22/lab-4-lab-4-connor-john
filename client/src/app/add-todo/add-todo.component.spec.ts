import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AbstractControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MockTodoService } from 'src/testing/todo.service.mock';
import { TodoService } from '../todos/todo.service';

import { AddTodoComponent } from './add-todo.component';

describe('AddTodoComponent', () => {
  let component: AddTodoComponent;
  let addTodoForm: FormGroup;
  let fixture: ComponentFixture<AddTodoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatCheckboxModule,
        BrowserAnimationsModule,
        RouterTestingModule,
      ],
      declarations: [ AddTodoComponent ],
      providers: [{provide: TodoService, useValue: new MockTodoService() }]
    })
    .compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTodoComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    fixture.detectChanges();
    addTodoForm = component.addTodoForm;
    expect(addTodoForm).toBeDefined();
    expect(addTodoForm.controls).toBeDefined();
  });

  it('should create the component and form', () => {
    expect(component).toBeTruthy();
    expect(addTodoForm).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(addTodoForm.valid).toBeFalsy();
  });

  describe('the owner field', () => {
    let ownerControl: AbstractControl;

    beforeEach(() => {
      ownerControl = component.addTodoForm.controls.owner;
    });

    it ('should be invalid when empty', () => {
      expect(addTodoForm.valid).toBeFalsy();
    });

    it ('should fail on a single character name', () => {
      ownerControl.setValue('x');
      expect(ownerControl.valid).toBeFalsy();
      expect(ownerControl.hasError('minlength')).toBeTruthy();
    });

    it ('should fail on a really long name', () => {
      ownerControl.setValue('x'.repeat(100));
      expect(ownerControl.valid).toBeFalsy();
    });

    it ('should allow the name \'John Doe\'', () => {
      ownerControl.setValue('John Doe');
      expect(ownerControl.valid).toBeTruthy();
    });
  });

  describe('The status field', () => {
    let statusControl: AbstractControl;
    beforeEach(() => {
      statusControl = component.addTodoForm.controls.status;
    });

    it ('should be false before anything happens', () => {
      expect(statusControl.value).toBeFalsy();
    });
  });

  describe('The category field', () => {

  });

});
