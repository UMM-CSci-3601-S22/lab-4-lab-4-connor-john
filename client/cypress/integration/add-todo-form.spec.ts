import { AddTodoPage } from '../support/add-todo.po';
import { Todo } from 'src/app/todos/todo';
import { clear } from 'console';

describe('Add Todo', () => {
  const page = new AddTodoPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('should have the correct title', () => {
    page.getTitle().should('have.text', 'New Todo');
  });

  it('Should enable and disable the add todo button', () => {
    //ADD TODO button should be disabled when required entries aren't filled.
    // Once everything is field, the button should be enabled.
    page.addTodoButton().should('be.disabled');
    page.getFormField('category').type('testing');
    page.addTodoButton().should('be.disabled');
    page.getFormField('body').type('lorem ipsum...');
    page.getFormField('owner').type('test-owner-1 and then we will type something long to test that it limits to 64 characters.');
    page.addTodoButton().should('be.disabled');
    page.getFormField('owner').clear().type('test-owner-should-pass');
    //all inputs should have valid input, then the button is enabled.
    page.addTodoButton().should('be.enabled');
  });

  it('Should show error messages for invalid inputs', () => {
    //there shouldn't be errors after nothing happened.
    cy.get('[data-test=ownerError').should('not.exist');
    //clicking the owner field without entering anything should cause an error
    page.getFormField('owner').click().blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    //more tests for various invalid name inputs
    page.getFormField('owner').type('J').blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    page.getFormField('owner').clear().type(page.generateCharacters(250));
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    //entering a valid owner should clear the error
    page.getFormField('owner').clear().type('Test owner').blur();
    cy.get('[data-test=ownerError]').should('not.exist');

    //there shouldn't be errors after nothing happened.
    cy.get('[data-test=categoryError').should('not.exist');
    //clicking the owner field without entering anything should cause an error
    page.getFormField('category').click().blur();
    cy.get('[data-test=categoryError]').should('exist').and('be.visible');
    //more tests for various invalid name inputs
    page.getFormField('category').type('J').blur();
    cy.get('[data-test=categoryError]').should('exist').and('be.visible');
    page.getFormField('category').clear().type(page.generateCharacters(250));
    cy.get('[data-test=categoryError]').should('exist').and('be.visible');
    //entering a valid category should clear the error
    page.getFormField('category').clear().type('Test category').blur();
    cy.get('[data-test=categoryError]').should('not.exist');

    //There should not be an error after nothing has happened yet
    cy.get('[data-test=bodyError]').should('not.exist');
    //Clicking the body field without entering anything should result in an error
    page.getFormField('body').click().blur();
    cy.get('[data-test=bodyError]').should('exist').and('be.visible');
    //After typing a reasonable "body" in the todo should result in no error.
    page.getFormField('body').type('A reasonable text for the body of a todo').blur();
    cy.get('[data-test=bodyError]').should('not.exist');
    //After typing an unreasonably long text in the "body" section, there should be an error.
    page.getFormField('body').clear().type(page.generateCharacters(5000)).blur();

    cy.get('[data-test=bodyError]').should('exist').and('be.visible');
  });


  describe('Adding a new todo', () => {

    beforeEach(() => {
      cy.task('seed:database');
    });
/*
    it('Should go to the right page and have the right info', () => {
      const todo: Todo = {
        _id: null,
        owner: 'test Owner',
        category: 'test category',
        status: false,
        body: 'Some test string for the body'
      };

      page.addTodo(todo);

      // New URL should end in the 24 hex character Mongo ID of the newly added todo
      //Commenting this out until we implement mongo and todoController.
      cy.url()
        .should('match', /\/todos\/[0-9a-fA-F]{24}$/)
        .should('not.match', /\/todos\/new$/);
      cy.get('.todo-card-owner').should('have.text', todo.owner);
      cy.get('.todo-card-category').should('have.text', todo.category);
      cy.get('.todo-card-body').should('have.text', todo.body);
      cy.get('.todo-card-status').should('be.true', todo.status);

      //We should see the confirmation message at the bottom of the screen
      cy.get('.mat-simple-snackbar').should('contain', `Added Todo ${todo._id}`);
    });

    it('Should fail with no category', () => {
      const todo: Todo = {
        _id: null,
        owner: 'test Owner',
        category: null, //This is null, so we should run into errors
        status: false,
        body: 'Some test string for the body'
      };

      page.addTodo(todo);

      //Continue here and proceed to check for errors

      cy.get('.mat-simple-snackbar').should('contain', 'Failed to add the todo');

      cy.url()
      .should('not.match', /\/todos\/[0-9a-fA-F]{24}$/)
      .should('match', /\/todos\/new$/);

      page.getFormField('owner').should('have.value', todo.owner);
      page.getFormField('body').should('have.value', todo.body);
      page.getFormField('status').should('have.value', todo.status);

    });
*/
  });
});


