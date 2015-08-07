var couch_url = 'http://127.0.0.1:5984';
var couch = 'designer_test';
var url = [couch_url, couch].join('/');

var test = require('tape');
var tapSpec = require('tap-spec');
var nano = require('nano')(couch_url);

var db = nano.use(couch);

var designer = require('../index');

var util = require('./util');

test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout)

test('create database', function(t) {
  nano.db.create(couch, function(err) {
    t.error(err, 'database created');
    t.end();
  });
});

test('designer should return a function', function(t) {
  t.equal(typeof designer, 'function');
  t.end();
});

test('designer should create a design doc', function(t) {
  var docs = [util.ddoc()];
  designer(url, docs, function(err) {
    t.error(err);
    db.get(docs[0]._id, function(err, doc) {
      t.error(err);
      t.ok(doc, 'doc exists');
      t.equal(doc._id, docs[0]._id);
      t.end();
    });
  });
});

test('created doc should have a version prop', function(t) {
  var docs = [util.ddoc()];
  designer(url, docs, function(err) {
    t.error(err);
    db.get(docs[0]._id, function(err, doc) {
      t.error(err);
      t.ok(doc, 'doc exists');
      t.equal(doc._id, docs[0]._id);
      t.equal(doc.version, 1);
      t.end();
    });
  });
});

test('designer should not return an error when the requested version doc is the same as an existing one', function(t) {
  var docs = [util.ddoc()];
  docs.push(docs[0]);
  designer(url, docs, function(errs) {
    t.error(errs);
    t.end();
  });
});

test('designer should handle posting a newer version of a doc', function(t) {
  var docs = [util.ddoc()];
  designer(url, docs, function(errs) {
    t.error(errs);
    docs[0].version = 2;
    designer(url, docs, function(errs) {
      t.error(errs);
      db.get(docs[0]._id, function(err, doc) {
        t.error(err);
        t.equal(doc.version, 2);
        t.end();
      });
    });
  });
});

test('designer should not overwrite a newer doc with an older one', function(t) {
  var docs = [util.ddoc(2)];
  designer(url, docs, function(errs) {
    t.error(errs);
    docs[0].version = 1;
    designer(url, docs, function(errs) {
      t.deepEqual([new Error('given doc was older than what I found remotely')], errs);
      db.get(docs[0]._id, function(err, doc) {
        t.error(err);
        t.equal(doc.version, 2);
        t.end();
      });
    });
  });
});

test('designer should barf when handed an unversioned doc', function(t) {
  var docs = [util.ddoc('undef')];
  t.equal(docs[0].version, undefined);
  designer(url, docs, function(errs) {
    t.deepEqual(errs, [new Error('doc does not have a version property')]);
    t.end();
  });
});

test('designer should handle a mix of versioned and unversioned docs', function(t) {
  var docs = [util.ddoc('undef'), util.ddoc()];
  t.equal(docs[0].version, undefined);
  designer(url, docs, function(errs) {
    t.deepEqual(errs, [new Error('doc does not have a version property'), null]);
    t.end();
  });
});

test('designer should create valid docs while rejecting unversioned ones', function(t) {
  var docs = [util.ddoc('undef'), util.ddoc()];
  t.equal(docs[0].version, undefined);
  designer(url, docs, function(errs) {
    t.deepEqual(errs, [new Error('doc does not have a version property'), null]);
    db.get(docs[1]._id, function(err, doc) {
      t.error(err);
      t.ok(doc, 'doc exists');
      t.equal(doc._id, docs[1]._id);
      t.end();
    });
  });
});

test('designer should create valid docs when also presented equally versioned ones', function(t) {
  var docs = [util.ddoc()];
  docs.push(docs[0]);
  docs.push(util.ddoc());
  designer(url, docs, function(errs) {
    t.error(errs);
    db.get(docs[2]._id, function(err, doc) {
      t.error(err);
      t.ok(doc, 'doc exists');
      t.equal(doc._id, docs[2]._id);
      t.end();
    });
  });
});

test('delete database', function(t) {
  nano.db.destroy(couch, function(err) {
    t.error(err, 'database deleted');
    t.end();
  });
});
