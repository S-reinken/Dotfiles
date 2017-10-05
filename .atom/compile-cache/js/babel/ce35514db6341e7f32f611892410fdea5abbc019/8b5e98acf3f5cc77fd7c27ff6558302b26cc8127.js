'use babel';

var _bind = Function.prototype.bind;

var _createClass = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
})();

var _get = function get(_x6, _x7, _x8) {
  var _again = true;_function: while (_again) {
    var object = _x6,
        property = _x7,
        receiver = _x8;_again = false;if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);if (parent === null) {
        return undefined;
      } else {
        _x6 = parent;_x7 = property;_x8 = receiver;_again = true;desc = parent = undefined;continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;if (getter === undefined) {
        return undefined;
      }return getter.call(receiver);
    }
  }
};

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];return arr2;
  } else {
    return Array.from(arr);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {
      var callNext = step.bind(null, 'next');var callThrow = step.bind(null, 'throw');function step(key, arg) {
        try {
          var info = gen[key](arg);var value = info.value;
        } catch (error) {
          reject(error);return;
        }if (info.done) {
          resolve(value);
        } else {
          Promise.resolve(value).then(callNext, callThrow);
        }
      }callNext();
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var _ = require('underscore-plus');
var url = require('url');
var path = require('path');

var _require = require('event-kit');

var Emitter = _require.Emitter;
var Disposable = _require.Disposable;
var CompositeDisposable = _require.CompositeDisposable;

var fs = require('fs-plus');

var _require2 = require('pathwatcher');

var Directory = _require2.Directory;

var Grim = require('grim');
var DefaultDirectorySearcher = require('./default-directory-searcher');
var Dock = require('./dock');
var Model = require('./model');
var StateStore = require('./state-store');
var TextEditor = require('./text-editor');
var Panel = require('./panel');
var PanelContainer = require('./panel-container');
var Task = require('./task');
var WorkspaceCenter = require('./workspace-center');
var WorkspaceElement = require('./workspace-element');

var STOPPED_CHANGING_ACTIVE_PANE_ITEM_DELAY = 100;
var ALL_LOCATIONS = ['center', 'left', 'right', 'bottom'];

// Essential: Represents the state of the user interface for the entire window.
// An instance of this class is available via the `atom.workspace` global.
//
// Interact with this object to open files, be notified of current and future
// editors, and manipulate panes. To add panels, use {Workspace::addTopPanel}
// and friends.
//
// ## Workspace Items
//
// The term "item" refers to anything that can be displayed
// in a pane within the workspace, either in the {WorkspaceCenter} or in one
// of the three {Dock}s. The workspace expects items to conform to the
// following interface:
//
// ### Required Methods
//
// #### `getTitle()`
//
// Returns a {String} containing the title of the item to display on its
// associated tab.
//
// ### Optional Methods
//
// #### `getElement()`
//
// If your item already *is* a DOM element, you do not need to implement this
// method. Otherwise it should return the element you want to display to
// represent this item.
//
// #### `destroy()`
//
// Destroys the item. This will be called when the item is removed from its
// parent pane.
//
// #### `onDidDestroy(callback)`
//
// Called by the workspace so it can be notified when the item is destroyed.
// Must return a {Disposable}.
//
// #### `serialize()`
//
// Serialize the state of the item. Must return an object that can be passed to
// `JSON.stringify`. The state should include a field called `deserializer`,
// which names a deserializer declared in your `package.json`. This method is
// invoked on items when serializing the workspace so they can be restored to
// the same location later.
//
// #### `getURI()`
//
// Returns the URI associated with the item.
//
// #### `getLongTitle()`
//
// Returns a {String} containing a longer version of the title to display in
// places like the window title or on tabs their short titles are ambiguous.
//
// #### `onDidChangeTitle`
//
// Called by the workspace so it can be notified when the item's title changes.
// Must return a {Disposable}.
//
// #### `getIconName()`
//
// Return a {String} with the name of an icon. If this method is defined and
// returns a string, the item's tab element will be rendered with the `icon` and
// `icon-${iconName}` CSS classes.
//
// ### `onDidChangeIcon(callback)`
//
// Called by the workspace so it can be notified when the item's icon changes.
// Must return a {Disposable}.
//
// #### `getDefaultLocation()`
//
// Tells the workspace where your item should be opened in absence of a user
// override. Items can appear in the center or in a dock on the left, right, or
// bottom of the workspace.
//
// Returns a {String} with one of the following values: `'center'`, `'left'`,
// `'right'`, `'bottom'`. If this method is not defined, `'center'` is the
// default.
//
// #### `getAllowedLocations()`
//
// Tells the workspace where this item can be moved. Returns an {Array} of one
// or more of the following values: `'center'`, `'left'`, `'right'`, or
// `'bottom'`.
//
// #### `isPermanentDockItem()`
//
// Tells the workspace whether or not this item can be closed by the user by
// clicking an `x` on its tab. Use of this feature is discouraged unless there's
// a very good reason not to allow users to close your item. Items can be made
// permanent *only* when they are contained in docks. Center pane items can
// always be removed. Note that it is currently still possible to close dock
// items via the `Close Pane` option in the context menu and via Atom APIs, so
// you should still be prepared to handle your dock items being destroyed by the
// user even if you implement this method.
//
// #### `save()`
//
// Saves the item.
//
// #### `saveAs(path)`
//
// Saves the item to the specified path.
//
// #### `getPath()`
//
// Returns the local path associated with this item. This is only used to set
// the initial location of the "save as" dialog.
//
// #### `isModified()`
//
// Returns whether or not the item is modified to reflect modification in the
// UI.
//
// #### `onDidChangeModified()`
//
// Called by the workspace so it can be notified when item's modified status
// changes. Must return a {Disposable}.
//
// #### `copy()`
//
// Create a copy of the item. If defined, the workspace will call this method to
// duplicate the item when splitting panes via certain split commands.
//
// #### `getPreferredHeight()`
//
// If this item is displayed in the bottom {Dock}, called by the workspace when
// initially displaying the dock to set its height. Once the dock has been
// resized by the user, their height will override this value.
//
// Returns a {Number}.
//
// #### `getPreferredWidth()`
//
// If this item is displayed in the left or right {Dock}, called by the
// workspace when initially displaying the dock to set its width. Once the dock
// has been resized by the user, their width will override this value.
//
// Returns a {Number}.
//
// #### `onDidTerminatePendingState(callback)`
//
// If the workspace is configured to use *pending pane items*, the workspace
// will subscribe to this method to terminate the pending state of the item.
// Must return a {Disposable}.
//
// #### `shouldPromptToSave()`
//
// This method indicates whether Atom should prompt the user to save this item
// when the user closes or reloads the window. Returns a boolean.
module.exports = (function (_Model) {
  _inherits(Workspace, _Model);

  function Workspace(params) {
    _classCallCheck(this, Workspace);

    _get(Object.getPrototypeOf(Workspace.prototype), 'constructor', this).apply(this, arguments);

    this.updateWindowTitle = this.updateWindowTitle.bind(this);
    this.updateDocumentEdited = this.updateDocumentEdited.bind(this);
    this.didDestroyPaneItem = this.didDestroyPaneItem.bind(this);
    this.didChangeActivePaneOnPaneContainer = this.didChangeActivePaneOnPaneContainer.bind(this);
    this.didChangeActivePaneItemOnPaneContainer = this.didChangeActivePaneItemOnPaneContainer.bind(this);
    this.didActivatePaneContainer = this.didActivatePaneContainer.bind(this);

    this.enablePersistence = params.enablePersistence;
    this.packageManager = params.packageManager;
    this.config = params.config;
    this.project = params.project;
    this.notificationManager = params.notificationManager;
    this.viewRegistry = params.viewRegistry;
    this.grammarRegistry = params.grammarRegistry;
    this.applicationDelegate = params.applicationDelegate;
    this.assert = params.assert;
    this.deserializerManager = params.deserializerManager;
    this.textEditorRegistry = params.textEditorRegistry;
    this.styleManager = params.styleManager;
    this.draggingItem = false;
    this.itemLocationStore = new StateStore('AtomPreviousItemLocations', 1);

    this.emitter = new Emitter();
    this.openers = [];
    this.destroyedItemURIs = [];
    this.stoppedChangingActivePaneItemTimeout = null;

    this.defaultDirectorySearcher = new DefaultDirectorySearcher();
    this.consumeServices(this.packageManager);

    this.paneContainers = {
      center: this.createCenter(),
      left: this.createDock('left'),
      right: this.createDock('right'),
      bottom: this.createDock('bottom')
    };
    this.activePaneContainer = this.paneContainers.center;
    this.hasActiveTextEditor = false;

    this.panelContainers = {
      top: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'top' }),
      left: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'left', dock: this.paneContainers.left }),
      right: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'right', dock: this.paneContainers.right }),
      bottom: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'bottom', dock: this.paneContainers.bottom }),
      header: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'header' }),
      footer: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'footer' }),
      modal: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'modal' })
    };

    this.subscribeToEvents();
  }

  _createClass(Workspace, [{
    key: 'getElement',
    value: function getElement() {
      if (!this.element) {
        this.element = new WorkspaceElement().initialize(this, {
          config: this.config,
          project: this.project,
          viewRegistry: this.viewRegistry,
          styleManager: this.styleManager
        });
      }
      return this.element;
    }
  }, {
    key: 'createCenter',
    value: function createCenter() {
      return new WorkspaceCenter({
        config: this.config,
        applicationDelegate: this.applicationDelegate,
        notificationManager: this.notificationManager,
        deserializerManager: this.deserializerManager,
        viewRegistry: this.viewRegistry,
        didActivate: this.didActivatePaneContainer,
        didChangeActivePane: this.didChangeActivePaneOnPaneContainer,
        didChangeActivePaneItem: this.didChangeActivePaneItemOnPaneContainer,
        didDestroyPaneItem: this.didDestroyPaneItem
      });
    }
  }, {
    key: 'createDock',
    value: function createDock(location) {
      return new Dock({
        location: location,
        config: this.config,
        applicationDelegate: this.applicationDelegate,
        deserializerManager: this.deserializerManager,
        notificationManager: this.notificationManager,
        viewRegistry: this.viewRegistry,
        didActivate: this.didActivatePaneContainer,
        didChangeActivePane: this.didChangeActivePaneOnPaneContainer,
        didChangeActivePaneItem: this.didChangeActivePaneItemOnPaneContainer,
        didDestroyPaneItem: this.didDestroyPaneItem
      });
    }
  }, {
    key: 'reset',
    value: function reset(packageManager) {
      this.packageManager = packageManager;
      this.emitter.dispose();
      this.emitter = new Emitter();

      this.paneContainers.center.destroy();
      this.paneContainers.left.destroy();
      this.paneContainers.right.destroy();
      this.paneContainers.bottom.destroy();

      _.values(this.panelContainers).forEach(function (panelContainer) {
        panelContainer.destroy();
      });

      this.paneContainers = {
        center: this.createCenter(),
        left: this.createDock('left'),
        right: this.createDock('right'),
        bottom: this.createDock('bottom')
      };
      this.activePaneContainer = this.paneContainers.center;
      this.hasActiveTextEditor = false;

      this.panelContainers = {
        top: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'top' }),
        left: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'left', dock: this.paneContainers.left }),
        right: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'right', dock: this.paneContainers.right }),
        bottom: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'bottom', dock: this.paneContainers.bottom }),
        header: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'header' }),
        footer: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'footer' }),
        modal: new PanelContainer({ viewRegistry: this.viewRegistry, location: 'modal' })
      };

      this.originalFontSize = null;
      this.openers = [];
      this.destroyedItemURIs = [];
      this.element = null;
      this.consumeServices(this.packageManager);
    }
  }, {
    key: 'subscribeToEvents',
    value: function subscribeToEvents() {
      this.project.onDidChangePaths(this.updateWindowTitle);
      this.subscribeToFontSize();
      this.subscribeToAddedItems();
      this.subscribeToMovedItems();
      this.subscribeToDockToggling();
    }
  }, {
    key: 'consumeServices',
    value: function consumeServices(_ref) {
      var _this = this;

      var serviceHub = _ref.serviceHub;

      this.directorySearchers = [];
      serviceHub.consume('atom.directory-searcher', '^0.1.0', function (provider) {
        return _this.directorySearchers.unshift(provider);
      });
    }

    // Called by the Serializable mixin during serialization.
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        deserializer: 'Workspace',
        packagesWithActiveGrammars: this.getPackageNamesWithActiveGrammars(),
        destroyedItemURIs: this.destroyedItemURIs.slice(),
        // Ensure deserializing 1.17 state with pre 1.17 Atom does not error
        // TODO: Remove after 1.17 has been on stable for a while
        paneContainer: { version: 2 },
        paneContainers: {
          center: this.paneContainers.center.serialize(),
          left: this.paneContainers.left.serialize(),
          right: this.paneContainers.right.serialize(),
          bottom: this.paneContainers.bottom.serialize()
        }
      };
    }
  }, {
    key: 'deserialize',
    value: function deserialize(state, deserializerManager) {
      var packagesWithActiveGrammars = state.packagesWithActiveGrammars != null ? state.packagesWithActiveGrammars : [];
      for (var packageName of packagesWithActiveGrammars) {
        var pkg = this.packageManager.getLoadedPackage(packageName);
        if (pkg != null) {
          pkg.loadGrammarsSync();
        }
      }
      if (state.destroyedItemURIs != null) {
        this.destroyedItemURIs = state.destroyedItemURIs;
      }

      if (state.paneContainers) {
        this.paneContainers.center.deserialize(state.paneContainers.center, deserializerManager);
        this.paneContainers.left.deserialize(state.paneContainers.left, deserializerManager);
        this.paneContainers.right.deserialize(state.paneContainers.right, deserializerManager);
        this.paneContainers.bottom.deserialize(state.paneContainers.bottom, deserializerManager);
      } else if (state.paneContainer) {
        // TODO: Remove this fallback once a lot of time has passed since 1.17 was released
        this.paneContainers.center.deserialize(state.paneContainer, deserializerManager);
      }

      this.hasActiveTextEditor = this.getActiveTextEditor() != null;

      this.updateWindowTitle();
    }
  }, {
    key: 'getPackageNamesWithActiveGrammars',
    value: function getPackageNamesWithActiveGrammars() {
      var _this2 = this;

      var packageNames = [];
      var addGrammar = function addGrammar() {
        var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var includedGrammarScopes = _ref2.includedGrammarScopes;
        var packageName = _ref2.packageName;

        if (!packageName) {
          return;
        }
        // Prevent cycles
        if (packageNames.indexOf(packageName) !== -1) {
          return;
        }

        packageNames.push(packageName);
        for (var scopeName of includedGrammarScopes != null ? includedGrammarScopes : []) {
          addGrammar(_this2.grammarRegistry.grammarForScopeName(scopeName));
        }
      };

      var editors = this.getTextEditors();
      for (var editor of editors) {
        addGrammar(editor.getGrammar());
      }

      if (editors.length > 0) {
        for (var grammar of this.grammarRegistry.getGrammars()) {
          if (grammar.injectionSelector) {
            addGrammar(grammar);
          }
        }
      }

      return _.uniq(packageNames);
    }
  }, {
    key: 'didActivatePaneContainer',
    value: function didActivatePaneContainer(paneContainer) {
      if (paneContainer !== this.getActivePaneContainer()) {
        this.activePaneContainer = paneContainer;
        this.didChangeActivePaneItem(this.activePaneContainer.getActivePaneItem());
        this.emitter.emit('did-change-active-pane-container', this.activePaneContainer);
        this.emitter.emit('did-change-active-pane', this.activePaneContainer.getActivePane());
        this.emitter.emit('did-change-active-pane-item', this.activePaneContainer.getActivePaneItem());
      }
    }
  }, {
    key: 'didChangeActivePaneOnPaneContainer',
    value: function didChangeActivePaneOnPaneContainer(paneContainer, pane) {
      if (paneContainer === this.getActivePaneContainer()) {
        this.emitter.emit('did-change-active-pane', pane);
      }
    }
  }, {
    key: 'didChangeActivePaneItemOnPaneContainer',
    value: function didChangeActivePaneItemOnPaneContainer(paneContainer, item) {
      if (paneContainer === this.getActivePaneContainer()) {
        this.didChangeActivePaneItem(item);
        this.emitter.emit('did-change-active-pane-item', item);
      }

      if (paneContainer === this.getCenter()) {
        var hadActiveTextEditor = this.hasActiveTextEditor;
        this.hasActiveTextEditor = item instanceof TextEditor;

        if (this.hasActiveTextEditor || hadActiveTextEditor) {
          var itemValue = this.hasActiveTextEditor ? item : undefined;
          this.emitter.emit('did-change-active-text-editor', itemValue);
        }
      }
    }
  }, {
    key: 'didChangeActivePaneItem',
    value: function didChangeActivePaneItem(item) {
      var _this3 = this;

      this.updateWindowTitle();
      this.updateDocumentEdited();
      if (this.activeItemSubscriptions) this.activeItemSubscriptions.dispose();
      this.activeItemSubscriptions = new CompositeDisposable();

      var modifiedSubscription = undefined,
          titleSubscription = undefined;

      if (item != null && typeof item.onDidChangeTitle === 'function') {
        titleSubscription = item.onDidChangeTitle(this.updateWindowTitle);
      } else if (item != null && typeof item.on === 'function') {
        titleSubscription = item.on('title-changed', this.updateWindowTitle);
        if (titleSubscription == null || typeof titleSubscription.dispose !== 'function') {
          titleSubscription = new Disposable(function () {
            item.off('title-changed', _this3.updateWindowTitle);
          });
        }
      }

      if (item != null && typeof item.onDidChangeModified === 'function') {
        modifiedSubscription = item.onDidChangeModified(this.updateDocumentEdited);
      } else if (item != null && typeof item.on === 'function') {
        modifiedSubscription = item.on('modified-status-changed', this.updateDocumentEdited);
        if (modifiedSubscription == null || typeof modifiedSubscription.dispose !== 'function') {
          modifiedSubscription = new Disposable(function () {
            item.off('modified-status-changed', _this3.updateDocumentEdited);
          });
        }
      }

      if (titleSubscription != null) {
        this.activeItemSubscriptions.add(titleSubscription);
      }
      if (modifiedSubscription != null) {
        this.activeItemSubscriptions.add(modifiedSubscription);
      }

      this.cancelStoppedChangingActivePaneItemTimeout();
      this.stoppedChangingActivePaneItemTimeout = setTimeout(function () {
        _this3.stoppedChangingActivePaneItemTimeout = null;
        _this3.emitter.emit('did-stop-changing-active-pane-item', item);
      }, STOPPED_CHANGING_ACTIVE_PANE_ITEM_DELAY);
    }
  }, {
    key: 'cancelStoppedChangingActivePaneItemTimeout',
    value: function cancelStoppedChangingActivePaneItemTimeout() {
      if (this.stoppedChangingActivePaneItemTimeout != null) {
        clearTimeout(this.stoppedChangingActivePaneItemTimeout);
      }
    }
  }, {
    key: 'setDraggingItem',
    value: function setDraggingItem(draggingItem) {
      _.values(this.paneContainers).forEach(function (dock) {
        dock.setDraggingItem(draggingItem);
      });
    }
  }, {
    key: 'subscribeToAddedItems',
    value: function subscribeToAddedItems() {
      var _this4 = this;

      this.onDidAddPaneItem(function (_ref3) {
        var item = _ref3.item;
        var pane = _ref3.pane;
        var index = _ref3.index;

        if (item instanceof TextEditor) {
          (function () {
            var subscriptions = new CompositeDisposable(_this4.textEditorRegistry.add(item), _this4.textEditorRegistry.maintainGrammar(item), _this4.textEditorRegistry.maintainConfig(item), item.observeGrammar(_this4.handleGrammarUsed.bind(_this4)));
            item.onDidDestroy(function () {
              subscriptions.dispose();
            });
            _this4.emitter.emit('did-add-text-editor', { textEditor: item, pane: pane, index: index });
          })();
        }
      });
    }
  }, {
    key: 'subscribeToDockToggling',
    value: function subscribeToDockToggling() {
      var _this5 = this;

      var docks = [this.getLeftDock(), this.getRightDock(), this.getBottomDock()];
      docks.forEach(function (dock) {
        dock.onDidChangeVisible(function (visible) {
          if (visible) return;
          var activeElement = document.activeElement;

          var dockElement = dock.getElement();
          if (dockElement === activeElement || dockElement.contains(activeElement)) {
            _this5.getCenter().activate();
          }
        });
      });
    }
  }, {
    key: 'subscribeToMovedItems',
    value: function subscribeToMovedItems() {
      var _this6 = this;

      var _loop = function _loop(paneContainer) {
        paneContainer.observePanes(function (pane) {
          pane.onDidAddItem(function (_ref4) {
            var item = _ref4.item;

            if (typeof item.getURI === 'function' && _this6.enablePersistence) {
              var uri = item.getURI();
              if (uri) {
                var _location = paneContainer.getLocation();
                var defaultLocation = undefined;
                if (typeof item.getDefaultLocation === 'function') {
                  defaultLocation = item.getDefaultLocation();
                }
                defaultLocation = defaultLocation || 'center';
                if (_location === defaultLocation) {
                  _this6.itemLocationStore['delete'](item.getURI());
                } else {
                  _this6.itemLocationStore.save(item.getURI(), _location);
                }
              }
            }
          });
        });
      };

      for (var paneContainer of this.getPaneContainers()) {
        _loop(paneContainer);
      }
    }

    // Updates the application's title and proxy icon based on whichever file is
    // open.
  }, {
    key: 'updateWindowTitle',
    value: function updateWindowTitle() {
      var itemPath = undefined,
          itemTitle = undefined,
          projectPath = undefined,
          representedPath = undefined;
      var appName = 'Atom';
      var left = this.project.getPaths();
      var projectPaths = left != null ? left : [];
      var item = this.getActivePaneItem();
      if (item) {
        itemPath = typeof item.getPath === 'function' ? item.getPath() : undefined;
        var longTitle = typeof item.getLongTitle === 'function' ? item.getLongTitle() : undefined;
        itemTitle = longTitle == null ? typeof item.getTitle === 'function' ? item.getTitle() : undefined : longTitle;
        projectPath = _.find(projectPaths, function (projectPath) {
          return itemPath === projectPath || (itemPath != null ? itemPath.startsWith(projectPath + path.sep) : undefined);
        });
      }
      if (itemTitle == null) {
        itemTitle = 'untitled';
      }
      if (projectPath == null) {
        projectPath = itemPath ? path.dirname(itemPath) : projectPaths[0];
      }
      if (projectPath != null) {
        projectPath = fs.tildify(projectPath);
      }

      var titleParts = [];
      if (item != null && projectPath != null) {
        titleParts.push(itemTitle, projectPath);
        representedPath = itemPath != null ? itemPath : projectPath;
      } else if (projectPath != null) {
        titleParts.push(projectPath);
        representedPath = projectPath;
      } else {
        titleParts.push(itemTitle);
        representedPath = '';
      }

      if (process.platform !== 'darwin') {
        titleParts.push(appName);
      }

      document.title = titleParts.join(' — ');
      this.applicationDelegate.setRepresentedFilename(representedPath);
      this.emitter.emit('did-change-window-title');
    }

    // On macOS, fades the application window's proxy icon when the current file
    // has been modified.
  }, {
    key: 'updateDocumentEdited',
    value: function updateDocumentEdited() {
      var activePaneItem = this.getActivePaneItem();
      var modified = activePaneItem != null && typeof activePaneItem.isModified === 'function' ? activePaneItem.isModified() || false : false;
      this.applicationDelegate.setWindowDocumentEdited(modified);
    }

    /*
    Section: Event Subscription
    */

  }, {
    key: 'onDidChangeActivePaneContainer',
    value: function onDidChangeActivePaneContainer(callback) {
      return this.emitter.on('did-change-active-pane-container', callback);
    }

    // Essential: Invoke the given callback with all current and future text
    // editors in the workspace.
    //
    // * `callback` {Function} to be called with current and future text editors.
    //   * `editor` A {TextEditor} that is present in {::getTextEditors} at the time
    //     of subscription or that is added at some later time.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'observeTextEditors',
    value: function observeTextEditors(callback) {
      for (var textEditor of this.getTextEditors()) {
        callback(textEditor);
      }
      return this.onDidAddTextEditor(function (_ref5) {
        var textEditor = _ref5.textEditor;
        return callback(textEditor);
      });
    }

    // Essential: Invoke the given callback with all current and future panes items
    // in the workspace.
    //
    // * `callback` {Function} to be called with current and future pane items.
    //   * `item` An item that is present in {::getPaneItems} at the time of
    //      subscription or that is added at some later time.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'observePaneItems',
    value: function observePaneItems(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.observePaneItems(callback);
      })))))();
    }

    // Essential: Invoke the given callback when the active pane item changes.
    //
    // Because observers are invoked synchronously, it's important not to perform
    // any expensive operations via this method. Consider
    // {::onDidStopChangingActivePaneItem} to delay operations until after changes
    // stop occurring.
    //
    // * `callback` {Function} to be called when the active pane item changes.
    //   * `item` The active pane item.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidChangeActivePaneItem',
    value: function onDidChangeActivePaneItem(callback) {
      return this.emitter.on('did-change-active-pane-item', callback);
    }

    // Essential: Invoke the given callback when the active pane item stops
    // changing.
    //
    // Observers are called asynchronously 100ms after the last active pane item
    // change. Handling changes here rather than in the synchronous
    // {::onDidChangeActivePaneItem} prevents unneeded work if the user is quickly
    // changing or closing tabs and ensures critical UI feedback, like changing the
    // highlighted tab, gets priority over work that can be done asynchronously.
    //
    // * `callback` {Function} to be called when the active pane item stopts
    //   changing.
    //   * `item` The active pane item.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidStopChangingActivePaneItem',
    value: function onDidStopChangingActivePaneItem(callback) {
      return this.emitter.on('did-stop-changing-active-pane-item', callback);
    }

    // Essential: Invoke the given callback when a text editor becomes the active
    // text editor and when there is no longer an active text editor.
    //
    // * `callback` {Function} to be called when the active text editor changes.
    //   * `editor` The active {TextEditor} or undefined if there is no longer an
    //      active text editor.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidChangeActiveTextEditor',
    value: function onDidChangeActiveTextEditor(callback) {
      return this.emitter.on('did-change-active-text-editor', callback);
    }

    // Essential: Invoke the given callback with the current active pane item and
    // with all future active pane items in the workspace.
    //
    // * `callback` {Function} to be called when the active pane item changes.
    //   * `item` The current active pane item.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'observeActivePaneItem',
    value: function observeActivePaneItem(callback) {
      callback(this.getActivePaneItem());
      return this.onDidChangeActivePaneItem(callback);
    }

    // Essential: Invoke the given callback with the current active text editor
    // (if any), with all future active text editors, and when there is no longer
    // an active text editor.
    //
    // * `callback` {Function} to be called when the active text editor changes.
    //   * `editor` The active {TextEditor} or undefined if there is not an
    //      active text editor.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'observeActiveTextEditor',
    value: function observeActiveTextEditor(callback) {
      callback(this.getActiveTextEditor());

      return this.onDidChangeActiveTextEditor(callback);
    }

    // Essential: Invoke the given callback whenever an item is opened. Unlike
    // {::onDidAddPaneItem}, observers will be notified for items that are already
    // present in the workspace when they are reopened.
    //
    // * `callback` {Function} to be called whenever an item is opened.
    //   * `event` {Object} with the following keys:
    //     * `uri` {String} representing the opened URI. Could be `undefined`.
    //     * `item` The opened item.
    //     * `pane` The pane in which the item was opened.
    //     * `index` The index of the opened item on its pane.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidOpen',
    value: function onDidOpen(callback) {
      return this.emitter.on('did-open', callback);
    }

    // Extended: Invoke the given callback when a pane is added to the workspace.
    //
    // * `callback` {Function} to be called panes are added.
    //   * `event` {Object} with the following keys:
    //     * `pane` The added pane.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidAddPane',
    value: function onDidAddPane(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.onDidAddPane(callback);
      })))))();
    }

    // Extended: Invoke the given callback before a pane is destroyed in the
    // workspace.
    //
    // * `callback` {Function} to be called before panes are destroyed.
    //   * `event` {Object} with the following keys:
    //     * `pane` The pane to be destroyed.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onWillDestroyPane',
    value: function onWillDestroyPane(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.onWillDestroyPane(callback);
      })))))();
    }

    // Extended: Invoke the given callback when a pane is destroyed in the
    // workspace.
    //
    // * `callback` {Function} to be called panes are destroyed.
    //   * `event` {Object} with the following keys:
    //     * `pane` The destroyed pane.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidDestroyPane',
    value: function onDidDestroyPane(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.onDidDestroyPane(callback);
      })))))();
    }

    // Extended: Invoke the given callback with all current and future panes in the
    // workspace.
    //
    // * `callback` {Function} to be called with current and future panes.
    //   * `pane` A {Pane} that is present in {::getPanes} at the time of
    //      subscription or that is added at some later time.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'observePanes',
    value: function observePanes(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.observePanes(callback);
      })))))();
    }

    // Extended: Invoke the given callback when the active pane changes.
    //
    // * `callback` {Function} to be called when the active pane changes.
    //   * `pane` A {Pane} that is the current return value of {::getActivePane}.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidChangeActivePane',
    value: function onDidChangeActivePane(callback) {
      return this.emitter.on('did-change-active-pane', callback);
    }

    // Extended: Invoke the given callback with the current active pane and when
    // the active pane changes.
    //
    // * `callback` {Function} to be called with the current and future active#
    //   panes.
    //   * `pane` A {Pane} that is the current return value of {::getActivePane}.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'observeActivePane',
    value: function observeActivePane(callback) {
      callback(this.getActivePane());
      return this.onDidChangeActivePane(callback);
    }

    // Extended: Invoke the given callback when a pane item is added to the
    // workspace.
    //
    // * `callback` {Function} to be called when pane items are added.
    //   * `event` {Object} with the following keys:
    //     * `item` The added pane item.
    //     * `pane` {Pane} containing the added item.
    //     * `index` {Number} indicating the index of the added item in its pane.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidAddPaneItem',
    value: function onDidAddPaneItem(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.onDidAddPaneItem(callback);
      })))))();
    }

    // Extended: Invoke the given callback when a pane item is about to be
    // destroyed, before the user is prompted to save it.
    //
    // * `callback` {Function} to be called before pane items are destroyed.
    //   * `event` {Object} with the following keys:
    //     * `item` The item to be destroyed.
    //     * `pane` {Pane} containing the item to be destroyed.
    //     * `index` {Number} indicating the index of the item to be destroyed in
    //       its pane.
    //
    // Returns a {Disposable} on which `.dispose` can be called to unsubscribe.
  }, {
    key: 'onWillDestroyPaneItem',
    value: function onWillDestroyPaneItem(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.onWillDestroyPaneItem(callback);
      })))))();
    }

    // Extended: Invoke the given callback when a pane item is destroyed.
    //
    // * `callback` {Function} to be called when pane items are destroyed.
    //   * `event` {Object} with the following keys:
    //     * `item` The destroyed item.
    //     * `pane` {Pane} containing the destroyed item.
    //     * `index` {Number} indicating the index of the destroyed item in its
    //       pane.
    //
    // Returns a {Disposable} on which `.dispose` can be called to unsubscribe.
  }, {
    key: 'onDidDestroyPaneItem',
    value: function onDidDestroyPaneItem(callback) {
      return new (_bind.apply(CompositeDisposable, [null].concat(_toConsumableArray(this.getPaneContainers().map(function (container) {
        return container.onDidDestroyPaneItem(callback);
      })))))();
    }

    // Extended: Invoke the given callback when a text editor is added to the
    // workspace.
    //
    // * `callback` {Function} to be called panes are added.
    //   * `event` {Object} with the following keys:
    //     * `textEditor` {TextEditor} that was added.
    //     * `pane` {Pane} containing the added text editor.
    //     * `index` {Number} indicating the index of the added text editor in its
    //        pane.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  }, {
    key: 'onDidAddTextEditor',
    value: function onDidAddTextEditor(callback) {
      return this.emitter.on('did-add-text-editor', callback);
    }
  }, {
    key: 'onDidChangeWindowTitle',
    value: function onDidChangeWindowTitle(callback) {
      return this.emitter.on('did-change-window-title', callback);
    }

    /*
    Section: Opening
    */

    // Essential: Opens the given URI in Atom asynchronously.
    // If the URI is already open, the existing item for that URI will be
    // activated. If no URI is given, or no registered opener can open
    // the URI, a new empty {TextEditor} will be created.
    //
    // * `uri` (optional) A {String} containing a URI.
    // * `options` (optional) {Object}
    //   * `initialLine` A {Number} indicating which row to move the cursor to
    //     initially. Defaults to `0`.
    //   * `initialColumn` A {Number} indicating which column to move the cursor to
    //     initially. Defaults to `0`.
    //   * `split` Either 'left', 'right', 'up' or 'down'.
    //     If 'left', the item will be opened in leftmost pane of the current active pane's row.
    //     If 'right', the item will be opened in the rightmost pane of the current active pane's row. If only one pane exists in the row, a new pane will be created.
    //     If 'up', the item will be opened in topmost pane of the current active pane's column.
    //     If 'down', the item will be opened in the bottommost pane of the current active pane's column. If only one pane exists in the column, a new pane will be created.
    //   * `activatePane` A {Boolean} indicating whether to call {Pane::activate} on
    //     containing pane. Defaults to `true`.
    //   * `activateItem` A {Boolean} indicating whether to call {Pane::activateItem}
    //     on containing pane. Defaults to `true`.
    //   * `pending` A {Boolean} indicating whether or not the item should be opened
    //     in a pending state. Existing pending items in a pane are replaced with
    //     new pending items when they are opened.
    //   * `searchAllPanes` A {Boolean}. If `true`, the workspace will attempt to
    //     activate an existing item for the given URI on any pane.
    //     If `false`, only the active pane will be searched for
    //     an existing item for the same URI. Defaults to `false`.
    //   * `location` (optional) A {String} containing the name of the location
    //     in which this item should be opened (one of "left", "right", "bottom",
    //     or "center"). If omitted, Atom will fall back to the last location in
    //     which a user has placed an item with the same URI or, if this is a new
    //     URI, the default location specified by the item. NOTE: This option
    //     should almost always be omitted to honor user preference.
    //
    // Returns a {Promise} that resolves to the {TextEditor} for the file URI.
  }, {
    key: 'open',
    value: _asyncToGenerator(function* (itemOrURI) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var uri = undefined,
          item = undefined;
      if (typeof itemOrURI === 'string') {
        uri = this.project.resolvePath(itemOrURI);
      } else if (itemOrURI) {
        item = itemOrURI;
        if (typeof item.getURI === 'function') uri = item.getURI();
      }

      if (!atom.config.get('core.allowPendingPaneItems')) {
        options.pending = false;
      }

      // Avoid adding URLs as recent documents to work-around this Spotlight crash:
      // https://github.com/atom/atom/issues/10071
      if (uri && (!url.parse(uri).protocol || process.platform === 'win32')) {
        this.applicationDelegate.addRecentDocument(uri);
      }

      var pane = undefined,
          itemExistsInWorkspace = undefined;

      // Try to find an existing item in the workspace.
      if (item || uri) {
        if (options.pane) {
          pane = options.pane;
        } else if (options.searchAllPanes) {
          pane = item ? this.paneForItem(item) : this.paneForURI(uri);
        } else {
          // If an item with the given URI is already in the workspace, assume
          // that item's pane container is the preferred location for that URI.
          var container = undefined;
          if (uri) container = this.paneContainerForURI(uri);
          if (!container) container = this.getActivePaneContainer();

          // The `split` option affects where we search for the item.
          pane = container.getActivePane();
          switch (options.split) {
            case 'left':
              pane = pane.findLeftmostSibling();
              break;
            case 'right':
              pane = pane.findRightmostSibling();
              break;
            case 'up':
              pane = pane.findTopmostSibling();
              break;
            case 'down':
              pane = pane.findBottommostSibling();
              break;
          }
        }

        if (pane) {
          if (item) {
            itemExistsInWorkspace = pane.getItems().includes(item);
          } else {
            item = pane.itemForURI(uri);
            itemExistsInWorkspace = item != null;
          }
        }
      }

      // If we already have an item at this stage, we won't need to do an async
      // lookup of the URI, so we yield the event loop to ensure this method
      // is consistently asynchronous.
      if (item) yield Promise.resolve();

      if (!itemExistsInWorkspace) {
        item = item || (yield this.createItemForURI(uri, options));
        if (!item) return;

        if (options.pane) {
          pane = options.pane;
        } else {
          var _location2 = options.location;
          if (!_location2 && !options.split && uri && this.enablePersistence) {
            _location2 = yield this.itemLocationStore.load(uri);
          }
          if (!_location2 && typeof item.getDefaultLocation === 'function') {
            _location2 = item.getDefaultLocation();
          }

          var allowedLocations = typeof item.getAllowedLocations === 'function' ? item.getAllowedLocations() : ALL_LOCATIONS;
          _location2 = allowedLocations.includes(_location2) ? _location2 : allowedLocations[0];

          var container = this.paneContainers[_location2] || this.getCenter();
          pane = container.getActivePane();
          switch (options.split) {
            case 'left':
              pane = pane.findLeftmostSibling();
              break;
            case 'right':
              pane = pane.findOrCreateRightmostSibling();
              break;
            case 'up':
              pane = pane.findTopmostSibling();
              break;
            case 'down':
              pane = pane.findOrCreateBottommostSibling();
              break;
          }
        }
      }

      if (!options.pending && pane.getPendingItem() === item) {
        pane.clearPendingItem();
      }

      this.itemOpened(item);

      if (options.activateItem === false) {
        pane.addItem(item, { pending: options.pending });
      } else {
        pane.activateItem(item, { pending: options.pending });
      }

      if (options.activatePane !== false) {
        pane.activate();
      }

      var initialColumn = 0;
      var initialLine = 0;
      if (!Number.isNaN(options.initialLine)) {
        initialLine = options.initialLine;
      }
      if (!Number.isNaN(options.initialColumn)) {
        initialColumn = options.initialColumn;
      }
      if (initialLine >= 0 || initialColumn >= 0) {
        if (typeof item.setCursorBufferPosition === 'function') {
          item.setCursorBufferPosition([initialLine, initialColumn]);
        }
      }

      var index = pane.getActiveItemIndex();
      this.emitter.emit('did-open', { uri: uri, pane: pane, item: item, index: index });
      return item;
    })

    // Essential: Search the workspace for items matching the given URI and hide them.
    //
    // * `itemOrURI` (optional) The item to hide or a {String} containing the URI
    //   of the item to hide.
    //
    // Returns a {boolean} indicating whether any items were found (and hidden).
  }, {
    key: 'hide',
    value: function hide(itemOrURI) {
      var foundItems = false;

      // If any visible item has the given URI, hide it
      for (var container of this.getPaneContainers()) {
        var isCenter = container === this.getCenter();
        if (isCenter || container.isVisible()) {
          for (var pane of container.getPanes()) {
            var activeItem = pane.getActiveItem();
            var foundItem = activeItem != null && (activeItem === itemOrURI || typeof activeItem.getURI === 'function' && activeItem.getURI() === itemOrURI);
            if (foundItem) {
              foundItems = true;
              // We can't really hide the center so we just destroy the item.
              if (isCenter) {
                pane.destroyItem(activeItem);
              } else {
                container.hide();
              }
            }
          }
        }
      }

      return foundItems;
    }

    // Essential: Search the workspace for items matching the given URI. If any are found, hide them.
    // Otherwise, open the URL.
    //
    // * `itemOrURI` (optional) The item to toggle or a {String} containing the URI
    //   of the item to toggle.
    //
    // Returns a Promise that resolves when the item is shown or hidden.
  }, {
    key: 'toggle',
    value: function toggle(itemOrURI) {
      if (this.hide(itemOrURI)) {
        return Promise.resolve();
      } else {
        return this.open(itemOrURI, { searchAllPanes: true });
      }
    }

    // Open Atom's license in the active pane.
  }, {
    key: 'openLicense',
    value: function openLicense() {
      return this.open('/usr/share/licenses/atom/LICENSE.md');
    }

    // Synchronously open the given URI in the active pane. **Only use this method
    // in specs. Calling this in production code will block the UI thread and
    // everyone will be mad at you.**
    //
    // * `uri` A {String} containing a URI.
    // * `options` An optional options {Object}
    //   * `initialLine` A {Number} indicating which row to move the cursor to
    //     initially. Defaults to `0`.
    //   * `initialColumn` A {Number} indicating which column to move the cursor to
    //     initially. Defaults to `0`.
    //   * `activatePane` A {Boolean} indicating whether to call {Pane::activate} on
    //     the containing pane. Defaults to `true`.
    //   * `activateItem` A {Boolean} indicating whether to call {Pane::activateItem}
    //     on containing pane. Defaults to `true`.
  }, {
    key: 'openSync',
    value: function openSync() {
      var uri_ = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var initialLine = options.initialLine;
      var initialColumn = options.initialColumn;

      var activatePane = options.activatePane != null ? options.activatePane : true;
      var activateItem = options.activateItem != null ? options.activateItem : true;

      var uri = this.project.resolvePath(uri_);
      var item = this.getActivePane().itemForURI(uri);
      if (uri && item == null) {
        for (var _opener of this.getOpeners()) {
          item = _opener(uri, options);
          if (item) break;
        }
      }
      if (item == null) {
        item = this.project.openSync(uri, { initialLine: initialLine, initialColumn: initialColumn });
      }

      if (activateItem) {
        this.getActivePane().activateItem(item);
      }
      this.itemOpened(item);
      if (activatePane) {
        this.getActivePane().activate();
      }
      return item;
    }
  }, {
    key: 'openURIInPane',
    value: function openURIInPane(uri, pane) {
      return this.open(uri, { pane: pane });
    }

    // Public: Creates a new item that corresponds to the provided URI.
    //
    // If no URI is given, or no registered opener can open the URI, a new empty
    // {TextEditor} will be created.
    //
    // * `uri` A {String} containing a URI.
    //
    // Returns a {Promise} that resolves to the {TextEditor} (or other item) for the given URI.
  }, {
    key: 'createItemForURI',
    value: function createItemForURI(uri, options) {
      if (uri != null) {
        for (var _opener2 of this.getOpeners()) {
          var item = _opener2(uri, options);
          if (item != null) return Promise.resolve(item);
        }
      }

      try {
        return this.openTextFile(uri, options);
      } catch (error) {
        switch (error.code) {
          case 'CANCELLED':
            return Promise.resolve();
          case 'EACCES':
            this.notificationManager.addWarning('Permission denied \'' + error.path + '\'');
            return Promise.resolve();
          case 'EPERM':
          case 'EBUSY':
          case 'ENXIO':
          case 'EIO':
          case 'ENOTCONN':
          case 'UNKNOWN':
          case 'ECONNRESET':
          case 'EINVAL':
          case 'EMFILE':
          case 'ENOTDIR':
          case 'EAGAIN':
            this.notificationManager.addWarning('Unable to open \'' + (error.path != null ? error.path : uri) + '\'', { detail: error.message });
            return Promise.resolve();
          default:
            throw error;
        }
      }
    }
  }, {
    key: 'openTextFile',
    value: function openTextFile(uri, options) {
      var _this7 = this;

      var filePath = this.project.resolvePath(uri);

      if (filePath != null) {
        try {
          fs.closeSync(fs.openSync(filePath, 'r'));
        } catch (error) {
          // allow ENOENT errors to create an editor for paths that dont exist
          if (error.code !== 'ENOENT') {
            throw error;
          }
        }
      }

      var fileSize = fs.getSizeSync(filePath);

      var largeFileMode = fileSize >= 2 * 1048576; // 2MB
      if (fileSize >= this.config.get('core.warnOnLargeFileLimit') * 1048576) {
        // 20MB by default
        var choice = this.applicationDelegate.confirm({
          message: 'Atom will be unresponsive during the loading of very large files.',
          detailedMessage: 'Do you still want to load this file?',
          buttons: ['Proceed', 'Cancel']
        });
        if (choice === 1) {
          var error = new Error();
          error.code = 'CANCELLED';
          throw error;
        }
      }

      return this.project.bufferForPath(filePath, options).then(function (buffer) {
        return _this7.textEditorRegistry.build(Object.assign({ buffer: buffer, largeFileMode: largeFileMode, autoHeight: false }, options));
      });
    }
  }, {
    key: 'handleGrammarUsed',
    value: function handleGrammarUsed(grammar) {
      if (grammar == null) {
        return;
      }
      return this.packageManager.triggerActivationHook(grammar.packageName + ':grammar-used');
    }

    // Public: Returns a {Boolean} that is `true` if `object` is a `TextEditor`.
    //
    // * `object` An {Object} you want to perform the check against.
  }, {
    key: 'isTextEditor',
    value: function isTextEditor(object) {
      return object instanceof TextEditor;
    }

    // Extended: Create a new text editor.
    //
    // Returns a {TextEditor}.
  }, {
    key: 'buildTextEditor',
    value: function buildTextEditor(params) {
      var editor = this.textEditorRegistry.build(params);
      var subscriptions = new CompositeDisposable(this.textEditorRegistry.maintainGrammar(editor), this.textEditorRegistry.maintainConfig(editor));
      editor.onDidDestroy(function () {
        subscriptions.dispose();
      });
      return editor;
    }

    // Public: Asynchronously reopens the last-closed item's URI if it hasn't already been
    // reopened.
    //
    // Returns a {Promise} that is resolved when the item is opened
  }, {
    key: 'reopenItem',
    value: function reopenItem() {
      var uri = this.destroyedItemURIs.pop();
      if (uri) {
        return this.open(uri);
      } else {
        return Promise.resolve();
      }
    }

    // Public: Register an opener for a uri.
    //
    // When a URI is opened via {Workspace::open}, Atom loops through its registered
    // opener functions until one returns a value for the given uri.
    // Openers are expected to return an object that inherits from HTMLElement or
    // a model which has an associated view in the {ViewRegistry}.
    // A {TextEditor} will be used if no opener returns a value.
    //
    // ## Examples
    //
    // ```coffee
    // atom.workspace.addOpener (uri) ->
    //   if path.extname(uri) is '.toml'
    //     return new TomlEditor(uri)
    // ```
    //
    // * `opener` A {Function} to be called when a path is being opened.
    //
    // Returns a {Disposable} on which `.dispose()` can be called to remove the
    // opener.
    //
    // Note that the opener will be called if and only if the URI is not already open
    // in the current pane. The searchAllPanes flag expands the search from the
    // current pane to all panes. If you wish to open a view of a different type for
    // a file that is already open, consider changing the protocol of the URI. For
    // example, perhaps you wish to preview a rendered version of the file `/foo/bar/baz.quux`
    // that is already open in a text editor view. You could signal this by calling
    // {Workspace::open} on the URI `quux-preview://foo/bar/baz.quux`. Then your opener
    // can check the protocol for quux-preview and only handle those URIs that match.
  }, {
    key: 'addOpener',
    value: function addOpener(opener) {
      var _this8 = this;

      this.openers.push(opener);
      return new Disposable(function () {
        _.remove(_this8.openers, opener);
      });
    }
  }, {
    key: 'getOpeners',
    value: function getOpeners() {
      return this.openers;
    }

    /*
    Section: Pane Items
    */

    // Essential: Get all pane items in the workspace.
    //
    // Returns an {Array} of items.
  }, {
    key: 'getPaneItems',
    value: function getPaneItems() {
      return _.flatten(this.getPaneContainers().map(function (container) {
        return container.getPaneItems();
      }));
    }

    // Essential: Get the active {Pane}'s active item.
    //
    // Returns an pane item {Object}.
  }, {
    key: 'getActivePaneItem',
    value: function getActivePaneItem() {
      return this.getActivePaneContainer().getActivePaneItem();
    }

    // Essential: Get all text editors in the workspace.
    //
    // Returns an {Array} of {TextEditor}s.
  }, {
    key: 'getTextEditors',
    value: function getTextEditors() {
      return this.getPaneItems().filter(function (item) {
        return item instanceof TextEditor;
      });
    }

    // Essential: Get the workspace center's active item if it is a {TextEditor}.
    //
    // Returns a {TextEditor} or `undefined` if the workspace center's current
    // active item is not a {TextEditor}.
  }, {
    key: 'getActiveTextEditor',
    value: function getActiveTextEditor() {
      var activeItem = this.getCenter().getActivePaneItem();
      if (activeItem instanceof TextEditor) {
        return activeItem;
      }
    }

    // Save all pane items.
  }, {
    key: 'saveAll',
    value: function saveAll() {
      this.getPaneContainers().forEach(function (container) {
        container.saveAll();
      });
    }
  }, {
    key: 'confirmClose',
    value: function confirmClose(options) {
      return Promise.all(this.getPaneContainers().map(function (container) {
        return container.confirmClose(options);
      })).then(function (results) {
        return !results.includes(false);
      });
    }

    // Save the active pane item.
    //
    // If the active pane item currently has a URI according to the item's
    // `.getURI` method, calls `.save` on the item. Otherwise
    // {::saveActivePaneItemAs} # will be called instead. This method does nothing
    // if the active item does not implement a `.save` method.
  }, {
    key: 'saveActivePaneItem',
    value: function saveActivePaneItem() {
      return this.getCenter().getActivePane().saveActiveItem();
    }

    // Prompt the user for a path and save the active pane item to it.
    //
    // Opens a native dialog where the user selects a path on disk, then calls
    // `.saveAs` on the item with the selected path. This method does nothing if
    // the active item does not implement a `.saveAs` method.
  }, {
    key: 'saveActivePaneItemAs',
    value: function saveActivePaneItemAs() {
      this.getCenter().getActivePane().saveActiveItemAs();
    }

    // Destroy (close) the active pane item.
    //
    // Removes the active pane item and calls the `.destroy` method on it if one is
    // defined.
  }, {
    key: 'destroyActivePaneItem',
    value: function destroyActivePaneItem() {
      return this.getActivePane().destroyActiveItem();
    }

    /*
    Section: Panes
    */

    // Extended: Get the most recently focused pane container.
    //
    // Returns a {Dock} or the {WorkspaceCenter}.
  }, {
    key: 'getActivePaneContainer',
    value: function getActivePaneContainer() {
      return this.activePaneContainer;
    }

    // Extended: Get all panes in the workspace.
    //
    // Returns an {Array} of {Pane}s.
  }, {
    key: 'getPanes',
    value: function getPanes() {
      return _.flatten(this.getPaneContainers().map(function (container) {
        return container.getPanes();
      }));
    }
  }, {
    key: 'getVisiblePanes',
    value: function getVisiblePanes() {
      return _.flatten(this.getVisiblePaneContainers().map(function (container) {
        return container.getPanes();
      }));
    }

    // Extended: Get the active {Pane}.
    //
    // Returns a {Pane}.
  }, {
    key: 'getActivePane',
    value: function getActivePane() {
      return this.getActivePaneContainer().getActivePane();
    }

    // Extended: Make the next pane active.
  }, {
    key: 'activateNextPane',
    value: function activateNextPane() {
      return this.getActivePaneContainer().activateNextPane();
    }

    // Extended: Make the previous pane active.
  }, {
    key: 'activatePreviousPane',
    value: function activatePreviousPane() {
      return this.getActivePaneContainer().activatePreviousPane();
    }

    // Extended: Get the first pane container that contains an item with the given
    // URI.
    //
    // * `uri` {String} uri
    //
    // Returns a {Dock}, the {WorkspaceCenter}, or `undefined` if no item exists
    // with the given URI.
  }, {
    key: 'paneContainerForURI',
    value: function paneContainerForURI(uri) {
      return this.getPaneContainers().find(function (container) {
        return container.paneForURI(uri);
      });
    }

    // Extended: Get the first pane container that contains the given item.
    //
    // * `item` the Item that the returned pane container must contain.
    //
    // Returns a {Dock}, the {WorkspaceCenter}, or `undefined` if no item exists
    // with the given URI.
  }, {
    key: 'paneContainerForItem',
    value: function paneContainerForItem(uri) {
      return this.getPaneContainers().find(function (container) {
        return container.paneForItem(uri);
      });
    }

    // Extended: Get the first {Pane} that contains an item with the given URI.
    //
    // * `uri` {String} uri
    //
    // Returns a {Pane} or `undefined` if no item exists with the given URI.
  }, {
    key: 'paneForURI',
    value: function paneForURI(uri) {
      for (var _location3 of this.getPaneContainers()) {
        var pane = _location3.paneForURI(uri);
        if (pane != null) {
          return pane;
        }
      }
    }

    // Extended: Get the {Pane} containing the given item.
    //
    // * `item` the Item that the returned pane must contain.
    //
    // Returns a {Pane} or `undefined` if no pane exists for the given item.
  }, {
    key: 'paneForItem',
    value: function paneForItem(item) {
      for (var _location4 of this.getPaneContainers()) {
        var pane = _location4.paneForItem(item);
        if (pane != null) {
          return pane;
        }
      }
    }

    // Destroy (close) the active pane.
  }, {
    key: 'destroyActivePane',
    value: function destroyActivePane() {
      var activePane = this.getActivePane();
      if (activePane != null) {
        activePane.destroy();
      }
    }

    // Close the active center pane item, or the active center pane if it is
    // empty, or the current window if there is only the empty root pane.
  }, {
    key: 'closeActivePaneItemOrEmptyPaneOrWindow',
    value: function closeActivePaneItemOrEmptyPaneOrWindow() {
      if (this.getCenter().getActivePaneItem() != null) {
        this.getCenter().getActivePane().destroyActiveItem();
      } else if (this.getCenter().getPanes().length > 1) {
        this.getCenter().destroyActivePane();
      } else if (this.config.get('core.closeEmptyWindows')) {
        atom.close();
      }
    }

    // Increase the editor font size by 1px.
  }, {
    key: 'increaseFontSize',
    value: function increaseFontSize() {
      this.config.set('editor.fontSize', this.config.get('editor.fontSize') + 1);
    }

    // Decrease the editor font size by 1px.
  }, {
    key: 'decreaseFontSize',
    value: function decreaseFontSize() {
      var fontSize = this.config.get('editor.fontSize');
      if (fontSize > 1) {
        this.config.set('editor.fontSize', fontSize - 1);
      }
    }

    // Restore to the window's original editor font size.
  }, {
    key: 'resetFontSize',
    value: function resetFontSize() {
      if (this.originalFontSize) {
        this.config.set('editor.fontSize', this.originalFontSize);
      }
    }
  }, {
    key: 'subscribeToFontSize',
    value: function subscribeToFontSize() {
      var _this9 = this;

      return this.config.onDidChange('editor.fontSize', function (_ref6) {
        var oldValue = _ref6.oldValue;

        if (_this9.originalFontSize == null) {
          _this9.originalFontSize = oldValue;
        }
      });
    }

    // Removes the item's uri from the list of potential items to reopen.
  }, {
    key: 'itemOpened',
    value: function itemOpened(item) {
      var uri = undefined;
      if (typeof item.getURI === 'function') {
        uri = item.getURI();
      } else if (typeof item.getUri === 'function') {
        uri = item.getUri();
      }

      if (uri != null) {
        _.remove(this.destroyedItemURIs, uri);
      }
    }

    // Adds the destroyed item's uri to the list of items to reopen.
  }, {
    key: 'didDestroyPaneItem',
    value: function didDestroyPaneItem(_ref7) {
      var item = _ref7.item;

      var uri = undefined;
      if (typeof item.getURI === 'function') {
        uri = item.getURI();
      } else if (typeof item.getUri === 'function') {
        uri = item.getUri();
      }

      if (uri != null) {
        this.destroyedItemURIs.push(uri);
      }
    }

    // Called by Model superclass when destroyed
  }, {
    key: 'destroyed',
    value: function destroyed() {
      this.paneContainers.center.destroy();
      this.paneContainers.left.destroy();
      this.paneContainers.right.destroy();
      this.paneContainers.bottom.destroy();
      this.cancelStoppedChangingActivePaneItemTimeout();
      if (this.activeItemSubscriptions != null) {
        this.activeItemSubscriptions.dispose();
      }
    }

    /*
    Section: Pane Locations
    */

    // Essential: Get the {WorkspaceCenter} at the center of the editor window.
  }, {
    key: 'getCenter',
    value: function getCenter() {
      return this.paneContainers.center;
    }

    // Essential: Get the {Dock} to the left of the editor window.
  }, {
    key: 'getLeftDock',
    value: function getLeftDock() {
      return this.paneContainers.left;
    }

    // Essential: Get the {Dock} to the right of the editor window.
  }, {
    key: 'getRightDock',
    value: function getRightDock() {
      return this.paneContainers.right;
    }

    // Essential: Get the {Dock} below the editor window.
  }, {
    key: 'getBottomDock',
    value: function getBottomDock() {
      return this.paneContainers.bottom;
    }
  }, {
    key: 'getPaneContainers',
    value: function getPaneContainers() {
      return [this.paneContainers.center, this.paneContainers.left, this.paneContainers.right, this.paneContainers.bottom];
    }
  }, {
    key: 'getVisiblePaneContainers',
    value: function getVisiblePaneContainers() {
      var center = this.getCenter();
      return atom.workspace.getPaneContainers().filter(function (container) {
        return container === center || container.isVisible();
      });
    }

    /*
    Section: Panels
     Panels are used to display UI related to an editor window. They are placed at one of the four
    edges of the window: left, right, top or bottom. If there are multiple panels on the same window
    edge they are stacked in order of priority: higher priority is closer to the center, lower
    priority towards the edge.
     *Note:* If your panel changes its size throughout its lifetime, consider giving it a higher
    priority, allowing fixed size panels to be closer to the edge. This allows control targets to
    remain more static for easier targeting by users that employ mice or trackpads. (See
    [atom/atom#4834](https://github.com/atom/atom/issues/4834) for discussion.)
    */

    // Essential: Get an {Array} of all the panel items at the bottom of the editor window.
  }, {
    key: 'getBottomPanels',
    value: function getBottomPanels() {
      return this.getPanels('bottom');
    }

    // Essential: Adds a panel item to the bottom of the editor window.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     latter. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addBottomPanel',
    value: function addBottomPanel(options) {
      return this.addPanel('bottom', options);
    }

    // Essential: Get an {Array} of all the panel items to the left of the editor window.
  }, {
    key: 'getLeftPanels',
    value: function getLeftPanels() {
      return this.getPanels('left');
    }

    // Essential: Adds a panel item to the left of the editor window.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     latter. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addLeftPanel',
    value: function addLeftPanel(options) {
      return this.addPanel('left', options);
    }

    // Essential: Get an {Array} of all the panel items to the right of the editor window.
  }, {
    key: 'getRightPanels',
    value: function getRightPanels() {
      return this.getPanels('right');
    }

    // Essential: Adds a panel item to the right of the editor window.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     latter. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addRightPanel',
    value: function addRightPanel(options) {
      return this.addPanel('right', options);
    }

    // Essential: Get an {Array} of all the panel items at the top of the editor window.
  }, {
    key: 'getTopPanels',
    value: function getTopPanels() {
      return this.getPanels('top');
    }

    // Essential: Adds a panel item to the top of the editor window above the tabs.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     latter. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addTopPanel',
    value: function addTopPanel(options) {
      return this.addPanel('top', options);
    }

    // Essential: Get an {Array} of all the panel items in the header.
  }, {
    key: 'getHeaderPanels',
    value: function getHeaderPanels() {
      return this.getPanels('header');
    }

    // Essential: Adds a panel item to the header.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     latter. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addHeaderPanel',
    value: function addHeaderPanel(options) {
      return this.addPanel('header', options);
    }

    // Essential: Get an {Array} of all the panel items in the footer.
  }, {
    key: 'getFooterPanels',
    value: function getFooterPanels() {
      return this.getPanels('footer');
    }

    // Essential: Adds a panel item to the footer.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     latter. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addFooterPanel',
    value: function addFooterPanel(options) {
      return this.addPanel('footer', options);
    }

    // Essential: Get an {Array} of all the modal panel items
  }, {
    key: 'getModalPanels',
    value: function getModalPanels() {
      return this.getPanels('modal');
    }

    // Essential: Adds a panel item as a modal dialog.
    //
    // * `options` {Object}
    //   * `item` Your panel content. It can be a DOM element, a jQuery element, or
    //     a model with a view registered via {ViewRegistry::addViewProvider}. We recommend the
    //     model option. See {ViewRegistry::addViewProvider} for more information.
    //   * `visible` (optional) {Boolean} false if you want the panel to initially be hidden
    //     (default: true)
    //   * `priority` (optional) {Number} Determines stacking order. Lower priority items are
    //     forced closer to the edges of the window. (default: 100)
    //
    // Returns a {Panel}
  }, {
    key: 'addModalPanel',
    value: function addModalPanel() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return this.addPanel('modal', options);
    }

    // Essential: Returns the {Panel} associated with the given item. Returns
    // `null` when the item has no panel.
    //
    // * `item` Item the panel contains
  }, {
    key: 'panelForItem',
    value: function panelForItem(item) {
      for (var _location5 in this.panelContainers) {
        var container = this.panelContainers[_location5];
        var panel = container.panelForItem(item);
        if (panel != null) {
          return panel;
        }
      }
      return null;
    }
  }, {
    key: 'getPanels',
    value: function getPanels(location) {
      return this.panelContainers[location].getPanels();
    }
  }, {
    key: 'addPanel',
    value: function addPanel(location, options) {
      if (options == null) {
        options = {};
      }
      return this.panelContainers[location].addPanel(new Panel(options, this.viewRegistry));
    }

    /*
    Section: Searching and Replacing
    */

    // Public: Performs a search across all files in the workspace.
    //
    // * `regex` {RegExp} to search with.
    // * `options` (optional) {Object}
    //   * `paths` An {Array} of glob patterns to search within.
    //   * `onPathsSearched` (optional) {Function} to be periodically called
    //     with number of paths searched.
    //   * `leadingContextLineCount` {Number} default `0`; The number of lines
    //      before the matched line to include in the results object.
    //   * `trailingContextLineCount` {Number} default `0`; The number of lines
    //      after the matched line to include in the results object.
    // * `iterator` {Function} callback on each file found.
    //
    // Returns a {Promise} with a `cancel()` method that will cancel all
    // of the underlying searches that were started as part of this scan.
  }, {
    key: 'scan',
    value: function scan(regex, options, iterator) {
      var _this10 = this;

      if (options === undefined) options = {};

      if (_.isFunction(options)) {
        iterator = options;
        options = {};
      }

      // Find a searcher for every Directory in the project. Each searcher that is matched
      // will be associated with an Array of Directory objects in the Map.
      var directoriesForSearcher = new Map();
      for (var directory of this.project.getDirectories()) {
        var searcher = this.defaultDirectorySearcher;
        for (var directorySearcher of this.directorySearchers) {
          if (directorySearcher.canSearchDirectory(directory)) {
            searcher = directorySearcher;
            break;
          }
        }
        var directories = directoriesForSearcher.get(searcher);
        if (!directories) {
          directories = [];
          directoriesForSearcher.set(searcher, directories);
        }
        directories.push(directory);
      }

      // Define the onPathsSearched callback.
      var onPathsSearched = undefined;
      if (_.isFunction(options.onPathsSearched)) {
        (function () {
          // Maintain a map of directories to the number of search results. When notified of a new count,
          // replace the entry in the map and update the total.
          var onPathsSearchedOption = options.onPathsSearched;
          var totalNumberOfPathsSearched = 0;
          var numberOfPathsSearchedForSearcher = new Map();
          onPathsSearched = function (searcher, numberOfPathsSearched) {
            var oldValue = numberOfPathsSearchedForSearcher.get(searcher);
            if (oldValue) {
              totalNumberOfPathsSearched -= oldValue;
            }
            numberOfPathsSearchedForSearcher.set(searcher, numberOfPathsSearched);
            totalNumberOfPathsSearched += numberOfPathsSearched;
            return onPathsSearchedOption(totalNumberOfPathsSearched);
          };
        })();
      } else {
        onPathsSearched = function () {};
      }

      // Kick off all of the searches and unify them into one Promise.
      var allSearches = [];
      directoriesForSearcher.forEach(function (directories, searcher) {
        var searchOptions = {
          inclusions: options.paths || [],
          includeHidden: true,
          excludeVcsIgnores: _this10.config.get('core.excludeVcsIgnoredPaths'),
          exclusions: _this10.config.get('core.ignoredNames'),
          follow: _this10.config.get('core.followSymlinks'),
          leadingContextLineCount: options.leadingContextLineCount || 0,
          trailingContextLineCount: options.trailingContextLineCount || 0,
          didMatch: function didMatch(result) {
            if (!_this10.project.isPathModified(result.filePath)) {
              return iterator(result);
            }
          },
          didError: function didError(error) {
            return iterator(null, error);
          },
          didSearchPaths: function didSearchPaths(count) {
            return onPathsSearched(searcher, count);
          }
        };
        var directorySearcher = searcher.search(directories, regex, searchOptions);
        allSearches.push(directorySearcher);
      });
      var searchPromise = Promise.all(allSearches);

      for (var buffer of this.project.getBuffers()) {
        if (buffer.isModified()) {
          var filePath = buffer.getPath();
          if (!this.project.contains(filePath)) {
            continue;
          }
          var matches = [];
          buffer.scan(regex, function (match) {
            return matches.push(match);
          });
          if (matches.length > 0) {
            iterator({ filePath: filePath, matches: matches });
          }
        }
      }

      // Make sure the Promise that is returned to the client is cancelable. To be consistent
      // with the existing behavior, instead of cancel() rejecting the promise, it should
      // resolve it with the special value 'cancelled'. At least the built-in find-and-replace
      // package relies on this behavior.
      var isCancelled = false;
      var cancellablePromise = new Promise(function (resolve, reject) {
        var onSuccess = function onSuccess() {
          if (isCancelled) {
            resolve('cancelled');
          } else {
            resolve(null);
          }
        };

        var onFailure = function onFailure() {
          for (var promise of allSearches) {
            promise.cancel();
          }
          reject();
        };

        searchPromise.then(onSuccess, onFailure);
      });
      cancellablePromise.cancel = function () {
        isCancelled = true;
        // Note that cancelling all of the members of allSearches will cause all of the searches
        // to resolve, which causes searchPromise to resolve, which is ultimately what causes
        // cancellablePromise to resolve.
        allSearches.map(function (promise) {
          return promise.cancel();
        });
      };

      // Although this method claims to return a `Promise`, the `ResultsPaneView.onSearch()`
      // method in the find-and-replace package expects the object returned by this method to have a
      // `done()` method. Include a done() method until find-and-replace can be updated.
      cancellablePromise.done = function (onSuccessOrFailure) {
        cancellablePromise.then(onSuccessOrFailure, onSuccessOrFailure);
      };
      return cancellablePromise;
    }

    // Public: Performs a replace across all the specified files in the project.
    //
    // * `regex` A {RegExp} to search with.
    // * `replacementText` {String} to replace all matches of regex with.
    // * `filePaths` An {Array} of file path strings to run the replace on.
    // * `iterator` A {Function} callback on each file with replacements:
    //   * `options` {Object} with keys `filePath` and `replacements`.
    //
    // Returns a {Promise}.
  }, {
    key: 'replace',
    value: function replace(regex, replacementText, filePaths, iterator) {
      var _this11 = this;

      return new Promise(function (resolve, reject) {
        var buffer = undefined;
        var openPaths = _this11.project.getBuffers().map(function (buffer) {
          return buffer.getPath();
        });
        var outOfProcessPaths = _.difference(filePaths, openPaths);

        var inProcessFinished = !openPaths.length;
        var outOfProcessFinished = !outOfProcessPaths.length;
        var checkFinished = function checkFinished() {
          if (outOfProcessFinished && inProcessFinished) {
            resolve();
          }
        };

        if (!outOfProcessFinished.length) {
          var flags = 'g';
          if (regex.ignoreCase) {
            flags += 'i';
          }

          var task = Task.once(require.resolve('./replace-handler'), outOfProcessPaths, regex.source, flags, replacementText, function () {
            outOfProcessFinished = true;
            checkFinished();
          });

          task.on('replace:path-replaced', iterator);
          task.on('replace:file-error', function (error) {
            iterator(null, error);
          });
        }

        for (buffer of _this11.project.getBuffers()) {
          if (!filePaths.includes(buffer.getPath())) {
            continue;
          }
          var replacements = buffer.replace(regex, replacementText, iterator);
          if (replacements) {
            iterator({ filePath: buffer.getPath(), replacements: replacements });
          }
        }

        inProcessFinished = true;
        checkFinished();
      });
    }
  }, {
    key: 'checkoutHeadRevision',
    value: function checkoutHeadRevision(editor) {
      var _this12 = this;

      if (editor.getPath()) {
        var checkoutHead = function checkoutHead() {
          return _this12.project.repositoryForDirectory(new Directory(editor.getDirectoryPath())).then(function (repository) {
            return repository && repository.checkoutHeadForEditor(editor);
          });
        };

        if (this.config.get('editor.confirmCheckoutHeadRevision')) {
          this.applicationDelegate.confirm({
            message: 'Confirm Checkout HEAD Revision',
            detailedMessage: 'Are you sure you want to discard all changes to "' + editor.getFileName() + '" since the last Git commit?',
            buttons: {
              OK: checkoutHead,
              Cancel: null
            }
          });
        } else {
          return checkoutHead();
        }
      } else {
        return Promise.resolve(false);
      }
    }
  }, {
    key: 'paneContainer',
    get: function get() {
      Grim.deprecate('`atom.workspace.paneContainer` has always been private, but it is now gone. Please use `atom.workspace.getCenter()` instead and consult the workspace API docs for public methods.');
      return this.paneContainers.center.paneContainer;
    }
  }]);

  return Workspace;
})(Model);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9idWlsZC9hdG9tL3NyYy9hdG9tLTEuMjAuMS9vdXQvYXBwL3NyYy93b3Jrc3BhY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOztBQUVYLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDOztBQUVwQyxJQUFJLFlBQVksR0FBRyxDQUFDLFlBQVk7QUFBRSxXQUFTLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUU7QUFBRSxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUFFLFVBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLFVBQVUsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUMsQUFBQyxVQUFVLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxBQUFDLElBQUksT0FBTyxJQUFJLFVBQVUsRUFBRSxVQUFVLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxBQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FBRTtHQUFFLEFBQUMsT0FBTyxVQUFVLFdBQVcsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFO0FBQUUsUUFBSSxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQyxBQUFDLElBQUksV0FBVyxFQUFFLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxBQUFDLE9BQU8sV0FBVyxDQUFDO0dBQUUsQ0FBQztDQUFFLENBQUEsRUFBRyxDQUFDOztBQUV0akIsSUFBSSxJQUFJLEdBQUcsU0FBUyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7QUFBRSxNQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsQUFBQyxTQUFTLEVBQUUsT0FBTyxNQUFNLEVBQUU7QUFBRSxRQUFJLE1BQU0sR0FBRyxHQUFHO1FBQUUsUUFBUSxHQUFHLEdBQUc7UUFBRSxRQUFRLEdBQUcsR0FBRyxDQUFDLEFBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxBQUFDLElBQUksTUFBTSxLQUFLLElBQUksRUFBRSxNQUFNLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxBQUFDLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQUFBQyxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7QUFBRSxVQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEFBQUMsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO0FBQUUsZUFBTyxTQUFTLENBQUM7T0FBRSxNQUFNO0FBQUUsV0FBRyxHQUFHLE1BQU0sQ0FBQyxBQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsQUFBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEFBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxBQUFDLElBQUksR0FBRyxNQUFNLEdBQUcsU0FBUyxDQUFDLEFBQUMsU0FBUyxTQUFTLENBQUM7T0FBRTtLQUFFLE1BQU0sSUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO0FBQUUsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0tBQUUsTUFBTTtBQUFFLFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQUFBQyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFBRSxlQUFPLFNBQVMsQ0FBQztPQUFFLEFBQUMsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQUU7R0FBRTtDQUFFLENBQUM7O0FBRXJwQixTQUFTLGtCQUFrQixDQUFDLEdBQUcsRUFBRTtBQUFFLE1BQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUFFLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxPQUFPLElBQUksQ0FBQztHQUFFLE1BQU07QUFBRSxXQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7R0FBRTtDQUFFOztBQUUvTCxTQUFTLGlCQUFpQixDQUFDLEVBQUUsRUFBRTtBQUFFLFNBQU8sWUFBWTtBQUFFLFFBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLEFBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFBRSxVQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxBQUFDLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLEFBQUMsU0FBUyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUFFLFlBQUk7QUFBRSxjQUFJLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQUFBQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1NBQUUsQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUFFLGdCQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQUFBQyxPQUFPO1NBQUUsQUFBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFBRSxpQkFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQUUsTUFBTTtBQUFFLGlCQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsU0FBUyxD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QUFHLENBQUMsb0NBQW9DLENBQUMsRUFBRTtBQUN6RCxjQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDO0FBQy9CLG1CQUFPLEVBQUUsZ0NBQWdDO0FBQ3pDLDJCQUFlLEVBQUEsbURBQUEsR0FBc0QsTUFBTSxDQUFDLFdBQVcsRUFBRSxHQUFBLDhCQUE4QjtBQUN2SCxtQkFBTyxFQUFFO0FBQ1AsZ0JBQUUsRUFBRSxZQUFZO0FBQ2hCLG9CQUFNLEVBQUUsSUFBSTthQUNiO1dBQ0YsQ0FBQyxDQUFBO1NBQ0gsTUFBTTtBQUNMLGlCQUFPLFlBQVksRUFBRSxDQUFBO1NBQ3RCO09BQ0YsTUFBTTtBQUNMLGVBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtPQUM5QjtLQUNGO0dBK1NBLEVBQUU7QUFDRCxPQUFHLEVBQUUsZUFBZTtBQUNwQixPQUFHLEVBOWhFYSxTQUFBLEdBQUEsR0FBRztBQUNuQixVQUFJLENBQUMsU0FBUyxDQUFDLG9MQUFvTCxDQUFDLENBQUE7QUFDcE0sYUFBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUE7S0FDaEQ7R0EraEVBLENBQUMsQ0FBQyxDQUFDOztBQUVKLFNBNWxFcUIsU0FBUyxDQUFBO0NBNmxFL0IsQ0FBQSxDQTdsRXdDLEtBQUssQ0FzeUQ3QyxDQUFBIiwiZmlsZSI6Ii9idWlsZC9hdG9tL3NyYy9hdG9tLTEuMjAuMS9vdXQvYXBwL3NyYy93b3Jrc3BhY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5jb25zdCBfID0gcmVxdWlyZSgndW5kZXJzY29yZS1wbHVzJylcbmNvbnN0IHVybCA9IHJlcXVpcmUoJ3VybCcpXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5jb25zdCB7RW1pdHRlciwgRGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdldmVudC1raXQnKVxuY29uc3QgZnMgPSByZXF1aXJlKCdmcy1wbHVzJylcbmNvbnN0IHtEaXJlY3Rvcnl9ID0gcmVxdWlyZSgncGF0aHdhdGNoZXInKVxuY29uc3QgR3JpbSA9IHJlcXVpcmUoJ2dyaW0nKVxuY29uc3QgRGVmYXVsdERpcmVjdG9yeVNlYXJjaGVyID0gcmVxdWlyZSgnLi9kZWZhdWx0LWRpcmVjdG9yeS1zZWFyY2hlcicpXG5jb25zdCBEb2NrID0gcmVxdWlyZSgnLi9kb2NrJylcbmNvbnN0IE1vZGVsID0gcmVxdWlyZSgnLi9tb2RlbCcpXG5jb25zdCBTdGF0ZVN0b3JlID0gcmVxdWlyZSgnLi9zdGF0ZS1zdG9yZScpXG5jb25zdCBUZXh0RWRpdG9yID0gcmVxdWlyZSgnLi90ZXh0LWVkaXRvcicpXG5jb25zdCBQYW5lbCA9IHJlcXVpcmUoJy4vcGFuZWwnKVxuY29uc3QgUGFuZWxDb250YWluZXIgPSByZXF1aXJlKCcuL3BhbmVsLWNvbnRhaW5lcicpXG5jb25zdCBUYXNrID0gcmVxdWlyZSgnLi90YXNrJylcbmNvbnN0IFdvcmtzcGFjZUNlbnRlciA9IHJlcXVpcmUoJy4vd29ya3NwYWNlLWNlbnRlcicpXG5jb25zdCBXb3Jrc3BhY2VFbGVtZW50ID0gcmVxdWlyZSgnLi93b3Jrc3BhY2UtZWxlbWVudCcpXG5cbmNvbnN0IFNUT1BQRURfQ0hBTkdJTkdfQUNUSVZFX1BBTkVfSVRFTV9ERUxBWSA9IDEwMFxuY29uc3QgQUxMX0xPQ0FUSU9OUyA9IFsnY2VudGVyJywgJ2xlZnQnLCAncmlnaHQnLCAnYm90dG9tJ11cblxuLy8gRXNzZW50aWFsOiBSZXByZXNlbnRzIHRoZSBzdGF0ZSBvZiB0aGUgdXNlciBpbnRlcmZhY2UgZm9yIHRoZSBlbnRpcmUgd2luZG93LlxuLy8gQW4gaW5zdGFuY2Ugb2YgdGhpcyBjbGFzcyBpcyBhdmFpbGFibGUgdmlhIHRoZSBgYXRvbS53b3Jrc3BhY2VgIGdsb2JhbC5cbi8vXG4vLyBJbnRlcmFjdCB3aXRoIHRoaXMgb2JqZWN0IHRvIG9wZW4gZmlsZXMsIGJlIG5vdGlmaWVkIG9mIGN1cnJlbnQgYW5kIGZ1dHVyZVxuLy8gZWRpdG9ycywgYW5kIG1hbmlwdWxhdGUgcGFuZXMuIFRvIGFkZCBwYW5lbHMsIHVzZSB7V29ya3NwYWNlOjphZGRUb3BQYW5lbH1cbi8vIGFuZCBmcmllbmRzLlxuLy9cbi8vICMjIFdvcmtzcGFjZSBJdGVtc1xuLy9cbi8vIFRoZSB0ZXJtIFwiaXRlbVwiIHJlZmVycyB0byBhbnl0aGluZyB0aGF0IGNhbiBiZSBkaXNwbGF5ZWRcbi8vIGluIGEgcGFuZSB3aXRoaW4gdGhlIHdvcmtzcGFjZSwgZWl0aGVyIGluIHRoZSB7V29ya3NwYWNlQ2VudGVyfSBvciBpbiBvbmVcbi8vIG9mIHRoZSB0aHJlZSB7RG9ja31zLiBUaGUgd29ya3NwYWNlIGV4cGVjdHMgaXRlbXMgdG8gY29uZm9ybSB0byB0aGVcbi8vIGZvbGxvd2luZyBpbnRlcmZhY2U6XG4vL1xuLy8gIyMjIFJlcXVpcmVkIE1ldGhvZHNcbi8vXG4vLyAjIyMjIGBnZXRUaXRsZSgpYFxuLy9cbi8vIFJldHVybnMgYSB7U3RyaW5nfSBjb250YWluaW5nIHRoZSB0aXRsZSBvZiB0aGUgaXRlbSB0byBkaXNwbGF5IG9uIGl0c1xuLy8gYXNzb2NpYXRlZCB0YWIuXG4vL1xuLy8gIyMjIE9wdGlvbmFsIE1ldGhvZHNcbi8vXG4vLyAjIyMjIGBnZXRFbGVtZW50KClgXG4vL1xuLy8gSWYgeW91ciBpdGVtIGFscmVhZHkgKmlzKiBhIERPTSBlbGVtZW50LCB5b3UgZG8gbm90IG5lZWQgdG8gaW1wbGVtZW50IHRoaXNcbi8vIG1ldGhvZC4gT3RoZXJ3aXNlIGl0IHNob3VsZCByZXR1cm4gdGhlIGVsZW1lbnQgeW91IHdhbnQgdG8gZGlzcGxheSB0b1xuLy8gcmVwcmVzZW50IHRoaXMgaXRlbS5cbi8vXG4vLyAjIyMjIGBkZXN0cm95KClgXG4vL1xuLy8gRGVzdHJveXMgdGhlIGl0ZW0uIFRoaXMgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgaXRlbSBpcyByZW1vdmVkIGZyb20gaXRzXG4vLyBwYXJlbnQgcGFuZS5cbi8vXG4vLyAjIyMjIGBvbkRpZERlc3Ryb3koY2FsbGJhY2spYFxuLy9cbi8vIENhbGxlZCBieSB0aGUgd29ya3NwYWNlIHNvIGl0IGNhbiBiZSBub3RpZmllZCB3aGVuIHRoZSBpdGVtIGlzIGRlc3Ryb3llZC5cbi8vIE11c3QgcmV0dXJuIGEge0Rpc3Bvc2FibGV9LlxuLy9cbi8vICMjIyMgYHNlcmlhbGl6ZSgpYFxuLy9cbi8vIFNlcmlhbGl6ZSB0aGUgc3RhdGUgb2YgdGhlIGl0ZW0uIE11c3QgcmV0dXJuIGFuIG9iamVjdCB0aGF0IGNhbiBiZSBwYXNzZWQgdG9cbi8vIGBKU09OLnN0cmluZ2lmeWAuIFRoZSBzdGF0ZSBzaG91bGQgaW5jbHVkZSBhIGZpZWxkIGNhbGxlZCBgZGVzZXJpYWxpemVyYCxcbi8vIHdoaWNoIG5hbWVzIGEgZGVzZXJpYWxpemVyIGRlY2xhcmVkIGluIHlvdXIgYHBhY2thZ2UuanNvbmAuIFRoaXMgbWV0aG9kIGlzXG4vLyBpbnZva2VkIG9uIGl0ZW1zIHdoZW4gc2VyaWFsaXppbmcgdGhlIHdvcmtzcGFjZSBzbyB0aGV5IGNhbiBiZSByZXN0b3JlZCB0b1xuLy8gdGhlIHNhbWUgbG9jYXRpb24gbGF0ZXIuXG4vL1xuLy8gIyMjIyBgZ2V0VVJJKClgXG4vL1xuLy8gUmV0dXJucyB0aGUgVVJJIGFzc29jaWF0ZWQgd2l0aCB0aGUgaXRlbS5cbi8vXG4vLyAjIyMjIGBnZXRMb25nVGl0bGUoKWBcbi8vXG4vLyBSZXR1cm5zIGEge1N0cmluZ30gY29udGFpbmluZyBhIGxvbmdlciB2ZXJzaW9uIG9mIHRoZSB0aXRsZSB0byBkaXNwbGF5IGluXG4vLyBwbGFjZXMgbGlrZSB0aGUgd2luZG93IHRpdGxlIG9yIG9uIHRhYnMgdGhlaXIgc2hvcnQgdGl0bGVzIGFyZSBhbWJpZ3VvdXMuXG4vL1xuLy8gIyMjIyBgb25EaWRDaGFuZ2VUaXRsZWBcbi8vXG4vLyBDYWxsZWQgYnkgdGhlIHdvcmtzcGFjZSBzbyBpdCBjYW4gYmUgbm90aWZpZWQgd2hlbiB0aGUgaXRlbSdzIHRpdGxlIGNoYW5nZXMuXG4vLyBNdXN0IHJldHVybiBhIHtEaXNwb3NhYmxlfS5cbi8vXG4vLyAjIyMjIGBnZXRJY29uTmFtZSgpYFxuLy9cbi8vIFJldHVybiBhIHtTdHJpbmd9IHdpdGggdGhlIG5hbWUgb2YgYW4gaWNvbi4gSWYgdGhpcyBtZXRob2QgaXMgZGVmaW5lZCBhbmRcbi8vIHJldHVybnMgYSBzdHJpbmcsIHRoZSBpdGVtJ3MgdGFiIGVsZW1lbnQgd2lsbCBiZSByZW5kZXJlZCB3aXRoIHRoZSBgaWNvbmAgYW5kXG4vLyBgaWNvbi0ke2ljb25OYW1lfWAgQ1NTIGNsYXNzZXMuXG4vL1xuLy8gIyMjIGBvbkRpZENoYW5nZUljb24oY2FsbGJhY2spYFxuLy9cbi8vIENhbGxlZCBieSB0aGUgd29ya3NwYWNlIHNvIGl0IGNhbiBiZSBub3RpZmllZCB3aGVuIHRoZSBpdGVtJ3MgaWNvbiBjaGFuZ2VzLlxuLy8gTXVzdCByZXR1cm4gYSB7RGlzcG9zYWJsZX0uXG4vL1xuLy8gIyMjIyBgZ2V0RGVmYXVsdExvY2F0aW9uKClgXG4vL1xuLy8gVGVsbHMgdGhlIHdvcmtzcGFjZSB3aGVyZSB5b3VyIGl0ZW0gc2hvdWxkIGJlIG9wZW5lZCBpbiBhYnNlbmNlIG9mIGEgdXNlclxuLy8gb3ZlcnJpZGUuIEl0ZW1zIGNhbiBhcHBlYXIgaW4gdGhlIGNlbnRlciBvciBpbiBhIGRvY2sgb24gdGhlIGxlZnQsIHJpZ2h0LCBvclxuLy8gYm90dG9tIG9mIHRoZSB3b3Jrc3BhY2UuXG4vL1xuLy8gUmV0dXJucyBhIHtTdHJpbmd9IHdpdGggb25lIG9mIHRoZSBmb2xsb3dpbmcgdmFsdWVzOiBgJ2NlbnRlcidgLCBgJ2xlZnQnYCxcbi8vIGAncmlnaHQnYCwgYCdib3R0b20nYC4gSWYgdGhpcyBtZXRob2QgaXMgbm90IGRlZmluZWQsIGAnY2VudGVyJ2AgaXMgdGhlXG4vLyBkZWZhdWx0LlxuLy9cbi8vICMjIyMgYGdldEFsbG93ZWRMb2NhdGlvbnMoKWBcbi8vXG4vLyBUZWxscyB0aGUgd29ya3NwYWNlIHdoZXJlIHRoaXMgaXRlbSBjYW4gYmUgbW92ZWQuIFJldHVybnMgYW4ge0FycmF5fSBvZiBvbmVcbi8vIG9yIG1vcmUgb2YgdGhlIGZvbGxvd2luZyB2YWx1ZXM6IGAnY2VudGVyJ2AsIGAnbGVmdCdgLCBgJ3JpZ2h0J2AsIG9yXG4vLyBgJ2JvdHRvbSdgLlxuLy9cbi8vICMjIyMgYGlzUGVybWFuZW50RG9ja0l0ZW0oKWBcbi8vXG4vLyBUZWxscyB0aGUgd29ya3NwYWNlIHdoZXRoZXIgb3Igbm90IHRoaXMgaXRlbSBjYW4gYmUgY2xvc2VkIGJ5IHRoZSB1c2VyIGJ5XG4vLyBjbGlja2luZyBhbiBgeGAgb24gaXRzIHRhYi4gVXNlIG9mIHRoaXMgZmVhdHVyZSBpcyBkaXNjb3VyYWdlZCB1bmxlc3MgdGhlcmUnc1xuLy8gYSB2ZXJ5IGdvb2QgcmVhc29uIG5vdCB0byBhbGxvdyB1c2VycyB0byBjbG9zZSB5b3VyIGl0ZW0uIEl0ZW1zIGNhbiBiZSBtYWRlXG4vLyBwZXJtYW5lbnQgKm9ubHkqIHdoZW4gdGhleSBhcmUgY29udGFpbmVkIGluIGRvY2tzLiBDZW50ZXIgcGFuZSBpdGVtcyBjYW5cbi8vIGFsd2F5cyBiZSByZW1vdmVkLiBOb3RlIHRoYXQgaXQgaXMgY3VycmVudGx5IHN0aWxsIHBvc3NpYmxlIHRvIGNsb3NlIGRvY2tcbi8vIGl0ZW1zIHZpYSB0aGUgYENsb3NlIFBhbmVgIG9wdGlvbiBpbiB0aGUgY29udGV4dCBtZW51IGFuZCB2aWEgQXRvbSBBUElzLCBzb1xuLy8geW91IHNob3VsZCBzdGlsbCBiZSBwcmVwYXJlZCB0byBoYW5kbGUgeW91ciBkb2NrIGl0ZW1zIGJlaW5nIGRlc3Ryb3llZCBieSB0aGVcbi8vIHVzZXIgZXZlbiBpZiB5b3UgaW1wbGVtZW50IHRoaXMgbWV0aG9kLlxuLy9cbi8vICMjIyMgYHNhdmUoKWBcbi8vXG4vLyBTYXZlcyB0aGUgaXRlbS5cbi8vXG4vLyAjIyMjIGBzYXZlQXMocGF0aClgXG4vL1xuLy8gU2F2ZXMgdGhlIGl0ZW0gdG8gdGhlIHNwZWNpZmllZCBwYXRoLlxuLy9cbi8vICMjIyMgYGdldFBhdGgoKWBcbi8vXG4vLyBSZXR1cm5zIHRoZSBsb2NhbCBwYXRoIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGl0ZW0uIFRoaXMgaXMgb25seSB1c2VkIHRvIHNldFxuLy8gdGhlIGluaXRpYWwgbG9jYXRpb24gb2YgdGhlIFwic2F2ZSBhc1wiIGRpYWxvZy5cbi8vXG4vLyAjIyMjIGBpc01vZGlmaWVkKClgXG4vL1xuLy8gUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgaXRlbSBpcyBtb2RpZmllZCB0byByZWZsZWN0IG1vZGlmaWNhdGlvbiBpbiB0aGVcbi8vIFVJLlxuLy9cbi8vICMjIyMgYG9uRGlkQ2hhbmdlTW9kaWZpZWQoKWBcbi8vXG4vLyBDYWxsZWQgYnkgdGhlIHdvcmtzcGFjZSBzbyBpdCBjYW4gYmUgbm90aWZpZWQgd2hlbiBpdGVtJ3MgbW9kaWZpZWQgc3RhdHVzXG4vLyBjaGFuZ2VzLiBNdXN0IHJldHVybiBhIHtEaXNwb3NhYmxlfS5cbi8vXG4vLyAjIyMjIGBjb3B5KClgXG4vL1xuLy8gQ3JlYXRlIGEgY29weSBvZiB0aGUgaXRlbS4gSWYgZGVmaW5lZCwgdGhlIHdvcmtzcGFjZSB3aWxsIGNhbGwgdGhpcyBtZXRob2QgdG9cbi8vIGR1cGxpY2F0ZSB0aGUgaXRlbSB3aGVuIHNwbGl0dGluZyBwYW5lcyB2aWEgY2VydGFpbiBzcGxpdCBjb21tYW5kcy5cbi8vXG4vLyAjIyMjIGBnZXRQcmVmZXJyZWRIZWlnaHQoKWBcbi8vXG4vLyBJZiB0aGlzIGl0ZW0gaXMgZGlzcGxheWVkIGluIHRoZSBib3R0b20ge0RvY2t9LCBjYWxsZWQgYnkgdGhlIHdvcmtzcGFjZSB3aGVuXG4vLyBpbml0aWFsbHkgZGlzcGxheWluZyB0aGUgZG9jayB0byBzZXQgaXRzIGhlaWdodC4gT25jZSB0aGUgZG9jayBoYXMgYmVlblxuLy8gcmVzaXplZCBieSB0aGUgdXNlciwgdGhlaXIgaGVpZ2h0IHdpbGwgb3ZlcnJpZGUgdGhpcyB2YWx1ZS5cbi8vXG4vLyBSZXR1cm5zIGEge051bWJlcn0uXG4vL1xuLy8gIyMjIyBgZ2V0UHJlZmVycmVkV2lkdGgoKWBcbi8vXG4vLyBJZiB0aGlzIGl0ZW0gaXMgZGlzcGxheWVkIGluIHRoZSBsZWZ0IG9yIHJpZ2h0IHtEb2NrfSwgY2FsbGVkIGJ5IHRoZVxuLy8gd29ya3NwYWNlIHdoZW4gaW5pdGlhbGx5IGRpc3BsYXlpbmcgdGhlIGRvY2sgdG8gc2V0IGl0cyB3aWR0aC4gT25jZSB0aGUgZG9ja1xuLy8gaGFzIGJlZW4gcmVzaXplZCBieSB0aGUgdXNlciwgdGhlaXIgd2lkdGggd2lsbCBvdmVycmlkZSB0aGlzIHZhbHVlLlxuLy9cbi8vIFJldHVybnMgYSB7TnVtYmVyfS5cbi8vXG4vLyAjIyMjIGBvbkRpZFRlcm1pbmF0ZVBlbmRpbmdTdGF0ZShjYWxsYmFjaylgXG4vL1xuLy8gSWYgdGhlIHdvcmtzcGFjZSBpcyBjb25maWd1cmVkIHRvIHVzZSAqcGVuZGluZyBwYW5lIGl0ZW1zKiwgdGhlIHdvcmtzcGFjZVxuLy8gd2lsbCBzdWJzY3JpYmUgdG8gdGhpcyBtZXRob2QgdG8gdGVybWluYXRlIHRoZSBwZW5kaW5nIHN0YXRlIG9mIHRoZSBpdGVtLlxuLy8gTXVzdCByZXR1cm4gYSB7RGlzcG9zYWJsZX0uXG4vL1xuLy8gIyMjIyBgc2hvdWxkUHJvbXB0VG9TYXZlKClgXG4vL1xuLy8gVGhpcyBtZXRob2QgaW5kaWNhdGVzIHdoZXRoZXIgQXRvbSBzaG91bGQgcHJvbXB0IHRoZSB1c2VyIHRvIHNhdmUgdGhpcyBpdGVtXG4vLyB3aGVuIHRoZSB1c2VyIGNsb3NlcyBvciByZWxvYWRzIHRoZSB3aW5kb3cuIFJldHVybnMgYSBib29sZWFuLlxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBXb3Jrc3BhY2UgZXh0ZW5kcyBNb2RlbCB7XG4gIGNvbnN0cnVjdG9yIChwYXJhbXMpIHtcbiAgICBzdXBlciguLi5hcmd1bWVudHMpXG5cbiAgICB0aGlzLnVwZGF0ZVdpbmRvd1RpdGxlID0gdGhpcy51cGRhdGVXaW5kb3dUaXRsZS5iaW5kKHRoaXMpXG4gICAgdGhpcy51cGRhdGVEb2N1bWVudEVkaXRlZCA9IHRoaXMudXBkYXRlRG9jdW1lbnRFZGl0ZWQuYmluZCh0aGlzKVxuICAgIHRoaXMuZGlkRGVzdHJveVBhbmVJdGVtID0gdGhpcy5kaWREZXN0cm95UGFuZUl0ZW0uYmluZCh0aGlzKVxuICAgIHRoaXMuZGlkQ2hhbmdlQWN0aXZlUGFuZU9uUGFuZUNvbnRhaW5lciA9IHRoaXMuZGlkQ2hhbmdlQWN0aXZlUGFuZU9uUGFuZUNvbnRhaW5lci5iaW5kKHRoaXMpXG4gICAgdGhpcy5kaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbU9uUGFuZUNvbnRhaW5lciA9IHRoaXMuZGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW1PblBhbmVDb250YWluZXIuYmluZCh0aGlzKVxuICAgIHRoaXMuZGlkQWN0aXZhdGVQYW5lQ29udGFpbmVyID0gdGhpcy5kaWRBY3RpdmF0ZVBhbmVDb250YWluZXIuYmluZCh0aGlzKVxuXG4gICAgdGhpcy5lbmFibGVQZXJzaXN0ZW5jZSA9IHBhcmFtcy5lbmFibGVQZXJzaXN0ZW5jZVxuICAgIHRoaXMucGFja2FnZU1hbmFnZXIgPSBwYXJhbXMucGFja2FnZU1hbmFnZXJcbiAgICB0aGlzLmNvbmZpZyA9IHBhcmFtcy5jb25maWdcbiAgICB0aGlzLnByb2plY3QgPSBwYXJhbXMucHJvamVjdFxuICAgIHRoaXMubm90aWZpY2F0aW9uTWFuYWdlciA9IHBhcmFtcy5ub3RpZmljYXRpb25NYW5hZ2VyXG4gICAgdGhpcy52aWV3UmVnaXN0cnkgPSBwYXJhbXMudmlld1JlZ2lzdHJ5XG4gICAgdGhpcy5ncmFtbWFyUmVnaXN0cnkgPSBwYXJhbXMuZ3JhbW1hclJlZ2lzdHJ5XG4gICAgdGhpcy5hcHBsaWNhdGlvbkRlbGVnYXRlID0gcGFyYW1zLmFwcGxpY2F0aW9uRGVsZWdhdGVcbiAgICB0aGlzLmFzc2VydCA9IHBhcmFtcy5hc3NlcnRcbiAgICB0aGlzLmRlc2VyaWFsaXplck1hbmFnZXIgPSBwYXJhbXMuZGVzZXJpYWxpemVyTWFuYWdlclxuICAgIHRoaXMudGV4dEVkaXRvclJlZ2lzdHJ5ID0gcGFyYW1zLnRleHRFZGl0b3JSZWdpc3RyeVxuICAgIHRoaXMuc3R5bGVNYW5hZ2VyID0gcGFyYW1zLnN0eWxlTWFuYWdlclxuICAgIHRoaXMuZHJhZ2dpbmdJdGVtID0gZmFsc2VcbiAgICB0aGlzLml0ZW1Mb2NhdGlvblN0b3JlID0gbmV3IFN0YXRlU3RvcmUoJ0F0b21QcmV2aW91c0l0ZW1Mb2NhdGlvbnMnLCAxKVxuXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMub3BlbmVycyA9IFtdXG4gICAgdGhpcy5kZXN0cm95ZWRJdGVtVVJJcyA9IFtdXG4gICAgdGhpcy5zdG9wcGVkQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbVRpbWVvdXQgPSBudWxsXG5cbiAgICB0aGlzLmRlZmF1bHREaXJlY3RvcnlTZWFyY2hlciA9IG5ldyBEZWZhdWx0RGlyZWN0b3J5U2VhcmNoZXIoKVxuICAgIHRoaXMuY29uc3VtZVNlcnZpY2VzKHRoaXMucGFja2FnZU1hbmFnZXIpXG5cbiAgICB0aGlzLnBhbmVDb250YWluZXJzID0ge1xuICAgICAgY2VudGVyOiB0aGlzLmNyZWF0ZUNlbnRlcigpLFxuICAgICAgbGVmdDogdGhpcy5jcmVhdGVEb2NrKCdsZWZ0JyksXG4gICAgICByaWdodDogdGhpcy5jcmVhdGVEb2NrKCdyaWdodCcpLFxuICAgICAgYm90dG9tOiB0aGlzLmNyZWF0ZURvY2soJ2JvdHRvbScpXG4gICAgfVxuICAgIHRoaXMuYWN0aXZlUGFuZUNvbnRhaW5lciA9IHRoaXMucGFuZUNvbnRhaW5lcnMuY2VudGVyXG4gICAgdGhpcy5oYXNBY3RpdmVUZXh0RWRpdG9yID0gZmFsc2VcblxuICAgIHRoaXMucGFuZWxDb250YWluZXJzID0ge1xuICAgICAgdG9wOiBuZXcgUGFuZWxDb250YWluZXIoe3ZpZXdSZWdpc3RyeTogdGhpcy52aWV3UmVnaXN0cnksIGxvY2F0aW9uOiAndG9wJ30pLFxuICAgICAgbGVmdDogbmV3IFBhbmVsQ29udGFpbmVyKHt2aWV3UmVnaXN0cnk6IHRoaXMudmlld1JlZ2lzdHJ5LCBsb2NhdGlvbjogJ2xlZnQnLCBkb2NrOiB0aGlzLnBhbmVDb250YWluZXJzLmxlZnR9KSxcbiAgICAgIHJpZ2h0OiBuZXcgUGFuZWxDb250YWluZXIoe3ZpZXdSZWdpc3RyeTogdGhpcy52aWV3UmVnaXN0cnksIGxvY2F0aW9uOiAncmlnaHQnLCBkb2NrOiB0aGlzLnBhbmVDb250YWluZXJzLnJpZ2h0fSksXG4gICAgICBib3R0b206IG5ldyBQYW5lbENvbnRhaW5lcih7dmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSwgbG9jYXRpb246ICdib3R0b20nLCBkb2NrOiB0aGlzLnBhbmVDb250YWluZXJzLmJvdHRvbX0pLFxuICAgICAgaGVhZGVyOiBuZXcgUGFuZWxDb250YWluZXIoe3ZpZXdSZWdpc3RyeTogdGhpcy52aWV3UmVnaXN0cnksIGxvY2F0aW9uOiAnaGVhZGVyJ30pLFxuICAgICAgZm9vdGVyOiBuZXcgUGFuZWxDb250YWluZXIoe3ZpZXdSZWdpc3RyeTogdGhpcy52aWV3UmVnaXN0cnksIGxvY2F0aW9uOiAnZm9vdGVyJ30pLFxuICAgICAgbW9kYWw6IG5ldyBQYW5lbENvbnRhaW5lcih7dmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSwgbG9jYXRpb246ICdtb2RhbCd9KVxuICAgIH1cblxuICAgIHRoaXMuc3Vic2NyaWJlVG9FdmVudHMoKVxuICB9XG5cbiAgZ2V0IHBhbmVDb250YWluZXIgKCkge1xuICAgIEdyaW0uZGVwcmVjYXRlKCdgYXRvbS53b3Jrc3BhY2UucGFuZUNvbnRhaW5lcmAgaGFzIGFsd2F5cyBiZWVuIHByaXZhdGUsIGJ1dCBpdCBpcyBub3cgZ29uZS4gUGxlYXNlIHVzZSBgYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKClgIGluc3RlYWQgYW5kIGNvbnN1bHQgdGhlIHdvcmtzcGFjZSBBUEkgZG9jcyBmb3IgcHVibGljIG1ldGhvZHMuJylcbiAgICByZXR1cm4gdGhpcy5wYW5lQ29udGFpbmVycy5jZW50ZXIucGFuZUNvbnRhaW5lclxuICB9XG5cbiAgZ2V0RWxlbWVudCAoKSB7XG4gICAgaWYgKCF0aGlzLmVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudCA9IG5ldyBXb3Jrc3BhY2VFbGVtZW50KCkuaW5pdGlhbGl6ZSh0aGlzLCB7XG4gICAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICAgIHByb2plY3Q6IHRoaXMucHJvamVjdCxcbiAgICAgICAgdmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSxcbiAgICAgICAgc3R5bGVNYW5hZ2VyOiB0aGlzLnN0eWxlTWFuYWdlclxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudFxuICB9XG5cbiAgY3JlYXRlQ2VudGVyICgpIHtcbiAgICByZXR1cm4gbmV3IFdvcmtzcGFjZUNlbnRlcih7XG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgYXBwbGljYXRpb25EZWxlZ2F0ZTogdGhpcy5hcHBsaWNhdGlvbkRlbGVnYXRlLFxuICAgICAgbm90aWZpY2F0aW9uTWFuYWdlcjogdGhpcy5ub3RpZmljYXRpb25NYW5hZ2VyLFxuICAgICAgZGVzZXJpYWxpemVyTWFuYWdlcjogdGhpcy5kZXNlcmlhbGl6ZXJNYW5hZ2VyLFxuICAgICAgdmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSxcbiAgICAgIGRpZEFjdGl2YXRlOiB0aGlzLmRpZEFjdGl2YXRlUGFuZUNvbnRhaW5lcixcbiAgICAgIGRpZENoYW5nZUFjdGl2ZVBhbmU6IHRoaXMuZGlkQ2hhbmdlQWN0aXZlUGFuZU9uUGFuZUNvbnRhaW5lcixcbiAgICAgIGRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtOiB0aGlzLmRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtT25QYW5lQ29udGFpbmVyLFxuICAgICAgZGlkRGVzdHJveVBhbmVJdGVtOiB0aGlzLmRpZERlc3Ryb3lQYW5lSXRlbVxuICAgIH0pXG4gIH1cblxuICBjcmVhdGVEb2NrIChsb2NhdGlvbikge1xuICAgIHJldHVybiBuZXcgRG9jayh7XG4gICAgICBsb2NhdGlvbixcbiAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICBhcHBsaWNhdGlvbkRlbGVnYXRlOiB0aGlzLmFwcGxpY2F0aW9uRGVsZWdhdGUsXG4gICAgICBkZXNlcmlhbGl6ZXJNYW5hZ2VyOiB0aGlzLmRlc2VyaWFsaXplck1hbmFnZXIsXG4gICAgICBub3RpZmljYXRpb25NYW5hZ2VyOiB0aGlzLm5vdGlmaWNhdGlvbk1hbmFnZXIsXG4gICAgICB2aWV3UmVnaXN0cnk6IHRoaXMudmlld1JlZ2lzdHJ5LFxuICAgICAgZGlkQWN0aXZhdGU6IHRoaXMuZGlkQWN0aXZhdGVQYW5lQ29udGFpbmVyLFxuICAgICAgZGlkQ2hhbmdlQWN0aXZlUGFuZTogdGhpcy5kaWRDaGFuZ2VBY3RpdmVQYW5lT25QYW5lQ29udGFpbmVyLFxuICAgICAgZGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW06IHRoaXMuZGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW1PblBhbmVDb250YWluZXIsXG4gICAgICBkaWREZXN0cm95UGFuZUl0ZW06IHRoaXMuZGlkRGVzdHJveVBhbmVJdGVtXG4gICAgfSlcbiAgfVxuXG4gIHJlc2V0IChwYWNrYWdlTWFuYWdlcikge1xuICAgIHRoaXMucGFja2FnZU1hbmFnZXIgPSBwYWNrYWdlTWFuYWdlclxuICAgIHRoaXMuZW1pdHRlci5kaXNwb3NlKClcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG5cbiAgICB0aGlzLnBhbmVDb250YWluZXJzLmNlbnRlci5kZXN0cm95KClcbiAgICB0aGlzLnBhbmVDb250YWluZXJzLmxlZnQuZGVzdHJveSgpXG4gICAgdGhpcy5wYW5lQ29udGFpbmVycy5yaWdodC5kZXN0cm95KClcbiAgICB0aGlzLnBhbmVDb250YWluZXJzLmJvdHRvbS5kZXN0cm95KClcblxuICAgIF8udmFsdWVzKHRoaXMucGFuZWxDb250YWluZXJzKS5mb3JFYWNoKHBhbmVsQ29udGFpbmVyID0+IHsgcGFuZWxDb250YWluZXIuZGVzdHJveSgpIH0pXG5cbiAgICB0aGlzLnBhbmVDb250YWluZXJzID0ge1xuICAgICAgY2VudGVyOiB0aGlzLmNyZWF0ZUNlbnRlcigpLFxuICAgICAgbGVmdDogdGhpcy5jcmVhdGVEb2NrKCdsZWZ0JyksXG4gICAgICByaWdodDogdGhpcy5jcmVhdGVEb2NrKCdyaWdodCcpLFxuICAgICAgYm90dG9tOiB0aGlzLmNyZWF0ZURvY2soJ2JvdHRvbScpXG4gICAgfVxuICAgIHRoaXMuYWN0aXZlUGFuZUNvbnRhaW5lciA9IHRoaXMucGFuZUNvbnRhaW5lcnMuY2VudGVyXG4gICAgdGhpcy5oYXNBY3RpdmVUZXh0RWRpdG9yID0gZmFsc2VcblxuICAgIHRoaXMucGFuZWxDb250YWluZXJzID0ge1xuICAgICAgdG9wOiBuZXcgUGFuZWxDb250YWluZXIoe3ZpZXdSZWdpc3RyeTogdGhpcy52aWV3UmVnaXN0cnksIGxvY2F0aW9uOiAndG9wJ30pLFxuICAgICAgbGVmdDogbmV3IFBhbmVsQ29udGFpbmVyKHt2aWV3UmVnaXN0cnk6IHRoaXMudmlld1JlZ2lzdHJ5LCBsb2NhdGlvbjogJ2xlZnQnLCBkb2NrOiB0aGlzLnBhbmVDb250YWluZXJzLmxlZnR9KSxcbiAgICAgIHJpZ2h0OiBuZXcgUGFuZWxDb250YWluZXIoe3ZpZXdSZWdpc3RyeTogdGhpcy52aWV3UmVnaXN0cnksIGxvY2F0aW9uOiAncmlnaHQnLCBkb2NrOiB0aGlzLnBhbmVDb250YWluZXJzLnJpZ2h0fSksXG4gICAgICBib3R0b206IG5ldyBQYW5lbENvbnRhaW5lcih7dmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSwgbG9jYXRpb246ICdib3R0b20nLCBkb2NrOiB0aGlzLnBhbmVDb250YWluZXJzLmJvdHRvbX0pLFxuICAgICAgaGVhZGVyOiBuZXcgUGFuZWxDb250YWluZXIoe3ZpZXdSZWdpc3RyeTogdGhpcy52aWV3UmVnaXN0cnksIGxvY2F0aW9uOiAnaGVhZGVyJ30pLFxuICAgICAgZm9vdGVyOiBuZXcgUGFuZWxDb250YWluZXIoe3ZpZXdSZWdpc3RyeTogdGhpcy52aWV3UmVnaXN0cnksIGxvY2F0aW9uOiAnZm9vdGVyJ30pLFxuICAgICAgbW9kYWw6IG5ldyBQYW5lbENvbnRhaW5lcih7dmlld1JlZ2lzdHJ5OiB0aGlzLnZpZXdSZWdpc3RyeSwgbG9jYXRpb246ICdtb2RhbCd9KVxuICAgIH1cblxuICAgIHRoaXMub3JpZ2luYWxGb250U2l6ZSA9IG51bGxcbiAgICB0aGlzLm9wZW5lcnMgPSBbXVxuICAgIHRoaXMuZGVzdHJveWVkSXRlbVVSSXMgPSBbXVxuICAgIHRoaXMuZWxlbWVudCA9IG51bGxcbiAgICB0aGlzLmNvbnN1bWVTZXJ2aWNlcyh0aGlzLnBhY2thZ2VNYW5hZ2VyKVxuICB9XG5cbiAgc3Vic2NyaWJlVG9FdmVudHMgKCkge1xuICAgIHRoaXMucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKHRoaXMudXBkYXRlV2luZG93VGl0bGUpXG4gICAgdGhpcy5zdWJzY3JpYmVUb0ZvbnRTaXplKClcbiAgICB0aGlzLnN1YnNjcmliZVRvQWRkZWRJdGVtcygpXG4gICAgdGhpcy5zdWJzY3JpYmVUb01vdmVkSXRlbXMoKVxuICAgIHRoaXMuc3Vic2NyaWJlVG9Eb2NrVG9nZ2xpbmcoKVxuICB9XG5cbiAgY29uc3VtZVNlcnZpY2VzICh7c2VydmljZUh1Yn0pIHtcbiAgICB0aGlzLmRpcmVjdG9yeVNlYXJjaGVycyA9IFtdXG4gICAgc2VydmljZUh1Yi5jb25zdW1lKFxuICAgICAgJ2F0b20uZGlyZWN0b3J5LXNlYXJjaGVyJyxcbiAgICAgICdeMC4xLjAnLFxuICAgICAgcHJvdmlkZXIgPT4gdGhpcy5kaXJlY3RvcnlTZWFyY2hlcnMudW5zaGlmdChwcm92aWRlcilcbiAgICApXG4gIH1cblxuICAvLyBDYWxsZWQgYnkgdGhlIFNlcmlhbGl6YWJsZSBtaXhpbiBkdXJpbmcgc2VyaWFsaXphdGlvbi5cbiAgc2VyaWFsaXplICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzZXJpYWxpemVyOiAnV29ya3NwYWNlJyxcbiAgICAgIHBhY2thZ2VzV2l0aEFjdGl2ZUdyYW1tYXJzOiB0aGlzLmdldFBhY2thZ2VOYW1lc1dpdGhBY3RpdmVHcmFtbWFycygpLFxuICAgICAgZGVzdHJveWVkSXRlbVVSSXM6IHRoaXMuZGVzdHJveWVkSXRlbVVSSXMuc2xpY2UoKSxcbiAgICAgIC8vIEVuc3VyZSBkZXNlcmlhbGl6aW5nIDEuMTcgc3RhdGUgd2l0aCBwcmUgMS4xNyBBdG9tIGRvZXMgbm90IGVycm9yXG4gICAgICAvLyBUT0RPOiBSZW1vdmUgYWZ0ZXIgMS4xNyBoYXMgYmVlbiBvbiBzdGFibGUgZm9yIGEgd2hpbGVcbiAgICAgIHBhbmVDb250YWluZXI6IHt2ZXJzaW9uOiAyfSxcbiAgICAgIHBhbmVDb250YWluZXJzOiB7XG4gICAgICAgIGNlbnRlcjogdGhpcy5wYW5lQ29udGFpbmVycy5jZW50ZXIuc2VyaWFsaXplKCksXG4gICAgICAgIGxlZnQ6IHRoaXMucGFuZUNvbnRhaW5lcnMubGVmdC5zZXJpYWxpemUoKSxcbiAgICAgICAgcmlnaHQ6IHRoaXMucGFuZUNvbnRhaW5lcnMucmlnaHQuc2VyaWFsaXplKCksXG4gICAgICAgIGJvdHRvbTogdGhpcy5wYW5lQ29udGFpbmVycy5ib3R0b20uc2VyaWFsaXplKClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkZXNlcmlhbGl6ZSAoc3RhdGUsIGRlc2VyaWFsaXplck1hbmFnZXIpIHtcbiAgICBjb25zdCBwYWNrYWdlc1dpdGhBY3RpdmVHcmFtbWFycyA9XG4gICAgICBzdGF0ZS5wYWNrYWdlc1dpdGhBY3RpdmVHcmFtbWFycyAhPSBudWxsID8gc3RhdGUucGFja2FnZXNXaXRoQWN0aXZlR3JhbW1hcnMgOiBbXVxuICAgIGZvciAobGV0IHBhY2thZ2VOYW1lIG9mIHBhY2thZ2VzV2l0aEFjdGl2ZUdyYW1tYXJzKSB7XG4gICAgICBjb25zdCBwa2cgPSB0aGlzLnBhY2thZ2VNYW5hZ2VyLmdldExvYWRlZFBhY2thZ2UocGFja2FnZU5hbWUpXG4gICAgICBpZiAocGtnICE9IG51bGwpIHtcbiAgICAgICAgcGtnLmxvYWRHcmFtbWFyc1N5bmMoKVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc3RhdGUuZGVzdHJveWVkSXRlbVVSSXMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5kZXN0cm95ZWRJdGVtVVJJcyA9IHN0YXRlLmRlc3Ryb3llZEl0ZW1VUklzXG4gICAgfVxuXG4gICAgaWYgKHN0YXRlLnBhbmVDb250YWluZXJzKSB7XG4gICAgICB0aGlzLnBhbmVDb250YWluZXJzLmNlbnRlci5kZXNlcmlhbGl6ZShzdGF0ZS5wYW5lQ29udGFpbmVycy5jZW50ZXIsIGRlc2VyaWFsaXplck1hbmFnZXIpXG4gICAgICB0aGlzLnBhbmVDb250YWluZXJzLmxlZnQuZGVzZXJpYWxpemUoc3RhdGUucGFuZUNvbnRhaW5lcnMubGVmdCwgZGVzZXJpYWxpemVyTWFuYWdlcilcbiAgICAgIHRoaXMucGFuZUNvbnRhaW5lcnMucmlnaHQuZGVzZXJpYWxpemUoc3RhdGUucGFuZUNvbnRhaW5lcnMucmlnaHQsIGRlc2VyaWFsaXplck1hbmFnZXIpXG4gICAgICB0aGlzLnBhbmVDb250YWluZXJzLmJvdHRvbS5kZXNlcmlhbGl6ZShzdGF0ZS5wYW5lQ29udGFpbmVycy5ib3R0b20sIGRlc2VyaWFsaXplck1hbmFnZXIpXG4gICAgfSBlbHNlIGlmIChzdGF0ZS5wYW5lQ29udGFpbmVyKSB7XG4gICAgICAvLyBUT0RPOiBSZW1vdmUgdGhpcyBmYWxsYmFjayBvbmNlIGEgbG90IG9mIHRpbWUgaGFzIHBhc3NlZCBzaW5jZSAxLjE3IHdhcyByZWxlYXNlZFxuICAgICAgdGhpcy5wYW5lQ29udGFpbmVycy5jZW50ZXIuZGVzZXJpYWxpemUoc3RhdGUucGFuZUNvbnRhaW5lciwgZGVzZXJpYWxpemVyTWFuYWdlcilcbiAgICB9XG5cbiAgICB0aGlzLmhhc0FjdGl2ZVRleHRFZGl0b3IgPSB0aGlzLmdldEFjdGl2ZVRleHRFZGl0b3IoKSAhPSBudWxsXG5cbiAgICB0aGlzLnVwZGF0ZVdpbmRvd1RpdGxlKClcbiAgfVxuXG4gIGdldFBhY2thZ2VOYW1lc1dpdGhBY3RpdmVHcmFtbWFycyAoKSB7XG4gICAgY29uc3QgcGFja2FnZU5hbWVzID0gW11cbiAgICBjb25zdCBhZGRHcmFtbWFyID0gKHtpbmNsdWRlZEdyYW1tYXJTY29wZXMsIHBhY2thZ2VOYW1lfSA9IHt9KSA9PiB7XG4gICAgICBpZiAoIXBhY2thZ2VOYW1lKSB7IHJldHVybiB9XG4gICAgICAvLyBQcmV2ZW50IGN5Y2xlc1xuICAgICAgaWYgKHBhY2thZ2VOYW1lcy5pbmRleE9mKHBhY2thZ2VOYW1lKSAhPT0gLTEpIHsgcmV0dXJuIH1cblxuICAgICAgcGFja2FnZU5hbWVzLnB1c2gocGFja2FnZU5hbWUpXG4gICAgICBmb3IgKGxldCBzY29wZU5hbWUgb2YgaW5jbHVkZWRHcmFtbWFyU2NvcGVzICE9IG51bGwgPyBpbmNsdWRlZEdyYW1tYXJTY29wZXMgOiBbXSkge1xuICAgICAgICBhZGRHcmFtbWFyKHRoaXMuZ3JhbW1hclJlZ2lzdHJ5LmdyYW1tYXJGb3JTY29wZU5hbWUoc2NvcGVOYW1lKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBlZGl0b3JzID0gdGhpcy5nZXRUZXh0RWRpdG9ycygpXG4gICAgZm9yIChsZXQgZWRpdG9yIG9mIGVkaXRvcnMpIHsgYWRkR3JhbW1hcihlZGl0b3IuZ2V0R3JhbW1hcigpKSB9XG5cbiAgICBpZiAoZWRpdG9ycy5sZW5ndGggPiAwKSB7XG4gICAgICBmb3IgKGxldCBncmFtbWFyIG9mIHRoaXMuZ3JhbW1hclJlZ2lzdHJ5LmdldEdyYW1tYXJzKCkpIHtcbiAgICAgICAgaWYgKGdyYW1tYXIuaW5qZWN0aW9uU2VsZWN0b3IpIHtcbiAgICAgICAgICBhZGRHcmFtbWFyKGdyYW1tYXIpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gXy51bmlxKHBhY2thZ2VOYW1lcylcbiAgfVxuXG4gIGRpZEFjdGl2YXRlUGFuZUNvbnRhaW5lciAocGFuZUNvbnRhaW5lcikge1xuICAgIGlmIChwYW5lQ29udGFpbmVyICE9PSB0aGlzLmdldEFjdGl2ZVBhbmVDb250YWluZXIoKSkge1xuICAgICAgdGhpcy5hY3RpdmVQYW5lQ29udGFpbmVyID0gcGFuZUNvbnRhaW5lclxuICAgICAgdGhpcy5kaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSh0aGlzLmFjdGl2ZVBhbmVDb250YWluZXIuZ2V0QWN0aXZlUGFuZUl0ZW0oKSlcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWFjdGl2ZS1wYW5lLWNvbnRhaW5lcicsIHRoaXMuYWN0aXZlUGFuZUNvbnRhaW5lcilcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWFjdGl2ZS1wYW5lJywgdGhpcy5hY3RpdmVQYW5lQ29udGFpbmVyLmdldEFjdGl2ZVBhbmUoKSlcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWFjdGl2ZS1wYW5lLWl0ZW0nLCB0aGlzLmFjdGl2ZVBhbmVDb250YWluZXIuZ2V0QWN0aXZlUGFuZUl0ZW0oKSlcbiAgICB9XG4gIH1cblxuICBkaWRDaGFuZ2VBY3RpdmVQYW5lT25QYW5lQ29udGFpbmVyIChwYW5lQ29udGFpbmVyLCBwYW5lKSB7XG4gICAgaWYgKHBhbmVDb250YWluZXIgPT09IHRoaXMuZ2V0QWN0aXZlUGFuZUNvbnRhaW5lcigpKSB7XG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1hY3RpdmUtcGFuZScsIHBhbmUpXG4gICAgfVxuICB9XG5cbiAgZGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW1PblBhbmVDb250YWluZXIgKHBhbmVDb250YWluZXIsIGl0ZW0pIHtcbiAgICBpZiAocGFuZUNvbnRhaW5lciA9PT0gdGhpcy5nZXRBY3RpdmVQYW5lQ29udGFpbmVyKCkpIHtcbiAgICAgIHRoaXMuZGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0oaXRlbSlcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWFjdGl2ZS1wYW5lLWl0ZW0nLCBpdGVtKVxuICAgIH1cblxuICAgIGlmIChwYW5lQ29udGFpbmVyID09PSB0aGlzLmdldENlbnRlcigpKSB7XG4gICAgICBjb25zdCBoYWRBY3RpdmVUZXh0RWRpdG9yID0gdGhpcy5oYXNBY3RpdmVUZXh0RWRpdG9yXG4gICAgICB0aGlzLmhhc0FjdGl2ZVRleHRFZGl0b3IgPSBpdGVtIGluc3RhbmNlb2YgVGV4dEVkaXRvclxuXG4gICAgICBpZiAodGhpcy5oYXNBY3RpdmVUZXh0RWRpdG9yIHx8IGhhZEFjdGl2ZVRleHRFZGl0b3IpIHtcbiAgICAgICAgY29uc3QgaXRlbVZhbHVlID0gdGhpcy5oYXNBY3RpdmVUZXh0RWRpdG9yID8gaXRlbSA6IHVuZGVmaW5lZFxuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1hY3RpdmUtdGV4dC1lZGl0b3InLCBpdGVtVmFsdWUpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gKGl0ZW0pIHtcbiAgICB0aGlzLnVwZGF0ZVdpbmRvd1RpdGxlKClcbiAgICB0aGlzLnVwZGF0ZURvY3VtZW50RWRpdGVkKClcbiAgICBpZiAodGhpcy5hY3RpdmVJdGVtU3Vic2NyaXB0aW9ucykgdGhpcy5hY3RpdmVJdGVtU3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLmFjdGl2ZUl0ZW1TdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgbGV0IG1vZGlmaWVkU3Vic2NyaXB0aW9uLCB0aXRsZVN1YnNjcmlwdGlvblxuXG4gICAgaWYgKGl0ZW0gIT0gbnVsbCAmJiB0eXBlb2YgaXRlbS5vbkRpZENoYW5nZVRpdGxlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aXRsZVN1YnNjcmlwdGlvbiA9IGl0ZW0ub25EaWRDaGFuZ2VUaXRsZSh0aGlzLnVwZGF0ZVdpbmRvd1RpdGxlKVxuICAgIH0gZWxzZSBpZiAoaXRlbSAhPSBudWxsICYmIHR5cGVvZiBpdGVtLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aXRsZVN1YnNjcmlwdGlvbiA9IGl0ZW0ub24oJ3RpdGxlLWNoYW5nZWQnLCB0aGlzLnVwZGF0ZVdpbmRvd1RpdGxlKVxuICAgICAgaWYgKHRpdGxlU3Vic2NyaXB0aW9uID09IG51bGwgfHwgdHlwZW9mIHRpdGxlU3Vic2NyaXB0aW9uLmRpc3Bvc2UgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGl0bGVTdWJzY3JpcHRpb24gPSBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAgICAgaXRlbS5vZmYoJ3RpdGxlLWNoYW5nZWQnLCB0aGlzLnVwZGF0ZVdpbmRvd1RpdGxlKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpdGVtICE9IG51bGwgJiYgdHlwZW9mIGl0ZW0ub25EaWRDaGFuZ2VNb2RpZmllZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbW9kaWZpZWRTdWJzY3JpcHRpb24gPSBpdGVtLm9uRGlkQ2hhbmdlTW9kaWZpZWQodGhpcy51cGRhdGVEb2N1bWVudEVkaXRlZClcbiAgICB9IGVsc2UgaWYgKGl0ZW0gIT0gbnVsbCAmJiB0eXBlb2YgaXRlbS5vbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbW9kaWZpZWRTdWJzY3JpcHRpb24gPSBpdGVtLm9uKCdtb2RpZmllZC1zdGF0dXMtY2hhbmdlZCcsIHRoaXMudXBkYXRlRG9jdW1lbnRFZGl0ZWQpXG4gICAgICBpZiAobW9kaWZpZWRTdWJzY3JpcHRpb24gPT0gbnVsbCB8fCB0eXBlb2YgbW9kaWZpZWRTdWJzY3JpcHRpb24uZGlzcG9zZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBtb2RpZmllZFN1YnNjcmlwdGlvbiA9IG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgICAgICBpdGVtLm9mZignbW9kaWZpZWQtc3RhdHVzLWNoYW5nZWQnLCB0aGlzLnVwZGF0ZURvY3VtZW50RWRpdGVkKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aXRsZVN1YnNjcmlwdGlvbiAhPSBudWxsKSB7IHRoaXMuYWN0aXZlSXRlbVN1YnNjcmlwdGlvbnMuYWRkKHRpdGxlU3Vic2NyaXB0aW9uKSB9XG4gICAgaWYgKG1vZGlmaWVkU3Vic2NyaXB0aW9uICE9IG51bGwpIHsgdGhpcy5hY3RpdmVJdGVtU3Vic2NyaXB0aW9ucy5hZGQobW9kaWZpZWRTdWJzY3JpcHRpb24pIH1cblxuICAgIHRoaXMuY2FuY2VsU3RvcHBlZENoYW5naW5nQWN0aXZlUGFuZUl0ZW1UaW1lb3V0KClcbiAgICB0aGlzLnN0b3BwZWRDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5zdG9wcGVkQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbVRpbWVvdXQgPSBudWxsXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXN0b3AtY2hhbmdpbmctYWN0aXZlLXBhbmUtaXRlbScsIGl0ZW0pXG4gICAgfSwgU1RPUFBFRF9DSEFOR0lOR19BQ1RJVkVfUEFORV9JVEVNX0RFTEFZKVxuICB9XG5cbiAgY2FuY2VsU3RvcHBlZENoYW5naW5nQWN0aXZlUGFuZUl0ZW1UaW1lb3V0ICgpIHtcbiAgICBpZiAodGhpcy5zdG9wcGVkQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbVRpbWVvdXQgIT0gbnVsbCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc3RvcHBlZENoYW5naW5nQWN0aXZlUGFuZUl0ZW1UaW1lb3V0KVxuICAgIH1cbiAgfVxuXG4gIHNldERyYWdnaW5nSXRlbSAoZHJhZ2dpbmdJdGVtKSB7XG4gICAgXy52YWx1ZXModGhpcy5wYW5lQ29udGFpbmVycykuZm9yRWFjaChkb2NrID0+IHtcbiAgICAgIGRvY2suc2V0RHJhZ2dpbmdJdGVtKGRyYWdnaW5nSXRlbSlcbiAgICB9KVxuICB9XG5cbiAgc3Vic2NyaWJlVG9BZGRlZEl0ZW1zICgpIHtcbiAgICB0aGlzLm9uRGlkQWRkUGFuZUl0ZW0oKHtpdGVtLCBwYW5lLCBpbmRleH0pID0+IHtcbiAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgVGV4dEVkaXRvcikge1xuICAgICAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICAgICAgdGhpcy50ZXh0RWRpdG9yUmVnaXN0cnkuYWRkKGl0ZW0pLFxuICAgICAgICAgIHRoaXMudGV4dEVkaXRvclJlZ2lzdHJ5Lm1haW50YWluR3JhbW1hcihpdGVtKSxcbiAgICAgICAgICB0aGlzLnRleHRFZGl0b3JSZWdpc3RyeS5tYWludGFpbkNvbmZpZyhpdGVtKSxcbiAgICAgICAgICBpdGVtLm9ic2VydmVHcmFtbWFyKHRoaXMuaGFuZGxlR3JhbW1hclVzZWQuYmluZCh0aGlzKSlcbiAgICAgICAgKVxuICAgICAgICBpdGVtLm9uRGlkRGVzdHJveSgoKSA9PiB7IHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpIH0pXG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtYWRkLXRleHQtZWRpdG9yJywge3RleHRFZGl0b3I6IGl0ZW0sIHBhbmUsIGluZGV4fSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgc3Vic2NyaWJlVG9Eb2NrVG9nZ2xpbmcgKCkge1xuICAgIGNvbnN0IGRvY2tzID0gW3RoaXMuZ2V0TGVmdERvY2soKSwgdGhpcy5nZXRSaWdodERvY2soKSwgdGhpcy5nZXRCb3R0b21Eb2NrKCldXG4gICAgZG9ja3MuZm9yRWFjaChkb2NrID0+IHtcbiAgICAgIGRvY2sub25EaWRDaGFuZ2VWaXNpYmxlKHZpc2libGUgPT4ge1xuICAgICAgICBpZiAodmlzaWJsZSkgcmV0dXJuXG4gICAgICAgIGNvbnN0IHthY3RpdmVFbGVtZW50fSA9IGRvY3VtZW50XG4gICAgICAgIGNvbnN0IGRvY2tFbGVtZW50ID0gZG9jay5nZXRFbGVtZW50KClcbiAgICAgICAgaWYgKGRvY2tFbGVtZW50ID09PSBhY3RpdmVFbGVtZW50IHx8IGRvY2tFbGVtZW50LmNvbnRhaW5zKGFjdGl2ZUVsZW1lbnQpKSB7XG4gICAgICAgICAgdGhpcy5nZXRDZW50ZXIoKS5hY3RpdmF0ZSgpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIHN1YnNjcmliZVRvTW92ZWRJdGVtcyAoKSB7XG4gICAgZm9yIChjb25zdCBwYW5lQ29udGFpbmVyIG9mIHRoaXMuZ2V0UGFuZUNvbnRhaW5lcnMoKSkge1xuICAgICAgcGFuZUNvbnRhaW5lci5vYnNlcnZlUGFuZXMocGFuZSA9PiB7XG4gICAgICAgIHBhbmUub25EaWRBZGRJdGVtKCh7aXRlbX0pID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIGl0ZW0uZ2V0VVJJID09PSAnZnVuY3Rpb24nICYmIHRoaXMuZW5hYmxlUGVyc2lzdGVuY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHVyaSA9IGl0ZW0uZ2V0VVJJKClcbiAgICAgICAgICAgIGlmICh1cmkpIHtcbiAgICAgICAgICAgICAgY29uc3QgbG9jYXRpb24gPSBwYW5lQ29udGFpbmVyLmdldExvY2F0aW9uKClcbiAgICAgICAgICAgICAgbGV0IGRlZmF1bHRMb2NhdGlvblxuICAgICAgICAgICAgICBpZiAodHlwZW9mIGl0ZW0uZ2V0RGVmYXVsdExvY2F0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdExvY2F0aW9uID0gaXRlbS5nZXREZWZhdWx0TG9jYXRpb24oKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGRlZmF1bHRMb2NhdGlvbiA9IGRlZmF1bHRMb2NhdGlvbiB8fCAnY2VudGVyJ1xuICAgICAgICAgICAgICBpZiAobG9jYXRpb24gPT09IGRlZmF1bHRMb2NhdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuaXRlbUxvY2F0aW9uU3RvcmUuZGVsZXRlKGl0ZW0uZ2V0VVJJKCkpXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtTG9jYXRpb25TdG9yZS5zYXZlKGl0ZW0uZ2V0VVJJKCksIGxvY2F0aW9uKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICAvLyBVcGRhdGVzIHRoZSBhcHBsaWNhdGlvbidzIHRpdGxlIGFuZCBwcm94eSBpY29uIGJhc2VkIG9uIHdoaWNoZXZlciBmaWxlIGlzXG4gIC8vIG9wZW4uXG4gIHVwZGF0ZVdpbmRvd1RpdGxlICgpIHtcbiAgICBsZXQgaXRlbVBhdGgsIGl0ZW1UaXRsZSwgcHJvamVjdFBhdGgsIHJlcHJlc2VudGVkUGF0aFxuICAgIGNvbnN0IGFwcE5hbWUgPSAnQXRvbSdcbiAgICBjb25zdCBsZWZ0ID0gdGhpcy5wcm9qZWN0LmdldFBhdGhzKClcbiAgICBjb25zdCBwcm9qZWN0UGF0aHMgPSBsZWZ0ICE9IG51bGwgPyBsZWZ0IDogW11cbiAgICBjb25zdCBpdGVtID0gdGhpcy5nZXRBY3RpdmVQYW5lSXRlbSgpXG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIGl0ZW1QYXRoID0gdHlwZW9mIGl0ZW0uZ2V0UGF0aCA9PT0gJ2Z1bmN0aW9uJyA/IGl0ZW0uZ2V0UGF0aCgpIDogdW5kZWZpbmVkXG4gICAgICBjb25zdCBsb25nVGl0bGUgPSB0eXBlb2YgaXRlbS5nZXRMb25nVGl0bGUgPT09ICdmdW5jdGlvbicgPyBpdGVtLmdldExvbmdUaXRsZSgpIDogdW5kZWZpbmVkXG4gICAgICBpdGVtVGl0bGUgPSBsb25nVGl0bGUgPT0gbnVsbFxuICAgICAgICA/ICh0eXBlb2YgaXRlbS5nZXRUaXRsZSA9PT0gJ2Z1bmN0aW9uJyA/IGl0ZW0uZ2V0VGl0bGUoKSA6IHVuZGVmaW5lZClcbiAgICAgICAgOiBsb25nVGl0bGVcbiAgICAgIHByb2plY3RQYXRoID0gXy5maW5kKFxuICAgICAgICBwcm9qZWN0UGF0aHMsXG4gICAgICAgIHByb2plY3RQYXRoID0+XG4gICAgICAgICAgKGl0ZW1QYXRoID09PSBwcm9qZWN0UGF0aCkgfHwgKGl0ZW1QYXRoICE9IG51bGwgPyBpdGVtUGF0aC5zdGFydHNXaXRoKHByb2plY3RQYXRoICsgcGF0aC5zZXApIDogdW5kZWZpbmVkKVxuICAgICAgKVxuICAgIH1cbiAgICBpZiAoaXRlbVRpdGxlID09IG51bGwpIHsgaXRlbVRpdGxlID0gJ3VudGl0bGVkJyB9XG4gICAgaWYgKHByb2plY3RQYXRoID09IG51bGwpIHsgcHJvamVjdFBhdGggPSBpdGVtUGF0aCA/IHBhdGguZGlybmFtZShpdGVtUGF0aCkgOiBwcm9qZWN0UGF0aHNbMF0gfVxuICAgIGlmIChwcm9qZWN0UGF0aCAhPSBudWxsKSB7XG4gICAgICBwcm9qZWN0UGF0aCA9IGZzLnRpbGRpZnkocHJvamVjdFBhdGgpXG4gICAgfVxuXG4gICAgY29uc3QgdGl0bGVQYXJ0cyA9IFtdXG4gICAgaWYgKChpdGVtICE9IG51bGwpICYmIChwcm9qZWN0UGF0aCAhPSBudWxsKSkge1xuICAgICAgdGl0bGVQYXJ0cy5wdXNoKGl0ZW1UaXRsZSwgcHJvamVjdFBhdGgpXG4gICAgICByZXByZXNlbnRlZFBhdGggPSBpdGVtUGF0aCAhPSBudWxsID8gaXRlbVBhdGggOiBwcm9qZWN0UGF0aFxuICAgIH0gZWxzZSBpZiAocHJvamVjdFBhdGggIT0gbnVsbCkge1xuICAgICAgdGl0bGVQYXJ0cy5wdXNoKHByb2plY3RQYXRoKVxuICAgICAgcmVwcmVzZW50ZWRQYXRoID0gcHJvamVjdFBhdGhcbiAgICB9IGVsc2Uge1xuICAgICAgdGl0bGVQYXJ0cy5wdXNoKGl0ZW1UaXRsZSlcbiAgICAgIHJlcHJlc2VudGVkUGF0aCA9ICcnXG4gICAgfVxuXG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gIT09ICdkYXJ3aW4nKSB7XG4gICAgICB0aXRsZVBhcnRzLnB1c2goYXBwTmFtZSlcbiAgICB9XG5cbiAgICBkb2N1bWVudC50aXRsZSA9IHRpdGxlUGFydHMuam9pbignIFxcdTIwMTQgJylcbiAgICB0aGlzLmFwcGxpY2F0aW9uRGVsZWdhdGUuc2V0UmVwcmVzZW50ZWRGaWxlbmFtZShyZXByZXNlbnRlZFBhdGgpXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2Utd2luZG93LXRpdGxlJylcbiAgfVxuXG4gIC8vIE9uIG1hY09TLCBmYWRlcyB0aGUgYXBwbGljYXRpb24gd2luZG93J3MgcHJveHkgaWNvbiB3aGVuIHRoZSBjdXJyZW50IGZpbGVcbiAgLy8gaGFzIGJlZW4gbW9kaWZpZWQuXG4gIHVwZGF0ZURvY3VtZW50RWRpdGVkICgpIHtcbiAgICBjb25zdCBhY3RpdmVQYW5lSXRlbSA9IHRoaXMuZ2V0QWN0aXZlUGFuZUl0ZW0oKVxuICAgIGNvbnN0IG1vZGlmaWVkID0gYWN0aXZlUGFuZUl0ZW0gIT0gbnVsbCAmJiB0eXBlb2YgYWN0aXZlUGFuZUl0ZW0uaXNNb2RpZmllZCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyBhY3RpdmVQYW5lSXRlbS5pc01vZGlmaWVkKCkgfHwgZmFsc2VcbiAgICAgIDogZmFsc2VcbiAgICB0aGlzLmFwcGxpY2F0aW9uRGVsZWdhdGUuc2V0V2luZG93RG9jdW1lbnRFZGl0ZWQobW9kaWZpZWQpXG4gIH1cblxuICAvKlxuICBTZWN0aW9uOiBFdmVudCBTdWJzY3JpcHRpb25cbiAgKi9cblxuICBvbkRpZENoYW5nZUFjdGl2ZVBhbmVDb250YWluZXIgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS1hY3RpdmUtcGFuZS1jb250YWluZXInLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayB3aXRoIGFsbCBjdXJyZW50IGFuZCBmdXR1cmUgdGV4dFxuICAvLyBlZGl0b3JzIGluIHRoZSB3b3Jrc3BhY2UuXG4gIC8vXG4gIC8vICogYGNhbGxiYWNrYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aXRoIGN1cnJlbnQgYW5kIGZ1dHVyZSB0ZXh0IGVkaXRvcnMuXG4gIC8vICAgKiBgZWRpdG9yYCBBIHtUZXh0RWRpdG9yfSB0aGF0IGlzIHByZXNlbnQgaW4gezo6Z2V0VGV4dEVkaXRvcnN9IGF0IHRoZSB0aW1lXG4gIC8vICAgICBvZiBzdWJzY3JpcHRpb24gb3IgdGhhdCBpcyBhZGRlZCBhdCBzb21lIGxhdGVyIHRpbWUuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9ic2VydmVUZXh0RWRpdG9ycyAoY2FsbGJhY2spIHtcbiAgICBmb3IgKGxldCB0ZXh0RWRpdG9yIG9mIHRoaXMuZ2V0VGV4dEVkaXRvcnMoKSkgeyBjYWxsYmFjayh0ZXh0RWRpdG9yKSB9XG4gICAgcmV0dXJuIHRoaXMub25EaWRBZGRUZXh0RWRpdG9yKCh7dGV4dEVkaXRvcn0pID0+IGNhbGxiYWNrKHRleHRFZGl0b3IpKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBJbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrIHdpdGggYWxsIGN1cnJlbnQgYW5kIGZ1dHVyZSBwYW5lcyBpdGVtc1xuICAvLyBpbiB0aGUgd29ya3NwYWNlLlxuICAvL1xuICAvLyAqIGBjYWxsYmFja2Age0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2l0aCBjdXJyZW50IGFuZCBmdXR1cmUgcGFuZSBpdGVtcy5cbiAgLy8gICAqIGBpdGVtYCBBbiBpdGVtIHRoYXQgaXMgcHJlc2VudCBpbiB7OjpnZXRQYW5lSXRlbXN9IGF0IHRoZSB0aW1lIG9mXG4gIC8vICAgICAgc3Vic2NyaXB0aW9uIG9yIHRoYXQgaXMgYWRkZWQgYXQgc29tZSBsYXRlciB0aW1lLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvYnNlcnZlUGFuZUl0ZW1zIChjYWxsYmFjaykge1xuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIC4uLnRoaXMuZ2V0UGFuZUNvbnRhaW5lcnMoKS5tYXAoY29udGFpbmVyID0+IGNvbnRhaW5lci5vYnNlcnZlUGFuZUl0ZW1zKGNhbGxiYWNrKSlcbiAgICApXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEludm9rZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgd2hlbiB0aGUgYWN0aXZlIHBhbmUgaXRlbSBjaGFuZ2VzLlxuICAvL1xuICAvLyBCZWNhdXNlIG9ic2VydmVycyBhcmUgaW52b2tlZCBzeW5jaHJvbm91c2x5LCBpdCdzIGltcG9ydGFudCBub3QgdG8gcGVyZm9ybVxuICAvLyBhbnkgZXhwZW5zaXZlIG9wZXJhdGlvbnMgdmlhIHRoaXMgbWV0aG9kLiBDb25zaWRlclxuICAvLyB7OjpvbkRpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtfSB0byBkZWxheSBvcGVyYXRpb25zIHVudGlsIGFmdGVyIGNoYW5nZXNcbiAgLy8gc3RvcCBvY2N1cnJpbmcuXG4gIC8vXG4gIC8vICogYGNhbGxiYWNrYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBhY3RpdmUgcGFuZSBpdGVtIGNoYW5nZXMuXG4gIC8vICAgKiBgaXRlbWAgVGhlIGFjdGl2ZSBwYW5lIGl0ZW0uXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS1hY3RpdmUtcGFuZS1pdGVtJywgY2FsbGJhY2spXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEludm9rZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgd2hlbiB0aGUgYWN0aXZlIHBhbmUgaXRlbSBzdG9wc1xuICAvLyBjaGFuZ2luZy5cbiAgLy9cbiAgLy8gT2JzZXJ2ZXJzIGFyZSBjYWxsZWQgYXN5bmNocm9ub3VzbHkgMTAwbXMgYWZ0ZXIgdGhlIGxhc3QgYWN0aXZlIHBhbmUgaXRlbVxuICAvLyBjaGFuZ2UuIEhhbmRsaW5nIGNoYW5nZXMgaGVyZSByYXRoZXIgdGhhbiBpbiB0aGUgc3luY2hyb25vdXNcbiAgLy8gezo6b25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbX0gcHJldmVudHMgdW5uZWVkZWQgd29yayBpZiB0aGUgdXNlciBpcyBxdWlja2x5XG4gIC8vIGNoYW5naW5nIG9yIGNsb3NpbmcgdGFicyBhbmQgZW5zdXJlcyBjcml0aWNhbCBVSSBmZWVkYmFjaywgbGlrZSBjaGFuZ2luZyB0aGVcbiAgLy8gaGlnaGxpZ2h0ZWQgdGFiLCBnZXRzIHByaW9yaXR5IG92ZXIgd29yayB0aGF0IGNhbiBiZSBkb25lIGFzeW5jaHJvbm91c2x5LlxuICAvL1xuICAvLyAqIGBjYWxsYmFja2Age0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2hlbiB0aGUgYWN0aXZlIHBhbmUgaXRlbSBzdG9wdHNcbiAgLy8gICBjaGFuZ2luZy5cbiAgLy8gICAqIGBpdGVtYCBUaGUgYWN0aXZlIHBhbmUgaXRlbS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb25EaWRTdG9wQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbSAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtc3RvcC1jaGFuZ2luZy1hY3RpdmUtcGFuZS1pdGVtJywgY2FsbGJhY2spXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEludm9rZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgd2hlbiBhIHRleHQgZWRpdG9yIGJlY29tZXMgdGhlIGFjdGl2ZVxuICAvLyB0ZXh0IGVkaXRvciBhbmQgd2hlbiB0aGVyZSBpcyBubyBsb25nZXIgYW4gYWN0aXZlIHRleHQgZWRpdG9yLlxuICAvL1xuICAvLyAqIGBjYWxsYmFja2Age0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2hlbiB0aGUgYWN0aXZlIHRleHQgZWRpdG9yIGNoYW5nZXMuXG4gIC8vICAgKiBgZWRpdG9yYCBUaGUgYWN0aXZlIHtUZXh0RWRpdG9yfSBvciB1bmRlZmluZWQgaWYgdGhlcmUgaXMgbm8gbG9uZ2VyIGFuXG4gIC8vICAgICAgYWN0aXZlIHRleHQgZWRpdG9yLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvbkRpZENoYW5nZUFjdGl2ZVRleHRFZGl0b3IgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS1hY3RpdmUtdGV4dC1lZGl0b3InLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayB3aXRoIHRoZSBjdXJyZW50IGFjdGl2ZSBwYW5lIGl0ZW0gYW5kXG4gIC8vIHdpdGggYWxsIGZ1dHVyZSBhY3RpdmUgcGFuZSBpdGVtcyBpbiB0aGUgd29ya3NwYWNlLlxuICAvL1xuICAvLyAqIGBjYWxsYmFja2Age0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2hlbiB0aGUgYWN0aXZlIHBhbmUgaXRlbSBjaGFuZ2VzLlxuICAvLyAgICogYGl0ZW1gIFRoZSBjdXJyZW50IGFjdGl2ZSBwYW5lIGl0ZW0uXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9ic2VydmVBY3RpdmVQYW5lSXRlbSAoY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayh0aGlzLmdldEFjdGl2ZVBhbmVJdGVtKCkpXG4gICAgcmV0dXJuIHRoaXMub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbShjYWxsYmFjaylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayB3aXRoIHRoZSBjdXJyZW50IGFjdGl2ZSB0ZXh0IGVkaXRvclxuICAvLyAoaWYgYW55KSwgd2l0aCBhbGwgZnV0dXJlIGFjdGl2ZSB0ZXh0IGVkaXRvcnMsIGFuZCB3aGVuIHRoZXJlIGlzIG5vIGxvbmdlclxuICAvLyBhbiBhY3RpdmUgdGV4dCBlZGl0b3IuXG4gIC8vXG4gIC8vICogYGNhbGxiYWNrYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBhY3RpdmUgdGV4dCBlZGl0b3IgY2hhbmdlcy5cbiAgLy8gICAqIGBlZGl0b3JgIFRoZSBhY3RpdmUge1RleHRFZGl0b3J9IG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBpcyBub3QgYW5cbiAgLy8gICAgICBhY3RpdmUgdGV4dCBlZGl0b3IuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9ic2VydmVBY3RpdmVUZXh0RWRpdG9yIChjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrKHRoaXMuZ2V0QWN0aXZlVGV4dEVkaXRvcigpKVxuXG4gICAgcmV0dXJuIHRoaXMub25EaWRDaGFuZ2VBY3RpdmVUZXh0RWRpdG9yKGNhbGxiYWNrKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBJbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrIHdoZW5ldmVyIGFuIGl0ZW0gaXMgb3BlbmVkLiBVbmxpa2VcbiAgLy8gezo6b25EaWRBZGRQYW5lSXRlbX0sIG9ic2VydmVycyB3aWxsIGJlIG5vdGlmaWVkIGZvciBpdGVtcyB0aGF0IGFyZSBhbHJlYWR5XG4gIC8vIHByZXNlbnQgaW4gdGhlIHdvcmtzcGFjZSB3aGVuIHRoZXkgYXJlIHJlb3BlbmVkLlxuICAvL1xuICAvLyAqIGBjYWxsYmFja2Age0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2hlbmV2ZXIgYW4gaXRlbSBpcyBvcGVuZWQuXG4gIC8vICAgKiBgZXZlbnRgIHtPYmplY3R9IHdpdGggdGhlIGZvbGxvd2luZyBrZXlzOlxuICAvLyAgICAgKiBgdXJpYCB7U3RyaW5nfSByZXByZXNlbnRpbmcgdGhlIG9wZW5lZCBVUkkuIENvdWxkIGJlIGB1bmRlZmluZWRgLlxuICAvLyAgICAgKiBgaXRlbWAgVGhlIG9wZW5lZCBpdGVtLlxuICAvLyAgICAgKiBgcGFuZWAgVGhlIHBhbmUgaW4gd2hpY2ggdGhlIGl0ZW0gd2FzIG9wZW5lZC5cbiAgLy8gICAgICogYGluZGV4YCBUaGUgaW5kZXggb2YgdGhlIG9wZW5lZCBpdGVtIG9uIGl0cyBwYW5lLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvbkRpZE9wZW4gKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLW9wZW4nLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBJbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrIHdoZW4gYSBwYW5lIGlzIGFkZGVkIHRvIHRoZSB3b3Jrc3BhY2UuXG4gIC8vXG4gIC8vICogYGNhbGxiYWNrYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCBwYW5lcyBhcmUgYWRkZWQuXG4gIC8vICAgKiBgZXZlbnRgIHtPYmplY3R9IHdpdGggdGhlIGZvbGxvd2luZyBrZXlzOlxuICAvLyAgICAgKiBgcGFuZWAgVGhlIGFkZGVkIHBhbmUuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9uRGlkQWRkUGFuZSAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICAuLi50aGlzLmdldFBhbmVDb250YWluZXJzKCkubWFwKGNvbnRhaW5lciA9PiBjb250YWluZXIub25EaWRBZGRQYW5lKGNhbGxiYWNrKSlcbiAgICApXG4gIH1cblxuICAvLyBFeHRlbmRlZDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayBiZWZvcmUgYSBwYW5lIGlzIGRlc3Ryb3llZCBpbiB0aGVcbiAgLy8gd29ya3NwYWNlLlxuICAvL1xuICAvLyAqIGBjYWxsYmFja2Age0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgYmVmb3JlIHBhbmVzIGFyZSBkZXN0cm95ZWQuXG4gIC8vICAgKiBgZXZlbnRgIHtPYmplY3R9IHdpdGggdGhlIGZvbGxvd2luZyBrZXlzOlxuICAvLyAgICAgKiBgcGFuZWAgVGhlIHBhbmUgdG8gYmUgZGVzdHJveWVkLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvbldpbGxEZXN0cm95UGFuZSAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICAuLi50aGlzLmdldFBhbmVDb250YWluZXJzKCkubWFwKGNvbnRhaW5lciA9PiBjb250YWluZXIub25XaWxsRGVzdHJveVBhbmUoY2FsbGJhY2spKVxuICAgIClcbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBJbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrIHdoZW4gYSBwYW5lIGlzIGRlc3Ryb3llZCBpbiB0aGVcbiAgLy8gd29ya3NwYWNlLlxuICAvL1xuICAvLyAqIGBjYWxsYmFja2Age0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgcGFuZXMgYXJlIGRlc3Ryb3llZC5cbiAgLy8gICAqIGBldmVudGAge09iamVjdH0gd2l0aCB0aGUgZm9sbG93aW5nIGtleXM6XG4gIC8vICAgICAqIGBwYW5lYCBUaGUgZGVzdHJveWVkIHBhbmUuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9uRGlkRGVzdHJveVBhbmUgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgLi4udGhpcy5nZXRQYW5lQ29udGFpbmVycygpLm1hcChjb250YWluZXIgPT4gY29udGFpbmVyLm9uRGlkRGVzdHJveVBhbmUoY2FsbGJhY2spKVxuICAgIClcbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBJbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrIHdpdGggYWxsIGN1cnJlbnQgYW5kIGZ1dHVyZSBwYW5lcyBpbiB0aGVcbiAgLy8gd29ya3NwYWNlLlxuICAvL1xuICAvLyAqIGBjYWxsYmFja2Age0Z1bmN0aW9ufSB0byBiZSBjYWxsZWQgd2l0aCBjdXJyZW50IGFuZCBmdXR1cmUgcGFuZXMuXG4gIC8vICAgKiBgcGFuZWAgQSB7UGFuZX0gdGhhdCBpcyBwcmVzZW50IGluIHs6OmdldFBhbmVzfSBhdCB0aGUgdGltZSBvZlxuICAvLyAgICAgIHN1YnNjcmlwdGlvbiBvciB0aGF0IGlzIGFkZGVkIGF0IHNvbWUgbGF0ZXIgdGltZS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb2JzZXJ2ZVBhbmVzIChjYWxsYmFjaykge1xuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIC4uLnRoaXMuZ2V0UGFuZUNvbnRhaW5lcnMoKS5tYXAoY29udGFpbmVyID0+IGNvbnRhaW5lci5vYnNlcnZlUGFuZXMoY2FsbGJhY2spKVxuICAgIClcbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBJbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrIHdoZW4gdGhlIGFjdGl2ZSBwYW5lIGNoYW5nZXMuXG4gIC8vXG4gIC8vICogYGNhbGxiYWNrYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBhY3RpdmUgcGFuZSBjaGFuZ2VzLlxuICAvLyAgICogYHBhbmVgIEEge1BhbmV9IHRoYXQgaXMgdGhlIGN1cnJlbnQgcmV0dXJuIHZhbHVlIG9mIHs6OmdldEFjdGl2ZVBhbmV9LlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvbkRpZENoYW5nZUFjdGl2ZVBhbmUgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS1hY3RpdmUtcGFuZScsIGNhbGxiYWNrKVxuICB9XG5cbiAgLy8gRXh0ZW5kZWQ6IEludm9rZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgd2l0aCB0aGUgY3VycmVudCBhY3RpdmUgcGFuZSBhbmQgd2hlblxuICAvLyB0aGUgYWN0aXZlIHBhbmUgY2hhbmdlcy5cbiAgLy9cbiAgLy8gKiBgY2FsbGJhY2tgIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdpdGggdGhlIGN1cnJlbnQgYW5kIGZ1dHVyZSBhY3RpdmUjXG4gIC8vICAgcGFuZXMuXG4gIC8vICAgKiBgcGFuZWAgQSB7UGFuZX0gdGhhdCBpcyB0aGUgY3VycmVudCByZXR1cm4gdmFsdWUgb2Ygezo6Z2V0QWN0aXZlUGFuZX0uXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gdW5zdWJzY3JpYmUuXG4gIG9ic2VydmVBY3RpdmVQYW5lIChjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrKHRoaXMuZ2V0QWN0aXZlUGFuZSgpKVxuICAgIHJldHVybiB0aGlzLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZShjYWxsYmFjaylcbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBJbnZva2UgdGhlIGdpdmVuIGNhbGxiYWNrIHdoZW4gYSBwYW5lIGl0ZW0gaXMgYWRkZWQgdG8gdGhlXG4gIC8vIHdvcmtzcGFjZS5cbiAgLy9cbiAgLy8gKiBgY2FsbGJhY2tgIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHdoZW4gcGFuZSBpdGVtcyBhcmUgYWRkZWQuXG4gIC8vICAgKiBgZXZlbnRgIHtPYmplY3R9IHdpdGggdGhlIGZvbGxvd2luZyBrZXlzOlxuICAvLyAgICAgKiBgaXRlbWAgVGhlIGFkZGVkIHBhbmUgaXRlbS5cbiAgLy8gICAgICogYHBhbmVgIHtQYW5lfSBjb250YWluaW5nIHRoZSBhZGRlZCBpdGVtLlxuICAvLyAgICAgKiBgaW5kZXhgIHtOdW1iZXJ9IGluZGljYXRpbmcgdGhlIGluZGV4IG9mIHRoZSBhZGRlZCBpdGVtIGluIGl0cyBwYW5lLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZSgpYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvbkRpZEFkZFBhbmVJdGVtIChjYWxsYmFjaykge1xuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIC4uLnRoaXMuZ2V0UGFuZUNvbnRhaW5lcnMoKS5tYXAoY29udGFpbmVyID0+IGNvbnRhaW5lci5vbkRpZEFkZFBhbmVJdGVtKGNhbGxiYWNrKSlcbiAgICApXG4gIH1cblxuICAvLyBFeHRlbmRlZDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayB3aGVuIGEgcGFuZSBpdGVtIGlzIGFib3V0IHRvIGJlXG4gIC8vIGRlc3Ryb3llZCwgYmVmb3JlIHRoZSB1c2VyIGlzIHByb21wdGVkIHRvIHNhdmUgaXQuXG4gIC8vXG4gIC8vICogYGNhbGxiYWNrYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCBiZWZvcmUgcGFuZSBpdGVtcyBhcmUgZGVzdHJveWVkLlxuICAvLyAgICogYGV2ZW50YCB7T2JqZWN0fSB3aXRoIHRoZSBmb2xsb3dpbmcga2V5czpcbiAgLy8gICAgICogYGl0ZW1gIFRoZSBpdGVtIHRvIGJlIGRlc3Ryb3llZC5cbiAgLy8gICAgICogYHBhbmVgIHtQYW5lfSBjb250YWluaW5nIHRoZSBpdGVtIHRvIGJlIGRlc3Ryb3llZC5cbiAgLy8gICAgICogYGluZGV4YCB7TnVtYmVyfSBpbmRpY2F0aW5nIHRoZSBpbmRleCBvZiB0aGUgaXRlbSB0byBiZSBkZXN0cm95ZWQgaW5cbiAgLy8gICAgICAgaXRzIHBhbmUuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlYCBjYW4gYmUgY2FsbGVkIHRvIHVuc3Vic2NyaWJlLlxuICBvbldpbGxEZXN0cm95UGFuZUl0ZW0gKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgLi4udGhpcy5nZXRQYW5lQ29udGFpbmVycygpLm1hcChjb250YWluZXIgPT4gY29udGFpbmVyLm9uV2lsbERlc3Ryb3lQYW5lSXRlbShjYWxsYmFjaykpXG4gICAgKVxuICB9XG5cbiAgLy8gRXh0ZW5kZWQ6IEludm9rZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgd2hlbiBhIHBhbmUgaXRlbSBpcyBkZXN0cm95ZWQuXG4gIC8vXG4gIC8vICogYGNhbGxiYWNrYCB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIHBhbmUgaXRlbXMgYXJlIGRlc3Ryb3llZC5cbiAgLy8gICAqIGBldmVudGAge09iamVjdH0gd2l0aCB0aGUgZm9sbG93aW5nIGtleXM6XG4gIC8vICAgICAqIGBpdGVtYCBUaGUgZGVzdHJveWVkIGl0ZW0uXG4gIC8vICAgICAqIGBwYW5lYCB7UGFuZX0gY29udGFpbmluZyB0aGUgZGVzdHJveWVkIGl0ZW0uXG4gIC8vICAgICAqIGBpbmRleGAge051bWJlcn0gaW5kaWNhdGluZyB0aGUgaW5kZXggb2YgdGhlIGRlc3Ryb3llZCBpdGVtIGluIGl0c1xuICAvLyAgICAgICBwYW5lLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge0Rpc3Bvc2FibGV9IG9uIHdoaWNoIGAuZGlzcG9zZWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb25EaWREZXN0cm95UGFuZUl0ZW0gKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgLi4udGhpcy5nZXRQYW5lQ29udGFpbmVycygpLm1hcChjb250YWluZXIgPT4gY29udGFpbmVyLm9uRGlkRGVzdHJveVBhbmVJdGVtKGNhbGxiYWNrKSlcbiAgICApXG4gIH1cblxuICAvLyBFeHRlbmRlZDogSW52b2tlIHRoZSBnaXZlbiBjYWxsYmFjayB3aGVuIGEgdGV4dCBlZGl0b3IgaXMgYWRkZWQgdG8gdGhlXG4gIC8vIHdvcmtzcGFjZS5cbiAgLy9cbiAgLy8gKiBgY2FsbGJhY2tgIHtGdW5jdGlvbn0gdG8gYmUgY2FsbGVkIHBhbmVzIGFyZSBhZGRlZC5cbiAgLy8gICAqIGBldmVudGAge09iamVjdH0gd2l0aCB0aGUgZm9sbG93aW5nIGtleXM6XG4gIC8vICAgICAqIGB0ZXh0RWRpdG9yYCB7VGV4dEVkaXRvcn0gdGhhdCB3YXMgYWRkZWQuXG4gIC8vICAgICAqIGBwYW5lYCB7UGFuZX0gY29udGFpbmluZyB0aGUgYWRkZWQgdGV4dCBlZGl0b3IuXG4gIC8vICAgICAqIGBpbmRleGAge051bWJlcn0gaW5kaWNhdGluZyB0aGUgaW5kZXggb2YgdGhlIGFkZGVkIHRleHQgZWRpdG9yIGluIGl0c1xuICAvLyAgICAgICAgcGFuZS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtEaXNwb3NhYmxlfSBvbiB3aGljaCBgLmRpc3Bvc2UoKWAgY2FuIGJlIGNhbGxlZCB0byB1bnN1YnNjcmliZS5cbiAgb25EaWRBZGRUZXh0RWRpdG9yIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1hZGQtdGV4dC1lZGl0b3InLCBjYWxsYmFjaylcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlV2luZG93VGl0bGUgKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS13aW5kb3ctdGl0bGUnLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8qXG4gIFNlY3Rpb246IE9wZW5pbmdcbiAgKi9cblxuICAvLyBFc3NlbnRpYWw6IE9wZW5zIHRoZSBnaXZlbiBVUkkgaW4gQXRvbSBhc3luY2hyb25vdXNseS5cbiAgLy8gSWYgdGhlIFVSSSBpcyBhbHJlYWR5IG9wZW4sIHRoZSBleGlzdGluZyBpdGVtIGZvciB0aGF0IFVSSSB3aWxsIGJlXG4gIC8vIGFjdGl2YXRlZC4gSWYgbm8gVVJJIGlzIGdpdmVuLCBvciBubyByZWdpc3RlcmVkIG9wZW5lciBjYW4gb3BlblxuICAvLyB0aGUgVVJJLCBhIG5ldyBlbXB0eSB7VGV4dEVkaXRvcn0gd2lsbCBiZSBjcmVhdGVkLlxuICAvL1xuICAvLyAqIGB1cmlgIChvcHRpb25hbCkgQSB7U3RyaW5nfSBjb250YWluaW5nIGEgVVJJLlxuICAvLyAqIGBvcHRpb25zYCAob3B0aW9uYWwpIHtPYmplY3R9XG4gIC8vICAgKiBgaW5pdGlhbExpbmVgIEEge051bWJlcn0gaW5kaWNhdGluZyB3aGljaCByb3cgdG8gbW92ZSB0aGUgY3Vyc29yIHRvXG4gIC8vICAgICBpbml0aWFsbHkuIERlZmF1bHRzIHRvIGAwYC5cbiAgLy8gICAqIGBpbml0aWFsQ29sdW1uYCBBIHtOdW1iZXJ9IGluZGljYXRpbmcgd2hpY2ggY29sdW1uIHRvIG1vdmUgdGhlIGN1cnNvciB0b1xuICAvLyAgICAgaW5pdGlhbGx5LiBEZWZhdWx0cyB0byBgMGAuXG4gIC8vICAgKiBgc3BsaXRgIEVpdGhlciAnbGVmdCcsICdyaWdodCcsICd1cCcgb3IgJ2Rvd24nLlxuICAvLyAgICAgSWYgJ2xlZnQnLCB0aGUgaXRlbSB3aWxsIGJlIG9wZW5lZCBpbiBsZWZ0bW9zdCBwYW5lIG9mIHRoZSBjdXJyZW50IGFjdGl2ZSBwYW5lJ3Mgcm93LlxuICAvLyAgICAgSWYgJ3JpZ2h0JywgdGhlIGl0ZW0gd2lsbCBiZSBvcGVuZWQgaW4gdGhlIHJpZ2h0bW9zdCBwYW5lIG9mIHRoZSBjdXJyZW50IGFjdGl2ZSBwYW5lJ3Mgcm93LiBJZiBvbmx5IG9uZSBwYW5lIGV4aXN0cyBpbiB0aGUgcm93LCBhIG5ldyBwYW5lIHdpbGwgYmUgY3JlYXRlZC5cbiAgLy8gICAgIElmICd1cCcsIHRoZSBpdGVtIHdpbGwgYmUgb3BlbmVkIGluIHRvcG1vc3QgcGFuZSBvZiB0aGUgY3VycmVudCBhY3RpdmUgcGFuZSdzIGNvbHVtbi5cbiAgLy8gICAgIElmICdkb3duJywgdGhlIGl0ZW0gd2lsbCBiZSBvcGVuZWQgaW4gdGhlIGJvdHRvbW1vc3QgcGFuZSBvZiB0aGUgY3VycmVudCBhY3RpdmUgcGFuZSdzIGNvbHVtbi4gSWYgb25seSBvbmUgcGFuZSBleGlzdHMgaW4gdGhlIGNvbHVtbiwgYSBuZXcgcGFuZSB3aWxsIGJlIGNyZWF0ZWQuXG4gIC8vICAgKiBgYWN0aXZhdGVQYW5lYCBBIHtCb29sZWFufSBpbmRpY2F0aW5nIHdoZXRoZXIgdG8gY2FsbCB7UGFuZTo6YWN0aXZhdGV9IG9uXG4gIC8vICAgICBjb250YWluaW5nIHBhbmUuIERlZmF1bHRzIHRvIGB0cnVlYC5cbiAgLy8gICAqIGBhY3RpdmF0ZUl0ZW1gIEEge0Jvb2xlYW59IGluZGljYXRpbmcgd2hldGhlciB0byBjYWxsIHtQYW5lOjphY3RpdmF0ZUl0ZW19XG4gIC8vICAgICBvbiBjb250YWluaW5nIHBhbmUuIERlZmF1bHRzIHRvIGB0cnVlYC5cbiAgLy8gICAqIGBwZW5kaW5nYCBBIHtCb29sZWFufSBpbmRpY2F0aW5nIHdoZXRoZXIgb3Igbm90IHRoZSBpdGVtIHNob3VsZCBiZSBvcGVuZWRcbiAgLy8gICAgIGluIGEgcGVuZGluZyBzdGF0ZS4gRXhpc3RpbmcgcGVuZGluZyBpdGVtcyBpbiBhIHBhbmUgYXJlIHJlcGxhY2VkIHdpdGhcbiAgLy8gICAgIG5ldyBwZW5kaW5nIGl0ZW1zIHdoZW4gdGhleSBhcmUgb3BlbmVkLlxuICAvLyAgICogYHNlYXJjaEFsbFBhbmVzYCBBIHtCb29sZWFufS4gSWYgYHRydWVgLCB0aGUgd29ya3NwYWNlIHdpbGwgYXR0ZW1wdCB0b1xuICAvLyAgICAgYWN0aXZhdGUgYW4gZXhpc3RpbmcgaXRlbSBmb3IgdGhlIGdpdmVuIFVSSSBvbiBhbnkgcGFuZS5cbiAgLy8gICAgIElmIGBmYWxzZWAsIG9ubHkgdGhlIGFjdGl2ZSBwYW5lIHdpbGwgYmUgc2VhcmNoZWQgZm9yXG4gIC8vICAgICBhbiBleGlzdGluZyBpdGVtIGZvciB0aGUgc2FtZSBVUkkuIERlZmF1bHRzIHRvIGBmYWxzZWAuXG4gIC8vICAgKiBgbG9jYXRpb25gIChvcHRpb25hbCkgQSB7U3RyaW5nfSBjb250YWluaW5nIHRoZSBuYW1lIG9mIHRoZSBsb2NhdGlvblxuICAvLyAgICAgaW4gd2hpY2ggdGhpcyBpdGVtIHNob3VsZCBiZSBvcGVuZWQgKG9uZSBvZiBcImxlZnRcIiwgXCJyaWdodFwiLCBcImJvdHRvbVwiLFxuICAvLyAgICAgb3IgXCJjZW50ZXJcIikuIElmIG9taXR0ZWQsIEF0b20gd2lsbCBmYWxsIGJhY2sgdG8gdGhlIGxhc3QgbG9jYXRpb24gaW5cbiAgLy8gICAgIHdoaWNoIGEgdXNlciBoYXMgcGxhY2VkIGFuIGl0ZW0gd2l0aCB0aGUgc2FtZSBVUkkgb3IsIGlmIHRoaXMgaXMgYSBuZXdcbiAgLy8gICAgIFVSSSwgdGhlIGRlZmF1bHQgbG9jYXRpb24gc3BlY2lmaWVkIGJ5IHRoZSBpdGVtLiBOT1RFOiBUaGlzIG9wdGlvblxuICAvLyAgICAgc2hvdWxkIGFsbW9zdCBhbHdheXMgYmUgb21pdHRlZCB0byBob25vciB1c2VyIHByZWZlcmVuY2UuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7UHJvbWlzZX0gdGhhdCByZXNvbHZlcyB0byB0aGUge1RleHRFZGl0b3J9IGZvciB0aGUgZmlsZSBVUkkuXG4gIGFzeW5jIG9wZW4gKGl0ZW1PclVSSSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IHVyaSwgaXRlbVxuICAgIGlmICh0eXBlb2YgaXRlbU9yVVJJID09PSAnc3RyaW5nJykge1xuICAgICAgdXJpID0gdGhpcy5wcm9qZWN0LnJlc29sdmVQYXRoKGl0ZW1PclVSSSlcbiAgICB9IGVsc2UgaWYgKGl0ZW1PclVSSSkge1xuICAgICAgaXRlbSA9IGl0ZW1PclVSSVxuICAgICAgaWYgKHR5cGVvZiBpdGVtLmdldFVSSSA9PT0gJ2Z1bmN0aW9uJykgdXJpID0gaXRlbS5nZXRVUkkoKVxuICAgIH1cblxuICAgIGlmICghYXRvbS5jb25maWcuZ2V0KCdjb3JlLmFsbG93UGVuZGluZ1BhbmVJdGVtcycpKSB7XG4gICAgICBvcHRpb25zLnBlbmRpbmcgPSBmYWxzZVxuICAgIH1cblxuICAgIC8vIEF2b2lkIGFkZGluZyBVUkxzIGFzIHJlY2VudCBkb2N1bWVudHMgdG8gd29yay1hcm91bmQgdGhpcyBTcG90bGlnaHQgY3Jhc2g6XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9pc3N1ZXMvMTAwNzFcbiAgICBpZiAodXJpICYmICghdXJsLnBhcnNlKHVyaSkucHJvdG9jb2wgfHwgcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJykpIHtcbiAgICAgIHRoaXMuYXBwbGljYXRpb25EZWxlZ2F0ZS5hZGRSZWNlbnREb2N1bWVudCh1cmkpXG4gICAgfVxuXG4gICAgbGV0IHBhbmUsIGl0ZW1FeGlzdHNJbldvcmtzcGFjZVxuXG4gICAgLy8gVHJ5IHRvIGZpbmQgYW4gZXhpc3RpbmcgaXRlbSBpbiB0aGUgd29ya3NwYWNlLlxuICAgIGlmIChpdGVtIHx8IHVyaSkge1xuICAgICAgaWYgKG9wdGlvbnMucGFuZSkge1xuICAgICAgICBwYW5lID0gb3B0aW9ucy5wYW5lXG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuc2VhcmNoQWxsUGFuZXMpIHtcbiAgICAgICAgcGFuZSA9IGl0ZW0gPyB0aGlzLnBhbmVGb3JJdGVtKGl0ZW0pIDogdGhpcy5wYW5lRm9yVVJJKHVyaSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIGFuIGl0ZW0gd2l0aCB0aGUgZ2l2ZW4gVVJJIGlzIGFscmVhZHkgaW4gdGhlIHdvcmtzcGFjZSwgYXNzdW1lXG4gICAgICAgIC8vIHRoYXQgaXRlbSdzIHBhbmUgY29udGFpbmVyIGlzIHRoZSBwcmVmZXJyZWQgbG9jYXRpb24gZm9yIHRoYXQgVVJJLlxuICAgICAgICBsZXQgY29udGFpbmVyXG4gICAgICAgIGlmICh1cmkpIGNvbnRhaW5lciA9IHRoaXMucGFuZUNvbnRhaW5lckZvclVSSSh1cmkpXG4gICAgICAgIGlmICghY29udGFpbmVyKSBjb250YWluZXIgPSB0aGlzLmdldEFjdGl2ZVBhbmVDb250YWluZXIoKVxuXG4gICAgICAgIC8vIFRoZSBgc3BsaXRgIG9wdGlvbiBhZmZlY3RzIHdoZXJlIHdlIHNlYXJjaCBmb3IgdGhlIGl0ZW0uXG4gICAgICAgIHBhbmUgPSBjb250YWluZXIuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy5zcGxpdCkge1xuICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgcGFuZSA9IHBhbmUuZmluZExlZnRtb3N0U2libGluZygpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgIHBhbmUgPSBwYW5lLmZpbmRSaWdodG1vc3RTaWJsaW5nKClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAndXAnOlxuICAgICAgICAgICAgcGFuZSA9IHBhbmUuZmluZFRvcG1vc3RTaWJsaW5nKClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAnZG93bic6XG4gICAgICAgICAgICBwYW5lID0gcGFuZS5maW5kQm90dG9tbW9zdFNpYmxpbmcoKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocGFuZSkge1xuICAgICAgICBpZiAoaXRlbSkge1xuICAgICAgICAgIGl0ZW1FeGlzdHNJbldvcmtzcGFjZSA9IHBhbmUuZ2V0SXRlbXMoKS5pbmNsdWRlcyhpdGVtKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0gPSBwYW5lLml0ZW1Gb3JVUkkodXJpKVxuICAgICAgICAgIGl0ZW1FeGlzdHNJbldvcmtzcGFjZSA9IGl0ZW0gIT0gbnVsbFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgYWxyZWFkeSBoYXZlIGFuIGl0ZW0gYXQgdGhpcyBzdGFnZSwgd2Ugd29uJ3QgbmVlZCB0byBkbyBhbiBhc3luY1xuICAgIC8vIGxvb2t1cCBvZiB0aGUgVVJJLCBzbyB3ZSB5aWVsZCB0aGUgZXZlbnQgbG9vcCB0byBlbnN1cmUgdGhpcyBtZXRob2RcbiAgICAvLyBpcyBjb25zaXN0ZW50bHkgYXN5bmNocm9ub3VzLlxuICAgIGlmIChpdGVtKSBhd2FpdCBQcm9taXNlLnJlc29sdmUoKVxuXG4gICAgaWYgKCFpdGVtRXhpc3RzSW5Xb3Jrc3BhY2UpIHtcbiAgICAgIGl0ZW0gPSBpdGVtIHx8IGF3YWl0IHRoaXMuY3JlYXRlSXRlbUZvclVSSSh1cmksIG9wdGlvbnMpXG4gICAgICBpZiAoIWl0ZW0pIHJldHVyblxuXG4gICAgICBpZiAob3B0aW9ucy5wYW5lKSB7XG4gICAgICAgIHBhbmUgPSBvcHRpb25zLnBhbmVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBsb2NhdGlvbiA9IG9wdGlvbnMubG9jYXRpb25cbiAgICAgICAgaWYgKCFsb2NhdGlvbiAmJiAhb3B0aW9ucy5zcGxpdCAmJiB1cmkgJiYgdGhpcy5lbmFibGVQZXJzaXN0ZW5jZSkge1xuICAgICAgICAgIGxvY2F0aW9uID0gYXdhaXQgdGhpcy5pdGVtTG9jYXRpb25TdG9yZS5sb2FkKHVyaSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWxvY2F0aW9uICYmIHR5cGVvZiBpdGVtLmdldERlZmF1bHRMb2NhdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGxvY2F0aW9uID0gaXRlbS5nZXREZWZhdWx0TG9jYXRpb24oKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYWxsb3dlZExvY2F0aW9ucyA9IHR5cGVvZiBpdGVtLmdldEFsbG93ZWRMb2NhdGlvbnMgPT09ICdmdW5jdGlvbicgPyBpdGVtLmdldEFsbG93ZWRMb2NhdGlvbnMoKSA6IEFMTF9MT0NBVElPTlNcbiAgICAgICAgbG9jYXRpb24gPSBhbGxvd2VkTG9jYXRpb25zLmluY2x1ZGVzKGxvY2F0aW9uKSA/IGxvY2F0aW9uIDogYWxsb3dlZExvY2F0aW9uc1swXVxuXG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMucGFuZUNvbnRhaW5lcnNbbG9jYXRpb25dIHx8IHRoaXMuZ2V0Q2VudGVyKClcbiAgICAgICAgcGFuZSA9IGNvbnRhaW5lci5nZXRBY3RpdmVQYW5lKClcbiAgICAgICAgc3dpdGNoIChvcHRpb25zLnNwbGl0KSB7XG4gICAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgICBwYW5lID0gcGFuZS5maW5kTGVmdG1vc3RTaWJsaW5nKClcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgICAgcGFuZSA9IHBhbmUuZmluZE9yQ3JlYXRlUmlnaHRtb3N0U2libGluZygpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ3VwJzpcbiAgICAgICAgICAgIHBhbmUgPSBwYW5lLmZpbmRUb3Btb3N0U2libGluZygpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ2Rvd24nOlxuICAgICAgICAgICAgcGFuZSA9IHBhbmUuZmluZE9yQ3JlYXRlQm90dG9tbW9zdFNpYmxpbmcoKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghb3B0aW9ucy5wZW5kaW5nICYmIChwYW5lLmdldFBlbmRpbmdJdGVtKCkgPT09IGl0ZW0pKSB7XG4gICAgICBwYW5lLmNsZWFyUGVuZGluZ0l0ZW0oKVxuICAgIH1cblxuICAgIHRoaXMuaXRlbU9wZW5lZChpdGVtKVxuXG4gICAgaWYgKG9wdGlvbnMuYWN0aXZhdGVJdGVtID09PSBmYWxzZSkge1xuICAgICAgcGFuZS5hZGRJdGVtKGl0ZW0sIHtwZW5kaW5nOiBvcHRpb25zLnBlbmRpbmd9KVxuICAgIH0gZWxzZSB7XG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbShpdGVtLCB7cGVuZGluZzogb3B0aW9ucy5wZW5kaW5nfSlcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5hY3RpdmF0ZVBhbmUgIT09IGZhbHNlKSB7XG4gICAgICBwYW5lLmFjdGl2YXRlKClcbiAgICB9XG5cbiAgICBsZXQgaW5pdGlhbENvbHVtbiA9IDBcbiAgICBsZXQgaW5pdGlhbExpbmUgPSAwXG4gICAgaWYgKCFOdW1iZXIuaXNOYU4ob3B0aW9ucy5pbml0aWFsTGluZSkpIHtcbiAgICAgIGluaXRpYWxMaW5lID0gb3B0aW9ucy5pbml0aWFsTGluZVxuICAgIH1cbiAgICBpZiAoIU51bWJlci5pc05hTihvcHRpb25zLmluaXRpYWxDb2x1bW4pKSB7XG4gICAgICBpbml0aWFsQ29sdW1uID0gb3B0aW9ucy5pbml0aWFsQ29sdW1uXG4gICAgfVxuICAgIGlmIChpbml0aWFsTGluZSA+PSAwIHx8IGluaXRpYWxDb2x1bW4gPj0gMCkge1xuICAgICAgaWYgKHR5cGVvZiBpdGVtLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGl0ZW0uc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2luaXRpYWxMaW5lLCBpbml0aWFsQ29sdW1uXSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpbmRleCA9IHBhbmUuZ2V0QWN0aXZlSXRlbUluZGV4KClcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLW9wZW4nLCB7dXJpLCBwYW5lLCBpdGVtLCBpbmRleH0pXG4gICAgcmV0dXJuIGl0ZW1cbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogU2VhcmNoIHRoZSB3b3Jrc3BhY2UgZm9yIGl0ZW1zIG1hdGNoaW5nIHRoZSBnaXZlbiBVUkkgYW5kIGhpZGUgdGhlbS5cbiAgLy9cbiAgLy8gKiBgaXRlbU9yVVJJYCAob3B0aW9uYWwpIFRoZSBpdGVtIHRvIGhpZGUgb3IgYSB7U3RyaW5nfSBjb250YWluaW5nIHRoZSBVUklcbiAgLy8gICBvZiB0aGUgaXRlbSB0byBoaWRlLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge2Jvb2xlYW59IGluZGljYXRpbmcgd2hldGhlciBhbnkgaXRlbXMgd2VyZSBmb3VuZCAoYW5kIGhpZGRlbikuXG4gIGhpZGUgKGl0ZW1PclVSSSkge1xuICAgIGxldCBmb3VuZEl0ZW1zID0gZmFsc2VcblxuICAgIC8vIElmIGFueSB2aXNpYmxlIGl0ZW0gaGFzIHRoZSBnaXZlbiBVUkksIGhpZGUgaXRcbiAgICBmb3IgKGNvbnN0IGNvbnRhaW5lciBvZiB0aGlzLmdldFBhbmVDb250YWluZXJzKCkpIHtcbiAgICAgIGNvbnN0IGlzQ2VudGVyID0gY29udGFpbmVyID09PSB0aGlzLmdldENlbnRlcigpXG4gICAgICBpZiAoaXNDZW50ZXIgfHwgY29udGFpbmVyLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgIGZvciAoY29uc3QgcGFuZSBvZiBjb250YWluZXIuZ2V0UGFuZXMoKSkge1xuICAgICAgICAgIGNvbnN0IGFjdGl2ZUl0ZW0gPSBwYW5lLmdldEFjdGl2ZUl0ZW0oKVxuICAgICAgICAgIGNvbnN0IGZvdW5kSXRlbSA9IChcbiAgICAgICAgICAgIGFjdGl2ZUl0ZW0gIT0gbnVsbCAmJiAoXG4gICAgICAgICAgICAgIGFjdGl2ZUl0ZW0gPT09IGl0ZW1PclVSSSB8fFxuICAgICAgICAgICAgICB0eXBlb2YgYWN0aXZlSXRlbS5nZXRVUkkgPT09ICdmdW5jdGlvbicgJiYgYWN0aXZlSXRlbS5nZXRVUkkoKSA9PT0gaXRlbU9yVVJJXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICAgIGlmIChmb3VuZEl0ZW0pIHtcbiAgICAgICAgICAgIGZvdW5kSXRlbXMgPSB0cnVlXG4gICAgICAgICAgICAvLyBXZSBjYW4ndCByZWFsbHkgaGlkZSB0aGUgY2VudGVyIHNvIHdlIGp1c3QgZGVzdHJveSB0aGUgaXRlbS5cbiAgICAgICAgICAgIGlmIChpc0NlbnRlcikge1xuICAgICAgICAgICAgICBwYW5lLmRlc3Ryb3lJdGVtKGFjdGl2ZUl0ZW0pXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb250YWluZXIuaGlkZSgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZvdW5kSXRlbXNcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogU2VhcmNoIHRoZSB3b3Jrc3BhY2UgZm9yIGl0ZW1zIG1hdGNoaW5nIHRoZSBnaXZlbiBVUkkuIElmIGFueSBhcmUgZm91bmQsIGhpZGUgdGhlbS5cbiAgLy8gT3RoZXJ3aXNlLCBvcGVuIHRoZSBVUkwuXG4gIC8vXG4gIC8vICogYGl0ZW1PclVSSWAgKG9wdGlvbmFsKSBUaGUgaXRlbSB0byB0b2dnbGUgb3IgYSB7U3RyaW5nfSBjb250YWluaW5nIHRoZSBVUklcbiAgLy8gICBvZiB0aGUgaXRlbSB0byB0b2dnbGUuXG4gIC8vXG4gIC8vIFJldHVybnMgYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgaXRlbSBpcyBzaG93biBvciBoaWRkZW4uXG4gIHRvZ2dsZSAoaXRlbU9yVVJJKSB7XG4gICAgaWYgKHRoaXMuaGlkZShpdGVtT3JVUkkpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMub3BlbihpdGVtT3JVUkksIHtzZWFyY2hBbGxQYW5lczogdHJ1ZX0pXG4gICAgfVxuICB9XG5cbiAgLy8gT3BlbiBBdG9tJ3MgbGljZW5zZSBpbiB0aGUgYWN0aXZlIHBhbmUuXG4gIG9wZW5MaWNlbnNlICgpIHtcbiAgICByZXR1cm4gdGhpcy5vcGVuKCcvdXNyL3NoYXJlL2xpY2Vuc2VzL2F0b20vTElDRU5TRS5tZCcpXG4gIH1cblxuICAvLyBTeW5jaHJvbm91c2x5IG9wZW4gdGhlIGdpdmVuIFVSSSBpbiB0aGUgYWN0aXZlIHBhbmUuICoqT25seSB1c2UgdGhpcyBtZXRob2RcbiAgLy8gaW4gc3BlY3MuIENhbGxpbmcgdGhpcyBpbiBwcm9kdWN0aW9uIGNvZGUgd2lsbCBibG9jayB0aGUgVUkgdGhyZWFkIGFuZFxuICAvLyBldmVyeW9uZSB3aWxsIGJlIG1hZCBhdCB5b3UuKipcbiAgLy9cbiAgLy8gKiBgdXJpYCBBIHtTdHJpbmd9IGNvbnRhaW5pbmcgYSBVUkkuXG4gIC8vICogYG9wdGlvbnNgIEFuIG9wdGlvbmFsIG9wdGlvbnMge09iamVjdH1cbiAgLy8gICAqIGBpbml0aWFsTGluZWAgQSB7TnVtYmVyfSBpbmRpY2F0aW5nIHdoaWNoIHJvdyB0byBtb3ZlIHRoZSBjdXJzb3IgdG9cbiAgLy8gICAgIGluaXRpYWxseS4gRGVmYXVsdHMgdG8gYDBgLlxuICAvLyAgICogYGluaXRpYWxDb2x1bW5gIEEge051bWJlcn0gaW5kaWNhdGluZyB3aGljaCBjb2x1bW4gdG8gbW92ZSB0aGUgY3Vyc29yIHRvXG4gIC8vICAgICBpbml0aWFsbHkuIERlZmF1bHRzIHRvIGAwYC5cbiAgLy8gICAqIGBhY3RpdmF0ZVBhbmVgIEEge0Jvb2xlYW59IGluZGljYXRpbmcgd2hldGhlciB0byBjYWxsIHtQYW5lOjphY3RpdmF0ZX0gb25cbiAgLy8gICAgIHRoZSBjb250YWluaW5nIHBhbmUuIERlZmF1bHRzIHRvIGB0cnVlYC5cbiAgLy8gICAqIGBhY3RpdmF0ZUl0ZW1gIEEge0Jvb2xlYW59IGluZGljYXRpbmcgd2hldGhlciB0byBjYWxsIHtQYW5lOjphY3RpdmF0ZUl0ZW19XG4gIC8vICAgICBvbiBjb250YWluaW5nIHBhbmUuIERlZmF1bHRzIHRvIGB0cnVlYC5cbiAgb3BlblN5bmMgKHVyaV8gPSAnJywgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3Qge2luaXRpYWxMaW5lLCBpbml0aWFsQ29sdW1ufSA9IG9wdGlvbnNcbiAgICBjb25zdCBhY3RpdmF0ZVBhbmUgPSBvcHRpb25zLmFjdGl2YXRlUGFuZSAhPSBudWxsID8gb3B0aW9ucy5hY3RpdmF0ZVBhbmUgOiB0cnVlXG4gICAgY29uc3QgYWN0aXZhdGVJdGVtID0gb3B0aW9ucy5hY3RpdmF0ZUl0ZW0gIT0gbnVsbCA/IG9wdGlvbnMuYWN0aXZhdGVJdGVtIDogdHJ1ZVxuXG4gICAgY29uc3QgdXJpID0gdGhpcy5wcm9qZWN0LnJlc29sdmVQYXRoKHVyaV8pXG4gICAgbGV0IGl0ZW0gPSB0aGlzLmdldEFjdGl2ZVBhbmUoKS5pdGVtRm9yVVJJKHVyaSlcbiAgICBpZiAodXJpICYmIChpdGVtID09IG51bGwpKSB7XG4gICAgICBmb3IgKGNvbnN0IG9wZW5lciBvZiB0aGlzLmdldE9wZW5lcnMoKSkge1xuICAgICAgICBpdGVtID0gb3BlbmVyKHVyaSwgb3B0aW9ucylcbiAgICAgICAgaWYgKGl0ZW0pIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpdGVtID09IG51bGwpIHtcbiAgICAgIGl0ZW0gPSB0aGlzLnByb2plY3Qub3BlblN5bmModXJpLCB7aW5pdGlhbExpbmUsIGluaXRpYWxDb2x1bW59KVxuICAgIH1cblxuICAgIGlmIChhY3RpdmF0ZUl0ZW0pIHtcbiAgICAgIHRoaXMuZ2V0QWN0aXZlUGFuZSgpLmFjdGl2YXRlSXRlbShpdGVtKVxuICAgIH1cbiAgICB0aGlzLml0ZW1PcGVuZWQoaXRlbSlcbiAgICBpZiAoYWN0aXZhdGVQYW5lKSB7XG4gICAgICB0aGlzLmdldEFjdGl2ZVBhbmUoKS5hY3RpdmF0ZSgpXG4gICAgfVxuICAgIHJldHVybiBpdGVtXG4gIH1cblxuICBvcGVuVVJJSW5QYW5lICh1cmksIHBhbmUpIHtcbiAgICByZXR1cm4gdGhpcy5vcGVuKHVyaSwge3BhbmV9KVxuICB9XG5cbiAgLy8gUHVibGljOiBDcmVhdGVzIGEgbmV3IGl0ZW0gdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgcHJvdmlkZWQgVVJJLlxuICAvL1xuICAvLyBJZiBubyBVUkkgaXMgZ2l2ZW4sIG9yIG5vIHJlZ2lzdGVyZWQgb3BlbmVyIGNhbiBvcGVuIHRoZSBVUkksIGEgbmV3IGVtcHR5XG4gIC8vIHtUZXh0RWRpdG9yfSB3aWxsIGJlIGNyZWF0ZWQuXG4gIC8vXG4gIC8vICogYHVyaWAgQSB7U3RyaW5nfSBjb250YWluaW5nIGEgVVJJLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge1Byb21pc2V9IHRoYXQgcmVzb2x2ZXMgdG8gdGhlIHtUZXh0RWRpdG9yfSAob3Igb3RoZXIgaXRlbSkgZm9yIHRoZSBnaXZlbiBVUkkuXG4gIGNyZWF0ZUl0ZW1Gb3JVUkkgKHVyaSwgb3B0aW9ucykge1xuICAgIGlmICh1cmkgIT0gbnVsbCkge1xuICAgICAgZm9yIChsZXQgb3BlbmVyIG9mIHRoaXMuZ2V0T3BlbmVycygpKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBvcGVuZXIodXJpLCBvcHRpb25zKVxuICAgICAgICBpZiAoaXRlbSAhPSBudWxsKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGl0ZW0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0aGlzLm9wZW5UZXh0RmlsZSh1cmksIG9wdGlvbnMpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHN3aXRjaCAoZXJyb3IuY29kZSkge1xuICAgICAgICBjYXNlICdDQU5DRUxMRUQnOlxuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICBjYXNlICdFQUNDRVMnOlxuICAgICAgICAgIHRoaXMubm90aWZpY2F0aW9uTWFuYWdlci5hZGRXYXJuaW5nKGBQZXJtaXNzaW9uIGRlbmllZCAnJHtlcnJvci5wYXRofSdgKVxuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICBjYXNlICdFUEVSTSc6XG4gICAgICAgIGNhc2UgJ0VCVVNZJzpcbiAgICAgICAgY2FzZSAnRU5YSU8nOlxuICAgICAgICBjYXNlICdFSU8nOlxuICAgICAgICBjYXNlICdFTk9UQ09OTic6XG4gICAgICAgIGNhc2UgJ1VOS05PV04nOlxuICAgICAgICBjYXNlICdFQ09OTlJFU0VUJzpcbiAgICAgICAgY2FzZSAnRUlOVkFMJzpcbiAgICAgICAgY2FzZSAnRU1GSUxFJzpcbiAgICAgICAgY2FzZSAnRU5PVERJUic6XG4gICAgICAgIGNhc2UgJ0VBR0FJTic6XG4gICAgICAgICAgdGhpcy5ub3RpZmljYXRpb25NYW5hZ2VyLmFkZFdhcm5pbmcoXG4gICAgICAgICAgICBgVW5hYmxlIHRvIG9wZW4gJyR7ZXJyb3IucGF0aCAhPSBudWxsID8gZXJyb3IucGF0aCA6IHVyaX0nYCxcbiAgICAgICAgICAgIHtkZXRhaWw6IGVycm9yLm1lc3NhZ2V9XG4gICAgICAgICAgKVxuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IGVycm9yXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgb3BlblRleHRGaWxlICh1cmksIG9wdGlvbnMpIHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHRoaXMucHJvamVjdC5yZXNvbHZlUGF0aCh1cmkpXG5cbiAgICBpZiAoZmlsZVBhdGggIT0gbnVsbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZnMuY2xvc2VTeW5jKGZzLm9wZW5TeW5jKGZpbGVQYXRoLCAncicpKVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gYWxsb3cgRU5PRU5UIGVycm9ycyB0byBjcmVhdGUgYW4gZWRpdG9yIGZvciBwYXRocyB0aGF0IGRvbnQgZXhpc3RcbiAgICAgICAgaWYgKGVycm9yLmNvZGUgIT09ICdFTk9FTlQnKSB7XG4gICAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGZpbGVTaXplID0gZnMuZ2V0U2l6ZVN5bmMoZmlsZVBhdGgpXG5cbiAgICBjb25zdCBsYXJnZUZpbGVNb2RlID0gZmlsZVNpemUgPj0gKDIgKiAxMDQ4NTc2KSAvLyAyTUJcbiAgICBpZiAoZmlsZVNpemUgPj0gKHRoaXMuY29uZmlnLmdldCgnY29yZS53YXJuT25MYXJnZUZpbGVMaW1pdCcpICogMTA0ODU3NikpIHsgLy8gMjBNQiBieSBkZWZhdWx0XG4gICAgICBjb25zdCBjaG9pY2UgPSB0aGlzLmFwcGxpY2F0aW9uRGVsZWdhdGUuY29uZmlybSh7XG4gICAgICAgIG1lc3NhZ2U6ICdBdG9tIHdpbGwgYmUgdW5yZXNwb25zaXZlIGR1cmluZyB0aGUgbG9hZGluZyBvZiB2ZXJ5IGxhcmdlIGZpbGVzLicsXG4gICAgICAgIGRldGFpbGVkTWVzc2FnZTogJ0RvIHlvdSBzdGlsbCB3YW50IHRvIGxvYWQgdGhpcyBmaWxlPycsXG4gICAgICAgIGJ1dHRvbnM6IFsnUHJvY2VlZCcsICdDYW5jZWwnXVxuICAgICAgfSlcbiAgICAgIGlmIChjaG9pY2UgPT09IDEpIHtcbiAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoKVxuICAgICAgICBlcnJvci5jb2RlID0gJ0NBTkNFTExFRCdcbiAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wcm9qZWN0LmJ1ZmZlckZvclBhdGgoZmlsZVBhdGgsIG9wdGlvbnMpXG4gICAgICAudGhlbihidWZmZXIgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0RWRpdG9yUmVnaXN0cnkuYnVpbGQoT2JqZWN0LmFzc2lnbih7YnVmZmVyLCBsYXJnZUZpbGVNb2RlLCBhdXRvSGVpZ2h0OiBmYWxzZX0sIG9wdGlvbnMpKVxuICAgICAgfSlcbiAgfVxuXG4gIGhhbmRsZUdyYW1tYXJVc2VkIChncmFtbWFyKSB7XG4gICAgaWYgKGdyYW1tYXIgPT0gbnVsbCkgeyByZXR1cm4gfVxuICAgIHJldHVybiB0aGlzLnBhY2thZ2VNYW5hZ2VyLnRyaWdnZXJBY3RpdmF0aW9uSG9vayhgJHtncmFtbWFyLnBhY2thZ2VOYW1lfTpncmFtbWFyLXVzZWRgKVxuICB9XG5cbiAgLy8gUHVibGljOiBSZXR1cm5zIGEge0Jvb2xlYW59IHRoYXQgaXMgYHRydWVgIGlmIGBvYmplY3RgIGlzIGEgYFRleHRFZGl0b3JgLlxuICAvL1xuICAvLyAqIGBvYmplY3RgIEFuIHtPYmplY3R9IHlvdSB3YW50IHRvIHBlcmZvcm0gdGhlIGNoZWNrIGFnYWluc3QuXG4gIGlzVGV4dEVkaXRvciAob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdCBpbnN0YW5jZW9mIFRleHRFZGl0b3JcbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBDcmVhdGUgYSBuZXcgdGV4dCBlZGl0b3IuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7VGV4dEVkaXRvcn0uXG4gIGJ1aWxkVGV4dEVkaXRvciAocGFyYW1zKSB7XG4gICAgY29uc3QgZWRpdG9yID0gdGhpcy50ZXh0RWRpdG9yUmVnaXN0cnkuYnVpbGQocGFyYW1zKVxuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIHRoaXMudGV4dEVkaXRvclJlZ2lzdHJ5Lm1haW50YWluR3JhbW1hcihlZGl0b3IpLFxuICAgICAgdGhpcy50ZXh0RWRpdG9yUmVnaXN0cnkubWFpbnRhaW5Db25maWcoZWRpdG9yKVxuICAgIClcbiAgICBlZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHsgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCkgfSlcbiAgICByZXR1cm4gZWRpdG9yXG4gIH1cblxuICAvLyBQdWJsaWM6IEFzeW5jaHJvbm91c2x5IHJlb3BlbnMgdGhlIGxhc3QtY2xvc2VkIGl0ZW0ncyBVUkkgaWYgaXQgaGFzbid0IGFscmVhZHkgYmVlblxuICAvLyByZW9wZW5lZC5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtQcm9taXNlfSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIGl0ZW0gaXMgb3BlbmVkXG4gIHJlb3Blbkl0ZW0gKCkge1xuICAgIGNvbnN0IHVyaSA9IHRoaXMuZGVzdHJveWVkSXRlbVVSSXMucG9wKClcbiAgICBpZiAodXJpKSB7XG4gICAgICByZXR1cm4gdGhpcy5vcGVuKHVyaSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgfVxuICB9XG5cbiAgLy8gUHVibGljOiBSZWdpc3RlciBhbiBvcGVuZXIgZm9yIGEgdXJpLlxuICAvL1xuICAvLyBXaGVuIGEgVVJJIGlzIG9wZW5lZCB2aWEge1dvcmtzcGFjZTo6b3Blbn0sIEF0b20gbG9vcHMgdGhyb3VnaCBpdHMgcmVnaXN0ZXJlZFxuICAvLyBvcGVuZXIgZnVuY3Rpb25zIHVudGlsIG9uZSByZXR1cm5zIGEgdmFsdWUgZm9yIHRoZSBnaXZlbiB1cmkuXG4gIC8vIE9wZW5lcnMgYXJlIGV4cGVjdGVkIHRvIHJldHVybiBhbiBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIEhUTUxFbGVtZW50IG9yXG4gIC8vIGEgbW9kZWwgd2hpY2ggaGFzIGFuIGFzc29jaWF0ZWQgdmlldyBpbiB0aGUge1ZpZXdSZWdpc3RyeX0uXG4gIC8vIEEge1RleHRFZGl0b3J9IHdpbGwgYmUgdXNlZCBpZiBubyBvcGVuZXIgcmV0dXJucyBhIHZhbHVlLlxuICAvL1xuICAvLyAjIyBFeGFtcGxlc1xuICAvL1xuICAvLyBgYGBjb2ZmZWVcbiAgLy8gYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyICh1cmkpIC0+XG4gIC8vICAgaWYgcGF0aC5leHRuYW1lKHVyaSkgaXMgJy50b21sJ1xuICAvLyAgICAgcmV0dXJuIG5ldyBUb21sRWRpdG9yKHVyaSlcbiAgLy8gYGBgXG4gIC8vXG4gIC8vICogYG9wZW5lcmAgQSB7RnVuY3Rpb259IHRvIGJlIGNhbGxlZCB3aGVuIGEgcGF0aCBpcyBiZWluZyBvcGVuZWQuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RGlzcG9zYWJsZX0gb24gd2hpY2ggYC5kaXNwb3NlKClgIGNhbiBiZSBjYWxsZWQgdG8gcmVtb3ZlIHRoZVxuICAvLyBvcGVuZXIuXG4gIC8vXG4gIC8vIE5vdGUgdGhhdCB0aGUgb3BlbmVyIHdpbGwgYmUgY2FsbGVkIGlmIGFuZCBvbmx5IGlmIHRoZSBVUkkgaXMgbm90IGFscmVhZHkgb3BlblxuICAvLyBpbiB0aGUgY3VycmVudCBwYW5lLiBUaGUgc2VhcmNoQWxsUGFuZXMgZmxhZyBleHBhbmRzIHRoZSBzZWFyY2ggZnJvbSB0aGVcbiAgLy8gY3VycmVudCBwYW5lIHRvIGFsbCBwYW5lcy4gSWYgeW91IHdpc2ggdG8gb3BlbiBhIHZpZXcgb2YgYSBkaWZmZXJlbnQgdHlwZSBmb3JcbiAgLy8gYSBmaWxlIHRoYXQgaXMgYWxyZWFkeSBvcGVuLCBjb25zaWRlciBjaGFuZ2luZyB0aGUgcHJvdG9jb2wgb2YgdGhlIFVSSS4gRm9yXG4gIC8vIGV4YW1wbGUsIHBlcmhhcHMgeW91IHdpc2ggdG8gcHJldmlldyBhIHJlbmRlcmVkIHZlcnNpb24gb2YgdGhlIGZpbGUgYC9mb28vYmFyL2Jhei5xdXV4YFxuICAvLyB0aGF0IGlzIGFscmVhZHkgb3BlbiBpbiBhIHRleHQgZWRpdG9yIHZpZXcuIFlvdSBjb3VsZCBzaWduYWwgdGhpcyBieSBjYWxsaW5nXG4gIC8vIHtXb3Jrc3BhY2U6Om9wZW59IG9uIHRoZSBVUkkgYHF1dXgtcHJldmlldzovL2Zvby9iYXIvYmF6LnF1dXhgLiBUaGVuIHlvdXIgb3BlbmVyXG4gIC8vIGNhbiBjaGVjayB0aGUgcHJvdG9jb2wgZm9yIHF1dXgtcHJldmlldyBhbmQgb25seSBoYW5kbGUgdGhvc2UgVVJJcyB0aGF0IG1hdGNoLlxuICBhZGRPcGVuZXIgKG9wZW5lcikge1xuICAgIHRoaXMub3BlbmVycy5wdXNoKG9wZW5lcilcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4geyBfLnJlbW92ZSh0aGlzLm9wZW5lcnMsIG9wZW5lcikgfSlcbiAgfVxuXG4gIGdldE9wZW5lcnMgKCkge1xuICAgIHJldHVybiB0aGlzLm9wZW5lcnNcbiAgfVxuXG4gIC8qXG4gIFNlY3Rpb246IFBhbmUgSXRlbXNcbiAgKi9cblxuICAvLyBFc3NlbnRpYWw6IEdldCBhbGwgcGFuZSBpdGVtcyBpbiB0aGUgd29ya3NwYWNlLlxuICAvL1xuICAvLyBSZXR1cm5zIGFuIHtBcnJheX0gb2YgaXRlbXMuXG4gIGdldFBhbmVJdGVtcyAoKSB7XG4gICAgcmV0dXJuIF8uZmxhdHRlbih0aGlzLmdldFBhbmVDb250YWluZXJzKCkubWFwKGNvbnRhaW5lciA9PiBjb250YWluZXIuZ2V0UGFuZUl0ZW1zKCkpKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBHZXQgdGhlIGFjdGl2ZSB7UGFuZX0ncyBhY3RpdmUgaXRlbS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhbiBwYW5lIGl0ZW0ge09iamVjdH0uXG4gIGdldEFjdGl2ZVBhbmVJdGVtICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBY3RpdmVQYW5lQ29udGFpbmVyKCkuZ2V0QWN0aXZlUGFuZUl0ZW0oKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBHZXQgYWxsIHRleHQgZWRpdG9ycyBpbiB0aGUgd29ya3NwYWNlLlxuICAvL1xuICAvLyBSZXR1cm5zIGFuIHtBcnJheX0gb2Yge1RleHRFZGl0b3J9cy5cbiAgZ2V0VGV4dEVkaXRvcnMgKCkge1xuICAgIHJldHVybiB0aGlzLmdldFBhbmVJdGVtcygpLmZpbHRlcihpdGVtID0+IGl0ZW0gaW5zdGFuY2VvZiBUZXh0RWRpdG9yKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBHZXQgdGhlIHdvcmtzcGFjZSBjZW50ZXIncyBhY3RpdmUgaXRlbSBpZiBpdCBpcyBhIHtUZXh0RWRpdG9yfS5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtUZXh0RWRpdG9yfSBvciBgdW5kZWZpbmVkYCBpZiB0aGUgd29ya3NwYWNlIGNlbnRlcidzIGN1cnJlbnRcbiAgLy8gYWN0aXZlIGl0ZW0gaXMgbm90IGEge1RleHRFZGl0b3J9LlxuICBnZXRBY3RpdmVUZXh0RWRpdG9yICgpIHtcbiAgICBjb25zdCBhY3RpdmVJdGVtID0gdGhpcy5nZXRDZW50ZXIoKS5nZXRBY3RpdmVQYW5lSXRlbSgpXG4gICAgaWYgKGFjdGl2ZUl0ZW0gaW5zdGFuY2VvZiBUZXh0RWRpdG9yKSB7IHJldHVybiBhY3RpdmVJdGVtIH1cbiAgfVxuXG4gIC8vIFNhdmUgYWxsIHBhbmUgaXRlbXMuXG4gIHNhdmVBbGwgKCkge1xuICAgIHRoaXMuZ2V0UGFuZUNvbnRhaW5lcnMoKS5mb3JFYWNoKGNvbnRhaW5lciA9PiB7XG4gICAgICBjb250YWluZXIuc2F2ZUFsbCgpXG4gICAgfSlcbiAgfVxuXG4gIGNvbmZpcm1DbG9zZSAob3B0aW9ucykge1xuICAgIHJldHVybiBQcm9taXNlLmFsbCh0aGlzLmdldFBhbmVDb250YWluZXJzKCkubWFwKGNvbnRhaW5lciA9PlxuICAgICAgY29udGFpbmVyLmNvbmZpcm1DbG9zZShvcHRpb25zKVxuICAgICkpLnRoZW4oKHJlc3VsdHMpID0+ICFyZXN1bHRzLmluY2x1ZGVzKGZhbHNlKSlcbiAgfVxuXG4gIC8vIFNhdmUgdGhlIGFjdGl2ZSBwYW5lIGl0ZW0uXG4gIC8vXG4gIC8vIElmIHRoZSBhY3RpdmUgcGFuZSBpdGVtIGN1cnJlbnRseSBoYXMgYSBVUkkgYWNjb3JkaW5nIHRvIHRoZSBpdGVtJ3NcbiAgLy8gYC5nZXRVUklgIG1ldGhvZCwgY2FsbHMgYC5zYXZlYCBvbiB0aGUgaXRlbS4gT3RoZXJ3aXNlXG4gIC8vIHs6OnNhdmVBY3RpdmVQYW5lSXRlbUFzfSAjIHdpbGwgYmUgY2FsbGVkIGluc3RlYWQuIFRoaXMgbWV0aG9kIGRvZXMgbm90aGluZ1xuICAvLyBpZiB0aGUgYWN0aXZlIGl0ZW0gZG9lcyBub3QgaW1wbGVtZW50IGEgYC5zYXZlYCBtZXRob2QuXG4gIHNhdmVBY3RpdmVQYW5lSXRlbSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2VudGVyKCkuZ2V0QWN0aXZlUGFuZSgpLnNhdmVBY3RpdmVJdGVtKClcbiAgfVxuXG4gIC8vIFByb21wdCB0aGUgdXNlciBmb3IgYSBwYXRoIGFuZCBzYXZlIHRoZSBhY3RpdmUgcGFuZSBpdGVtIHRvIGl0LlxuICAvL1xuICAvLyBPcGVucyBhIG5hdGl2ZSBkaWFsb2cgd2hlcmUgdGhlIHVzZXIgc2VsZWN0cyBhIHBhdGggb24gZGlzaywgdGhlbiBjYWxsc1xuICAvLyBgLnNhdmVBc2Agb24gdGhlIGl0ZW0gd2l0aCB0aGUgc2VsZWN0ZWQgcGF0aC4gVGhpcyBtZXRob2QgZG9lcyBub3RoaW5nIGlmXG4gIC8vIHRoZSBhY3RpdmUgaXRlbSBkb2VzIG5vdCBpbXBsZW1lbnQgYSBgLnNhdmVBc2AgbWV0aG9kLlxuICBzYXZlQWN0aXZlUGFuZUl0ZW1BcyAoKSB7XG4gICAgdGhpcy5nZXRDZW50ZXIoKS5nZXRBY3RpdmVQYW5lKCkuc2F2ZUFjdGl2ZUl0ZW1BcygpXG4gIH1cblxuICAvLyBEZXN0cm95IChjbG9zZSkgdGhlIGFjdGl2ZSBwYW5lIGl0ZW0uXG4gIC8vXG4gIC8vIFJlbW92ZXMgdGhlIGFjdGl2ZSBwYW5lIGl0ZW0gYW5kIGNhbGxzIHRoZSBgLmRlc3Ryb3lgIG1ldGhvZCBvbiBpdCBpZiBvbmUgaXNcbiAgLy8gZGVmaW5lZC5cbiAgZGVzdHJveUFjdGl2ZVBhbmVJdGVtICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBY3RpdmVQYW5lKCkuZGVzdHJveUFjdGl2ZUl0ZW0oKVxuICB9XG5cbiAgLypcbiAgU2VjdGlvbjogUGFuZXNcbiAgKi9cblxuICAvLyBFeHRlbmRlZDogR2V0IHRoZSBtb3N0IHJlY2VudGx5IGZvY3VzZWQgcGFuZSBjb250YWluZXIuXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RG9ja30gb3IgdGhlIHtXb3Jrc3BhY2VDZW50ZXJ9LlxuICBnZXRBY3RpdmVQYW5lQ29udGFpbmVyICgpIHtcbiAgICByZXR1cm4gdGhpcy5hY3RpdmVQYW5lQ29udGFpbmVyXG4gIH1cblxuICAvLyBFeHRlbmRlZDogR2V0IGFsbCBwYW5lcyBpbiB0aGUgd29ya3NwYWNlLlxuICAvL1xuICAvLyBSZXR1cm5zIGFuIHtBcnJheX0gb2Yge1BhbmV9cy5cbiAgZ2V0UGFuZXMgKCkge1xuICAgIHJldHVybiBfLmZsYXR0ZW4odGhpcy5nZXRQYW5lQ29udGFpbmVycygpLm1hcChjb250YWluZXIgPT4gY29udGFpbmVyLmdldFBhbmVzKCkpKVxuICB9XG5cbiAgZ2V0VmlzaWJsZVBhbmVzICgpIHtcbiAgICByZXR1cm4gXy5mbGF0dGVuKHRoaXMuZ2V0VmlzaWJsZVBhbmVDb250YWluZXJzKCkubWFwKGNvbnRhaW5lciA9PiBjb250YWluZXIuZ2V0UGFuZXMoKSkpXG4gIH1cblxuICAvLyBFeHRlbmRlZDogR2V0IHRoZSBhY3RpdmUge1BhbmV9LlxuICAvL1xuICAvLyBSZXR1cm5zIGEge1BhbmV9LlxuICBnZXRBY3RpdmVQYW5lICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBY3RpdmVQYW5lQ29udGFpbmVyKCkuZ2V0QWN0aXZlUGFuZSgpXG4gIH1cblxuICAvLyBFeHRlbmRlZDogTWFrZSB0aGUgbmV4dCBwYW5lIGFjdGl2ZS5cbiAgYWN0aXZhdGVOZXh0UGFuZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWN0aXZlUGFuZUNvbnRhaW5lcigpLmFjdGl2YXRlTmV4dFBhbmUoKVxuICB9XG5cbiAgLy8gRXh0ZW5kZWQ6IE1ha2UgdGhlIHByZXZpb3VzIHBhbmUgYWN0aXZlLlxuICBhY3RpdmF0ZVByZXZpb3VzUGFuZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWN0aXZlUGFuZUNvbnRhaW5lcigpLmFjdGl2YXRlUHJldmlvdXNQYW5lKClcbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBHZXQgdGhlIGZpcnN0IHBhbmUgY29udGFpbmVyIHRoYXQgY29udGFpbnMgYW4gaXRlbSB3aXRoIHRoZSBnaXZlblxuICAvLyBVUkkuXG4gIC8vXG4gIC8vICogYHVyaWAge1N0cmluZ30gdXJpXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RG9ja30sIHRoZSB7V29ya3NwYWNlQ2VudGVyfSwgb3IgYHVuZGVmaW5lZGAgaWYgbm8gaXRlbSBleGlzdHNcbiAgLy8gd2l0aCB0aGUgZ2l2ZW4gVVJJLlxuICBwYW5lQ29udGFpbmVyRm9yVVJJICh1cmkpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYW5lQ29udGFpbmVycygpLmZpbmQoY29udGFpbmVyID0+IGNvbnRhaW5lci5wYW5lRm9yVVJJKHVyaSkpXG4gIH1cblxuICAvLyBFeHRlbmRlZDogR2V0IHRoZSBmaXJzdCBwYW5lIGNvbnRhaW5lciB0aGF0IGNvbnRhaW5zIHRoZSBnaXZlbiBpdGVtLlxuICAvL1xuICAvLyAqIGBpdGVtYCB0aGUgSXRlbSB0aGF0IHRoZSByZXR1cm5lZCBwYW5lIGNvbnRhaW5lciBtdXN0IGNvbnRhaW4uXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7RG9ja30sIHRoZSB7V29ya3NwYWNlQ2VudGVyfSwgb3IgYHVuZGVmaW5lZGAgaWYgbm8gaXRlbSBleGlzdHNcbiAgLy8gd2l0aCB0aGUgZ2l2ZW4gVVJJLlxuICBwYW5lQ29udGFpbmVyRm9ySXRlbSAodXJpKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UGFuZUNvbnRhaW5lcnMoKS5maW5kKGNvbnRhaW5lciA9PiBjb250YWluZXIucGFuZUZvckl0ZW0odXJpKSlcbiAgfVxuXG4gIC8vIEV4dGVuZGVkOiBHZXQgdGhlIGZpcnN0IHtQYW5lfSB0aGF0IGNvbnRhaW5zIGFuIGl0ZW0gd2l0aCB0aGUgZ2l2ZW4gVVJJLlxuICAvL1xuICAvLyAqIGB1cmlgIHtTdHJpbmd9IHVyaVxuICAvL1xuICAvLyBSZXR1cm5zIGEge1BhbmV9IG9yIGB1bmRlZmluZWRgIGlmIG5vIGl0ZW0gZXhpc3RzIHdpdGggdGhlIGdpdmVuIFVSSS5cbiAgcGFuZUZvclVSSSAodXJpKSB7XG4gICAgZm9yIChsZXQgbG9jYXRpb24gb2YgdGhpcy5nZXRQYW5lQ29udGFpbmVycygpKSB7XG4gICAgICBjb25zdCBwYW5lID0gbG9jYXRpb24ucGFuZUZvclVSSSh1cmkpXG4gICAgICBpZiAocGFuZSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBwYW5lXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gRXh0ZW5kZWQ6IEdldCB0aGUge1BhbmV9IGNvbnRhaW5pbmcgdGhlIGdpdmVuIGl0ZW0uXG4gIC8vXG4gIC8vICogYGl0ZW1gIHRoZSBJdGVtIHRoYXQgdGhlIHJldHVybmVkIHBhbmUgbXVzdCBjb250YWluLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge1BhbmV9IG9yIGB1bmRlZmluZWRgIGlmIG5vIHBhbmUgZXhpc3RzIGZvciB0aGUgZ2l2ZW4gaXRlbS5cbiAgcGFuZUZvckl0ZW0gKGl0ZW0pIHtcbiAgICBmb3IgKGxldCBsb2NhdGlvbiBvZiB0aGlzLmdldFBhbmVDb250YWluZXJzKCkpIHtcbiAgICAgIGNvbnN0IHBhbmUgPSBsb2NhdGlvbi5wYW5lRm9ySXRlbShpdGVtKVxuICAgICAgaWYgKHBhbmUgIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gcGFuZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIERlc3Ryb3kgKGNsb3NlKSB0aGUgYWN0aXZlIHBhbmUuXG4gIGRlc3Ryb3lBY3RpdmVQYW5lICgpIHtcbiAgICBjb25zdCBhY3RpdmVQYW5lID0gdGhpcy5nZXRBY3RpdmVQYW5lKClcbiAgICBpZiAoYWN0aXZlUGFuZSAhPSBudWxsKSB7XG4gICAgICBhY3RpdmVQYW5lLmRlc3Ryb3koKVxuICAgIH1cbiAgfVxuXG4gIC8vIENsb3NlIHRoZSBhY3RpdmUgY2VudGVyIHBhbmUgaXRlbSwgb3IgdGhlIGFjdGl2ZSBjZW50ZXIgcGFuZSBpZiBpdCBpc1xuICAvLyBlbXB0eSwgb3IgdGhlIGN1cnJlbnQgd2luZG93IGlmIHRoZXJlIGlzIG9ubHkgdGhlIGVtcHR5IHJvb3QgcGFuZS5cbiAgY2xvc2VBY3RpdmVQYW5lSXRlbU9yRW1wdHlQYW5lT3JXaW5kb3cgKCkge1xuICAgIGlmICh0aGlzLmdldENlbnRlcigpLmdldEFjdGl2ZVBhbmVJdGVtKCkgIT0gbnVsbCkge1xuICAgICAgdGhpcy5nZXRDZW50ZXIoKS5nZXRBY3RpdmVQYW5lKCkuZGVzdHJveUFjdGl2ZUl0ZW0oKVxuICAgIH0gZWxzZSBpZiAodGhpcy5nZXRDZW50ZXIoKS5nZXRQYW5lcygpLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRoaXMuZ2V0Q2VudGVyKCkuZGVzdHJveUFjdGl2ZVBhbmUoKVxuICAgIH0gZWxzZSBpZiAodGhpcy5jb25maWcuZ2V0KCdjb3JlLmNsb3NlRW1wdHlXaW5kb3dzJykpIHtcbiAgICAgIGF0b20uY2xvc2UoKVxuICAgIH1cbiAgfVxuXG4gIC8vIEluY3JlYXNlIHRoZSBlZGl0b3IgZm9udCBzaXplIGJ5IDFweC5cbiAgaW5jcmVhc2VGb250U2l6ZSAoKSB7XG4gICAgdGhpcy5jb25maWcuc2V0KCdlZGl0b3IuZm9udFNpemUnLCB0aGlzLmNvbmZpZy5nZXQoJ2VkaXRvci5mb250U2l6ZScpICsgMSlcbiAgfVxuXG4gIC8vIERlY3JlYXNlIHRoZSBlZGl0b3IgZm9udCBzaXplIGJ5IDFweC5cbiAgZGVjcmVhc2VGb250U2l6ZSAoKSB7XG4gICAgY29uc3QgZm9udFNpemUgPSB0aGlzLmNvbmZpZy5nZXQoJ2VkaXRvci5mb250U2l6ZScpXG4gICAgaWYgKGZvbnRTaXplID4gMSkge1xuICAgICAgdGhpcy5jb25maWcuc2V0KCdlZGl0b3IuZm9udFNpemUnLCBmb250U2l6ZSAtIDEpXG4gICAgfVxuICB9XG5cbiAgLy8gUmVzdG9yZSB0byB0aGUgd2luZG93J3Mgb3JpZ2luYWwgZWRpdG9yIGZvbnQgc2l6ZS5cbiAgcmVzZXRGb250U2l6ZSAoKSB7XG4gICAgaWYgKHRoaXMub3JpZ2luYWxGb250U2l6ZSkge1xuICAgICAgdGhpcy5jb25maWcuc2V0KCdlZGl0b3IuZm9udFNpemUnLCB0aGlzLm9yaWdpbmFsRm9udFNpemUpXG4gICAgfVxuICB9XG5cbiAgc3Vic2NyaWJlVG9Gb250U2l6ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLm9uRGlkQ2hhbmdlKCdlZGl0b3IuZm9udFNpemUnLCAoe29sZFZhbHVlfSkgPT4ge1xuICAgICAgaWYgKHRoaXMub3JpZ2luYWxGb250U2l6ZSA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMub3JpZ2luYWxGb250U2l6ZSA9IG9sZFZhbHVlXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8vIFJlbW92ZXMgdGhlIGl0ZW0ncyB1cmkgZnJvbSB0aGUgbGlzdCBvZiBwb3RlbnRpYWwgaXRlbXMgdG8gcmVvcGVuLlxuICBpdGVtT3BlbmVkIChpdGVtKSB7XG4gICAgbGV0IHVyaVxuICAgIGlmICh0eXBlb2YgaXRlbS5nZXRVUkkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHVyaSA9IGl0ZW0uZ2V0VVJJKClcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBpdGVtLmdldFVyaSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdXJpID0gaXRlbS5nZXRVcmkoKVxuICAgIH1cblxuICAgIGlmICh1cmkgIT0gbnVsbCkge1xuICAgICAgXy5yZW1vdmUodGhpcy5kZXN0cm95ZWRJdGVtVVJJcywgdXJpKVxuICAgIH1cbiAgfVxuXG4gIC8vIEFkZHMgdGhlIGRlc3Ryb3llZCBpdGVtJ3MgdXJpIHRvIHRoZSBsaXN0IG9mIGl0ZW1zIHRvIHJlb3Blbi5cbiAgZGlkRGVzdHJveVBhbmVJdGVtICh7aXRlbX0pIHtcbiAgICBsZXQgdXJpXG4gICAgaWYgKHR5cGVvZiBpdGVtLmdldFVSSSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdXJpID0gaXRlbS5nZXRVUkkoKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGl0ZW0uZ2V0VXJpID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB1cmkgPSBpdGVtLmdldFVyaSgpXG4gICAgfVxuXG4gICAgaWYgKHVyaSAhPSBudWxsKSB7XG4gICAgICB0aGlzLmRlc3Ryb3llZEl0ZW1VUklzLnB1c2godXJpKVxuICAgIH1cbiAgfVxuXG4gIC8vIENhbGxlZCBieSBNb2RlbCBzdXBlcmNsYXNzIHdoZW4gZGVzdHJveWVkXG4gIGRlc3Ryb3llZCAoKSB7XG4gICAgdGhpcy5wYW5lQ29udGFpbmVycy5jZW50ZXIuZGVzdHJveSgpXG4gICAgdGhpcy5wYW5lQ29udGFpbmVycy5sZWZ0LmRlc3Ryb3koKVxuICAgIHRoaXMucGFuZUNvbnRhaW5lcnMucmlnaHQuZGVzdHJveSgpXG4gICAgdGhpcy5wYW5lQ29udGFpbmVycy5ib3R0b20uZGVzdHJveSgpXG4gICAgdGhpcy5jYW5jZWxTdG9wcGVkQ2hhbmdpbmdBY3RpdmVQYW5lSXRlbVRpbWVvdXQoKVxuICAgIGlmICh0aGlzLmFjdGl2ZUl0ZW1TdWJzY3JpcHRpb25zICE9IG51bGwpIHtcbiAgICAgIHRoaXMuYWN0aXZlSXRlbVN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgfVxuICB9XG5cbiAgLypcbiAgU2VjdGlvbjogUGFuZSBMb2NhdGlvbnNcbiAgKi9cblxuICAvLyBFc3NlbnRpYWw6IEdldCB0aGUge1dvcmtzcGFjZUNlbnRlcn0gYXQgdGhlIGNlbnRlciBvZiB0aGUgZWRpdG9yIHdpbmRvdy5cbiAgZ2V0Q2VudGVyICgpIHtcbiAgICByZXR1cm4gdGhpcy5wYW5lQ29udGFpbmVycy5jZW50ZXJcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogR2V0IHRoZSB7RG9ja30gdG8gdGhlIGxlZnQgb2YgdGhlIGVkaXRvciB3aW5kb3cuXG4gIGdldExlZnREb2NrICgpIHtcbiAgICByZXR1cm4gdGhpcy5wYW5lQ29udGFpbmVycy5sZWZ0XG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEdldCB0aGUge0RvY2t9IHRvIHRoZSByaWdodCBvZiB0aGUgZWRpdG9yIHdpbmRvdy5cbiAgZ2V0UmlnaHREb2NrICgpIHtcbiAgICByZXR1cm4gdGhpcy5wYW5lQ29udGFpbmVycy5yaWdodFxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBHZXQgdGhlIHtEb2NrfSBiZWxvdyB0aGUgZWRpdG9yIHdpbmRvdy5cbiAgZ2V0Qm90dG9tRG9jayAoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFuZUNvbnRhaW5lcnMuYm90dG9tXG4gIH1cblxuICBnZXRQYW5lQ29udGFpbmVycyAoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHRoaXMucGFuZUNvbnRhaW5lcnMuY2VudGVyLFxuICAgICAgdGhpcy5wYW5lQ29udGFpbmVycy5sZWZ0LFxuICAgICAgdGhpcy5wYW5lQ29udGFpbmVycy5yaWdodCxcbiAgICAgIHRoaXMucGFuZUNvbnRhaW5lcnMuYm90dG9tXG4gICAgXVxuICB9XG5cbiAgZ2V0VmlzaWJsZVBhbmVDb250YWluZXJzICgpIHtcbiAgICBjb25zdCBjZW50ZXIgPSB0aGlzLmdldENlbnRlcigpXG4gICAgcmV0dXJuIGF0b20ud29ya3NwYWNlLmdldFBhbmVDb250YWluZXJzKClcbiAgICAgIC5maWx0ZXIoY29udGFpbmVyID0+IGNvbnRhaW5lciA9PT0gY2VudGVyIHx8IGNvbnRhaW5lci5pc1Zpc2libGUoKSlcbiAgfVxuXG4gIC8qXG4gIFNlY3Rpb246IFBhbmVsc1xuXG4gIFBhbmVscyBhcmUgdXNlZCB0byBkaXNwbGF5IFVJIHJlbGF0ZWQgdG8gYW4gZWRpdG9yIHdpbmRvdy4gVGhleSBhcmUgcGxhY2VkIGF0IG9uZSBvZiB0aGUgZm91clxuICBlZGdlcyBvZiB0aGUgd2luZG93OiBsZWZ0LCByaWdodCwgdG9wIG9yIGJvdHRvbS4gSWYgdGhlcmUgYXJlIG11bHRpcGxlIHBhbmVscyBvbiB0aGUgc2FtZSB3aW5kb3dcbiAgZWRnZSB0aGV5IGFyZSBzdGFja2VkIGluIG9yZGVyIG9mIHByaW9yaXR5OiBoaWdoZXIgcHJpb3JpdHkgaXMgY2xvc2VyIHRvIHRoZSBjZW50ZXIsIGxvd2VyXG4gIHByaW9yaXR5IHRvd2FyZHMgdGhlIGVkZ2UuXG5cbiAgKk5vdGU6KiBJZiB5b3VyIHBhbmVsIGNoYW5nZXMgaXRzIHNpemUgdGhyb3VnaG91dCBpdHMgbGlmZXRpbWUsIGNvbnNpZGVyIGdpdmluZyBpdCBhIGhpZ2hlclxuICBwcmlvcml0eSwgYWxsb3dpbmcgZml4ZWQgc2l6ZSBwYW5lbHMgdG8gYmUgY2xvc2VyIHRvIHRoZSBlZGdlLiBUaGlzIGFsbG93cyBjb250cm9sIHRhcmdldHMgdG9cbiAgcmVtYWluIG1vcmUgc3RhdGljIGZvciBlYXNpZXIgdGFyZ2V0aW5nIGJ5IHVzZXJzIHRoYXQgZW1wbG95IG1pY2Ugb3IgdHJhY2twYWRzLiAoU2VlXG4gIFthdG9tL2F0b20jNDgzNF0oaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9pc3N1ZXMvNDgzNCkgZm9yIGRpc2N1c3Npb24uKVxuICAqL1xuXG4gIC8vIEVzc2VudGlhbDogR2V0IGFuIHtBcnJheX0gb2YgYWxsIHRoZSBwYW5lbCBpdGVtcyBhdCB0aGUgYm90dG9tIG9mIHRoZSBlZGl0b3Igd2luZG93LlxuICBnZXRCb3R0b21QYW5lbHMgKCkge1xuICAgIHJldHVybiB0aGlzLmdldFBhbmVscygnYm90dG9tJylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogQWRkcyBhIHBhbmVsIGl0ZW0gdG8gdGhlIGJvdHRvbSBvZiB0aGUgZWRpdG9yIHdpbmRvdy5cbiAgLy9cbiAgLy8gKiBgb3B0aW9uc2Age09iamVjdH1cbiAgLy8gICAqIGBpdGVtYCBZb3VyIHBhbmVsIGNvbnRlbnQuIEl0IGNhbiBiZSBET00gZWxlbWVudCwgYSBqUXVlcnkgZWxlbWVudCwgb3JcbiAgLy8gICAgIGEgbW9kZWwgd2l0aCBhIHZpZXcgcmVnaXN0ZXJlZCB2aWEge1ZpZXdSZWdpc3RyeTo6YWRkVmlld1Byb3ZpZGVyfS4gV2UgcmVjb21tZW5kIHRoZVxuICAvLyAgICAgbGF0dGVyLiBTZWUge1ZpZXdSZWdpc3RyeTo6YWRkVmlld1Byb3ZpZGVyfSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgLy8gICAqIGB2aXNpYmxlYCAob3B0aW9uYWwpIHtCb29sZWFufSBmYWxzZSBpZiB5b3Ugd2FudCB0aGUgcGFuZWwgdG8gaW5pdGlhbGx5IGJlIGhpZGRlblxuICAvLyAgICAgKGRlZmF1bHQ6IHRydWUpXG4gIC8vICAgKiBgcHJpb3JpdHlgIChvcHRpb25hbCkge051bWJlcn0gRGV0ZXJtaW5lcyBzdGFja2luZyBvcmRlci4gTG93ZXIgcHJpb3JpdHkgaXRlbXMgYXJlXG4gIC8vICAgICBmb3JjZWQgY2xvc2VyIHRvIHRoZSBlZGdlcyBvZiB0aGUgd2luZG93LiAoZGVmYXVsdDogMTAwKVxuICAvL1xuICAvLyBSZXR1cm5zIGEge1BhbmVsfVxuICBhZGRCb3R0b21QYW5lbCAob3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLmFkZFBhbmVsKCdib3R0b20nLCBvcHRpb25zKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBHZXQgYW4ge0FycmF5fSBvZiBhbGwgdGhlIHBhbmVsIGl0ZW1zIHRvIHRoZSBsZWZ0IG9mIHRoZSBlZGl0b3Igd2luZG93LlxuICBnZXRMZWZ0UGFuZWxzICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYW5lbHMoJ2xlZnQnKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBBZGRzIGEgcGFuZWwgaXRlbSB0byB0aGUgbGVmdCBvZiB0aGUgZWRpdG9yIHdpbmRvdy5cbiAgLy9cbiAgLy8gKiBgb3B0aW9uc2Age09iamVjdH1cbiAgLy8gICAqIGBpdGVtYCBZb3VyIHBhbmVsIGNvbnRlbnQuIEl0IGNhbiBiZSBET00gZWxlbWVudCwgYSBqUXVlcnkgZWxlbWVudCwgb3JcbiAgLy8gICAgIGEgbW9kZWwgd2l0aCBhIHZpZXcgcmVnaXN0ZXJlZCB2aWEge1ZpZXdSZWdpc3RyeTo6YWRkVmlld1Byb3ZpZGVyfS4gV2UgcmVjb21tZW5kIHRoZVxuICAvLyAgICAgbGF0dGVyLiBTZWUge1ZpZXdSZWdpc3RyeTo6YWRkVmlld1Byb3ZpZGVyfSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgLy8gICAqIGB2aXNpYmxlYCAob3B0aW9uYWwpIHtCb29sZWFufSBmYWxzZSBpZiB5b3Ugd2FudCB0aGUgcGFuZWwgdG8gaW5pdGlhbGx5IGJlIGhpZGRlblxuICAvLyAgICAgKGRlZmF1bHQ6IHRydWUpXG4gIC8vICAgKiBgcHJpb3JpdHlgIChvcHRpb25hbCkge051bWJlcn0gRGV0ZXJtaW5lcyBzdGFja2luZyBvcmRlci4gTG93ZXIgcHJpb3JpdHkgaXRlbXMgYXJlXG4gIC8vICAgICBmb3JjZWQgY2xvc2VyIHRvIHRoZSBlZGdlcyBvZiB0aGUgd2luZG93LiAoZGVmYXVsdDogMTAwKVxuICAvL1xuICAvLyBSZXR1cm5zIGEge1BhbmVsfVxuICBhZGRMZWZ0UGFuZWwgKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRQYW5lbCgnbGVmdCcsIG9wdGlvbnMpXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEdldCBhbiB7QXJyYXl9IG9mIGFsbCB0aGUgcGFuZWwgaXRlbXMgdG8gdGhlIHJpZ2h0IG9mIHRoZSBlZGl0b3Igd2luZG93LlxuICBnZXRSaWdodFBhbmVscyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UGFuZWxzKCdyaWdodCcpXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEFkZHMgYSBwYW5lbCBpdGVtIHRvIHRoZSByaWdodCBvZiB0aGUgZWRpdG9yIHdpbmRvdy5cbiAgLy9cbiAgLy8gKiBgb3B0aW9uc2Age09iamVjdH1cbiAgLy8gICAqIGBpdGVtYCBZb3VyIHBhbmVsIGNvbnRlbnQuIEl0IGNhbiBiZSBET00gZWxlbWVudCwgYSBqUXVlcnkgZWxlbWVudCwgb3JcbiAgLy8gICAgIGEgbW9kZWwgd2l0aCBhIHZpZXcgcmVnaXN0ZXJlZCB2aWEge1ZpZXdSZWdpc3RyeTo6YWRkVmlld1Byb3ZpZGVyfS4gV2UgcmVjb21tZW5kIHRoZVxuICAvLyAgICAgbGF0dGVyLiBTZWUge1ZpZXdSZWdpc3RyeTo6YWRkVmlld1Byb3ZpZGVyfSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgLy8gICAqIGB2aXNpYmxlYCAob3B0aW9uYWwpIHtCb29sZWFufSBmYWxzZSBpZiB5b3Ugd2FudCB0aGUgcGFuZWwgdG8gaW5pdGlhbGx5IGJlIGhpZGRlblxuICAvLyAgICAgKGRlZmF1bHQ6IHRydWUpXG4gIC8vICAgKiBgcHJpb3JpdHlgIChvcHRpb25hbCkge051bWJlcn0gRGV0ZXJtaW5lcyBzdGFja2luZyBvcmRlci4gTG93ZXIgcHJpb3JpdHkgaXRlbXMgYXJlXG4gIC8vICAgICBmb3JjZWQgY2xvc2VyIHRvIHRoZSBlZGdlcyBvZiB0aGUgd2luZG93LiAoZGVmYXVsdDogMTAwKVxuICAvL1xuICAvLyBSZXR1cm5zIGEge1BhbmVsfVxuICBhZGRSaWdodFBhbmVsIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkUGFuZWwoJ3JpZ2h0Jywgb3B0aW9ucylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogR2V0IGFuIHtBcnJheX0gb2YgYWxsIHRoZSBwYW5lbCBpdGVtcyBhdCB0aGUgdG9wIG9mIHRoZSBlZGl0b3Igd2luZG93LlxuICBnZXRUb3BQYW5lbHMgKCkge1xuICAgIHJldHVybiB0aGlzLmdldFBhbmVscygndG9wJylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogQWRkcyBhIHBhbmVsIGl0ZW0gdG8gdGhlIHRvcCBvZiB0aGUgZWRpdG9yIHdpbmRvdyBhYm92ZSB0aGUgdGFicy5cbiAgLy9cbiAgLy8gKiBgb3B0aW9uc2Age09iamVjdH1cbiAgLy8gICAqIGBpdGVtYCBZb3VyIHBhbmVsIGNvbnRlbnQuIEl0IGNhbiBiZSBET00gZWxlbWVudCwgYSBqUXVlcnkgZWxlbWVudCwgb3JcbiAgLy8gICAgIGEgbW9kZWwgd2l0aCBhIHZpZXcgcmVnaXN0ZXJlZCB2aWEge1ZpZXdSZWdpc3RyeTo6YWRkVmlld1Byb3ZpZGVyfS4gV2UgcmVjb21tZW5kIHRoZVxuICAvLyAgICAgbGF0dGVyLiBTZWUge1ZpZXdSZWdpc3RyeTo6YWRkVmlld1Byb3ZpZGVyfSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgLy8gICAqIGB2aXNpYmxlYCAob3B0aW9uYWwpIHtCb29sZWFufSBmYWxzZSBpZiB5b3Ugd2FudCB0aGUgcGFuZWwgdG8gaW5pdGlhbGx5IGJlIGhpZGRlblxuICAvLyAgICAgKGRlZmF1bHQ6IHRydWUpXG4gIC8vICAgKiBgcHJpb3JpdHlgIChvcHRpb25hbCkge051bWJlcn0gRGV0ZXJtaW5lcyBzdGFja2luZyBvcmRlci4gTG93ZXIgcHJpb3JpdHkgaXRlbXMgYXJlXG4gIC8vICAgICBmb3JjZWQgY2xvc2VyIHRvIHRoZSBlZGdlcyBvZiB0aGUgd2luZG93LiAoZGVmYXVsdDogMTAwKVxuICAvL1xuICAvLyBSZXR1cm5zIGEge1BhbmVsfVxuICBhZGRUb3BQYW5lbCAob3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLmFkZFBhbmVsKCd0b3AnLCBvcHRpb25zKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBHZXQgYW4ge0FycmF5fSBvZiBhbGwgdGhlIHBhbmVsIGl0ZW1zIGluIHRoZSBoZWFkZXIuXG4gIGdldEhlYWRlclBhbmVscyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UGFuZWxzKCdoZWFkZXInKVxuICB9XG5cbiAgLy8gRXNzZW50aWFsOiBBZGRzIGEgcGFuZWwgaXRlbSB0byB0aGUgaGVhZGVyLlxuICAvL1xuICAvLyAqIGBvcHRpb25zYCB7T2JqZWN0fVxuICAvLyAgICogYGl0ZW1gIFlvdXIgcGFuZWwgY29udGVudC4gSXQgY2FuIGJlIERPTSBlbGVtZW50LCBhIGpRdWVyeSBlbGVtZW50LCBvclxuICAvLyAgICAgYSBtb2RlbCB3aXRoIGEgdmlldyByZWdpc3RlcmVkIHZpYSB7Vmlld1JlZ2lzdHJ5OjphZGRWaWV3UHJvdmlkZXJ9LiBXZSByZWNvbW1lbmQgdGhlXG4gIC8vICAgICBsYXR0ZXIuIFNlZSB7Vmlld1JlZ2lzdHJ5OjphZGRWaWV3UHJvdmlkZXJ9IGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAvLyAgICogYHZpc2libGVgIChvcHRpb25hbCkge0Jvb2xlYW59IGZhbHNlIGlmIHlvdSB3YW50IHRoZSBwYW5lbCB0byBpbml0aWFsbHkgYmUgaGlkZGVuXG4gIC8vICAgICAoZGVmYXVsdDogdHJ1ZSlcbiAgLy8gICAqIGBwcmlvcml0eWAgKG9wdGlvbmFsKSB7TnVtYmVyfSBEZXRlcm1pbmVzIHN0YWNraW5nIG9yZGVyLiBMb3dlciBwcmlvcml0eSBpdGVtcyBhcmVcbiAgLy8gICAgIGZvcmNlZCBjbG9zZXIgdG8gdGhlIGVkZ2VzIG9mIHRoZSB3aW5kb3cuIChkZWZhdWx0OiAxMDApXG4gIC8vXG4gIC8vIFJldHVybnMgYSB7UGFuZWx9XG4gIGFkZEhlYWRlclBhbmVsIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkUGFuZWwoJ2hlYWRlcicsIG9wdGlvbnMpXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEdldCBhbiB7QXJyYXl9IG9mIGFsbCB0aGUgcGFuZWwgaXRlbXMgaW4gdGhlIGZvb3Rlci5cbiAgZ2V0Rm9vdGVyUGFuZWxzICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYW5lbHMoJ2Zvb3RlcicpXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEFkZHMgYSBwYW5lbCBpdGVtIHRvIHRoZSBmb290ZXIuXG4gIC8vXG4gIC8vICogYG9wdGlvbnNgIHtPYmplY3R9XG4gIC8vICAgKiBgaXRlbWAgWW91ciBwYW5lbCBjb250ZW50LiBJdCBjYW4gYmUgRE9NIGVsZW1lbnQsIGEgalF1ZXJ5IGVsZW1lbnQsIG9yXG4gIC8vICAgICBhIG1vZGVsIHdpdGggYSB2aWV3IHJlZ2lzdGVyZWQgdmlhIHtWaWV3UmVnaXN0cnk6OmFkZFZpZXdQcm92aWRlcn0uIFdlIHJlY29tbWVuZCB0aGVcbiAgLy8gICAgIGxhdHRlci4gU2VlIHtWaWV3UmVnaXN0cnk6OmFkZFZpZXdQcm92aWRlcn0gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gIC8vICAgKiBgdmlzaWJsZWAgKG9wdGlvbmFsKSB7Qm9vbGVhbn0gZmFsc2UgaWYgeW91IHdhbnQgdGhlIHBhbmVsIHRvIGluaXRpYWxseSBiZSBoaWRkZW5cbiAgLy8gICAgIChkZWZhdWx0OiB0cnVlKVxuICAvLyAgICogYHByaW9yaXR5YCAob3B0aW9uYWwpIHtOdW1iZXJ9IERldGVybWluZXMgc3RhY2tpbmcgb3JkZXIuIExvd2VyIHByaW9yaXR5IGl0ZW1zIGFyZVxuICAvLyAgICAgZm9yY2VkIGNsb3NlciB0byB0aGUgZWRnZXMgb2YgdGhlIHdpbmRvdy4gKGRlZmF1bHQ6IDEwMClcbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtQYW5lbH1cbiAgYWRkRm9vdGVyUGFuZWwgKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5hZGRQYW5lbCgnZm9vdGVyJywgb3B0aW9ucylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogR2V0IGFuIHtBcnJheX0gb2YgYWxsIHRoZSBtb2RhbCBwYW5lbCBpdGVtc1xuICBnZXRNb2RhbFBhbmVscyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UGFuZWxzKCdtb2RhbCcpXG4gIH1cblxuICAvLyBFc3NlbnRpYWw6IEFkZHMgYSBwYW5lbCBpdGVtIGFzIGEgbW9kYWwgZGlhbG9nLlxuICAvL1xuICAvLyAqIGBvcHRpb25zYCB7T2JqZWN0fVxuICAvLyAgICogYGl0ZW1gIFlvdXIgcGFuZWwgY29udGVudC4gSXQgY2FuIGJlIGEgRE9NIGVsZW1lbnQsIGEgalF1ZXJ5IGVsZW1lbnQsIG9yXG4gIC8vICAgICBhIG1vZGVsIHdpdGggYSB2aWV3IHJlZ2lzdGVyZWQgdmlhIHtWaWV3UmVnaXN0cnk6OmFkZFZpZXdQcm92aWRlcn0uIFdlIHJlY29tbWVuZCB0aGVcbiAgLy8gICAgIG1vZGVsIG9wdGlvbi4gU2VlIHtWaWV3UmVnaXN0cnk6OmFkZFZpZXdQcm92aWRlcn0gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gIC8vICAgKiBgdmlzaWJsZWAgKG9wdGlvbmFsKSB7Qm9vbGVhbn0gZmFsc2UgaWYgeW91IHdhbnQgdGhlIHBhbmVsIHRvIGluaXRpYWxseSBiZSBoaWRkZW5cbiAgLy8gICAgIChkZWZhdWx0OiB0cnVlKVxuICAvLyAgICogYHByaW9yaXR5YCAob3B0aW9uYWwpIHtOdW1iZXJ9IERldGVybWluZXMgc3RhY2tpbmcgb3JkZXIuIExvd2VyIHByaW9yaXR5IGl0ZW1zIGFyZVxuICAvLyAgICAgZm9yY2VkIGNsb3NlciB0byB0aGUgZWRnZXMgb2YgdGhlIHdpbmRvdy4gKGRlZmF1bHQ6IDEwMClcbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtQYW5lbH1cbiAgYWRkTW9kYWxQYW5lbCAob3B0aW9ucyA9IHt9KSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkUGFuZWwoJ21vZGFsJywgb3B0aW9ucylcbiAgfVxuXG4gIC8vIEVzc2VudGlhbDogUmV0dXJucyB0aGUge1BhbmVsfSBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIGl0ZW0uIFJldHVybnNcbiAgLy8gYG51bGxgIHdoZW4gdGhlIGl0ZW0gaGFzIG5vIHBhbmVsLlxuICAvL1xuICAvLyAqIGBpdGVtYCBJdGVtIHRoZSBwYW5lbCBjb250YWluc1xuICBwYW5lbEZvckl0ZW0gKGl0ZW0pIHtcbiAgICBmb3IgKGxldCBsb2NhdGlvbiBpbiB0aGlzLnBhbmVsQ29udGFpbmVycykge1xuICAgICAgY29uc3QgY29udGFpbmVyID0gdGhpcy5wYW5lbENvbnRhaW5lcnNbbG9jYXRpb25dXG4gICAgICBjb25zdCBwYW5lbCA9IGNvbnRhaW5lci5wYW5lbEZvckl0ZW0oaXRlbSlcbiAgICAgIGlmIChwYW5lbCAhPSBudWxsKSB7IHJldHVybiBwYW5lbCB9XG4gICAgfVxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBnZXRQYW5lbHMgKGxvY2F0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMucGFuZWxDb250YWluZXJzW2xvY2F0aW9uXS5nZXRQYW5lbHMoKVxuICB9XG5cbiAgYWRkUGFuZWwgKGxvY2F0aW9uLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMgPT0gbnVsbCkgeyBvcHRpb25zID0ge30gfVxuICAgIHJldHVybiB0aGlzLnBhbmVsQ29udGFpbmVyc1tsb2NhdGlvbl0uYWRkUGFuZWwobmV3IFBhbmVsKG9wdGlvbnMsIHRoaXMudmlld1JlZ2lzdHJ5KSlcbiAgfVxuXG4gIC8qXG4gIFNlY3Rpb246IFNlYXJjaGluZyBhbmQgUmVwbGFjaW5nXG4gICovXG5cbiAgLy8gUHVibGljOiBQZXJmb3JtcyBhIHNlYXJjaCBhY3Jvc3MgYWxsIGZpbGVzIGluIHRoZSB3b3Jrc3BhY2UuXG4gIC8vXG4gIC8vICogYHJlZ2V4YCB7UmVnRXhwfSB0byBzZWFyY2ggd2l0aC5cbiAgLy8gKiBgb3B0aW9uc2AgKG9wdGlvbmFsKSB7T2JqZWN0fVxuICAvLyAgICogYHBhdGhzYCBBbiB7QXJyYXl9IG9mIGdsb2IgcGF0dGVybnMgdG8gc2VhcmNoIHdpdGhpbi5cbiAgLy8gICAqIGBvblBhdGhzU2VhcmNoZWRgIChvcHRpb25hbCkge0Z1bmN0aW9ufSB0byBiZSBwZXJpb2RpY2FsbHkgY2FsbGVkXG4gIC8vICAgICB3aXRoIG51bWJlciBvZiBwYXRocyBzZWFyY2hlZC5cbiAgLy8gICAqIGBsZWFkaW5nQ29udGV4dExpbmVDb3VudGAge051bWJlcn0gZGVmYXVsdCBgMGA7IFRoZSBudW1iZXIgb2YgbGluZXNcbiAgLy8gICAgICBiZWZvcmUgdGhlIG1hdGNoZWQgbGluZSB0byBpbmNsdWRlIGluIHRoZSByZXN1bHRzIG9iamVjdC5cbiAgLy8gICAqIGB0cmFpbGluZ0NvbnRleHRMaW5lQ291bnRgIHtOdW1iZXJ9IGRlZmF1bHQgYDBgOyBUaGUgbnVtYmVyIG9mIGxpbmVzXG4gIC8vICAgICAgYWZ0ZXIgdGhlIG1hdGNoZWQgbGluZSB0byBpbmNsdWRlIGluIHRoZSByZXN1bHRzIG9iamVjdC5cbiAgLy8gKiBgaXRlcmF0b3JgIHtGdW5jdGlvbn0gY2FsbGJhY2sgb24gZWFjaCBmaWxlIGZvdW5kLlxuICAvL1xuICAvLyBSZXR1cm5zIGEge1Byb21pc2V9IHdpdGggYSBgY2FuY2VsKClgIG1ldGhvZCB0aGF0IHdpbGwgY2FuY2VsIGFsbFxuICAvLyBvZiB0aGUgdW5kZXJseWluZyBzZWFyY2hlcyB0aGF0IHdlcmUgc3RhcnRlZCBhcyBwYXJ0IG9mIHRoaXMgc2Nhbi5cbiAgc2NhbiAocmVnZXgsIG9wdGlvbnMgPSB7fSwgaXRlcmF0b3IpIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKG9wdGlvbnMpKSB7XG4gICAgICBpdGVyYXRvciA9IG9wdGlvbnNcbiAgICAgIG9wdGlvbnMgPSB7fVxuICAgIH1cblxuICAgIC8vIEZpbmQgYSBzZWFyY2hlciBmb3IgZXZlcnkgRGlyZWN0b3J5IGluIHRoZSBwcm9qZWN0LiBFYWNoIHNlYXJjaGVyIHRoYXQgaXMgbWF0Y2hlZFxuICAgIC8vIHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIGFuIEFycmF5IG9mIERpcmVjdG9yeSBvYmplY3RzIGluIHRoZSBNYXAuXG4gICAgY29uc3QgZGlyZWN0b3JpZXNGb3JTZWFyY2hlciA9IG5ldyBNYXAoKVxuICAgIGZvciAoY29uc3QgZGlyZWN0b3J5IG9mIHRoaXMucHJvamVjdC5nZXREaXJlY3RvcmllcygpKSB7XG4gICAgICBsZXQgc2VhcmNoZXIgPSB0aGlzLmRlZmF1bHREaXJlY3RvcnlTZWFyY2hlclxuICAgICAgZm9yIChjb25zdCBkaXJlY3RvcnlTZWFyY2hlciBvZiB0aGlzLmRpcmVjdG9yeVNlYXJjaGVycykge1xuICAgICAgICBpZiAoZGlyZWN0b3J5U2VhcmNoZXIuY2FuU2VhcmNoRGlyZWN0b3J5KGRpcmVjdG9yeSkpIHtcbiAgICAgICAgICBzZWFyY2hlciA9IGRpcmVjdG9yeVNlYXJjaGVyXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGV0IGRpcmVjdG9yaWVzID0gZGlyZWN0b3JpZXNGb3JTZWFyY2hlci5nZXQoc2VhcmNoZXIpXG4gICAgICBpZiAoIWRpcmVjdG9yaWVzKSB7XG4gICAgICAgIGRpcmVjdG9yaWVzID0gW11cbiAgICAgICAgZGlyZWN0b3JpZXNGb3JTZWFyY2hlci5zZXQoc2VhcmNoZXIsIGRpcmVjdG9yaWVzKVxuICAgICAgfVxuICAgICAgZGlyZWN0b3JpZXMucHVzaChkaXJlY3RvcnkpXG4gICAgfVxuXG4gICAgLy8gRGVmaW5lIHRoZSBvblBhdGhzU2VhcmNoZWQgY2FsbGJhY2suXG4gICAgbGV0IG9uUGF0aHNTZWFyY2hlZFxuICAgIGlmIChfLmlzRnVuY3Rpb24ob3B0aW9ucy5vblBhdGhzU2VhcmNoZWQpKSB7XG4gICAgICAvLyBNYWludGFpbiBhIG1hcCBvZiBkaXJlY3RvcmllcyB0byB0aGUgbnVtYmVyIG9mIHNlYXJjaCByZXN1bHRzLiBXaGVuIG5vdGlmaWVkIG9mIGEgbmV3IGNvdW50LFxuICAgICAgLy8gcmVwbGFjZSB0aGUgZW50cnkgaW4gdGhlIG1hcCBhbmQgdXBkYXRlIHRoZSB0b3RhbC5cbiAgICAgIGNvbnN0IG9uUGF0aHNTZWFyY2hlZE9wdGlvbiA9IG9wdGlvbnMub25QYXRoc1NlYXJjaGVkXG4gICAgICBsZXQgdG90YWxOdW1iZXJPZlBhdGhzU2VhcmNoZWQgPSAwXG4gICAgICBjb25zdCBudW1iZXJPZlBhdGhzU2VhcmNoZWRGb3JTZWFyY2hlciA9IG5ldyBNYXAoKVxuICAgICAgb25QYXRoc1NlYXJjaGVkID0gZnVuY3Rpb24gKHNlYXJjaGVyLCBudW1iZXJPZlBhdGhzU2VhcmNoZWQpIHtcbiAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSBudW1iZXJPZlBhdGhzU2VhcmNoZWRGb3JTZWFyY2hlci5nZXQoc2VhcmNoZXIpXG4gICAgICAgIGlmIChvbGRWYWx1ZSkge1xuICAgICAgICAgIHRvdGFsTnVtYmVyT2ZQYXRoc1NlYXJjaGVkIC09IG9sZFZhbHVlXG4gICAgICAgIH1cbiAgICAgICAgbnVtYmVyT2ZQYXRoc1NlYXJjaGVkRm9yU2VhcmNoZXIuc2V0KHNlYXJjaGVyLCBudW1iZXJPZlBhdGhzU2VhcmNoZWQpXG4gICAgICAgIHRvdGFsTnVtYmVyT2ZQYXRoc1NlYXJjaGVkICs9IG51bWJlck9mUGF0aHNTZWFyY2hlZFxuICAgICAgICByZXR1cm4gb25QYXRoc1NlYXJjaGVkT3B0aW9uKHRvdGFsTnVtYmVyT2ZQYXRoc1NlYXJjaGVkKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBvblBhdGhzU2VhcmNoZWQgPSBmdW5jdGlvbiAoKSB7fVxuICAgIH1cblxuICAgIC8vIEtpY2sgb2ZmIGFsbCBvZiB0aGUgc2VhcmNoZXMgYW5kIHVuaWZ5IHRoZW0gaW50byBvbmUgUHJvbWlzZS5cbiAgICBjb25zdCBhbGxTZWFyY2hlcyA9IFtdXG4gICAgZGlyZWN0b3JpZXNGb3JTZWFyY2hlci5mb3JFYWNoKChkaXJlY3Rvcmllcywgc2VhcmNoZXIpID0+IHtcbiAgICAgIGNvbnN0IHNlYXJjaE9wdGlvbnMgPSB7XG4gICAgICAgIGluY2x1c2lvbnM6IG9wdGlvbnMucGF0aHMgfHwgW10sXG4gICAgICAgIGluY2x1ZGVIaWRkZW46IHRydWUsXG4gICAgICAgIGV4Y2x1ZGVWY3NJZ25vcmVzOiB0aGlzLmNvbmZpZy5nZXQoJ2NvcmUuZXhjbHVkZVZjc0lnbm9yZWRQYXRocycpLFxuICAgICAgICBleGNsdXNpb25zOiB0aGlzLmNvbmZpZy5nZXQoJ2NvcmUuaWdub3JlZE5hbWVzJyksXG4gICAgICAgIGZvbGxvdzogdGhpcy5jb25maWcuZ2V0KCdjb3JlLmZvbGxvd1N5bWxpbmtzJyksXG4gICAgICAgIGxlYWRpbmdDb250ZXh0TGluZUNvdW50OiBvcHRpb25zLmxlYWRpbmdDb250ZXh0TGluZUNvdW50IHx8IDAsXG4gICAgICAgIHRyYWlsaW5nQ29udGV4dExpbmVDb3VudDogb3B0aW9ucy50cmFpbGluZ0NvbnRleHRMaW5lQ291bnQgfHwgMCxcbiAgICAgICAgZGlkTWF0Y2g6IHJlc3VsdCA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLnByb2plY3QuaXNQYXRoTW9kaWZpZWQocmVzdWx0LmZpbGVQYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yKHJlc3VsdClcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGRpZEVycm9yIChlcnJvcikge1xuICAgICAgICAgIHJldHVybiBpdGVyYXRvcihudWxsLCBlcnJvcilcbiAgICAgICAgfSxcbiAgICAgICAgZGlkU2VhcmNoUGF0aHMgKGNvdW50KSB7XG4gICAgICAgICAgcmV0dXJuIG9uUGF0aHNTZWFyY2hlZChzZWFyY2hlciwgY291bnQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGRpcmVjdG9yeVNlYXJjaGVyID0gc2VhcmNoZXIuc2VhcmNoKGRpcmVjdG9yaWVzLCByZWdleCwgc2VhcmNoT3B0aW9ucylcbiAgICAgIGFsbFNlYXJjaGVzLnB1c2goZGlyZWN0b3J5U2VhcmNoZXIpXG4gICAgfSlcbiAgICBjb25zdCBzZWFyY2hQcm9taXNlID0gUHJvbWlzZS5hbGwoYWxsU2VhcmNoZXMpXG5cbiAgICBmb3IgKGxldCBidWZmZXIgb2YgdGhpcy5wcm9qZWN0LmdldEJ1ZmZlcnMoKSkge1xuICAgICAgaWYgKGJ1ZmZlci5pc01vZGlmaWVkKCkpIHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGggPSBidWZmZXIuZ2V0UGF0aCgpXG4gICAgICAgIGlmICghdGhpcy5wcm9qZWN0LmNvbnRhaW5zKGZpbGVQYXRoKSkge1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1hdGNoZXMgPSBbXVxuICAgICAgICBidWZmZXIuc2NhbihyZWdleCwgbWF0Y2ggPT4gbWF0Y2hlcy5wdXNoKG1hdGNoKSlcbiAgICAgICAgaWYgKG1hdGNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGl0ZXJhdG9yKHtmaWxlUGF0aCwgbWF0Y2hlc30pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlIFByb21pc2UgdGhhdCBpcyByZXR1cm5lZCB0byB0aGUgY2xpZW50IGlzIGNhbmNlbGFibGUuIFRvIGJlIGNvbnNpc3RlbnRcbiAgICAvLyB3aXRoIHRoZSBleGlzdGluZyBiZWhhdmlvciwgaW5zdGVhZCBvZiBjYW5jZWwoKSByZWplY3RpbmcgdGhlIHByb21pc2UsIGl0IHNob3VsZFxuICAgIC8vIHJlc29sdmUgaXQgd2l0aCB0aGUgc3BlY2lhbCB2YWx1ZSAnY2FuY2VsbGVkJy4gQXQgbGVhc3QgdGhlIGJ1aWx0LWluIGZpbmQtYW5kLXJlcGxhY2VcbiAgICAvLyBwYWNrYWdlIHJlbGllcyBvbiB0aGlzIGJlaGF2aW9yLlxuICAgIGxldCBpc0NhbmNlbGxlZCA9IGZhbHNlXG4gICAgY29uc3QgY2FuY2VsbGFibGVQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgb25TdWNjZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoaXNDYW5jZWxsZWQpIHtcbiAgICAgICAgICByZXNvbHZlKCdjYW5jZWxsZWQnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUobnVsbClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBvbkZhaWx1cmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAobGV0IHByb21pc2Ugb2YgYWxsU2VhcmNoZXMpIHsgcHJvbWlzZS5jYW5jZWwoKSB9XG4gICAgICAgIHJlamVjdCgpXG4gICAgICB9XG5cbiAgICAgIHNlYXJjaFByb21pc2UudGhlbihvblN1Y2Nlc3MsIG9uRmFpbHVyZSlcbiAgICB9KVxuICAgIGNhbmNlbGxhYmxlUHJvbWlzZS5jYW5jZWwgPSAoKSA9PiB7XG4gICAgICBpc0NhbmNlbGxlZCA9IHRydWVcbiAgICAgIC8vIE5vdGUgdGhhdCBjYW5jZWxsaW5nIGFsbCBvZiB0aGUgbWVtYmVycyBvZiBhbGxTZWFyY2hlcyB3aWxsIGNhdXNlIGFsbCBvZiB0aGUgc2VhcmNoZXNcbiAgICAgIC8vIHRvIHJlc29sdmUsIHdoaWNoIGNhdXNlcyBzZWFyY2hQcm9taXNlIHRvIHJlc29sdmUsIHdoaWNoIGlzIHVsdGltYXRlbHkgd2hhdCBjYXVzZXNcbiAgICAgIC8vIGNhbmNlbGxhYmxlUHJvbWlzZSB0byByZXNvbHZlLlxuICAgICAgYWxsU2VhcmNoZXMubWFwKChwcm9taXNlKSA9PiBwcm9taXNlLmNhbmNlbCgpKVxuICAgIH1cblxuICAgIC8vIEFsdGhvdWdoIHRoaXMgbWV0aG9kIGNsYWltcyB0byByZXR1cm4gYSBgUHJvbWlzZWAsIHRoZSBgUmVzdWx0c1BhbmVWaWV3Lm9uU2VhcmNoKClgXG4gICAgLy8gbWV0aG9kIGluIHRoZSBmaW5kLWFuZC1yZXBsYWNlIHBhY2thZ2UgZXhwZWN0cyB0aGUgb2JqZWN0IHJldHVybmVkIGJ5IHRoaXMgbWV0aG9kIHRvIGhhdmUgYVxuICAgIC8vIGBkb25lKClgIG1ldGhvZC4gSW5jbHVkZSBhIGRvbmUoKSBtZXRob2QgdW50aWwgZmluZC1hbmQtcmVwbGFjZSBjYW4gYmUgdXBkYXRlZC5cbiAgICBjYW5jZWxsYWJsZVByb21pc2UuZG9uZSA9IG9uU3VjY2Vzc09yRmFpbHVyZSA9PiB7XG4gICAgICBjYW5jZWxsYWJsZVByb21pc2UudGhlbihvblN1Y2Nlc3NPckZhaWx1cmUsIG9uU3VjY2Vzc09yRmFpbHVyZSlcbiAgICB9XG4gICAgcmV0dXJuIGNhbmNlbGxhYmxlUHJvbWlzZVxuICB9XG5cbiAgLy8gUHVibGljOiBQZXJmb3JtcyBhIHJlcGxhY2UgYWNyb3NzIGFsbCB0aGUgc3BlY2lmaWVkIGZpbGVzIGluIHRoZSBwcm9qZWN0LlxuICAvL1xuICAvLyAqIGByZWdleGAgQSB7UmVnRXhwfSB0byBzZWFyY2ggd2l0aC5cbiAgLy8gKiBgcmVwbGFjZW1lbnRUZXh0YCB7U3RyaW5nfSB0byByZXBsYWNlIGFsbCBtYXRjaGVzIG9mIHJlZ2V4IHdpdGguXG4gIC8vICogYGZpbGVQYXRoc2AgQW4ge0FycmF5fSBvZiBmaWxlIHBhdGggc3RyaW5ncyB0byBydW4gdGhlIHJlcGxhY2Ugb24uXG4gIC8vICogYGl0ZXJhdG9yYCBBIHtGdW5jdGlvbn0gY2FsbGJhY2sgb24gZWFjaCBmaWxlIHdpdGggcmVwbGFjZW1lbnRzOlxuICAvLyAgICogYG9wdGlvbnNgIHtPYmplY3R9IHdpdGgga2V5cyBgZmlsZVBhdGhgIGFuZCBgcmVwbGFjZW1lbnRzYC5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIHtQcm9taXNlfS5cbiAgcmVwbGFjZSAocmVnZXgsIHJlcGxhY2VtZW50VGV4dCwgZmlsZVBhdGhzLCBpdGVyYXRvcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgYnVmZmVyXG4gICAgICBjb25zdCBvcGVuUGF0aHMgPSB0aGlzLnByb2plY3QuZ2V0QnVmZmVycygpLm1hcChidWZmZXIgPT4gYnVmZmVyLmdldFBhdGgoKSlcbiAgICAgIGNvbnN0IG91dE9mUHJvY2Vzc1BhdGhzID0gXy5kaWZmZXJlbmNlKGZpbGVQYXRocywgb3BlblBhdGhzKVxuXG4gICAgICBsZXQgaW5Qcm9jZXNzRmluaXNoZWQgPSAhb3BlblBhdGhzLmxlbmd0aFxuICAgICAgbGV0IG91dE9mUHJvY2Vzc0ZpbmlzaGVkID0gIW91dE9mUHJvY2Vzc1BhdGhzLmxlbmd0aFxuICAgICAgY29uc3QgY2hlY2tGaW5pc2hlZCA9ICgpID0+IHtcbiAgICAgICAgaWYgKG91dE9mUHJvY2Vzc0ZpbmlzaGVkICYmIGluUHJvY2Vzc0ZpbmlzaGVkKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCFvdXRPZlByb2Nlc3NGaW5pc2hlZC5sZW5ndGgpIHtcbiAgICAgICAgbGV0IGZsYWdzID0gJ2cnXG4gICAgICAgIGlmIChyZWdleC5pZ25vcmVDYXNlKSB7IGZsYWdzICs9ICdpJyB9XG5cbiAgICAgICAgY29uc3QgdGFzayA9IFRhc2sub25jZShcbiAgICAgICAgICByZXF1aXJlLnJlc29sdmUoJy4vcmVwbGFjZS1oYW5kbGVyJyksXG4gICAgICAgICAgb3V0T2ZQcm9jZXNzUGF0aHMsXG4gICAgICAgICAgcmVnZXguc291cmNlLFxuICAgICAgICAgIGZsYWdzLFxuICAgICAgICAgIHJlcGxhY2VtZW50VGV4dCxcbiAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBvdXRPZlByb2Nlc3NGaW5pc2hlZCA9IHRydWVcbiAgICAgICAgICAgIGNoZWNrRmluaXNoZWQoKVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuXG4gICAgICAgIHRhc2sub24oJ3JlcGxhY2U6cGF0aC1yZXBsYWNlZCcsIGl0ZXJhdG9yKVxuICAgICAgICB0YXNrLm9uKCdyZXBsYWNlOmZpbGUtZXJyb3InLCBlcnJvciA9PiB7IGl0ZXJhdG9yKG51bGwsIGVycm9yKSB9KVxuICAgICAgfVxuXG4gICAgICBmb3IgKGJ1ZmZlciBvZiB0aGlzLnByb2plY3QuZ2V0QnVmZmVycygpKSB7XG4gICAgICAgIGlmICghZmlsZVBhdGhzLmluY2x1ZGVzKGJ1ZmZlci5nZXRQYXRoKCkpKSB7IGNvbnRpbnVlIH1cbiAgICAgICAgY29uc3QgcmVwbGFjZW1lbnRzID0gYnVmZmVyLnJlcGxhY2UocmVnZXgsIHJlcGxhY2VtZW50VGV4dCwgaXRlcmF0b3IpXG4gICAgICAgIGlmIChyZXBsYWNlbWVudHMpIHtcbiAgICAgICAgICBpdGVyYXRvcih7ZmlsZVBhdGg6IGJ1ZmZlci5nZXRQYXRoKCksIHJlcGxhY2VtZW50c30pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaW5Qcm9jZXNzRmluaXNoZWQgPSB0cnVlXG4gICAgICBjaGVja0ZpbmlzaGVkKClcbiAgICB9KVxuICB9XG5cbiAgY2hlY2tvdXRIZWFkUmV2aXNpb24gKGVkaXRvcikge1xuICAgIGlmIChlZGl0b3IuZ2V0UGF0aCgpKSB7XG4gICAgICBjb25zdCBjaGVja291dEhlYWQgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2plY3QucmVwb3NpdG9yeUZvckRpcmVjdG9yeShuZXcgRGlyZWN0b3J5KGVkaXRvci5nZXREaXJlY3RvcnlQYXRoKCkpKVxuICAgICAgICAgIC50aGVuKHJlcG9zaXRvcnkgPT4gcmVwb3NpdG9yeSAmJiByZXBvc2l0b3J5LmNoZWNrb3V0SGVhZEZvckVkaXRvcihlZGl0b3IpKVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jb25maWcuZ2V0KCdlZGl0b3IuY29uZmlybUNoZWNrb3V0SGVhZFJldmlzaW9uJykpIHtcbiAgICAgICAgdGhpcy5hcHBsaWNhdGlvbkRlbGVnYXRlLmNvbmZpcm0oe1xuICAgICAgICAgIG1lc3NhZ2U6ICdDb25maXJtIENoZWNrb3V0IEhFQUQgUmV2aXNpb24nLFxuICAgICAgICAgIGRldGFpbGVkTWVzc2FnZTogYEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkaXNjYXJkIGFsbCBjaGFuZ2VzIHRvIFwiJHtlZGl0b3IuZ2V0RmlsZU5hbWUoKX1cIiBzaW5jZSB0aGUgbGFzdCBHaXQgY29tbWl0P2AsXG4gICAgICAgICAgYnV0dG9uczoge1xuICAgICAgICAgICAgT0s6IGNoZWNrb3V0SGVhZCxcbiAgICAgICAgICAgIENhbmNlbDogbnVsbFxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjaGVja291dEhlYWQoKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKVxuICAgIH1cbiAgfVxufVxuIl19