var fs = require('fs'),
    path = require('path'),
    Q = require('q'),
    _ = require('underscore-data'),
    BaseBackend = require('./base');

function resolvedPromise(val) {
    var d = Q.defer();
    d.resolve(val);
    return d.promise;
}

/** @class FsBackend
    @extends BaseBackend */
var FsBackend = BaseBackend.extend(
/** @lends FsBackend# */
{
    /** @method */
    initialize: function(options) {
        BaseBackend.prototype.initialize.call(this, options);
    },

    /** @method */
    objectStoreNames: function() {
        return Q.ninvoke(fs, 'readdir', this.options.path);
    },

    /** @method */
    objectStore: function(name, options) {
        name = path.basename(name);
        return new FsStore(this, name, options);
    },

    /** @method */
    createObjectStore: function(name, options) {
        var d = Q.defer();
        name = path.basename(name);
        fs.mkdir(path.join(this.options.path, name), function() {
            d.resolve(this.objectStore(name, options));
        }.bind(this));
        return d.promise;
    },

    /** @method */
    deleteObjectStore: function(name) {
        name = path.basename(name);
        this.objectStore(name).clear().then(function() {
            return Q.ninvoke(fs, 'rmdir', path.join(this.options.path, name));
        });
    },
    /** Encode object into string, by default uses JSON.stringify
        Override to use different serialization
        @method */
    encode: JSON.stringify,
    /** Decode string into object, by default uses JSON.parse
        Override to use different serialization
        @method */
    decode: JSON.parse
});



/** @class FsStore
    @extends BaseStore */
var FsStore = BaseBackend.BaseStore.extend(
/** @lends FsStore# */
{
    /** @method */
    initialize: function(backend, name, options) {
        BaseBackend.BaseStore.prototype.initialize.call(this, backend, name, options);
    },

    /** @method */
    get: function(directives) {
        var key = this._getObjectKey({}, directives);
        return Q.ninvoke(fs, 'readFile', this.filename(key), 'utf-8')
            .then(function(x) {
                return this.backend.decode(x);
            }.bind(this));
    },

    /** @method */
    add: function(object, directives) {
        var key = this._getObjectKey(object, directives);

        return Q.ninvoke(fs, 'writeFile', this.filename(key), this.backend.encode(object), {flag: 'wx'}).then(function() {
            return object;
        });
    },

    /** @method */
    put: function(object, directives) {
        var key = this._getObjectKey(object, directives);

        return Q.ninvoke(fs, 'writeFile', this.filename(key), this.backend.encode(object), {flag: 'w'}).then(function() {
            return object;
        });
    },

    /** @method */
    'delete': function(directives) {
        var key = this._getObjectKey({}, directives),
            d = Q.defer();

        Q.ninvoke(fs, 'unlink', this.filename(key))
            .then(function() {
                d.resolve(1);
            })
            .fail(function() {
                d.resolve(0);
            });

        return d.promise;
    },

    /** Execute RQL query */
    query: function(query) {
        var self = this;
        return Q.ninvoke(fs, 'readdir', path.join(this.backend.options.path, this.name))
            .then(function(files) {
                return Q.all(files.map(function(f) {
                    return self.get(f);
                }));
            })
            .then(function(vals) {
                return _.query(vals, query);
            });
    },

    /** Delete all items */
    clear: function() {
        var self = this;
        return Q.ninvoke(fs, 'readdir', path.join(this.backend.options.path, this.name))
            .then(function(files) {
                return Q.all(files.map(function(f) {
                    return self.delete(f);
                }));
            })
            .then(function() {
                return true;
            });
    },

    /** Get absolute filename for given key */
    filename: function(file) {
        return path.join(this.backend.options.path, this.name, ''+path.basename(file));
    } 
});

/** @module fs */

FsBackend.FsStore = FsStore;
module.exports = FsBackend;
