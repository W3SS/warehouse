
/** @module base */
(function (factory) {
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' && typeof require !== 'undefined') {
        // CommonJS
        module.exports = factory(require('underscore'));
    } else {
        // running in browser
        window.warehouse = window.warehouse || {};
        window.warehouse.BaseBackend = factory(_);
    }
})(function(_) {

/** @class BaseBackend */
function BaseBackend() {
    this.initialize.apply(this, arguments);
}

_.extend(BaseBackend.prototype,
/** @lends BaseBackend# */
{
    /** Initialize the backend instance */
    initialize: function(options) {
        options = _.extend({}, options || {});
        this.options = options;    
    },

    /** List storage names (e.g. tables for SQL, collections for MongoDB)
        @abstract */
    objectStoreNames: function() {

    },

    /** Get object store
     * @abstract */
    objectStore: function(name, options) {

    },

    /** Create object store
        @abstract */
    createObjectStore: function(name, options) {

    },

    /** Delete object store
        @abstract */
    deleteObjectStore: function(name) {

    }
});



/** @class BaseStore */
function BaseStore() {
    this.initialize.apply(this, arguments);
}

_.extend(BaseStore.prototype,
/** @lends BaseStore# */
{
    /** Initialize the backend instance
        @constructs */
    initialize: function(backend, name, options) {
        options = _.extend({keyPath: 'id'}, options || {});
        this.options = options;

        this.backend = backend;
        this.name = name;
        this.keyPath = this.options.keyPath;
    },

    /** Get value (aka READ)
        @abstract */
    get: function(directives) {

    },

    /** Add value (aka CREATE, insert)
        @abstract */
    add: function(object, directives) {

    },

    /** Get value (aka UPDATE)
        @abstract */
    put: function(object, directives) {

    },

    /** Delete value (aka DELETE)
        @abstract */
    'delete': function(directives) {

    },

    /** Execute RQL query
        @abstract */
    query: function(query) {

    },

    /** Delete all items
        @abstract */
    clear: function() {

    },

    /** Extract key value from object
        @private */
    _getObjectKey: function(obj, key) {
        if (typeof key === 'object') {
            key = key.key;
        }
        return key || obj[this.keyPath];
    }
});

// Taken from Backbone:

  // Shared empty constructor function to aid in prototype-chain creation.
  var ctor = function(){};

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
  };

  // The self-propagating extend function that Backbone classes use.
  var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

/** Class inheritance */
BaseStore.extend = extend;

/** Class inheritance */
BaseBackend.extend = extend;
BaseBackend.BaseStore = BaseStore;

return BaseBackend;

});