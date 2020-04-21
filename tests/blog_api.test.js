const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const blogs = await helper.blogsInDb()

  expect(blogs).toHaveLength(helper.initialBlogs.length)
})

test('blogs have field "id" instead of "_id"', async () => {
  const blogs = await helper.blogsInDb()

  expect(blogs[0].id).toBeDefined()
  expect(blogs[0]._id).not.toBeDefined()
})

test('a valid blog with valid token can be added', async () => {
  const newBlog = {
    title: 'testTitle',
    author: 'testAuthor',
    url: 'testUrl',
    likes: 999
  }

  const token = await helper.loginToken()

  await api
    .post('/api/blogs')
    .set('Authorization', 'Bearer ' + token)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const title = blogsAtEnd.map(n => n.title)
  expect(title).toContain('testTitle')

  const author = blogsAtEnd.map(n => n.author)
  expect(author).toContain('testAuthor')

  const url = blogsAtEnd.map(n => n.url)
  expect(url).toContain('testUrl')

  const likes = blogsAtEnd.map(n => n.likes)
  expect(likes).toContain(999)
})

test('if field "likes" is not set, initial value will be 0', async () => {
  const newBlog = {
    title: 'testTitle',
    author: 'testAuthor',
    url: 'testUrl'
  }

  const token = await helper.loginToken()

  await api
    .post('/api/blogs')
    .set('Authorization', 'Bearer ' + token)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const likes = blogsAtEnd.map(n => n.likes)
  expect(likes).toContain(0)
})

test('if field "title" is not set, response status code 400 Bad request', async () => {
  const newBlog = {
    author: 'testAuthor',
    url: 'testUrl'
  }

  const token = await helper.loginToken()

  await api
    .post('/api/blogs')
    .set('Authorization', 'Bearer ' + token)
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)
})

test('if field "url" is not set, response status code 400 Bad request', async () => {
  const newBlog = {
    title: 'testTitle',
    author: 'testAuthor'
  }

  const token = await helper.loginToken()

  await api
    .post('/api/blogs')
    .set('Authorization', 'Bearer ' + token)
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)
})

test('delete first blog with response 204 and confirm that it was deleted', async () => {
  const blogs = await helper.blogsInDb()
  const id = blogs[0].id

  const token = await helper.loginToken()

  await api
    .delete(`/api/blogs/${id}`)
    .set('Authorization', 'Bearer ' + token)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  const ids = blogsAtEnd.map(n => n.id)
  expect(ids).not.toContain(id)
})

test('update first blog', async () => {
  const blogs = await helper.blogsInDb()
  const id = blogs[0].id

  const blogObject = {
    title: 'testTitle',
    author: 'testAuthor',
    url: 'testUrl',
    likes: 999
  }

  await api
    .put(`/api/blogs/${id}`)
    .send(blogObject)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

  const title = blogsAtEnd.map(n => n.title)
  expect(title).toContain('testTitle')

  const author = blogsAtEnd.map(n => n.author)
  expect(author).toContain('testAuthor')

  const url = blogsAtEnd.map(n => n.url)
  expect(url).toContain('testUrl')

  const likes = blogsAtEnd.map(n => n.likes)
  expect(likes).toContain(999)
})

test('adding new blog without token fails with 401 Unauthorized', async () => {
  const blogObject = {
    title: 'testTitle',
    author: 'testAuthor',
    url: 'testUrl',
    likes: 999
  }

  await api
    .post('/api/blogs')
    .send(blogObject)
    .expect(401)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

afterAll(() => {
  mongoose.connection.close()
})