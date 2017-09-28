'use strict';

const express = require('express');
const knex = require('../knex');
const {camelizeKeys, decamelizeKeys} = require('humps');
// eslint-disable-next-line new-cap
const router = express.Router();

// YOUR CODE HERE
//GET
router.get('/books', (_req, res, next) => {
  knex('books')
    .orderBy('title', 'ASC')
    .select('id', 'title', 'author', 'genre', 'description', 'cover_url as coverUrl', 'created_at as createdAt', 'updated_at as updatedAt')
    .then((books) => {
      res.send(books);
    })
    .catch((err) => {
      next(err);
    });
});
router.get('/books/:id', function (req, res, next) {
  const id = req.params.id
  knex('books')
  .orderBy('title', 'ASC')
  .select('id', 'title', 'author', 'genre', 'description', 'cover_url as coverUrl', 'created_at as createdAt', 'updated_at as updatedAt')
    .where('id', id)
    .then((books) => {
      if (books.length < 1) {
        return res.sendStatus(404)
      }
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(books[0]))
    })
    .catch((err) => next(err))
})

//POST
router.post('/books', (req, res, next) => {
  knex('books')
    .insert({
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      description: req.body.description,
      cover_url: req.body.coverUrl
    }, '*')
    .then((book) => {
      const newObj = {
        id: book[0].id,
        title: book[0].title,
        author: book[0].author,
        genre: book[0].genre,
        description: book[0].description,
        coverUrl: book[0].cover_url
      }
      res.send(newObj);
    })
    .catch((err) => {
      next(err);
    });
});


//PATCH
router.patch('/books/:id', function (req, res, next) {
  const id = Number.parseInt(req.params.id)

  if (Number.isNaN(id)) {
    return next()
  }

  knex('books')
  .where('id', id)
  .first()
  .then((book) => {
    let newobj = {
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      description: req.body.description,
      coverUrl: req.body.coverUrl
    }
    return knex('books')
    .update(decamelizeKeys(newobj), '*')
    .where('id', id)
  })
  .then((rows) => {
    const book = camelizeKeys(rows[0])
    res.send(book)
  })
  .catch((err) => {
    next(err)
  })
})

//DELETE
router.delete('/books/:id', function(req, res, next) {
  const id = req.params.id
  if (Number.isNaN(id)) {
    return next()
  }
  let book
  knex('books')
  .where('id', id)
  .first()
  .then((row) => {
    book = camelizeKeys(row)
    return knex('books')
    .del()
    .where('id', id);
  })
  .then(() => {
    delete book.id
    res.send(book)
  })
})



module.exports = router;
