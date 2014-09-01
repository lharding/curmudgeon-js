var gulp = require('gulp');

var settings = {
  src: {
    templates: ['templates/*.hbs'],
    partials: ['templates/partials/**/*.hbs'],
    posts:    ['blog/**/*.blog'],
    skel:     ['skel/**/*']
  },
  paths: {
    postBodyTemplate: 'templates/partials/post_full.hbs',
    out: 'out'
  },
  blog: {
    url_prefix: '/',
    blog_title: '#!/bin/lsh',
    blog_host: 'lsh.io',
    blog_author: 'Leander Harding',
    page_title: 'Leander Harding',
    now: new Date().toString(),
    posts: []
  }
};

require('..')(gulp, settings);

gulp.task('watch', function () {
  gulp.watch(settings.src.posts, ['curmudgeon']);
  gulp.watch(settings.src.skel, ['curmudgeon']);
});

gulp.task('default', ['curmudgeon']);