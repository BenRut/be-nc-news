process.env.NODE_ENV = 'test';
const app = require('../app');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-sorted'));
const request = require('supertest');
const connection = require('../db/connection');

beforeEach(() => connection.seed.run());
after(() => connection.destroy());

describe('/api', () => {
  describe('GET', () => {
    describe(':)', () => {
      it('responds with status 200 and JSON containing all available endpoints', () => {
        return request(app)
          .get('/api')
          .expect(200)
          .then(({ body }) => {
            expect(body.api).to.eql({
              '/topics': {
                get: 'responds with an aray of topics on key of topics'
              },
              '/users': {
                ':username':
                  'responds with requested user object on the key of user'
              },
              '/articles': {
                get: 'responds with arrays of articles on key of articles',
                '/:article_id': {
                  get: 'responds with requested article on key of article',
                  patch:
                    'receives request on body to increment or decrement the value of votes by 1 eg. "{inc_votes: 1}", updates vote count on article and responds with updated article object on key of article',
                  '/comments': {
                    post:
                      'receives request on body of comment and username eg. "{ username: "rogersop", body: "hello" }" and responds with comment object on key of comment',
                    get:
                      'responds with array of comments on article on key of comments'
                  }
                }
              },
              '/comments': {
                '/:comment_id': {
                  patch:
                    'receives request on body to increment or decrement value of votes by 1 eg. "{ inc_votes: 1 }", updates vote count on comment and responds with updated comment on key of comment',
                  delete: 'responds with status 204'
                }
              }
            });
          });
      });
    });
  });
  describe(':(', () => {
    it('returns 404 when given invalid url', () => {
      return request(app)
        .get('/api/kjshdfgids')
        .expect(404);
    });
  });
});

describe('DELETE', () => {
  describe(':(', () => {
    it('returns 405', () => {
      return request(app)
        .del('/api')
        .expect(405)
        .then(({ body }) => {
          expect(body.msg).to.equal('method not allowed');
        });
    });
  });
});

describe('/topics', () => {
  describe('GET', () => {
    it('responds with status 200 and array of topic objects', () => {
      return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
          expect(body.topics).to.eql([
            {
              description: 'The man, the Mitch, the legend',
              slug: 'mitch'
            },
            {
              description: 'Not dogs',
              slug: 'cats'
            },
            {
              description: 'what books are made of',
              slug: 'paper'
            }
          ]);
        });
    });
  });

  describe('INVALID METHODS', () => {
    it('responds with status 405 for invalid methods', () => {
      const invalidMethods = ['patch', 'put', 'delete'];
      const methodPromises = invalidMethods.map(method => {
        return request(app)
          [method]('/api/topics')
          .expect(405)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('method not allowed');
          });
      });
      // methodPromises -> [ Promise { <pending> }, Promise { <pending> }, Promise { <pending> } ]
      return Promise.all(methodPromises);
    });
  });
});
describe('/users', () => {
  describe('/:username', () => {
    describe('GET', () => {
      describe(':)', () => {
        it('responds with status 200 and requested user object', () => {
          return request(app)
            .get('/api/users/butter_bridge')
            .expect(200)
            .then(({ body }) => {
              expect(body.user).to.eql({
                username: 'butter_bridge',
                name: 'jonny',
                avatar_url:
                  'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg'
              });
            });
        });
      });
      describe(':(', () => {
        it('responds with status 404 for valid but non-existant username', () => {
          return request(app)
            .get('/api/users/pizza')
            .expect(404);
        });
      });
    });
    describe('INVALID METHODS', () => {
      it('responds with status 405 for invalid methods', () => {
        const invalidMethods = ['patch', 'put', 'delete', 'post'];
        const methodPromises = invalidMethods.map(method => {
          return request(app)
            [method]('/api/users/butter_bridge')
            .expect(405)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal('method not allowed');
            });
        });
        // methodPromises -> [ Promise { <pending> }, Promise { <pending> }, Promise { <pending> } ]
        return Promise.all(methodPromises);
      });
    });
  });
});
describe('/articles', () => {
  describe('GET', () => {
    describe(':)', () => {
      it('responds with status 200 and an array of article objects', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles.length).to.equal(12);
          });
      });
      it('responds with an array of article objects which contain a comment_count key', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body: { articles } }) => {
            for (let i = 0; i < articles.length; i++) {
              expect(articles[i]).to.contain.keys('comment_count');
            }
          });
      });
      it('comment count has value of number of comments on each article', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles[0].comment_count).to.equal('13');
          });
      });
      it('articles array is sorted by date as a default and in descending order', () => {
        return request(app)
          .get('/api/articles')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.sortedBy('created_at', {
              descending: true
            });
          });
      });
      it('articles array is sorted by given column', () => {
        return request(app)
          .get('/api/articles?sort_by=body')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.sortedBy('body', {
              descending: true
            });
          });
      });
      it('articles array is sorted in descending order when passed desc as query', () => {
        return request(app)
          .get('/api/articles?order=asc')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.be.sortedBy('created_at', {
              descending: false
            });
          });
      });
      it('articles array contains only those by given author in query', () => {
        return request(app)
          .get('/api/articles?author=icellusedkars')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles.length).to.equal(6);
          });
      });
      it('articles array contains only those by given topic in query', () => {
        return request(app)
          .get('/api/articles?topic=cats')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles.length).to.equal(1);
          });
      });
      it('responds with status 200 and empty array when queried author who has no articles', () => {
        return request(app)
          .get('/api/articles?author=lurker')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.eql([]);
          });
      });
      it('responds with status 200 and empty array when queried existing topic with no articles', () => {
        return request(app)
          .get('/api/articles?topic=paper')
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).to.eql([]);
          });
      });
    });

    describe(':(', () => {
      it('responds with 404 when sorted by invalid column', () => {
        return request(app)
          .get('/api/articles?sort_by=pizza')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal('bad request');
          });
      });
      it('responds with 400 when given invalid order query', () => {
        return request(app)
          .get('/api/articles?order=pizza')
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).to.equal('bad request');
          });
      });
      it('responds with 404 when given non-existant author', () => {
        return request(app)
          .get('/api/articles?author=steve')
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal('not found');
          });
      });
      it('responds with 404 when given non-existant topic', () => {
        return request(app)
          .get('/api/articles?topic=steve')
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.equal('not found');
          });
      });
    });
  });
  describe('INVALID METHODS', () => {
    it('responds with status 405 for invalid methods', () => {
      const invalidMethods = ['patch', 'put', 'delete'];
      const methodPromises = invalidMethods.map(method => {
        return request(app)
          [method]('/api/articles')
          .expect(405)
          .then(({ body: { msg } }) => {
            expect(msg).to.equal('method not allowed');
          });
      });
      // methodPromises -> [ Promise { <pending> }, Promise { <pending> }, Promise { <pending> } ]
      return Promise.all(methodPromises);
    });
  });

  describe('/:article_id', () => {
    describe('GET', () => {
      describe(':)', () => {
        it('responds with status 200 and requested article object', () => {
          return request(app)
            .get('/api/articles/1')
            .expect(200)
            .then(({ body }) => {
              expect(body.article).to.contain.keys(
                'article_id',
                'title',
                'body',
                'votes',
                'topic',
                'author',
                'created_at'
              );
            });
        });
        it('article object contains comment count', () => {
          return request(app)
            .get('/api/articles/1')
            .expect(200)
            .then(({ body }) => {
              expect(body.article).to.contain.keys('comment_count');
            });
        });
        it('comment count has value of number of comments on article', () => {
          return request(app)
            .get('/api/articles/1')
            .expect(200)
            .then(({ body }) => {
              expect(body.article.comment_count).to.equal('13');
            });
        });
      });
      describe(':(', () => {
        it('responds with status 404 when requested non-existent valid article id ', () => {
          return request(app)
            .get('/api/articles/13')
            .expect(404);
        });
        it('responds with status 400 when requested invalid article id', () => {
          return request(app)
            .get('/api/articles/kjghlojgou')
            .expect(400);
        });
      });
    });
    describe('PATCH', () => {
      describe(':)', () => {
        it('responds with 200 and updated article', () => {
          return request(app)
            .patch('/api/articles/1')
            .send({ inc_votes: 1 })
            .expect(200)
            .then(({ body: { article } }) => {
              expect(article.votes).to.equal(101);
            });
        });
        it('responds with 200 and unchanged article when given empty body', () => {
          return request(app)
            .patch('/api/articles/1')
            .send({})
            .expect(200)
            .then(({ body: { article } }) => {
              expect(article.votes).to.equal(100);
            });
        });
      });

      describe(':(', () => {
        it('responds with 404 when attempting to update non-existant article', () => {
          return request(app)
            .patch('/api/articles/100')
            .send({ inc_votes: 1 })
            .expect(404);
        });
        it('responds with 400 when not given integer', () => {
          return request(app)
            .patch('/api/articles/1')
            .send({ inc_votes: 'hello' })
            .expect(400);
        });
      });
    });
    describe('INVALID METHODS', () => {
      it('responds with status 405 for invalid methods', () => {
        const invalidMethods = ['put', 'delete'];
        const methodPromises = invalidMethods.map(method => {
          return request(app)
            [method]('/api/articles/1')
            .expect(405)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal('method not allowed');
            });
        });
        // methodPromises -> [ Promise { <pending> }, Promise { <pending> }, Promise { <pending> } ]
        return Promise.all(methodPromises);
      });
    });
    describe('/comments', () => {
      describe('POST', () => {
        describe(':)', () => {
          it('returns status 201 and added comment', () => {
            return request(app)
              .post('/api/articles/1/comments')
              .send({ username: 'rogersop', body: 'hello' })
              .expect(201)
              .then(({ body }) => {
                expect(body.comment).to.contain.keys(
                  'author',
                  'body',
                  'comment_id',
                  'created_at',
                  'votes'
                );
              });
          });
        });
        describe(':(', () => {
          it('returns status 400 when given comment not formatted correctly', () => {
            return request(app)
              .post('/api/articles/1/comments')
              .send({ pizza: 'rogersop', body: 'hello' })
              .expect(400);
          });

          it("responds with status 400 when posting to correctly formatted article id that doesn't exist", () => {
            return request(app)
              .post('/api/articles/10000/comments')
              .send({
                username: 'rogersop',
                body: 'hello'
              })
              .expect(422)
              .then(({ body }) => {
                expect(body.msg).to.equal('unprocessible entity');
              });
          });
          it('responds with status 400 when not given enough data', () => {
            return request(app)
              .post('/api/articles/1/comments')
              .send({})
              .expect(400)
              .then(({ body }) => {
                expect(body.msg).to.equal('bad request');
              });
          });
        });
      });
      describe('GET', () => {
        describe(':)', () => {
          it('responds with status 200 and array of comments', () => {
            return request(app)
              .get('/api/articles/1/comments')
              .then(({ body }) => {
                expect(body.comments.length).to.equal(13);
              });
          });
          it('comments array is sorted by comment_id as a default and in descending order', () => {
            return request(app)
              .get('/api/articles/1/comments')
              .expect(200)
              .then(({ body }) => {
                expect(body.comments).to.be.sortedBy('created_at', {
                  descending: true
                });
              });
          });

          it('comments array is sorted by given column', () => {
            return request(app)
              .get('/api/articles/1/comments?sort_by=votes')
              .expect(200)
              .then(({ body }) => {
                expect(body.comments).to.be.sortedBy('votes', {
                  descending: true
                });
              });
          });
          it('comments array is sorted in descending order when passed desc as query', () => {
            return request(app)
              .get('/api/articles/1/comments?order=asc')
              .expect(200)
              .then(({ body }) => {
                expect(body.comments).to.be.sortedBy('created_at', {
                  descending: false
                });
              });
          });
          it('returns 200 when article exists but has no comments', () => {
            return request(app)
              .get('/api/articles/2/comments')
              .expect(200)
              .then(({ body: { comments } }) => {
                expect(comments).to.eql([]);
              });
          });
        });
        describe(':(', () => {
          it('returns 404 when requests comments for valid but non-existant article', () => {
            return request(app)
              .get('/api/articles/1000/comments')
              .expect(404)
              .then(({ body }) => {
                expect(body.msg).to.equal('not found');
              });
          });

          it('responds with 404 when sorted by invalid column', () => {
            return request(app)
              .get('/api/articles/1/comments?sort_by=pizza')
              .expect(400)
              .then(({ body }) => {
                expect(body.msg).to.equal('bad request');
              });
          });
          it('responds with 400 when given invalid order query', () => {
            return request(app)
              .get('/api/articles/1/comments?order=pizza')
              .expect(400)
              .then(({ body }) => {
                expect(body.msg).to.equal('bad request');
              });
          });
        });
      });
      describe('INVALID METHODS', () => {
        it('responds with status 405 for invalid methods', () => {
          const invalidMethods = ['put', 'delete', 'patch'];
          const methodPromises = invalidMethods.map(method => {
            return request(app)
              [method]('/api/articles/1/comments')
              .expect(405)
              .then(({ body: { msg } }) => {
                expect(msg).to.equal('method not allowed');
              });
          });
          // methodPromises -> [ Promise { <pending> }, Promise { <pending> }, Promise { <pending> } ]
          return Promise.all(methodPromises);
        });
      });
    });
  });
});
describe('/comments', () => {
  describe('/:comment_id', () => {
    describe('PATCH', () => {
      describe(':)', () => {
        it('responds with status 200 and updated comment', () => {
          return request(app)
            .patch('/api/comments/1')
            .send({ inc_votes: 1 })
            .expect(200)
            .then(({ body: { comment } }) => {
              expect(comment.votes).to.equal(17);
            });
        });
        it('responds with status 200 and unchanged comment when given no body', () => {
          return request(app)
            .patch('/api/comments/1')
            .send({})
            .expect(200)
            .then(({ body }) => {
              expect(body.comment.votes).to.equal(16);
            });
        });
      });
      describe(':(', () => {
        it('responds with 404 when attempting to update non-existant comment', () => {
          return request(app)
            .patch('/api/comments/100')
            .send({ inc_votes: 1 })
            .expect(404);
        });
        it('responds with 400 when not given integer', () => {
          return request(app)
            .patch('/api/comments/1')
            .send({ inc_votes: 'hello' })
            .expect(400);
        });
      });
    });
    describe('DELETE', () => {
      describe(':)', () => {
        it('responds with status 204', () => {
          return request(app)
            .delete('/api/comments/1')
            .expect(204);
        });
      });
      describe(':(', () => {
        it('responds with status 404 when trying to delete non-existing comment', () => {
          return request(app)
            .delete('/api/comments/100')
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).to.equal('not found');
            });
        });
      });
    });
    describe('INVALID METHODS', () => {
      it('responds with status 405 for invalid methods', () => {
        const invalidMethods = ['put', 'post', 'get'];
        const methodPromises = invalidMethods.map(method => {
          return request(app)
            [method]("/api/comments/'1")
            .expect(405)
            .then(({ body: { msg } }) => {
              expect(msg).to.equal('method not allowed');
            });
        });
        // methodPromises -> [ Promise { <pending> }, Promise { <pending> }, Promise { <pending> } ]
        return Promise.all(methodPromises);
      });
    });
  });
});
