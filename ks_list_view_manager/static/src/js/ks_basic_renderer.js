odoo.define('ks_list_view_manager.BasicRenderer', function (require) {
"use strict";

/**
 * The BasicRenderer is an abstract class designed to share code between all
 * views that uses a BasicModel. The main goal is to keep track of all field
 * widgets, and properly destroy them whenever a rerender is done. The widgets
 * and modifiers updates mechanism is also shared in the BasicRenderer.
 */
 var BasicRenderer = require('web.BasicRenderer');
var AbstractRenderer = require('web.AbstractRenderer');
var config = require('web.config');
var core = require('web.core');
var dom = require('web.dom');
const session = require('web.session');
const utils = require('web.utils');
const widgetRegistry = require('web.widget_registry');
const widgetRegistryOwl = require("web.widgetRegistry");

const { WidgetAdapterMixin } = require('web.OwlCompatibility');
const FieldWrapper = require('web.FieldWrapper');
const WidgetWrapper = require("web.WidgetWrapper");

var qweb = core.qweb;
const _t = core._t;

var KsBasicRenderer = BasicRenderer.include({


    on_attach_callback: function () {
        this._super.apply(this,arguments);

        $('.o_legacy_dialog').addClass('ks_lvm_index_content');

    },

})

return KsBasicRenderer;
});
