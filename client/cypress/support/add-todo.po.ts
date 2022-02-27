import {Todo} from 'src/app/todos/todo';

export class AddTodoPage {
  navigateTo() {
    return cy.visit('/todos/new');
  }

  getTitle(){
    return cy.get('.add-todo-title');
  }

  addTodoButton() {
    return cy.get('[data-test=confirmAddTodoButton]');
  }

  getFormField(fieldName: string) {
    return cy.get(`mat-form-field [formcontrolname=${fieldName}]`);
  }

  generateCharacters(length: number) {
    // returns a random sequence of ASCII characters that is a given length
    // used to help test the maximum length requirements of the inputs
    let output = '';
    for (let i = 0; i < length; i++){
      output += String.fromCharCode(Math.round(Math.random() * 50) + 65);
    }
    return output;
  }

  addTodo(newTodo: Todo) {
    this.getFormField('owner').type(newTodo.owner);
    if(newTodo.category){
      this.getFormField('category').type(newTodo.category);
    }
    if (newTodo.status === true){
      this.getFormField('status').click();
    }
    this.getFormField('body').type(newTodo.body);
  }

}
