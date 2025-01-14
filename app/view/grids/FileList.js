// Generated by CoffeeScript 1.11.1
Ext.define('FM.view.grids.FileList', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.filelist',
  cls: 'fm-file-list',
  columns: [],
  stateful: true,
  multiSelect: true,
  viewConfig: {
    stripeRows: false,
    markDirty: false,
    plugins: {
      ptype: "gridviewdragdrop",
      ddGroup: "DDGroup",
      enableDrop: false
    }
  },
  requires: ['Ext.grid.plugin.DragDrop'],
  initComponent: function() {
    FM.Logger.log('FM.view.grids.FileList init');
    this.callParent(arguments);
    return this.initEventsHandlers();
  },
  getSession: function() {
    return this.ownerCt.session;
  },
  getActions: function() {
    return this.ownerCt.session;
  },
  initStore: function(listing) {
    var panel, session;
    session = this.getSession();
    panel = this.ownerCt;
    FM.Logger.log('initStore listing = ', listing, this, session, session.type);
    this.list_cache = {};
    this.removeEvents();
    if ((session != null) && (session.type != null) && session.type === FM.Session.HOME) {
      this.initHomeConfig();
      this.initHomeStore();
      panel.setShareStatus(listing.is_share, listing.is_share_write);
    } else if ((session != null) && (session.type != null) && session.type === FM.Session.SFTP) {
      this.initHomeConfig();
      this.initHomeStore();
    } else if ((session != null) && (session.type != null) && session.type === FM.Session.FTP) {
      this.initPublicFtpConfig();
      this.initPublicFtpStore();
    } else if ((session != null) && (session.type != null) && session.type === FM.Session.WEBDAV) {
      this.initPublicWebDavConfig();
      this.initPublicWebDavStore();
    }
    panel.initEmptyContextMenu();
    this.setFileList(listing);
    panel.initTopToolBarHandlers();
    this.initDropZone();
    return this.initHotKeys();
  },
  initDropZone: function() {
    var view;
    FM.Logger.debug('called initDropZone()');
    view = this.getView();
    return this.drop_zone = Ext.create("Ext.dd.DropZone", view.getEl(), {
      ddGroup: "DDGroup",
      getTargetFromEvent: function(e) {
        var target;
        target = e.getTarget(view.rowSelector);
        return target != null ? target : {
          target: view.getEl()
        };
      },
      onNodeOver: function(nodeData, source, e, data) {
        var source_panel, source_records, target_panel, target_record;
        FM.Logger.debug('onNodeOver()', arguments, view.ownerCt);
        source_panel = FM.helpers.GetComponentByDomEl(source.getEl()).ownerCt;
        target_panel = view.ownerCt.ownerCt;
        source_records = data.records;
        target_record = view.getRecord(e.getTarget());
        FM.Logger.debug('source_panel', source_panel);
        FM.Logger.debug('target_panel', target_panel);
        FM.Logger.debug('source_records', source_records);
        FM.Logger.debug('target_record', target_record);
        if (!FM.helpers.isAllowed(FM.Actions.Copy, source_panel, source_records)) {
          return Ext.dd.DropZone.prototype.dropNotAllowed;
        }
        if (e.getTarget() === view.getEl().dom) {
          if (!_.isEqual(target_panel.session, source_panel.session)) {
            return Ext.dd.DropZone.prototype.dropAllowed;
          } else {
            return Ext.dd.DropZone.prototype.dropNotAllowed;
          }
        }
        if (target_record != null) {
          return Ext.dd.DropZone.prototype.dropAllowed;
        }
        return Ext.dd.DropZone.prototype.dropNotAllowed;
      },
      onNodeDrop: function(nodeData, source, e, data) {
        var source_panel, source_records, target_panel, target_record;
        FM.Logger.debug('onNodeDrop()', arguments, view.ownerCt);
        source_panel = FM.helpers.GetComponentByDomEl(source.getEl()).ownerCt;
        target_panel = view.ownerCt.ownerCt;
        source_records = data.records;
        target_record = view.getRecord(e.getTarget());
        FM.Logger.debug('source_panel', source_panel);
        FM.Logger.debug('target_panel', target_panel);
        FM.Logger.debug('source_records', source_records);
        FM.Logger.debug('target_record', target_record);
        if (!FM.helpers.isAllowed(FM.Actions.Copy, source_panel, source_records)) {
          return;
        }
        FM.Logger.debug('to copy');
        if (target_record != null) {
          if (target_record.get('is_dir')) {
            FM.Logger.debug('target_path = ', FM.helpers.GetAbsName(target_panel.session, target_record));
            return FM.Actions.Copy.execute(source_panel, target_panel, FM.helpers.GetAbsName(target_panel.session, target_record), source_records);
          } else {
            FM.Logger.debug('target_path = ', target_panel.session.path);
            return FM.Actions.Copy.execute(source_panel, target_panel, target_panel.session.path, source_records);
          }
        } else {
          FM.Logger.debug('target_path = ', target_panel.session.path);
          return FM.Actions.Copy.execute(source_panel, target_panel, target_panel.session.path, source_records);
        }
      }
    });
  },
  initEventsHandlers: function() {
    this.handlers = {
      gridview: {
        beforecontainermousedown: function(view) {
          var panel;
          panel = view.ownerCt.ownerCt;
          return FM.helpers.SetActivePanel(panel);
        },
        beforeitemmousedown: function(view) {
          var i, len, menu, menus, panel, results;
          panel = view.ownerCt.ownerCt;
          FM.helpers.SetActivePanel(panel, false, false);
          menus = Ext.ComponentQuery.query('menu[name=fm-file-list-context-menu]');
          results = [];
          for (i = 0, len = menus.length; i < len; i++) {
            menu = menus[i];
            results.push(menu.close());
          }
          return results;
        },
        itemdblclick: function(view, record) {
          var panel;
          panel = view.ownerCt.ownerCt;
          return FM.Actions.OpenFile.execute(panel, record);
        },
        itemkeydown: function(view, record, item, index, e) {
          var key, panel, path;
          panel = view.ownerCt.ownerCt;
          key = e.getKey();
          if (key === Ext.event.Event.ENTER) {
            if (record.get('is_dir')) {
              path = FM.helpers.GetAbsName(panel.session, record);
              return FM.Actions.Open.execute(panel, path);
            }
          }
        },
        itemcontextmenu: function(view, rec, node, index, event) {
          var grid_context_menu, panel;
          panel = view.ownerCt.ownerCt;
          event.stopEvent();
          if (panel.hasContextMenu(rec)) {
            grid_context_menu = panel.getContextMenu(rec);
            return grid_context_menu.showAt(event.getXY());
          }
        },
        containercontextmenu: function(view, event) {
          var panel;
          panel = view.ownerCt.ownerCt;
          event.stopEvent();
          return panel.empty_context_menu.showAt(event.getXY());
        },
        selectionchange: function(selection, selected) {
          var panel, real_selected;
          FM.Logger.debug('selectionchange() called', arguments);
          if (selection.view != null) {
            panel = selection.view.ownerCt.ownerCt;
            real_selected = FM.helpers.GetSelected(panel);
            return FM.getApplication().fireEvent(FM.Events.main.selectFiles, panel, real_selected);
          }
        }
      }
    };
    return FM.Logger.log('FileList initEventsHandlers() called', this.handlers);
  },
  removeEvents: function() {
    var gridView, key;
    FM.Logger.log('Panel removeEvents() called', this.handlers);
    gridView = this.getView();
    for (key in this.handlers.gridview) {
      gridView.removeListener(key, this.handlers.gridview[key]);
    }
    return FM.Logger.debug('Panel events removed', this.handlers);
  },
  initHomeConfig: function() {
    var gridView;
    this.setConfig({
      columns: [
        {
          header: t("Name"),
          dataIndex: "name",
          hideable: false,
          draggable: false,
          flex: true,
          sort: function(direction) {
            var dir, field, grid, koef, sorter, store;
            grid = this.up('tablepanel');
            store = grid.store;
            if (direction == null) {
              dir = this.sortState === 'ASC' ? 'DESC' : 'ASC';
            } else {
              dir = direction;
            }
            koef = dir === 'ASC' ? 1 : -1;
            field = [];
            sorter = Ext.create('Ext.util.Sorter', {
              direction: dir,
              sorterFn: function(a, b) {
                var adir, an, bdir, bn;
                an = a.get('name');
                bn = b.get('name');
                adir = a.get('is_dir');
                bdir = b.get('is_dir');
                if (an === '..') {
                  return -1 * koef;
                } else if (bn === '..') {
                  return koef;
                } else if (adir === bdir) {
                  if (an > bn) {
                    return 1;
                  } else {
                    return -1;
                  }
                } else {
                  if (adir) {
                    return -1;
                  } else if (bdir) {
                    return 1;
                  }
                  if (an > bn) {
                    return 1;
                  } else {
                    return -1;
                  }
                }
              }
            });
            field.push(sorter);
            Ext.suspendLayouts();
            this.sorting = true;
            store.sort(field, void 0, grid.multiColumnSort ? 'multi' : 'replace');
            (function(_this) {
              return (function(sorter) {
                var ascCls, changed, descCls, rootHeaderCt;
                direction = sorter.getDirection();
                ascCls = _this.ascSortCls;
                descCls = _this.descSortCls;
                rootHeaderCt = _this.getRootHeaderCt();
                changed = void 0;
                if (direction === 'DESC') {
                  if (!_this.hasCls(descCls)) {
                    _this.addCls(descCls);
                    _this.sortState = 'DESC';
                    changed = true;
                  }
                  _this.removeCls(ascCls);
                } else if (direction === 'ASC') {
                  if (!_this.hasCls(ascCls)) {
                    _this.addCls(ascCls);
                    _this.sortState = 'ASC';
                    changed = true;
                  }
                  _this.removeCls(descCls);
                } else {
                  _this.removeCls([ascCls, descCls]);
                  _this.sortState = null;
                }
                if (changed) {
                  return rootHeaderCt.fireEvent('sortchange', rootHeaderCt, _this, direction);
                }
              });
            })(this)(sorter);
            delete this.sorting;
            return Ext.resumeLayouts(true);
          },
          renderer: function(value, metaData, record) {
            var ext, is_dir, is_link, is_share;
            is_dir = record.get("is_dir");
            is_link = record.get("is_link");
            is_share = record.get("is_share");
            ext = '';
            if (is_dir) {
              ext = "_dir";
            } else {
              ext = record.get("ext").toLowerCase();
            }
            if (is_link) {
              ext = "_link";
            }
            if (is_share) {
              ext = "_share";
            }
            metaData.style = "background-image: url(/fm/resources/images/sprites/icons_16.png)";
            metaData.tdCls = ext !== '' ? "cell-icon icon-16-" + ext : "cell-icon icon-16-_blank";
            if (is_dir) {
              return value;
            } else {
              return FM.helpers.GetFileName(value);
            }
          }
        }, {
          header: t("Type"),
          dataIndex: "ext",
          width: 55
        }, {
          header: t("Size"),
          dataIndex: "size",
          width: 60,
          renderer: function(value, metaData, record) {
            if (record.get("is_dir") && !record.get('loaded')) {
              return "[DIR]";
            }
            if (record.get("is_link")) {
              return "[LINK]";
            }
            return Ext.util.Format.fileSize(value);
          }
        }, {
          header: t("Owner"),
          dataIndex: "owner",
          hidden: false
        }, {
          header: t("Base64"),
          dataIndex: "base64",
          hidden: true
        }, {
          header: t("Attributes"),
          dataIndex: "mode",
          width: 55
        }, {
          header: t("Modified"),
          dataIndex: "mtime",
          width: 125,
          renderer: function(value, metaData, record) {
            return record.get("mtime_str");
          }
        }
      ]
    });
    gridView = this.getView();
    return gridView.on({
      beforecontainermousedown: this.handlers.gridview.beforecontainermousedown,
      beforeitemmousedown: this.handlers.gridview.beforeitemmousedown,
      itemdblclick: this.handlers.gridview.itemdblclick,
      itemkeydown: this.handlers.gridview.itemkeydown,
      itemcontextmenu: this.handlers.gridview.itemcontextmenu,
      containercontextmenu: this.handlers.gridview.containercontextmenu,
      selectionchange: this.handlers.gridview.selectionchange
    });
  },
  initPublicFtpConfig: function() {
    var gridView;
    FM.Logger.debug("initPublicFtpConfig() called", arguments);
    this.setConfig({
      columns: [
        {
          header: t("Name"),
          dataIndex: "name",
          hideable: false,
          draggable: false,
          flex: true,
          sort: function(direction) {
            var dir, field, grid, koef, sorter, store;
            grid = this.up('tablepanel');
            store = grid.store;
            if (direction == null) {
              dir = this.sortState === 'ASC' ? 'DESC' : 'ASC';
            } else {
              dir = direction;
            }
            koef = dir === 'ASC' ? 1 : -1;
            field = [];
            sorter = Ext.create('Ext.util.Sorter', {
              direction: dir,
              sorterFn: function(a, b) {
                var adir, an, bdir, bn;
                an = a.get('name');
                bn = b.get('name');
                adir = a.get('is_dir');
                bdir = b.get('is_dir');
                if (an === '..') {
                  return -1 * koef;
                } else if (bn === '..') {
                  return koef;
                } else if (adir === bdir) {
                  if (an > bn) {
                    return 1;
                  } else {
                    return -1;
                  }
                } else {
                  if (adir) {
                    return -1;
                  } else if (bdir) {
                    return 1;
                  }
                  if (an > bn) {
                    return 1;
                  } else {
                    return -1;
                  }
                }
              }
            });
            field.push(sorter);
            Ext.suspendLayouts();
            this.sorting = true;
            store.sort(field, void 0, grid.multiColumnSort ? 'multi' : 'replace');
            (function(_this) {
              return (function(sorter) {
                var ascCls, changed, descCls, rootHeaderCt;
                direction = sorter.getDirection();
                ascCls = _this.ascSortCls;
                descCls = _this.descSortCls;
                rootHeaderCt = _this.getRootHeaderCt();
                changed = void 0;
                if (direction === 'DESC') {
                  if (!_this.hasCls(descCls)) {
                    _this.addCls(descCls);
                    _this.sortState = 'DESC';
                    changed = true;
                  }
                  _this.removeCls(ascCls);
                } else if (direction === 'ASC') {
                  if (!_this.hasCls(ascCls)) {
                    _this.addCls(ascCls);
                    _this.sortState = 'ASC';
                    changed = true;
                  }
                  _this.removeCls(descCls);
                } else {
                  _this.removeCls([ascCls, descCls]);
                  _this.sortState = null;
                }
                if (changed) {
                  return rootHeaderCt.fireEvent('sortchange', rootHeaderCt, _this, direction);
                }
              });
            })(this)(sorter);
            delete this.sorting;
            return Ext.resumeLayouts(true);
          },
          renderer: function(value, metaData, record) {
            var ext, is_dir, is_link, is_share;
            is_dir = record.get("is_dir");
            is_link = record.get("is_link");
            is_share = record.get("is_share");
            ext = '';
            if (is_dir) {
              ext = "_dir";
            } else {
              ext = record.get("ext").toLowerCase();
            }
            if (is_link) {
              ext = "_link";
            }
            if (is_share) {
              ext = "_share";
            }
            metaData.style = "background-image: url(/fm/resources/images/sprites/icons_16.png)";
            metaData.tdCls = ext !== '' ? "cell-icon icon-16-" + ext : "cell-icon icon-16-_blank";
            if (is_dir) {
              return value;
            } else {
              return FM.helpers.GetFileName(value);
            }
          }
        }, {
          header: t("Type"),
          dataIndex: "ext",
          width: 55
        }, {
          header: t("Size"),
          dataIndex: "size",
          width: 60,
          renderer: function(value, metaData, record) {
            if (record.get("is_dir") && !record.get('loaded')) {
              return "[DIR]";
            }
            if (record.get("is_link")) {
              return "[LINK]";
            }
            return Ext.util.Format.fileSize(value);
          }
        }, {
          header: t("Owner"),
          dataIndex: "owner",
          hidden: false
        }, {
          header: t("Base64"),
          dataIndex: "base64",
          hidden: true
        }, {
          header: t("Attributes"),
          dataIndex: "mode",
          width: 55
        }, {
          header: t("Modified"),
          dataIndex: "mtime",
          width: 125,
          renderer: function(value, metaData, record) {
            return record.get("mtime_str");
          }
        }
      ]
    });
    gridView = this.getView();
    return gridView.on({
      beforecontainermousedown: this.handlers.gridview.beforecontainermousedown,
      beforeitemmousedown: this.handlers.gridview.beforeitemmousedown,
      itemdblclick: this.handlers.gridview.itemdblclick,
      itemkeydown: this.handlers.gridview.itemkeydown,
      itemcontextmenu: this.handlers.gridview.itemcontextmenu,
      containercontextmenu: this.handlers.gridview.containercontextmenu,
      selectionchange: this.handlers.gridview.selectionchange
    });
  },
  initPublicWebDavConfig: function() {
    var gridView;
    FM.Logger.debug("initPublicWebDavConfig() called", arguments);
    this.setConfig({
      columns: [
        {
          header: t("Name"),
          dataIndex: "name",
          hideable: false,
          draggable: false,
          flex: true,
          sort: function(direction) {
            var dir, field, grid, koef, sorter, store;
            grid = this.up('tablepanel');
            store = grid.store;
            if (direction == null) {
              dir = this.sortState === 'ASC' ? 'DESC' : 'ASC';
            } else {
              dir = direction;
            }
            koef = dir === 'ASC' ? 1 : -1;
            field = [];
            sorter = Ext.create('Ext.util.Sorter', {
              direction: dir,
              sorterFn: function(a, b) {
                var adir, an, bdir, bn;
                an = a.get('name');
                bn = b.get('name');
                adir = a.get('is_dir');
                bdir = b.get('is_dir');
                if (an === '..') {
                  return -1 * koef;
                } else if (bn === '..') {
                  return koef;
                } else if (adir === bdir) {
                  if (an > bn) {
                    return 1;
                  } else {
                    return -1;
                  }
                } else {
                  if (adir) {
                    return -1;
                  } else if (bdir) {
                    return 1;
                  }
                  if (an > bn) {
                    return 1;
                  } else {
                    return -1;
                  }
                }
              }
            });
            field.push(sorter);
            Ext.suspendLayouts();
            this.sorting = true;
            store.sort(field, void 0, grid.multiColumnSort ? 'multi' : 'replace');
            (function(_this) {
              return (function(sorter) {
                var ascCls, changed, descCls, rootHeaderCt;
                direction = sorter.getDirection();
                ascCls = _this.ascSortCls;
                descCls = _this.descSortCls;
                rootHeaderCt = _this.getRootHeaderCt();
                changed = void 0;
                if (direction === 'DESC') {
                  if (!_this.hasCls(descCls)) {
                    _this.addCls(descCls);
                    _this.sortState = 'DESC';
                    changed = true;
                  }
                  _this.removeCls(ascCls);
                } else if (direction === 'ASC') {
                  if (!_this.hasCls(ascCls)) {
                    _this.addCls(ascCls);
                    _this.sortState = 'ASC';
                    changed = true;
                  }
                  _this.removeCls(descCls);
                } else {
                  _this.removeCls([ascCls, descCls]);
                  _this.sortState = null;
                }
                if (changed) {
                  return rootHeaderCt.fireEvent('sortchange', rootHeaderCt, _this, direction);
                }
              });
            })(this)(sorter);
            delete this.sorting;
            return Ext.resumeLayouts(true);
          },
          renderer: function(value, metaData, record) {
            var ext, is_dir, is_link, is_share;
            is_dir = record.get("is_dir");
            is_link = record.get("is_link");
            is_share = record.get("is_share");
            ext = '';
            if (is_dir) {
              ext = "_dir";
            } else {
              ext = record.get("ext").toLowerCase();
            }
            if (is_link) {
              ext = "_link";
            }
            if (is_share) {
              ext = "_share";
            }
            metaData.style = "background-image: url(/fm/resources/images/sprites/icons_16.png)";
            metaData.tdCls = ext !== '' ? "cell-icon icon-16-" + ext : "cell-icon icon-16-_blank";
            if (is_dir) {
              return value;
            } else {
              return FM.helpers.GetFileName(value);
            }
          }
        }, {
          header: t("Type"),
          dataIndex: "ext",
          width: 55
        }, {
          header: t("Size"),
          dataIndex: "size",
          width: 60,
          renderer: function(value, metaData, record) {
            if (record.get("is_dir") && !record.get('loaded')) {
              return "[DIR]";
            }
            if (record.get("is_link")) {
              return "[LINK]";
            }
            return Ext.util.Format.fileSize(value);
          }
        }, {
          header: t("Owner"),
          dataIndex: "owner",
          hidden: false
        }, {
          header: t("Base64"),
          dataIndex: "base64",
          hidden: true
        }, {
          header: t("Attributes"),
          dataIndex: "mode",
          width: 55
        }, {
          header: t("Modified"),
          dataIndex: "mtime",
          width: 125,
          renderer: function(value, metaData, record) {
            return record.get("mtime_str");
          }
        }
      ]
    });
    gridView = this.getView();
    return gridView.on({
      beforecontainermousedown: this.handlers.gridview.beforecontainermousedown,
      beforeitemmousedown: this.handlers.gridview.beforeitemmousedown,
      itemdblclick: this.handlers.gridview.itemdblclick,
      itemkeydown: this.handlers.gridview.itemkeydown,
      itemcontextmenu: this.handlers.gridview.itemcontextmenu,
      containercontextmenu: this.handlers.gridview.containercontextmenu,
      selectionchange: this.handlers.gridview.selectionchange
    });
  },
  initLocalAppletConfig: function() {
    var gridView;
    this.setConfig({
      columns: [
        {
          header: t("Name"),
          dataIndex: "name",
          hideable: false,
          draggable: false,
          flex: true,
          renderer: function(value, metaData, record) {
            var ext, is_dir, is_link, is_share;
            is_dir = record.get("is_dir");
            is_link = record.get("is_link");
            is_share = record.get("is_share");
            ext = '';
            if (is_dir) {
              ext = "_dir";
            } else {
              ext = record.get("ext").toLowerCase();
            }
            if (is_link) {
              ext = "_link";
            }
            if (is_share) {
              ext = "_share";
            }
            metaData.style = "background-image: url(/fm/resources/images/sprites/icons_16.png)";
            metaData.tdCls = ext !== '' ? "cell-icon icon-16-" + ext : "cell-icon icon-16-_blank";
            if (is_dir) {
              return value;
            } else {
              return FM.helpers.GetFileName(value);
            }
          }
        }, {
          header: t("Type"),
          dataIndex: "ext",
          width: 55
        }, {
          header: t("Size"),
          dataIndex: "size",
          width: 60,
          renderer: function(value, metaData, record) {
            if (record.get("is_dir") && !record.get('loaded')) {
              return "[DIR]";
            }
            if (record.get("is_link")) {
              return "[LINK]";
            }
            return Ext.util.Format.fileSize(value);
          }
        }, {
          header: t("Owner"),
          dataIndex: "owner",
          hidden: false
        }, {
          header: t("Base64"),
          dataIndex: "base64",
          hidden: true
        }, {
          header: t("Attributes"),
          dataIndex: "mode",
          width: 55
        }, {
          header: t("Modified"),
          dataIndex: "mtime",
          width: 125,
          renderer: function(value, metaData, record) {
            return record.get("mtime_str");
          }
        }
      ]
    });
    gridView = this.getView();
    return gridView.on({
      beforecontainermousedown: this.handlers.gridview.beforecontainermousedown,
      beforeitemmousedown: this.handlers.gridview.beforeitemmousedown,
      itemdblclick: this.handlers.gridview.itemdblclick,
      itemkeydown: this.handlers.gridview.itemkeydown,
      itemcontextmenu: this.handlers.gridview.itemcontextmenu,
      containercontextmenu: this.handlers.gridview.containercontextmenu,
      selectionchange: this.handlers.gridview.selectionchange
    });
  },
  initHomeStore: function() {
    var store;
    FM.Logger.debug('call initHomeStore()');
    store = Ext.create("Ext.data.Store", {
      autoLoad: false,
      sortOnLoad: false,
      model: 'FM.model.File'
    });
    return this.setStore(store);
  },
  initPublicFtpStore: function() {
    var store;
    FM.Logger.debug("initPublicFtpStore() called", arguments);
    store = Ext.create("Ext.data.Store", {
      autoLoad: false,
      sortOnLoad: true,
      model: 'FM.model.File',
      sorters: [
        {
          property: "name",
          direction: "ASC"
        }
      ]
    });
    return this.setStore(store);
  },
  initPublicWebDavStore: function() {
    var store;
    FM.Logger.debug("initPublicWebDavStore() called", arguments);
    store = Ext.create("Ext.data.Store", {
      autoLoad: false,
      sortOnLoad: true,
      model: 'FM.model.File',
      sorters: [
        {
          property: "name",
          direction: "ASC"
        }
      ]
    });
    return this.setStore(store);
  },
  initLocalAppletStore: function() {
    var store;
    store = Ext.create("Ext.data.Store", {
      autoLoad: false,
      sortOnLoad: true,
      model: 'FM.model.File',
      sorters: [
        {
          property: "name",
          direction: "ASC"
        }
      ]
    });
    return this.setStore(store);
  },
  hasListCache: function(path) {
    FM.Logger.log("checking cache ", path, this.list_cache, this.list_cache[path] != null);
    if ((this.list_cache[path] != null) && (this.list_cache[path].items != null) && this.list_cache[path].items.length > 0) {
      FM.Logger.log("cache exist ", this.list_cache[path]);
      return true;
    }
    FM.Logger.log("no cache ");
    return false;
  },
  setListCache: function(path, listing) {
    return this.list_cache[path] = Ext.ux.Util.clone(listing);
  },
  clearListCache: function() {
    return this.list_cache = {};
  },
  getListCache: function(path) {
    if (this.hasListCache(path)) {
      return this.list_cache[path];
    }
    return [];
  },
  setFileList: function(listing) {
    var columns, panel;
    FM.Logger.debug("setFileList() called ", this.toString(), this.getSession, FM.Left.session, FM.Right.session, listing);
    this.getStore().loadData(listing.items);
    panel = this.ownerCt;
    panel.session.path = listing.path;
    panel.updatePathBar();
    panel.updateStatusBar();
    this.setListCache(listing.path, listing);
    columns = Ext.ComponentQuery.query('gridcolumn[dataIndex=name]', this);
    columns[0].sort("ASC");
    return FM.helpers.UnsetLoading(panel.body);
  },
  addFile: function(file) {
    var columns, panel;
    FM.Logger.log("addFile called ", this.ownerCt.toString(), this.getSession(), FM.Left.session, FM.Right.session, file);
    this.getStore().add(file);
    panel = this.ownerCt;
    panel.updatePathBar();
    panel.updateStatusBar();
    columns = Ext.ComponentQuery.query('gridcolumn[dataIndex=name]', this);
    return columns[0].sort("ASC");
  },
  addFiles: function(files) {
    var columns, file, i, len, panel;
    FM.Logger.log("addFiles called ", this.ownerCt.toString(), this.getSession(), FM.Left.session, FM.Right.session, files);
    for (i = 0, len = files.length; i < len; i++) {
      file = files[i];
      this.getStore().add(file);
    }
    panel = this.ownerCt;
    panel.updatePathBar();
    panel.updateStatusBar();
    columns = Ext.ComponentQuery.query('gridcolumn[dataIndex=name]', this);
    return columns[0].sort("ASC");
  },
  initHotKeys: function() {
    var panel;
    FM.Logger.log('initHotKeys()', this);
    panel = this.ownerCt;
    if (FM.HotKeys[panel.toString()] != null) {
      FM.HotKeys[panel.toString()].destroy();
    }
    return FM.HotKeys[panel.toString()] = new Ext.util.KeyMap({
      target: this.getEl(),
      binding: [
        {
          key: Ext.event.Event.TAB,
          fn: FM.HotKeys.HotKeyDecorator(function(key, e) {
            FM.helpers.SetActivePanel(FM.Inactive);
            FM.Active.filelist.getView().focus();
            return e.stopEvent();
          })
        }, {
          key: Ext.event.Event.F2,
          fn: FM.HotKeys.HotKeyDecorator(function(key, e) {
            var record;
            record = FM.helpers.GetLastSelected(FM.Active);
            if (FM.helpers.isAllowed(FM.Actions.Rename, FM.Active, [record])) {
              FM.Actions.Rename.execute(FM.Active, record);
            }
            return e.stopEvent();
          })
        }, {
          key: Ext.event.Event.BACKSPACE,
          fn: FM.HotKeys.HotKeyDecorator(function(key, e) {
            var path, record;
            record = FM.Active.filelist.getStore().findRecord("name", "..");
            if (record != null) {
              path = FM.helpers.GetAbsName(FM.Active.session, record);
              FM.Actions.Open.execute(FM.Active, path);
            }
            return e.stopEvent();
          })
        }, {
          key: Ext.event.Event.DELETE,
          fn: FM.HotKeys.HotKeyDecorator(function(key, e) {
            var records;
            records = FM.helpers.GetSelected(FM.Active);
            if (records.length === 0) {
              e.stopEvent();
            } else {
              if (FM.helpers.isAllowed(FM.Actions.Remove, FM.Active, records)) {
                FM.Actions.Remove.execute(FM.Active, FM.helpers.GetAbsNames(FM.Active.session, records));
              }
              return e.stopEvent();
            }
          })
        }, {
          key: Ext.event.Event.ENTER,
          fn: FM.HotKeys.HotKeyDecorator((function(_this) {
            return function(key, e) {
              var path, record, selection_array;
              FM.Logger.debug("ENTER", panel, arguments);
              selection_array = _this.getView().getSelectionModel().getSelection();
              if (selection_array.length > 1) {
                e.stopEvent();
                return;
              }
              if (selection_array.length === 1) {
                record = selection_array[0];
                path = FM.helpers.GetAbsName(_this.getSession(), record);
                FM.Actions.Open.execute(panel, path);
              }
              return e.stopEvent();
            };
          })(this))
        }, {
          key: Ext.event.Event.ESC,
          fn: FM.HotKeys.HotKeyDecorator(function(key, e) {
            FM.helpers.SelectDefault(FM.Active);
            return e.stopEvent();
          })
        }, {
          key: "a",
          ctrl: true,
          fn: FM.HotKeys.HotKeyDecorator(function(key, e) {
            FM.Logger.debug("Ctrl + A", panel, arguments);
            FM.Active.filelist.getView().getSelectionModel().selectAll();
            return e.stopEvent();
          })
        }, {
          key: [Ext.event.Event.NUM_THREE, Ext.event.Event.THREE],
          ctrl: true,
          fn: FM.HotKeys.HotKeyDecorator(function(key, e) {
            var record;
            record = FM.helpers.GetLastSelected(FM.Active);
            if (FM.helpers.isAllowed(FM.Actions.View, FM.Active, [record])) {
              FM.Actions.View.execute(FM.Active, record);
            }
            return e.stopEvent();
          })
        }, {
          key: [Ext.event.Event.NUM_FOUR, Ext.event.Event.FOUR],
          ctrl: true,
          fn: FM.HotKeys.HotKeyDecorator(function(key, e) {
            var record;
            record = FM.helpers.GetLastSelected(FM.Active);
            if (FM.helpers.isAllowed(FM.Actions.Edit, FM.Active, [record])) {
              FM.Actions.Edit.execute(FM.Active, record);
            }
            return e.stopEvent();
          })
        }, {
          key: [Ext.event.Event.NUM_FIVE, Ext.event.Event.FIVE],
          ctrl: true,
          fn: FM.HotKeys.HotKeyDecorator(function(key, e) {
            var records;
            records = FM.helpers.GetSelected(FM.Active);
            if (FM.helpers.isAllowed(FM.Actions.Copy, FM.Active, records)) {
              FM.Actions.Copy.execute(FM.Active, FM.Inactive, FM.Inactive.session.path, records);
            }
            return e.stopEvent();
          })
        }, {
          key: [Ext.event.Event.NUM_FIVE, Ext.event.Event.FIVE],
          shift: true,
          fn: FM.HotKeys.HotKeyDecorator(function(key, e) {
            var records;
            records = FM.helpers.GetSelected(FM.Active);
            if (FM.helpers.isAllowed(FM.Actions.Move, FM.Active, records)) {
              FM.Actions.Move.execute(FM.Active, FM.Inactive, records);
            }
            return e.stopEvent();
          })
        }, {
          key: [Ext.event.Event.NUM_SIX, Ext.event.Event.SIX],
          ctrl: true,
          fn: FM.HotKeys.HotKeyDecorator(function(key, e) {
            var record;
            record = FM.helpers.GetLastSelected(FM.Active);
            if (FM.helpers.isAllowed(FM.Actions.Rename, FM.Active, [record])) {
              FM.Actions.Rename.execute(FM.Active, record);
            }
            return e.stopEvent();
          })
        }, {
          key: [Ext.event.Event.NUM_SEVEN, Ext.event.Event.SEVEN],
          ctrl: true,
          fn: FM.HotKeys.HotKeyDecorator(function(key, e) {
            if (FM.helpers.isAllowed(FM.Actions.NewFolder, panel, [])) {
              FM.Actions.NewFolder.execute(panel);
            }
            return e.stopEvent();
          })
        }, {
          key: [Ext.event.Event.NUM_EIGHT, Ext.event.Event.EIGHT],
          ctrl: true,
          fn: FM.HotKeys.HotKeyDecorator(function(key, e) {
            var records;
            records = FM.helpers.GetSelected(panel);
            if (records.length === 0) {
              e.stopEvent();
            } else {
              if (FM.helpers.isAllowed(FM.Actions.Remove, panel, records)) {
                FM.Actions.Remove.execute(panel, FM.helpers.GetAbsNames(panel.session, records));
              }
              return e.stopEvent();
            }
          })
        }
      ]
    });
  }
});
