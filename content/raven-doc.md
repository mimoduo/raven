---
title: Raven Documentation
date: 2017-06-29
category: projects
summary: AAWWW yeaaa!!! Time to get drilling down to the Raven blog workflow - from getting familiar with Raven's structure to creating your own theme. If you're familiar with Pelican, you'll feel right at home (p^-^)p
---

## Getting Started

First, let's start with some of the basics of Raven by detailing where everything is:

* **content**: markdown files representing your blog posts
* **output**: static files generated based on the theme and content
* **themes**: appearance and markup of your blog

### Installing Raven

Once you're set with [npm](https://nodejs.org/en/), whip out your terminal and enter in the following:

```ssh
git clone https://github.com/mimoduo/raven.git
cd raven
sudo npm install gulp-cli -g
npm install
gulp
```

> **That's it!** Gulp will begin to process all posts, spin up a live reload server, and begin watching for any post, template, icon, or style changes.

**Now you're officially ready to start creating your new blog by**:

* [configuring your blog's settings](#configuring-raven),
* [structuring your blog](#structuring-your-blog),
* [styling your blog](#styling-your-blog),
* and [creating markdown content](#creating-content)!

## How Raven Works

Raven grabs all the markdown files you've written in the content folder and processes them as such:

**markdown >> json >> pug :: index/post-detail/categories pages**

1. Retrieves the contents of each markdown file
2. Processes the file's front matter field
3. Renders the file's markdown content into viable HTML
4. Pushes a json object representation of the file to a blog array
5. Sorts the newly created array by date
6. Sorts the articles by category
7. Compiles index pages using the blog array
8. Compiles post detail pages using the blog array
8. Compiles category pages using the blog array

## Configuring Raven

Raven pulls in the `"data"` object from the **package.json** file to render your blog. *Feel free to add key: value pairs here to help better represent your blog*:

```js
"data": {
  "site": {
    "name": "raven",
    "url": "raven.surge.sh"
  },
  "fonts": [
    {
      "family": "Oxygen",
      "weights": "300,400,700"
    }
  ],
  "analytics": true,
  "disqus": {
    "include": true,
    "shortname": "raven-blog"
  },
  "static": "output",
  "theme": "themes/feather",
  "templates": "themes/feather",
  "pager": 8,
  "links": {
    "social": [
      {
        "name": "Github",
        "url": "https://github.com"
      },
      {
        "name": "Codepen",
        "url": "https://codepen.io"
      }
    ]
  }
}
```

### Data Object Reference

* **fonts**: provides pug the data needed to dynamically pull google fonts
* **static**: determines the output directory of static content
* **theme**: determines which sass theme folder to pull from
* **templates**: determines which pug templates folder to pull from
* **pager**: the amount of posts on each index page

### Using Data Within Templates

Data can be referenced within pug by **evaluating template locals**:

```pug
//- Render the site name from data: { site: { name: ""}}
h1= data.site.name
p Thanks to the power of Raven my blog, #{data.site.name}, was possible!

//- Render each link from data: { links: { social: []}}
each link in data.links.social
  a(href=link.url)= link.name

//- Render arbitrary values from data: { custom: ""}
h2= data.custom
```

## Structuring Your Blog

The first thing you'll likely want to do is modify the templates a bit, starting from base.pug. If you haven't written in pug before, here's an [awesome pug tutorial](http://mimoduo.surge.sh/learn-pug-js-with-pugs.html) for you!

> **Remember**, all of the variables used within each template are provided to pug from your *package.json's* `"data"` *object* and *each markdown post's front matter*.

**base.pug** is the foundational template that provides the structure to all other page templates, namely:

* **index.pug**: *list view for blog articles*
* **post-detail.pug**: *detail view for a specific blog article*

All other templates are considered **partials** that are included on the aforementioned templates:

* **post.pug**: foundational template to represent each post
* **pager.pug**: provides the ability to chunk your blog list
* **analytics.pug**: *conditionally included based on your blog's settings*
* **disqus.pug**: *conditionally included based on your blog's settings*

## Styling Your Blog

All of the classes used within the base templates are available to style within the **feather theme** under `/themes/feather/sass/*`. For those new to Sass, here's a quick [sass cheat sheet](https://codepen.io/mimoduo/post/sass-cheat-sheet) for you!

There are a few utility files to help you through development:

* normalize.css: *basic reset for browser consistency*
* functions.scss: *several inline font sizing functions for ems & rems*
* variables.scss: *grid variables & a space for custom variables*

### Creating Your Own Theme

Creating your own theme is a piece of cake. Since Raven treats markup and styles separately, you can continue to use the feather theme templates while developing your own theme outside of feather. *Just reconfigure your blog's settings to point to a different theme folder*:

```json
"data": {
  "theme": "themes/yourTheme"
}
```

Afterwards, make sure that your new theme folder contains the following folder structure for gulp to process Sass correctly:

`/themes/yourTheme/sass/site.scss`

## Creating Content

Each blog article is written in **Markdown** with the addition of **front matter**. If you're diggin for a markdown tutorial, [daring fireball](https://daringfireball.net/projects/markdown/syntax) has you covered! The following front matter meets the minimum requirements for a blog article:

```md
---
title: Blog Post Title Field
date: 2017-07-24
category: navie
summary: Blog Post Summary Field
---

# Your Markdown Content!
```

After saving this post, you'll notice a new entry on the index page, a new detail page, and a new category in the main navigation.

## Fly With the Wind!

All the basics of Raven have been covered! There's a bit more to explore and a lot more on the way. I hope you enjoy publishing your blog with Raven! And if you have already published your blog, wouldn't you want some free recognition? Jump over to the [Raven github repo](https://github.com/mimoduo/raven) and add your blog to the [Blogs Running Raven](https://github.com/mimoduo/raven#blogs-running-raven) section.
