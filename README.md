## Designer
[![Build Status](https://travis-ci.org/Prismatik/designer.svg?branch=master)](https://travis-ci.org/Prismatik/designer)

### How to:

`npm install designer`

```
var designer = require('designer');
var docs = [
  {
    _id: '_design/people',
    version: 1,
    views: {
      friendly: {
        map: "function(person) { return (doc.manners > 4 && doc.empathy > 7) }"
      }
    }
  }
];
designer('http://localhost:5984/ohai', docs, function(errs) {
  errs.forEach(function(err, i) {
    console.log('err for', docs[i], 'was', err);
  });
});
```

### What?

This is a library for managing your design docs in a couch database.

A nice thing about CouchDB is that your code is data. Configuring your database is just a matter of putting some data (design docs) in it.

The superpower this gives your applications is that your source code can include data that tells the database how the application expects it to behave.

In pseudocode:

```
start application
application looks on disk for some design documents
application posts all those design documents to its couch
couch now has all the views/etc that the application expects
yay!
```

I found myself writing the above code across multiple applications.

It gets dreary when you also have to handle making modifications to design docs. In order to update a document, you have to overwrite the old one. Obviously you only want to do this if you've got something newer!

designer expects your documents to have a version property. They get compared with `if (new < old)` so they should probably just be integers.
