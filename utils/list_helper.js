const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }

  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((max, blog) => max.likes > blog.likes ? max : blog)
}

const mostBlogs = (blogs => {
  let tempBlogs = []

  blogs.map(blog => {
    const index = tempBlogs.findIndex(tempBlog => tempBlog.author === blog.author)

    if (index === -1) tempBlogs.push({ author: blog.author, blogs: 1 })
    else tempBlogs[index].blogs++
  })

  return tempBlogs.reduce((max, blog) => max.blogs > blog.blogs ? max : blog)
})

const mostLikes = (blogs => {
  let tempBlogs = []

  blogs.map(blog => {
    const index = tempBlogs.findIndex(tempBlog => tempBlog.author === blog.author)

    if (index === -1) tempBlogs.push({ author: blog.author, likes: blog.likes })
    else tempBlogs[index].likes += blog.likes
  })

  return tempBlogs.reduce((max, blog) => max.likes > blog.likes ? max : blog)
})

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}