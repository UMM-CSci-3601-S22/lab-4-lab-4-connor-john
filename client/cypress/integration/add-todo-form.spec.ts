import { AddTodoPage } from '../support/add-todo.po';
describe('Add Todo', () => {
  const page = new AddTodoPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('should have the correct title', () => {
    page.getTitle().should('have.text', 'New todo');
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
    page.getFormField('owner').clear().type('This name is long and should cause problems with the maximum length for the owner field');
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
    page.getFormField('category').clear().type('This name is long, causing problems with the maximum length for the category field');
    cy.get('[data-test=categoryError]').should('exist').and('be.visible');
    //entering a valid category should clear the error
    page.getFormField('category').clear().type('Test category').blur();
    cy.get('[data-test=categoryError]').should('not.exist');
  });

});
