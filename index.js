var request = require('request');

var postDoc = function(url, doc, cb) {
  request.post(url, {json: doc}, function(err, res, body) {
    if (err) {
      return cb(err);
    } else if (res.statusCode === 409) {
      request.get([url, doc._id].join('/'), {json: true}, function(err, res, body) {
        if (err) return cb(err);
        if (res.statusCode !== 200) return cb(new Error('failed to get old version of ddoc'));
        if (!body.version) return cb(new Error('old doc was unversioned'));
        if (doc.version === body.version) return cb(null);
        if (doc.version < body.version) {
          return cb(new Error('given doc was older than what I found remotely'));
        }
        doc._rev = body._rev;
        postDoc(url, doc, cb);
      });
    } else if (res.statusCode < 200 || res.statusCode >= 300) {
      return cb(new Error(JSON.stringify(body)));
    } else {
      return cb(null);
    }
  });
};

module.exports = function(url, docs, cb) {
  var errs = [];
  docs.forEach(function(doc) {
    if (!doc.version) {
      errs.push(new Error('doc does not have a version property'));
      if (errs.length === docs.length) return cb(errs);
    };
    postDoc(url, doc, function(err) {
      errs.push(err);
      if (errs.length === docs.length) {
        var filtered = errs.filter(function(err) {
          return err;
        });
        if (filtered.length === 0) errs = null;
        return cb(errs);
      };
    });
  });
};
