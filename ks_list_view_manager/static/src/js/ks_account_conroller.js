odoo.define('ks_list_view_manager.account_controller', function (require) {
    "use strict";

    var view_registry = require('web.view_registry');
    var ListView = require('web.ListView');
    var bill_data = view_registry.get('account_tree');
    var ks_list_controller = require('ks_list_view_manager.controller');
    var UploadBillMixin = require('account.upload.bill.mixin');

    if(bill_data) {
        var bill = bill_data.prototype.config.Controller.extend(_.extend({}, ks_list_controller.prototype,UploadBillMixin,{

        buttons_template: 'BillsListView.buttons',
        events: _.extend({}, ks_list_controller.prototype.events, bill_data.prototype.config.Controller.prototype.events),
    }, {}));

    var BillsListView = ListView.extend({
        config: _.extend({}, ListView.prototype.config, {
            Controller: bill,
        }),
    });

    view_registry.add('account_tree', BillsListView);
    }

})