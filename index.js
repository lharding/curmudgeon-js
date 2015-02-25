'use strict';
var Handlebars = require('handlebars');
var rename = require('gulp-rename');
var through = require('through');
var marked = require( 'marked' );
var File = require('gulp-util').File;
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

module.exports = function(gulp, settings) {
  var blogModel = _.clone(settings.blog);

  settings.handlebars && _.pairs(settings.handlebars.helpers).forEach(function(pair) {
    Handlebars.registerHelper(pair[0], pair[1]);
  });

  gulp.task('partials', function () {
    return gulp.src(settings.src.partials)
      .pipe(through(function (file) {
          var partialName = file.relative.slice(0, file.relative.lastIndexOf('.'));
          var template = file.contents.toString();
          Handlebars.registerPartial(partialName, template);
        },
        function () {
          this.queue(null);
        }));
  });

  gulp.task('model', function() {
    return gulp.src(settings.src.posts)
      .pipe(rename({extname: '.html'}))
      .pipe(through(function (file) {
          var post = file.contents.toString().split('\n');
          var postModel = {
            title: post[0],
            date: post[1],
            tags: post[2].split(',').map(function(tag) {return tag.trim(); }),
            body: marked(post.slice(3).join('\n')),
            outfile: file.relative
          };
          blogModel.posts.push(postModel);
        },
        function() {
          blogModel.posts = _.sortBy(blogModel.posts, 'date').reverse();
          this.queue(null);
        }));
  });

  var postTemplate = Handlebars.compile(fs.readFileSync(settings.paths.postBodyTemplate).toString());

  gulp.task('posts', ['partials', 'model'], function () {
      var rs = new through();
      var ret = rs.pipe(gulp.dest(settings.paths.out));

      blogModel.posts.forEach(function(postModel) {
        var file = new File({
          base: path.join(__dirname, settings.paths.out),
          cwd: __dirname,
          path: path.join(__dirname, settings.paths.out, postModel.outfile),
          contents: new Buffer(postTemplate(_.extend(_.clone(postModel), blogModel, {frontpage: false})))
        });

        rs.queue(file);
      });

      rs.queue(null);

      return ret;
  });

  gulp.task('skel', function () {
    return gulp.src(settings.src.skel).pipe(gulp.dest(settings.paths.out));
  });

  var tagTemplate = settings.paths.tagPageTemplate && Handlebars.compile(fs.readFileSync(settings.paths.tagPageTemplate).toString());

  gulp.task('tags', ['partials', 'model'], function() {
    var tags = {};

    blogModel.posts.forEach(function(post) {
      post.tags.forEach(function(tag) {
        tags[tag] = tags[tag] || [];
        tags[tag].push(post);
      });
    });

    blogModel.tags = _.pairs(tags).map(function(pair) {
      return {
        tag: pair[0],
        tagged_posts: pair[1],
        page: path.join(settings.paths.tagPages, pair[0] + '.html')
      }
    });

    var rs = through();
    var ret = rs.pipe(gulp.dest(settings.paths.out));

    blogModel.tags.forEach(function(tag) {
      var file = new File({
        base: path.join(__dirname, settings.paths.tagPages),
        cwd: __dirname,
        path: path.join(__dirname, settings.paths.tagPages, tag.page),
        contents: new Buffer(tagTemplate(_.extend(_.clone(tag), blogModel)))
      });

      rs.queue(file);
    });

    rs.queue(null);

    return ret;
  });

  gulp.task('pages', ['model', 'partials'], function () {
    return gulp.src(settings.src.templates)
      .pipe(through(function (file) {
        var ctx = _.extend(_.clone(blogModel), {frontpage: true});
        file.contents = new Buffer(Handlebars.compile(file.contents.toString())(ctx));
        this.queue(file);
      }))
      .pipe(rename({extname: ''}))
      .pipe(gulp.dest(settings.paths.out));
  });

  gulp.task('curmudgeon', ['tags', 'posts', 'skel', 'pages']);
};