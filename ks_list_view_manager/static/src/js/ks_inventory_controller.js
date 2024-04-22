odoo.define('ks_list_view_manager.inventory_controller', function (require) {
    "use strict";

    var view_registry = require('web.view_registry');
    var ListView = require('web.ListView');
    var inventory_validate_button = view_registry.get('inventory_validate_button');
    var ks_list_controller = require('ks_list_view_manager.controller');

    if(inventory_validate_button) {
        // making suitable with invetory validate button list view
        var inventory_validate = inventory_validate_button.prototype.config.Controller.extend(_.extend({}, ks_list_controller.prototype,{
            events: _.extend({},ks_list_controller.prototype.events,inventory_validate_button.prototype.config.Controller.prototype.events),

            init: function (parent, model, renderer, params) {
                return this._super.apply(this, arguments);
            },

            // -------------------------------------------------------------------------
            // Public
            // -------------------------------------------------------------------------

            /**
             * @override
             */
            renderButtons: function ($node) {
                this._super.apply(this, arguments);
            },

            // -------------------------------------------------------------------------
            // Handlers
            // -------------------------------------------------------------------------

            /**
             * Handler called when user click on validation button in inventory lines
             * view. Makes an rpc to try to validate the inventory, then will go back on
             * the inventory view form if it was validated.
             * This method could also open a wizard in case something was missing.
             *
             * @private
             */
            _onValidateInventory: function () {
                this._super.apply(this, arguments);
            },
        },{}));

        var InventoryValidationView = ListView.extend({
            config: _.extend({}, ListView.prototype.config,{
                Controller: inventory_validate,
            }),
        });

        view_registry.add('inventory_validate_button', InventoryValidationView);
    }

})