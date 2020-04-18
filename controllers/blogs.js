
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs.map(note => note.toJSON()))
})

blogsRouter.post('/', async (request, response) => {
  if (!request.body.title) {
    response.status(400).json({ error: 'missing title-field' })
  } else if (!request.body.url) {
    response.status(400).json({ error: 'missing url-field' })
  } else {
    const blog = new Blog(request.body)
    const savedBlog = await blog.save()
    response.status(201).json(savedBlog.toJSON())
  }
})

module.exports = blogsRouter