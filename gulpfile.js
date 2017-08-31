var gulp = require('gulp'),
    reload = require('require-reload')(require),
    pkg = reload('./package.json'),
    fs = require('fs'),
    path = require('path'),
    del = require('del'),
    globby = require('globby'),
    frontMatter = require('front-matter'),
    feed = require('feed'),
    hljs = require('highlight.js'),
    mdnh = require('markdown-it-named-headers'),
    markdown = require('markdown-it')({
      html: true,
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(lang, str).value;
          } catch (__) {}
        }

        return '';
      }
    })
      .use(mdnh),
    pug = require('pug'),
    browserSync = require('browser-sync').create(),
    svgSprite = require('gulp-svg-sprite'),
    postcss = require('gulp-postcss'),
    sass = require('gulp-sass'),
    sassGlob = require('gulp-sass-glob'),
    surge = require('gulp-surge'),
    blog,
    nav;


function formatDate(date) {
  var monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return monthNames[monthIndex] + ' ' + day + ', ' + year;
}


gulp.task('clean', function() {

  if (fs.existsSync(pkg.data.static)) {
    del(pkg.data.static + '/*');
  }

});


gulp.task('prep', function() {

  if (!fs.existsSync(pkg.data.static)) {
    fs.mkdirSync(pkg.data.static);
  }

});


gulp.task('process', ['prep'], function() {

  blog = [];
  nav = [];

  var files = globby.sync([
    'content/*.md',
    '!content/_*md'
  ]);

  for (file in files) {
    var contents = fs.readFileSync(files[file], 'utf8');

    var content = frontMatter(contents);
    var currentDate = new Date();
    content.attributes.markup = markdown.render(content.body);
    content.attributes.name = path.basename(files[file], '.md');
    content.attributes.link = content.attributes.name + '.html';

    if(content.attributes.date <= currentDate) {
      content.attributes.date = formatDate(content.attributes.date);
      blog.push(content.attributes);
    }
  }

  blog.sort(function(a, b) {
    a = new Date(a.date);
    b = new Date(b.date);
    return a > b ? -1 : a < b ? 1 : 0;
  });

  for (var post in blog) {
    var category;

    if(blog[post].category) {
      category = blog[post].category;
    } else {
      category = 'misc';
    }

    nav.push({
      name: category,
      url: category.replace(' ', '-') + '.html',
      posts: []
    });
  }

  // Prevent duplicate nav labels
  for (var i = 0; i < nav.length; i++) {
    for (var x = i+1; x < nav.length; x++) {
      if (i !== x && nav[i].name === nav[x].name) {
        nav.splice(x, 1);
      }
    }
  }

  for (var post in blog) {
    for (var item in nav) {
      if (blog[post].category == nav[item].name) {
        nav[item].posts.push(blog[post]);
      }
    }
  }

});


gulp.task('index', ['process'], function() {

  var page = 1;
  var division = pkg.data.pager;

  for (var i = 0; i <= blog.length; i+=division) {
    var fn = pug.compileFile(pkg.data.templates + '/templates/index.pug');
    var html = fn({
      categories: nav,
      data: pkg.data,
      posts: blog.slice(i, i + division),
      pager: Math.round(blog.length / division)
    });

    var dir;

    if (i == 0) {
      dir = pkg.data.static + '/index.html';
    } else {
      dir = pkg.data.static + '/page-' + page + '.html';
    }

    fs.writeFile(dir, html, function(err) {
      if (err) console.log(err);
    });

    page++;
  }

});


gulp.task('categories', ['process'], function() {

  for (var item in nav) {
    var fn = pug.compileFile(pkg.data.templates + '/templates/index.pug');
    var html = fn({
      categories: nav,
      data: pkg.data,
      posts: nav[item].posts
    });

    var dir = pkg.data.static + '/' + nav[item].name.toLowerCase().replace(' ', '-') + '.html'

    fs.writeFile(dir, html, function(err) {
      if (err) console.log(err);
    });
  }

});


gulp.task('posts', ['process'], function() {

  for (post in blog) {
    var fn = pug.compileFile(pkg.data.templates + '/templates/post-detail.pug');
    var html = fn({
      categories: nav,
      data: pkg.data,
      post: blog[post]
    });

    var dir = pkg.data.static + '/' + blog[post].name + '.html';

    fs.writeFile(dir, html, function(err) {
      if (err) console.log(err);
    });
  }

});


gulp.task('sprite', function() {

  return gulp.src(pkg.data.theme + '/icons/*.svg')
    .pipe(svgSprite({
      mode: {
        inline: true,
        symbol: {
          dest: pkg.data.theme
        }
      },
      svg: {
        xmlDeclaration: false,
        doctypeDeclaration: false,
        dimensionAttributes: true
      }
    }))
    .pipe(gulp.dest('.'));

});


gulp.task('sass', function() {

  return gulp.src(pkg.data.theme + '/sass/site.scss')
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      require('autoprefixer')({
        browsers: [
          '> 1%',
          'last 2 versions'
        ],
        cascade: false
      })
    ]))
    .pipe(gulp.dest(pkg.data.static + '/css'))
    .pipe(browserSync.stream());

});


gulp.task('favicon', function() {

  return gulp.src(pkg.data.theme + '/favicons/*')
    .pipe(gulp.dest(pkg.data.static));

});


gulp.task('rss', function() {

  rss = new feed({
    title: pkg.data.site.name,
    description: pkg.data.site.description,
    id: pkg.data.site.url,
    link: pkg.data.site.url,
    image: pkg.data.site.url + 'favicon-32x32.png',
    favicon: pkg.data.site.url + 'favicon.ico',
    copyright: 'All rights reserved ' + new Date().getFullYear() + ', ' + pkg.author,
    updated: new Date(2013, 06, 14),
    feedLinks: {
      json: pkg.data.site.url + 'json',
      atom: pkg.data.site.url + 'atom',
    },
    author: {
      name: pkg.author,
      email: pkg.email,
      link: pkg.link
    }
  });

  var files = globby.sync([
    'content/*.md',
    '!content/_*md'
  ]);

  for (file in files) {
    var contents = fs.readFileSync(files[file], 'utf8');

    var content = frontMatter(contents);
    content.attributes.markup = markdown.render(content.body);
    content.attributes.name = path.basename(files[file], '.md');
    content.attributes.link = content.attributes.name + '.html';

    rss.addItem({
      title: content.attributes.title,
      id: content.attributes.name,
      link: pkg.data.site.url + content.attributes.link,
      description: content.attributes.summary,
      content: content.attributes.markup,
      author: [{
        name: pkg.author,
        email: pkg.email,
        link: pkg.link
      }],
      date: content.attributes.date
    });
  }

  var rss2 = rss.rss2();
  var atom1 = rss.atom1();
  var json1 = rss.json1();

  fs.writeFile(pkg.data.static + '/feed.xml', rss2, function(err) {
    if (err) console.log(err);
  });

  fs.writeFile(pkg.data.static + '/feed.atom', atom1, function(err) {
    if (err) console.log(err);
  });

  fs.writeFile(pkg.data.static + '/feed.json', json1, function(err) {
    if (err) console.log(err);
  });

});


gulp.task('surge', ['render', 'favicon', 'rss'], function() {

  return surge({
    project: './' + pkg.data.static,
    domain: pkg.data.site.url
  });

});


gulp.task('browser-sync', function() {

  browserSync.init({
    logPrefix: pkg.name,
    ui: false,
    server: './' + pkg.data.static + '/',
    notify: {
      styles: {
        top: 'auto',
        bottom: '0',
        padding: '4px 8px',
        fontSize: '12px',
        borderBottomLeftRadius: '0'
      }
    }
  });

});


gulp.task('reload', function() {

  browserSync.reload();

});


gulp.task('reset', function() {

  try {
    pkg = reload('./package.json');
  } catch (e) {
    console.error("Failed to reload package.json! Error: ", e);
  }

});


gulp.task('watch', function() {

  gulp.watch('package.json', ['reset', 'render', 'reload']);
  gulp.watch('content/*.md', ['render', 'reload']);
  gulp.watch(pkg.data.theme + '/icons/*.svg', ['sprite', 'render', 'reload']);
  gulp.watch(pkg.data.theme + '/sass/*.scss', ['sass']);
  gulp.watch(pkg.data.theme + '/templates/*.pug', ['render', 'reload']);
  gulp.watch(pkg.data.theme + '/favicons/*', ['favicon', 'reload']);

});


gulp.task('render', [
  'index',
  'categories',
  'posts'
]);


gulp.task('default', [
  'sprite',
  'render',
  'sass',
  'watch',
  'browser-sync'
]);
