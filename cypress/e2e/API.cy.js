///<reference types="cypress"/>

import { faker } from '@faker-js/faker';
import * as pet from '../fixtures/API.json'

describe('Exam tasks', () => {
let accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJsYTNAbWFpbC5jb20iLCJpYXQiOjE2Nzg0NzAzODYsImV4cCI6MTY3ODQ3Mzk4Niwic3ViIjoiMTQifQ.rZLwndhfqQxSq7GCHhiwkt__CxhDsSG8LO5A4vUz3qs"

  it('Task 1. Get all posts. Verify HTTP response status code and content type.', () => {
    cy.log('Get all posts');
    cy.request('GET', '/posts').then( response => {
      console.log(response);
      expect(response.status).to.be.equal(200);
      expect(response.headers["content-type"]).to.be.equal("application/json; charset=utf-8")
    })
  })

  it('Task 2. Get only first 10 posts. Verify HTTP response status code. Verify that only first posts are returned.', () => {
    cy.log('Get only first 10 posts')
    cy.request('GET', '/posts?_start=0&_end=10').then( response => {
      console.log(response);
      expect(response.status).to.be.equal(200);
      expect(response.body.length).to.be.equal(10);
      // Verify that only first posts are returned.
    })
  })   
  
  it('Task 3. Get posts with id = 55 and id = 60', () => {
    cy.log('Get posts with id = 55 and id = 60')
    cy.request('GET', '/posts?id=55&id=60').then( response => {
      console.log(response);
      expect(response.status).to.be.equal(200);
      expect(response.body[0].id).to.be.equal(55);      
      expect(response.body[1].id).to.be.equal(60);
    })
  })

  it('Task 4. Create a post (without token). Verify HTTP response status code.', () => {
    cy.log('Create a post')
    cy.request({
      method: 'POST', 
      url: '/664/posts', 
      failOnStatusCode: false
    }).then(response => {
      console.log(response);
      expect(response.status).to.be.equal(401);  
    })
  })

  it('Task 5. Create post with adding access token in header. Verify HTTP response status code. Verify post is created.', () => {
    let postId;
    cy.log('Create a post')
    cy.request({
      method: 'POST', 
      url: '/664/posts', 
      headers: {"Authorization": `Bearer ${accessToken}`}         //ADD FAKER
    }).then( response => {
      console.log(response);
      expect(response.status).to.be.equal(201);
      postId = response.body.id;

      cy.log('Verify post is created')
      cy.request('GET', `/posts/${postId}`).then( response => {
        console.log(response);
        expect(`${JSON.stringify(response.body.id)}`).to.be.equal(`${postId}`);
      })
    })
  })

  // it('Task 6. Create post entity and verify that the entity is created. Verify HTTP response status code. Use JSON in body.', () => {
  //   let postId;
  //   cy.log('Create a post entity')
  //   cy.request({
  //     method: 'POST', 
  //     url: '/posts', 
  //     body:  {
  //       "title": `${title}`,          //ADD FAKER
  //       "body": `${body}`             //ADD FAKER
  //     }
  //   }).then( response => {
  //     console.log(response);
  //     expect(response.status).to.be.equal(201);
  //     postId = response.body.id;

  //     cy.log('Verify post entity is created')
  //     cy.request('GET', `/posts/${postId}`).then( response => {
  //       console.log(response);
  //       expect(`${JSON.stringify(response.body.id)}`).to.be.equal(`${postId}`);
  //       expect(`${JSON.stringify(response.body.title)}`).to.be.equal(`${title}`); - check title
  //       expect(`${JSON.stringify(response.body.body)}`).to.be.equal(`${body}`); - check body
  //     })
  //   })
  // })

    it('Task 7. Update non-existing entity. Verify HTTP response status code.', () => {
    cy.log('Update non-existing entity')
    cy.request({
      method: 'PUT', 
      url: '/posts/20000', 
      body:  {
        "title": "test",          //ADD FAKER `${title}`
        "body": "test"             //ADD FAKER `${body}`
      },
      failOnStatusCode: false
    }).then( response => {
      console.log(response);
      expect(response.status).to.be.equal(404);
    })
  })

  it('Task 8. Create post entity and update the created entity. Verify HTTP response status code and verify that the entity is updated.', () => {
    cy.log('Create post entity')
    cy.request({
      method: 'POST', 
      url: '/posts', 
      body:  {
        "title": "test",          //ADD FAKER `${title}`
        "body": "test"             //ADD FAKER `${body}
      }
    }).then( response => {
      console.log(response);
      expect(response.status).to.be.equal(201);
    })
  })


})
