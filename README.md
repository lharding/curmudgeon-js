# Curmudgeon.js

Curmudgeon.js is a static blog generator for impatient Javascript programmers.
Actually serving the files it generates is left as an exercise for the user.

Following the theme of impatient programmers, the following documentation is super-terse.

## Writing

Write your blog posts in text format, saved in files named whatever you want in whatever
directory structure you want (the directory structure will be mirrored in the compiled output).
The first line of a post is the post title, the second line is the date (any date format),
the third line is reserved for future use, and the rest of the file is the body:
````
My Cool Post
Morndas, 3rd Frostfall, 3E2411
RESERVED
## A subheading
Blah *blah* a long blog post about obscure Elder Scrolls references.
````
Markdown in post bodies will be processed into HTML using the markdown npm module.

## Using

The cleanest thing to do is use this repo as a private NPM package by putting it into a
`package.json` in the root of your blog project dir:
````
{
    "name": "My neato blog",
    "dependencies": {
        "curmudgeon.js": "git+https://github.com/lharding/curmudgeon-js.git"
    }
}
````

You then need a `gulpfile.js` that sets your options and actually invokes curmudgeon:

````
var settings = {
  src: {
    /* Where to look for handlebars templates. Each found file gets rendered
       using the 'blog' object below as context, and then saved with its '.hbs'
       extension lopped off. (Thus templates should be named things like 
       'index.html.hbs'.) */
    templates: ['templates/*.hbs'],
   
    /* Where to look for handlebars partials. The partial name will be the filename
       minus extension, e.g. global_header.hbs -> {{> global_header }} */
    partials: ['templates/partials/**/*.hbs'],
    
    /* Where to look for blog posts. */
    posts:    ['blog/**/*.blog'],
    
    /* A website skeleton containing any styles or assets you want. Gets copied into 
    the output directory when building. */
    skel:     ['skel/**/*']
  },
  paths: {
    /* The template file to use for post permalink pages. The context passed to the
       template is the 'blog' object below merged with the post context (see below) 
       for the post being rendered. */
    postBodyTemplate: 'templates/partials/post_full.hbs',
    
    /* The directory to put output files in. */
    out: 'out'
  },
  
  /* Context object to pass to templates. */
  blog: {
    url_prefix: '/',
    blog_title: '#!/bin/lsh',
    blog_host: 'lsh.io',
    blog_author: 'Leander Harding',
    page_title: 'Leander Harding',
    now: new Date().toString(),
    
    /* Gets filled out with an array of template context objects generated from the 
       post files. Example:
    {
      title: "Title of Post",
      date: "Jan 1, 1970 00:00:00.000",
      body: "Post body html",
      outfile: "path/relative/to/settings.src.posts"
    } */
    posts: []
  }
};

require('curmudgeon.js')(settings);
````

Curmudgeon obnoxiously registers itself as the default gulp task, so you can now run `gulp`
in your project dir and it will generate your blog according to the setings above.