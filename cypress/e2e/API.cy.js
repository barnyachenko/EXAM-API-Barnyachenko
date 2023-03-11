///<reference types="cypress"/>

import { faker } from '@faker-js/faker';

describe('Exam tasks', () => {

  let token
  let userId
  it('Precondition. Get token.', () => {
    let body = {
      "email": faker.internet.email(),
      "password": faker.internet.password()
    }
    cy.request('POST', '/register', body).then( response => {
      token = response.body.accessToken
      userId = response.body.user.id
    })
  })

  let allPosts
  it('Task 1. Get all posts. Verify HTTP response status code and content type.', () => {
    cy.log('Get all posts');
    cy.request('GET', '/posts').then( response => {
      expect(response.status).to.be.equal(200);
      expect(response.headers["content-type"]).to.be.equal("application/json; charset=utf-8")
      allPosts = response.body
    })
  })

  let first10Posts
  it('Task 2. Get only first 10 posts. Verify HTTP response status code. Verify that only first posts are returned.', () => {
    cy.log('Get only first 10 posts')
    cy.request('GET', '/posts?_start=0&_end=10').then( response => {
      expect(response.status).to.be.equal(200);
      expect(response.body.length).to.be.equal(10);
      first10Posts = response.body
      expect(compareElementsOrder()).to.be.true
      function compareElementsOrder() {
        let result = true
        first10Posts.forEach((element, index) => { 
          if (element.id !== allPosts[index].id) 
            result = false
        }) 
        return result
      }
    })
  })   
  
  it('Task 3. Get posts with id = 55 and id = 60', () => {
    cy.log('Get posts with id = 55 and id = 60')
    cy.request('GET', '/posts?id=55&id=60').then( response => {
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
      expect(response.status).to.be.equal(401);  
    })
  })

  it('Task 5. Create post with adding access token in header. Verify HTTP response status code. Verify post is created.', () => {
    let postId;
    cy.log('Create a post')
    cy.request({
      method: 'POST', 
      url: '/664/posts', 
      headers: {"Authorization": "Bearer " + token}
    }).then( response => {
      expect(response.status).to.be.equal(201);
      postId = response.body.id;

      cy.log('Verify post is created')
      cy.request('GET', `/posts/${postId}`).then( response => {
        expect(`${JSON.stringify(response.body.id)}`).to.be.equal(`${postId}`);
      })
      deletePost(postId)
    })
  })

  it('Task 6. Create post entity and verify that the entity is created. Verify HTTP response status code. Use JSON in body.', () => {
    let postId;
    let entityTitle = faker.word.noun()
    let entityBody = faker.word.noun()
    cy.log('Create a post entity')
    cy.request({
      method: 'POST', 
      url: '/posts', 
      body:  {
        "title": entityTitle,      
        "body": entityBody         
      }
    }).then( response => {
      expect(response.status).to.be.equal(201);
      postId = response.body.id;

      cy.log('Verify post entity is created')
      cy.request('GET', `/posts/${postId}`).then( response => {
        expect(`${JSON.stringify(response.body.id)}`).to.be.equal(`${postId}`);
        expect(response.body.title).to.be.equal(entityTitle);
        expect(response.body.body).to.be.equal(entityBody); 
      })
      deletePost(postId)
    })
  })

  it('Task 7. Update non-existing entity. Verify HTTP response status code.', () => {
    let id = faker.random.numeric()
    cy.log('Delete random post to check not existing entity')
    cy.request({
      method: 'DELETE', 
      url: `/posts/${id}`,
      failOnStatusCode: false
    }).then ( () => {
      cy.log('Update non-existing entity')
      cy.request({
        method: 'PUT', 
        url: `/posts/${id}`, 
        body:  {
        "title": faker.word.noun(),         
        "body": faker.word.noun()             
        },
      failOnStatusCode: false
      }).then( response => {
        console.log(response);
        expect(response.status).to.be.equal(404);
      })
    })
  })

  let postID
  it('Task 8. Create post entity and update the created entity. Verify HTTP response status code and verify that the entity is updated.', () => {
    let entityTitle = faker.word.noun()
    let entityBody = faker.word.noun()
    cy.log('Create post entity')
    cy.request({
      method: 'POST', 
      url: '/posts', 
      body:  {
        "title": entityTitle,       
        "body": entityBody            
      }
    }).then( response => {
      let entityTitle = faker.word.noun()
      let entityBody = faker.word.noun()
      postID = response.body.id

      cy.log('Update the created entity')
      cy.request({
        method: 'PUT',
        url: `/posts/${postID}`,
        body: {
          "title": entityTitle,       
          "body": entityBody             
        }
      }).then( response => {
        expect(response.status).to.be.equal(200);
        expect(response.body.title).to.be.equal(entityTitle);
        expect(response.body.body).to.be.equal(entityBody); 
      })
      deletePost(postID)
    })
  })

  it('Task 9. Delete non-existing post entity. Verify HTTP response status code.', () => {
    let id = faker.random.numeric()
    cy.log('Delete random post')
    cy.request({
      method: 'DELETE', 
      url: `/posts/${id}`,
      failOnStatusCode: false
    }).then ( () => {
      cy.log('Delete not existing post')
      cy.request({
        method: 'DELETE', 
        url: `/posts/${id}`,
        failOnStatusCode: false
      }).then( response => {
        console.log(response);
        expect(response.status).to.be.equal(404);
      })
    })
  })

  let postID2
  it('Task 10. Create post entity, update the created entity, and delete the entity. Verify HTTP response status code and verify that the entity is deleted.', () => {
    let entityTitle = faker.word.noun()
    let entityBody = faker.word.noun()
    cy.log('Create post entity')
    cy.request({
      method: 'POST', 
      url: '/posts', 
      body:  {
        "title": entityTitle,     
        "body": entityBody          
      }
    }).then( response => {
      let entityTitle = faker.word.noun()
      let entityBody = faker.word.noun()
      postID2 = response.body.id

      cy.log('Update the created entity')
      cy.request({
        method: 'PUT',
        url: `/posts/${postID2}`,
        body: {
          "title": entityTitle,       
          "body": entityBody             
        }
      }).then( response => {
        expect(response.status).to.be.equal(200);
        expect(response.body.title).to.be.equal(entityTitle);
        expect(response.body.body).to.be.equal(entityBody); 

      cy.log('Delete the updated entity')
      cy.request('DELETE', `/posts/${postID2}`).then( response => {
        expect(response.status).to.be.equal(200);

        cy.log('Check deleted entity is deleted')
        cy.request({
          method: 'GET', 
          url: `/posts/${postID2}`,
          failOnStatusCode: false
        }).then( response => {
          expect(response.status).to.be.equal(404);
        })
      })
    })
  })
})

  it('Postcondition. Delete created user.', () => {
    cy.request('DELETE', `/users/${userId}`)
  })
 
  function deletePost(id) {
    cy.request('DELETE', `/posts/${id}`)
  }
})
