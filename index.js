'use strict';
var gulp = require('gulp');
var Handlebars = require('handlebars');
var rename = require('gulp-rename');
var through = require('through');
var markdown = require( "markdown" ).markdown;
var fs = require('fs');
var _ = require('underscore');

module.exports = function(settings) {
  var blogModel = settings.blog;

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

  var postTemplate = Handlebars.compile(fs.readFileSync(settings.paths.postBodyTemplate).toString());

  gulp.task('posts', ['partials'], function () {
    return gulp.src(settings.src.posts)
      .pipe(rename({extname: '.html'}))
      .pipe(through(function (file) {
        var post = file.contents.toString().split('\n');
        var postModel = {
          title: post[0],
          date: post[1],
          body: markdown.toHTML(post.slice(3).join('\n')),
          outfile: file.relative
        };
        blogModel.posts.push(postModel);

        file.contents = new Buffer(postTemplate(_.extend(_.clone(postModel), blogModel, {frontpage: false})));

        this.queue(file);
      }))
      .pipe(gulp.dest(settings.paths.out));
  });

  gulp.task('skel', function () {
    return gulp.src(settings.src.skel).pipe(gulp.dest(settings.paths.out));
  });

  gulp.task('default', ['skel', 'partials', 'posts'], function () {
    return gulp.src(settings.src.templates)
      .pipe(through(function (file) {
        var ctx = _.extend(_.clone(blogModel), {frontpage: true});
        file.contents = new Buffer(Handlebars.compile(file.contents.toString())(ctx));
        this.queue(file);
      }))
      .pipe(rename({extname: ''}))
      .pipe(gulp.dest(settings.paths.out));
  });
};