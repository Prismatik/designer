var rando = require('random-string');

module.exports = {
  ddoc: function(version) {
    if (!version) version = 1;
    if (version === 'undef') version = undefined;
    return {
      version: version,
      _id: '_design/'+rando(),
      views: {
        some_view: {
          map:
            (function() {
              return;
            }).toString()
        }
      }
    }
  }
};
