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

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'testTitle',
    author: 'testAuthor',
    url: 'testUrl',
    likes: 999
  }

  await api
    .post('/api/blogs')
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

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const likes = blogsAtEnd.map(n => n.likes)
  expect(likes).toContain(0)
})

afterAll(() => {
  mongoose.connection.close()
})