odoo.define('ks_list_view_manager.controller', function (require) {
    "use strict";

    var core = require('web.core');
    var ajax = require('web.ajax');
    var QWeb = core.qweb;
    var Dialog = require('web.Dialog');
    var fieldUtils = require('web.field_utils');
    var ListController = require('web.ListController');
    var framework = require('web.framework');
    var view_registry = require('web.view_registry');
    var dom = require('web.dom');
//    var ActionManager = require('web.ActionManager');
    var ListView = require('web.ListView');
    var _t = core._t;
    var inventory_validate_button = view_registry.get('inventory_validate_button');
    var basic_model = require('web.BasicModel');
    const session = require('web.session');

    ListController.include({
        saveRecord: function (ev) {
            var self = this;
            var def = this._super.apply(this, arguments);
            def.then(function () {
                self.ks_reload_list_view();
            });
            return def;
        },

//        events: _.extend({}, ListController.prototype.events, {
//            'click .ks_hide_show_checkbox': '_onKsFieldActiveClick',
//            'click span.ks_editable': '_onKsSpanFieldEditableClick',
//            'focusout input.ks_editable': '_onKsInputFieldEditableFocusout',
//            'click .cancel_button': '_onKsCancelButtonClick',
//            'hide.bs.dropdown #ks_dropdown': '_onKsHideLvmDropDown',
//            'click .restore_button': 'ks_confirm_restoreData',
//            'click .refresh_button': 'ks_reload_list_view',
//            'keyup #myInput': 'ks_searchBar',
//            'click .copy_button': '_onKsDuplicateRecord',
//            'click #mode': 'ks_modeToggle',
//            'click button.o_button_import': 'importdata',
//        }),
//
//        custom_events: _.extend({}, ListController.prototype.custom_events, {
//            Ks_update_advance_search_renderer: "Ks_update_advance_search_controller",
//            ks_remove_domain: "ks_remove_popup_domain",
//            ks_update: "ks_update_columns",
//            ks_clear_field_filters: "ks_clear_field_filters",
//            on_ks_list_header_resize: "_onKsListHeaderResize",
//        }),

        init: function (parent, model, renderer, params) {
            this.events = _.extend({}, this.events, {
                'click .ks_hide_show_checkbox': '_onKsFieldActiveClick',
                'click span.ks_editable': '_onKsSpanFieldEditableClick',
                'focusout input.ks_editable': '_onKsInputFieldEditableFocusout',
                'click .cancel_button': '_onKsCancelButtonClick',
                'hide.bs.dropdown #ks_dropdown': '_onKsHideLvmDropDown',
                'click .restore_button': 'ks_confirm_restoreData',
                'click .refresh_button': 'ks_reload_list_view',
                'keyup #myInput': 'ks_searchBar',
                'click .copy_button': '_onKsDuplicateRecord',
                'click #mode': 'ks_modeToggle',
                'click button.o_button_import': 'importdata',
            });

            this.custom_events = _.extend({},this.custom_events, {
                Ks_update_advance_search_renderer: "Ks_update_advance_search_controller",
                ks_remove_domain: "ks_remove_popup_domain",
                ks_update: "ks_update_columns",
                ks_clear_field_filters: "ks_clear_field_filters",
                on_ks_list_header_resize: "_onKsListHeaderResize",
            });
            if (!params.ks_lvm_data){
                this.ks_lvm_mode = false;
                this._super.apply(this, arguments);
            }else
            {
              this.ks_list_view_data = params.ks_lvm_data ? params.ks_lvm_data.ks_lvm_user_mode_data : false;
              this._super.apply(this, arguments);
              if(this.renderer.arch.attrs.js_class == "account_move_line_list"){
                  this.ks_lvm_mode = false;
                  this._super.apply(this,arguments); }else{
              this.ks_lvm_mode = parent.className && parent.className.search("o_action_manager") >=0 ? true:false;}
//              renderer.ks_lvm_mode = this.ks_lvm_mode;
              renderer.ks_lvm_mode = true;
              this.ks_lvm_mode = true;
              this.ksViewID = params.ks_lvm_data.ksViewID;
              this.ks_advance_search_refresh = false;
              this.importEnabled = true;
              this.ks_start_date = undefined;
              this.ks_end_date = undefined;
              this.ks_start_date_id = undefined;
              this.ks_end_date_id = undefined;
              this.ks_remove_popup_flag = false;
              this.ks_toggle = 0;
              this.ks_fields_data_dirty = {};

              this.ks_fields_data = params.ks_lvm_data && params.ks_lvm_data.ks_lvm_user_table_result ? params.ks_lvm_data.ks_lvm_user_table_result.ks_fields_data : false;
              if (!this.ks_fields_data) this.ks_fields_data = renderer.ks_fields_data;
              this.ks_field_list = Object.values(this.ks_fields_data).sort((a, b) => a.ks_field_order - b.ks_field_order);

              this.ks_table_data = params.ks_lvm_data && params.ks_lvm_data.ks_lvm_user_table_result ? params.ks_lvm_data.ks_lvm_user_table_result.ks_table_data : false;
              this.ks_lvm_user_mode_data = params.ks_lvm_data ? params.ks_lvm_data.ks_lvm_user_mode_data : false;
              this.ks_is_restore_flag = false;
              this.ks_editable = this.mode === "edit";
              this.ks_autocomplete_data = {};
              if(this.renderer.arch.attrs.js_class == "lazy_column_list"){
                this.editable=false;
                this.ks_editable = false;
              }
              this.ks_autocomplete_data_result = {};
              this.ks_field_filter = {};
              this.ks_list_default_domain = false;
              this.ks_resize = false
            }
        },

        ks_renderButtons: function () {
            if(!this.$buttons.find("#ks_dropdown").length) {
                var $lvmButtons = $(QWeb.render('ks_ListView.buttons', {widget: this}));
                if ($('#ks_dropdown').length == 0){
                $lvmButtons.appendTo($('.o_list_buttons'));
                this._ks_init_sortable();
            }
            }
            this.renderer.on_attach_callback();
        },

        _onFieldChanged: function (ev) {
                const target = ev.data.__originalComponent || ev.target;

                if(!target.__node){
                    for (var i in this.renderer.arch.children){
                        if(this.renderer.arch.children[i].attrs.name == target.props.fieldName){
                            if(ev.data.__originalComponent){
                                ev.data.__originalComponent.__node = this.renderer.arch.children[i];
                            } else {
                                ev.target.__node = this.renderer.arch.children[i];
                            }
                            break;
                        }
                    }
                }
                this._super.apply(this,arguments);
        },
        importdata: function () {
            if (!this.$buttons) {
                return;
            }
            var self = this;

            var state = self.model.get(self.handle, {raw: true});
            self.do_action({
                type: 'ir.actions.client',
                tag: 'import',
                params: {
                    model: self.modelName,
                    context: state.getContext(),
                }
            });
        },

        on_attach_callback: function () {
            if (this.ks_lvm_mode) {
                $(".o_content").addClass("ks_lvm_o_content");
                $('.o_legacy_dialog').addClass('ks_lvm_index_content');
                $(".o_cp_bottom_left").parent().addClass('ks_custom_column')
                $(".o_main_content").addClass("ks_lvm_o_main_content");

                // Adding z-index to sidebar of muk_backend_themes
                $(".mk_apps_sidebar_panel").css("z-index",1000);
                this.renderer.on_attach_callback();
                this._ks_init_sortable();
                this._super.apply(this, arguments);
                this.ks_renderButtons();
            } else {
                return this._super.apply(this, arguments);

            }
        },

        on_detach_callback: function () {
            if (this.ks_lvm_mode) {
                $(".o_content").removeClass("ks_lvm_o_content");
                $(".o_cp_bottom_left").parent().addClass('ks_custom_column')
                $(".o_main_content").removeClass("ks_lvm_o_main_content");
            } else {
                return this._super.apply(this, arguments);
            }

        },

        ks_reload_list_view: function () {
            if (this.ks_lvm_mode) {
                var ks_update_params = {};
                ks_update_params["modelName"] = this.modelName;
                ks_update_params["context"] = this.renderer.state.context;
                ks_update_params["ids"] = this.renderer.state.res_ids;
                ks_update_params["offset"] = this.renderer.state.offset;
                ks_update_params["currentId"] = this.renderer.state.res_id;
                ks_update_params["selectRecords"] = this.renderer.selection;
                ks_update_params["groupBy"] = this.renderer.state.groupedBy;
                ks_update_params["domain"] = this.renderer.state.domain;
                this.update(ks_update_params);
            }

        },

        // Initialize LVM data in Database
        ks_initialize_lvm_data: function () {
            if (this.ks_lvm_mode) {
                var self = this;
                var ks_table_width_px = this.$el.find("table.o_list_table").innerWidth();
                //patchy code to convert float number up to two decimal precisions
                var ks_table_width_per = +(((ks_table_width_px / $(window).width()) * 100).toFixed(14));
                return this._rpc({
                    route: '/ks_lvm_control/create_list_view_data',
                    params: {
                        'ks_model': this.modelName,
                        'ks_editable': this.ks_editable,
                        'ks_view_id': this.ksViewID || false,
                        'ks_table_width_per': ks_table_width_per || 99.45,
                        'ks_fields_data': this.ks_fields_data,
                        'ks_resize':self.ks_resize
                    }
                }).then(function (ks_list_view_data) {
                    self.ks_reset_list_view(ks_list_view_data).then(function () {
                        self.ks_table_data = self.renderer.ks_user_table_result.ks_table_data;
                        self.ks_fields_data = self.renderer.ks_fields_data;
                        self.ks_resize = false;
                        self.ks_field_list = Object.values(self.ks_fields_data).sort((a, b) => a.ks_field_order - b.ks_field_order);
                    });
                });
            }

        },

        // Update Field Status in LVM DB. TODO: Add condition to either update data or not
        ks_update_field_data: function (ks_table_data, ks_field_data, ks_reset_renderer) {
            if (this.ks_lvm_mode) {
                var self = this;
                if (!self.ks_table_data) {
                    return self.ks_initialize_lvm_data();
                }

                var ks_reset_renderer = ks_reset_renderer;
                //            Condition to fetch data or not

                var ks_fetch_options = {
                    'ks_model': this.modelName,
                    'ks_view_id': this.ksViewID || false,
                }

                if (ks_reset_renderer) framework.blockUI();
                return this._rpc({
                    route: '/ks_lvm_control/update_list_view_data',
                    params: {
                        'ks_table_data': ks_table_data,
                        'ks_fields_data': ks_field_data,
                        'ks_fetch_options': ks_fetch_options,
                        'ks_resize':self.ks_resize
                    }
                }).then(function (ks_list_view_data) {
                    if (ks_reset_renderer) {
                        ks_list_view_data['ks_old_domain'] = self.renderer.state.getDomain();
                        self.ks_reset_list_view(ks_list_view_data);
                        self.ks_resize = false;
                        framework.unblockUI();
                    };
                });
            }
        },

        _onSaveLine: function (ev) {
            if (this.ks_lvm_mode) {
                this.saveRecord(ev.data.recordID)
                    .then(ev.data.onSuccess).then(function (result) {
                        $('.toggle_button').show();
                        if (self.ks_editable && !$('#mode').is(':checked')) {
                            $('#mode').prop('checked', true);
                        }
                    }).guardedCatch(ev.data.onFailure);
            } else {
                return this._super.apply(this, arguments);
            }


        },

        ks_modeToggle: function (ev) {
            if (this.ks_lvm_mode) {
                var self = this;
                var ks_table_data_list = [];
                this.ks_editable = ev.target.checked;
                if (this.ks_table_data) {
                    this.ks_table_data.ks_editable = ev.target.checked;
                    ks_table_data_list = [this.ks_table_data]
                };

                if (!self.ks_table_data){
                    return self.ks_initialize_lvm_data();
                }

                this.ks_update_field_data(ks_table_data_list, [], true).then(function () {
                    self.editable = self.ks_editable ? "top" : false;
                });
            }
        },

        ks_reset_list_view: function (render_params) {
            if (this.ks_lvm_mode) {
                var self = this;
                if (render_params) {
                    var fields_view = render_params.fields_views[this.viewType];
                    var action = this.getParent() && this.getParent().widget.controlPanelProps.action;
                    var viewParams = {}
                    if (action) {
                        var renderer_state = this.renderer.state;
                        renderer_state.domain = self.renderer.ksBaseDomain;
                        viewParams = {
                            action: this.getParent() && this.getParent().widget.controlPanelProps.action,
                            hasSelectors: true,
                            modelName: action.res_model,
                            searchQuery: {
                                context: renderer_state.context,
                                domain: renderer_state.domain !== null ? renderer_state.domain: render_params['ks_old_domain'],
                                groupBy: renderer_state.groupedBy || [],
                                orderedBy: renderer_state.orderedBy || [],
                                offset: renderer_state.offset
                            },
                        };
                    }
                    return self._ks_update_renderer(fields_view, viewParams)
                }

                return $.when();
            }
        },

        ks_remove_popup_domain: function (ks_options) {
            if (this.ks_lvm_mode) {
                var self = this;
                var ks_i;
                var key;
                var key_array;

                if (ks_options.data.ksDiv !== undefined) {
                    key_array = ks_options.data.ksDiv.id.split("_value")
                    key = key_array[0];
                } else {
                    key = event.target.id;
                }

                if (self.renderer.ks_field_domain_dict[key] !== undefined) {
                    if (self.renderer.ks_field_domain_dict[key].length === 1 || ks_options.data.ksfieldtype === "date" || ks_options.data.ksfieldtype === "datetime") {
                        delete self.renderer.ks_field_domain_dict[key]
                        for (ks_i = 0; ks_i < self.renderer.ks_key_fields.length; ks_i++) {
                            if (key === self.renderer.ks_key_fields[ks_i]) {
                                break;
                            }
                        }

                        if (ks_options.data.ksDiv !== undefined) {
                            $("#" + ks_options.data.ksDiv.id).remove()
                        } else {
                            $("#" + $(ks_options.data.event.target).parent().children()[$(ks_options.data.event.target).parent().children().length - 2].id).remove();
                        }

                        self.renderer.ks_key_fields.splice(ks_i, 1);
                        self.ks_remove_popup_flag = true;
                        self.Ks_update_advance_search_controller(false);
                    } else {
                        for (var j = 0; j < self.renderer.ks_field_domain_dict[key].length; j++) {
                            if (self.renderer.ks_field_domain_dict[key][j] !== '|') {
                                if (ks_options.data.ksDiv !== undefined) {
                                    if (self.renderer.ks_field_domain_dict[key][j][2] === ks_options.data.ksDiv.innerText) {
                                        self.renderer.ks_field_domain_dict[key].splice(j, 1)
                                        self.renderer.ks_field_domain_dict[key].splice(0, 1);
                                        break;
                                    }
                                } else {
                                    self.renderer.ks_field_domain_dict[key].splice(j, 1)
                                    self.renderer.ks_field_domain_dict[key].splice(0, 1);
                                    break;
                                }
                            }
                        }
                        if (ks_options.data.ksDiv !== undefined) {
                            $("#" + ks_options.data.ksDiv.id).remove()
                        } else {
                            $("#" + $(ks_options.data.event.target).parent().children()[$(ks_options.data.event.target).parent().children().length - 2].id).remove();
                        }
                        self.ks_remove_popup_flag = true;
                        self.Ks_update_advance_search_controller(false);
                    }
                } else {
                    self.ks_remove_popup_flag = true;
                    self.Ks_update_advance_search_controller(false);
                }
            }
        },

        Ks_update_advance_search_controller: function (ks_options) {
            if (this.ks_lvm_mode) {
                var self = this;
                if (self.ks_remove_popup_flag === true) {
                    var ks_advance_search_params = {};
                    ks_advance_search_params["modelName"] = self.renderer.state.model;
                    ks_advance_search_params["context"] = self.renderer.state.context;
                    ks_advance_search_params["ids"] = self.renderer.state.res_ids;
                    ks_advance_search_params["offset"] = self.renderer.state.offset;
                    ks_advance_search_params["currentId"] = self.renderer.state.res_id;
                    ks_advance_search_params["selectRecords"] = self.renderer.selection
                    ks_advance_search_params["groupBy"] = self.renderer.state.groupedBy
                    self.renderer.ks_field_domain_list = [];

                    for (var j = 0; j < self.renderer.ks_key_fields.length; j++) {
                        self.renderer.ks_field_domain_list = self.renderer.ks_field_domain_list.concat(self.renderer.ks_field_domain_dict[self.renderer.ks_key_fields[j]]);
                    }
                    self.ks_remove_popup_flag = false;
                    ks_advance_search_params["ksDomain"] = self.renderer.ks_field_domain_list;
                    if (self.renderer.state.domain.length === 0) {
                        self.renderer.ksBaseDomain = []
                    }
                    if (self.renderer.ksBaseDomain === null && (self.renderer.ksDomain === null || self.renderer.ksDomain.length === 0) && self.renderer.state.domain.length) {
                        self.renderer.ksBaseDomain = self.renderer.state.domain
                    }
                    if (self.renderer.ksBaseDomain.length !== 0 || self.renderer.ks_field_domain_list.length !== 0) {
                        ks_advance_search_params["domain"] = self.renderer.ksBaseDomain.concat(self.renderer.ks_field_domain_list)
                    } else {
                        ks_advance_search_params["domain"] = []
                    }
                    self.renderer.ksDomain = ks_advance_search_params["ksDomain"]
                    self.update(ks_advance_search_params, undefined);
                } else {
                    var ks_val_flag = false;
                    if (ks_options.data.ks_val) {
                        ks_val_flag = ks_options.data.ks_val.trim() !== 0
                    } else {
                        if(ks_options.data.ksfieldtype == "selection"){
                            ks_val_flag = $(".custom-control-searchbar-change[data-name=" + ks_options.data.KsSearchId + "]").val().trim() !==0
                        }else{
                            ks_val_flag = $(".custom-control-searchbar-advance[data-name=" + ks_options.data.KsSearchId + "]").val() !== 0
                        }
                    }

                    if (Number(ks_val_flag)) {
                        self.ks_advance_search_refresh = true;
                        if(ks_options.data.ksfieldtype == "selection"){
                            var ks_search_value = ks_options.data.ks_val || $(".custom-control-searchbar-change[data-name=" + ks_options.data.KsSearchId + "]").val();
                        }else{
                            var ks_search_value = ks_options.data.ks_val || $(".custom-control-searchbar-advance[data-name=" + ks_options.data.KsSearchId + "]").val();
                        }
//                        var ks_search_value = ks_options.data.ks_val || $(".custom-control-searchbar-advance[data-name=" + ks_options.data.KsSearchId + "]").val();
                        var ks_advance_search_type = ks_options.data.ksfieldtype;
                        var ks_selection_values = [];
                        var ks_advance_search_params = {};
                        self.renderer.ks_field_domain_list = [];
                        self.ks_key_insert_flag = false;
                        var ks_data_insert_flag = false;
                        var ks_value = ks_options.data.KsSearchId.split("_lvm_start_date")
                        ks_advance_search_params["groupBy"] = self.renderer.state.groupedBy
                        ks_advance_search_params["modelName"] = self.renderer.state.model;
                        ks_advance_search_params["context"] = self.renderer.state.context;
                        ks_advance_search_params["ids"] = self.renderer.state.res_ids;
                        ks_advance_search_params["offset"] = self.renderer.state.offset;
                        ks_advance_search_params["currentId"] = self.renderer.state.res_id;
                        ks_advance_search_params["selectRecords"] = self.renderer.selection

                        if (ks_value.length === 1) {
                            ks_value = ks_options.data.KsSearchId.split("_lvm_end_date")
                            if (ks_value.length === 2)
                                ks_options.data.KsSearchId = ks_value[0];
                        } else {
                            ks_options.data.KsSearchId = ks_value[0];
                        }

                        for (var ks_sel_check = 0; ks_sel_check < self.renderer.ks_key_fields.length; ks_sel_check++) {
                            if (ks_options.data.KsSearchId === self.renderer.ks_key_fields[ks_sel_check]) {
                                ks_data_insert_flag = true;
                            }
                        }

                        if ((ks_data_insert_flag === false) || (ks_data_insert_flag === true && (ks_advance_search_type === "many2one" || ks_advance_search_type === "many2many" || ks_advance_search_type === "char"))) {
                            if (!(ks_advance_search_type === "datetime" || ks_advance_search_type === "date")) {
                                if (this.renderer.ks_key_fields.length === 0) {
                                    if (ks_advance_search_type === 'monetary' || ks_advance_search_type === 'integer' || ks_advance_search_type === 'float') {
                                        try {
                                            var currency = self.getSession().get_currency(self.renderer.ks_list_view_data.currency_id);
                                            var formatted_value = fieldUtils.parse.float(ks_search_value || 0, {
                                                digits: currency && currency.digits
                                            });
                                            ks_search_value = formatted_value
                                            self.renderer.ks_key_fields.push(ks_options.data.KsSearchId);
                                        } catch {
                                            self.do_notify(
                                                _t("Please enter a valid number")
                                            );
                                        }
                                    } else {
                                        self.renderer.ks_key_fields.push(ks_options.data.KsSearchId);
                                    }
                                } else {
                                    for (var key_length = 0; key_length < self.renderer.ks_key_fields.length; key_length++) {
                                        if ((self.renderer.ks_key_fields[key_length] === ks_options.data.KsSearchId)) {
                                            self.ks_key_insert_flag = true;
                                            break;
                                        }
                                    }
                                    if (!(self.ks_key_insert_flag)) {
                                        if (ks_advance_search_type === 'monetary' || ks_advance_search_type === 'integer' || ks_advance_search_type === 'float') {
                                            try {
                                                var currency = self.getSession().get_currency(self.renderer.ks_list_view_data.currency_id);
                                                var formatted_value = fieldUtils.parse.float(ks_search_value || 0, {
                                                    digits: currency && currency.digits
                                                });
                                                ks_search_value = formatted_value
                                                self.renderer.ks_key_fields.push(ks_options.data.KsSearchId);
                                            } catch {
                                                self.do_notify(
                                                    _t("Please enter a valid number")
                                                );
                                            }
                                        } else {
                                            self.renderer.ks_key_fields.push(ks_options.data.KsSearchId);
                                        }
                                    }
                                }
                            }

                            if (ks_advance_search_type === "datetime" || ks_advance_search_type === "date") {
                                if (ks_options.data.ksFieldIdentity === ks_options.data.KsSearchId + '_lvm_start_date lvm_start_date') {
                                    self.ks_start_date = ks_search_value;
                                    self.ks_start_date_id = ks_options.data.KsSearchId;
                                } else {
                                    self.ks_end_date = ks_search_value;
                                    self.ks_end_date_id = ks_options.data.KsSearchId
                                }

                                if (ks_advance_search_type === "datetime" || ks_advance_search_type === "date") {
                                    if (ks_options.data.ksFieldIdentity === ks_options.data.KsSearchId + '_lvm_end_date lvm_end_date') {
                                        if (self.ks_start_date_id === self.ks_end_date_id) {
                                            self.renderer.ks_field_domain_dict[self.ks_start_date_id] = [
                                                [self.ks_start_date_id, '>=', self.ks_start_date],
                                                [self.ks_end_date_id, '<=', self.ks_end_date]
                                            ]
                                            if (self.renderer.ks_key_fields.length === 0) {
                                                self.renderer.ks_key_fields.push(self.ks_start_date_id);
                                            } else {
                                                for (var key_length = 0; key_length < self.renderer.ks_key_fields.length; key_length++) {
                                                    if (!(self.renderer.ks_key_fields[key_length] === ks_options.data.KsSearchId)) {
                                                        self.renderer.ks_key_fields.push(self.ks_start_date_id);
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            } else if (ks_advance_search_type === 'selection') {
                                if (ks_search_value === "Select a Selection") {
                                    for (var j = 0; j < self.renderer.ks_key_fields.length; j++) {
                                        self.renderer.ks_field_domain_list = self.renderer.ks_field_domain_list.concat(self.renderer.ks_field_domain_dict[self.renderer.ks_key_fields[j]]);
                                    }
                                    ks_advance_search_params["ksDomain"] = self.renderer.ks_field_domain_list;
                                    if (self.renderer.state.domain.length === 0) {
                                        self.renderer.ksBaseDomain = []
                                    }
                                    ks_advance_search_params["domain"] = self.renderer.ksBaseDomain.concat(self.renderer.ks_field_domain_list)
                                    self.renderer.ksDomain = ks_advance_search_params["ksDomain"]
                                    self.update(ks_advance_search_params, undefined);
                                } else {

                                    // obtaining values of selection
                                    ks_selection_values = self.renderer.state.fields[ks_options.data.KsSearchId].selection;

                                    //setting values for selection
                                    for (var i = 0; i < ks_selection_values.length; i++) {
                                        if (ks_selection_values[i][1] === ks_search_value) {
                                            ks_search_value = ks_selection_values[i][0];
                                        }
                                    }
                                    self.renderer.ks_field_domain_dict[ks_options.data.KsSearchId] = [
                                        [ks_options.data.KsSearchId, '=', ks_search_value]
                                    ]
                                }
                            } else if (ks_advance_search_type === "many2one" || ks_advance_search_type === "many2many") {
                                if (self.renderer.ks_field_domain_dict[ks_options.data.KsSearchId] === undefined)
                                    self.renderer.ks_field_domain_dict[ks_options.data.KsSearchId] = [
                                        [ks_options.data.KsSearchId, "ilike", ks_search_value]
                                    ]
                                else
                                    self.renderer.ks_field_domain_dict[ks_options.data.KsSearchId].push([ks_options.data.KsSearchId, "ilike", ks_search_value])

                                if (self.renderer.ks_field_domain_dict[ks_options.data.KsSearchId].length > 1) {
                                    self.renderer.ks_field_domain_dict[ks_options.data.KsSearchId].unshift("|")
                                }
                                ks_advance_search_params["ids"] = self.initialState.res_id;
                            } else if (ks_advance_search_type === 'monetary' || ks_advance_search_type === 'integer' || ks_advance_search_type === 'float') {
                                self.renderer.ks_field_domain_dict[ks_options.data.KsSearchId] = [
                                    [ks_options.data.KsSearchId, '=', ks_search_value]
                                ]

                            }
                            else if (ks_advance_search_type === 'char') {
                                  if(self.renderer.ks_field_domain_dict[ks_options.data.KsSearchId] === undefined){
                                           self.renderer.ks_field_domain_dict[ks_options.data.KsSearchId] = [
                                           [ks_options.data.KsSearchId, 'ilike', ks_search_value]
                                               ]
                                    }
                                else{self.renderer.ks_field_domain_dict[ks_options.data.KsSearchId].push([ks_options.data.KsSearchId, 'ilike', ks_search_value])}
                                if (self.renderer.ks_field_domain_dict[ks_options.data.KsSearchId].length > 1) {
                                    self.renderer.ks_field_domain_dict[ks_options.data.KsSearchId].unshift("|")
                                }
                            }

                             else {
                                self.renderer.ks_field_domain_dict[ks_options.data.KsSearchId] = [
                                    [ks_options.data.KsSearchId, "ilike", ks_search_value]
                                ]
                            }

                            if (ks_advance_search_type === "datetime" || ks_advance_search_type === "date") {
                                if (ks_options.data.ksFieldIdentity === ks_options.data.KsSearchId + '_lvm_end_date lvm_end_date') {
                                    for (var j = 0; j < self.renderer.ks_key_fields.length; j++) {
                                        this.renderer.ks_field_domain_list = self.renderer.ks_field_domain_list.concat(self.renderer.ks_field_domain_dict[self.renderer.ks_key_fields[j]]);
                                    }
                                    ks_advance_search_params["ksDomain"] = self.renderer.ks_field_domain_list;
                                    if (self.renderer.state.domain.length === 0) {
                                        self.renderer.ksBaseDomain = []
                                    }
                                    ks_advance_search_params["domain"] = self.renderer.ksBaseDomain.concat(self.renderer.ks_field_domain_list)
                                    self.renderer.ksDomain = ks_advance_search_params["ksDomain"]
                                    self.update(ks_advance_search_params, undefined);
                                    self.ks_start_date = undefined;
                                    self.ks_end_date = undefined;
                                    self.ks_start_date_id = undefined;
                                    self.ks_end_date_id = undefined;
                                }
                            } else {
                                if (ks_advance_search_type === 'monetary' || ks_advance_search_type === 'integer' || ks_advance_search_type === 'float') {
                                    if (!(isNaN(ks_search_value))) {
                                        for (var j = 0; j < self.renderer.ks_key_fields.length; j++) {
                                            self.renderer.ks_field_domain_list = self.renderer.ks_field_domain_list.concat(self.renderer.ks_field_domain_dict[self.renderer.ks_key_fields[j]]);
                                        }
                                        ks_advance_search_params["ksDomain"] = self.renderer.ks_field_domain_list;
                                        if (self.renderer.state.domain.length === 0) {
                                            self.renderer.ksBaseDomain = []
                                        }
                                        ks_advance_search_params["domain"] = self.renderer.ksBaseDomain.concat(self.renderer.ks_field_domain_list)
                                        self.renderer.ksDomain = ks_advance_search_params["ksDomain"]
                                        self.update(ks_advance_search_params, undefined);
                                    } else {
                                        if (self.renderer.state.domain.length === 0) {
                                            self.renderer.ksBaseDomain = []
                                        }
                                        ks_advance_search_params["domain"] = self.renderer.ksDomain || []
                                        self.update(ks_advance_search_params, undefined);
                                    }
                                } else {
                                    for (var j = 0; j < self.renderer.ks_key_fields.length; j++) {
                                        self.renderer.ks_field_domain_list = self.renderer.ks_field_domain_list.concat(self.renderer.ks_field_domain_dict[self.renderer.ks_key_fields[j]]);
                                    }
                                    ks_advance_search_params["ksDomain"] = self.renderer.ks_field_domain_list;
                                    if (self.renderer.state.domain.length === 0) {
                                        self.renderer.ksBaseDomain = []
                                    }
                                    ks_advance_search_params["domain"] = self.renderer.ksBaseDomain.concat(self.renderer.ks_field_domain_list)
                                    self.renderer.ksDomain = ks_advance_search_params["ksDomain"]
                                    self.update(ks_advance_search_params, undefined);
                                }
                            }
                        } else {
                            for (var j = 0; j < self.renderer.ks_key_fields.length; j++) {
                                self.renderer.ks_field_domain_list = self.renderer.ks_field_domain_list.concat(self.renderer.ks_field_domain_dict[self.renderer.ks_key_fields[j]]);
                            }
                            ks_advance_search_params["ksDomain"] = self.renderer.ks_field_domain_list;
                            if (self.renderer.state.domain.length === 0) {
                                self.renderer.ksBaseDomain = []
                            }
                            ks_advance_search_params["domain"] = self.renderer.ksBaseDomain.concat(self.renderer.ks_field_domain_list)
                            self.renderer.ksDomain = ks_advance_search_params["ksDomain"]
                            self.update(ks_advance_search_params, undefined);
                        }
                    } else {
                        self.ks_advance_search_refresh = true;
//                        var ks_search_value = $('#' + ks_options.data.KsSearchId).val().trim();
                        if(ks_options.data.ksfieldtype == "selection"){
                             var ks_search_value = $(".custom-control-searchbar-change[data-name=" + ks_options.data.KsSearchId + "]").val().trim();
                        }else{
                             var ks_search_value = $(".custom-control-searchbar-advance[data-name=" + ks_options.data.KsSearchId + "]").val();
                        }
//                        var ks_search_value = $(".custom-control-searchbar-advance[data-name=" + ks_options.data.KsSearchId + "]").val().trim();
                        var ks_advance_search_type = ks_options.data.ksfieldtype;
                        var ks_selection_values = [];
                        var ks_advance_search_params = {};
                        self.renderer.ks_field_domain_list = [];
                        self.ks_key_insert_flag = false;
                        var ks_data_insert_flag = false;
                        var ks_value = ks_options.data.KsSearchId.split("_lvm_start_date")

                        ks_advance_search_params["modelName"] = self.renderer.state.model;
                        ks_advance_search_params["context"] = self.renderer.state.context;
                        ks_advance_search_params["ids"] = self.renderer.state.res_ids;
                        ks_advance_search_params["offset"] = self.renderer.state.offset;
                        ks_advance_search_params["currentId"] = self.renderer.state.res_id;
                        ks_advance_search_params["selectRecords"] = self.renderer.selection
                        ks_advance_search_params["groupBy"] = []

                        for (var j = 0; j < self.renderer.ks_key_fields.length; j++) {
                            self.renderer.ks_field_domain_list = self.renderer.ks_field_domain_list.concat(self.renderer.ks_field_domain_dict[self.renderer.ks_key_fields[j]]);
                        }
                        ks_advance_search_params["ksDomain"] = self.renderer.ks_field_domain_list;
                        if (self.renderer.state.domain.length === 0) {
                            self.renderer.ksBaseDomain = []
                        }
                        ks_advance_search_params["domain"] = self.renderer.ksBaseDomain.concat(self.renderer.ks_field_domain_list)
                        self.renderer.ksDomain = ks_advance_search_params["ksDomain"]
                        self.update(ks_advance_search_params, undefined);
                    }
                }
            }
        },

        ks_searchBar: function (e) {
            if (this.ks_lvm_mode) {
                var ks_input = e.target.value.toUpperCase();
                _.map($(".ks_columns_list").children(), function ($field) {
                    $field.style.display = $field.dataset.ks_columns_name.toUpperCase().indexOf(ks_input) > -1 ? "" : "none";
                })
            }
        },

        ks_confirm_restoreData: function (event) {
            if (this.ks_lvm_mode) {
                var self = this;
                self.ks_resize = false;
                Dialog.confirm(this, _t("Are you sure you want to restore to Odoo default View?"), {
                    confirm_callback: function () {
                        self.ks_is_restore_flag = true;
                        self.ksResetLvmData();
                    }
                });
            }
        },

        ksResetLvmData: function () {
            if (this.ks_lvm_mode) {
                var self = this;
                if (this.ks_table_data) {
                    return this._rpc({
                        route: '/ks_lvm_control/ks_reset_list_view_data',
                        params: {
                            'ks_model': this.modelName,
                            'ks_view_id': this.ksViewID || false,
                            'ks_lvm_table_id': this.ks_table_data.id
                        }
                    }).then(function (ks_list_view_data) {
                        self.ks_reset_list_view(ks_list_view_data).then(function () {
                            self.KsResetControllerData();
                        });
                    });
                }

                //            self.KsResetControllerData();
                return $.when();
            }
        },

        KsResetControllerData: function () {
            if (this.ks_lvm_mode) {
                var self = this;
                this.ks_table_data = this.renderer.ks_user_table_result.ks_table_data;
                this.ks_fields_data = this.renderer.ks_fields_data;
                this.ks_field_list = Object.values(this.ks_fields_data).sort((a, b) => a.ks_field_order - b.ks_field_order);

                this.ks_lvm_user_mode_data = false;
                if ($(".ks_columns").length) {
                    $(".ks_columns_list").remove();
                    //                TODO : Correct this thing
                    $(".ks-text-center").remove();
                    var $ks_column_list = QWeb.render("ks_list_view_fields_selection_list", {
                        widget: this
                    });
                    $(".ks_columns").append($ks_column_list);
                    self._ks_init_sortable();

                }
                this.ks_editable = this.mode === "edit";
                this.$el.find("#mode").prop('checked', this.ks_editable);
                this.editable = this.mode === "edit" ? "top" : false;
                if(this.renderer.arch.attrs.js_class == "lazy_column_list"){
                    this.editable=false;
                    this.ks_editable = false;
              }
            }
        },

        _onKsListHeaderResize: function (option) {
            if (this.ks_lvm_mode) {
                var self = this;
                var data = option.data || {};
                var ks_to_update_field_data = [];

                var table_width = this.$el.find("table.o_list_table").innerWidth();
                if (self.ks_table_data) self.ks_table_data.ks_table_width = +(((table_width / $(window).width()) * 100).toFixed(14));
                var ks_table_data = self.ks_table_data ? [self.ks_table_data] : [];

                _.each($('.tableFloatingHeaderOriginal th[data-name]'), function (field) {
                    if(self.ks_fields_data[$(field).data().name]){
                        self.ks_fields_data[$(field).data().name].ks_width = table_width > 0 ? +((($(field).innerWidth() * 100) / table_width).toFixed(14)) : 0.0;
                        var ks_field_data = self.ks_fields_data[$(field).data().name];
                        ks_to_update_field_data.push(ks_field_data);
                    }
                });
                self.ks_resize = true

                if (!self.ks_table_data){
                    return self.ks_initialize_lvm_data();
                }

                self.ks_update_field_data(ks_table_data, ks_to_update_field_data, false);
                if (self.ks_table_data) self.ks_reload_list_view();
            }
        },

        _onKsFieldActiveClick: function (event) {
            if (this.ks_lvm_mode) {
                event.stopPropagation();
                var self = this;
                self.ks_resize = false;
                if (session.ks_toggle_color) {
                    $("input:checked + .ks_slider").css("background-color", session.ks_toggle_color);
                    $("input:not(:checked) + .ks_slider").css("background-color", "");
                }
                var ks_field_data = this.ks_fields_data[event.target.dataset.field_name];
                ks_field_data.ksShowField = event.target.checked;

                if (!self.ks_table_data){
                    return self.ks_initialize_lvm_data();
                }

                self.ks_update_field_data([], [ks_field_data], true)
            }
        },

        _onKsSpanFieldEditableClick: function (event) {
            if (this.ks_lvm_mode) {
                event.stopPropagation();
                var self = this;
                var ks_field_id = event.target.dataset.fieldId;
                var $field_span_el = $(event.target);
                var $field_input_el = this.$el.find('input.ks_editable[data-field-id=' + ks_field_id + ']');
                var name = this.ks_fields_data[ks_field_id].ks_columns_name;
                $field_input_el.val(name);
                $field_span_el.hide();
                $field_input_el.removeClass("d-none");
                $field_input_el.focus();
                $(".cancel_button").removeClass("d-none");
            }
        },

        _onKsInputFieldEditableFocusout: function (event) {
            if (this.ks_lvm_mode) {
                event.stopPropagation();
                var self = this;
                var ks_field_id = event.target.dataset.fieldId;
                var $field_span_el = this.$el.find('span.ks_editable[data-field-id=' + ks_field_id + ']');
                var $field_input_el = $(event.target)
                var name = this.ks_fields_data[ks_field_id].ks_columns_name;
                var input_val = $field_input_el.val();

                if (input_val.length !== 0) {
                    $field_span_el.text(input_val);
                    self.ks_fields_data_dirty[ks_field_id] = _.extend({}, self.ks_fields_data_dirty[ks_field_id], {
                        ks_columns_name: input_val,
                        id: self.ks_fields_data[ks_field_id].id,
                    })
                }
                $field_span_el.show();
                $field_input_el.addClass("d-none");
            }
        },

        _onKsCancelButtonClick: function (event) {
            if (this.ks_lvm_mode) {
                event.stopPropagation();
                var self = this;
                _.map(Object.keys(self.ks_fields_data_dirty), function (ks_field_id) {
                    var $field_span_el = self.$el.find('span.ks_editable[data-field-id=' + ks_field_id + ']');
                    var name = self.ks_fields_data[ks_field_id].ks_columns_name;
                    $field_span_el.text(name);
                });
                self.ks_fields_data_dirty = {};
                $(".cancel_button").addClass("d-none");
            }
        },

        _onKsHideLvmDropDown: function (event) {
            if (this.ks_lvm_mode) {
                event.stopPropagation();
                var self = this;

                // Box Hide Reset View
                $(".cancel_button").addClass("d-none");
                $("#myInput").val("");
                _.map($(".ks_columns_list").children(), function ($field) {
                    $field.style.display = "";
                })

                // Hack code to control drop down button click again when drop down is active
                if (!event.hasOwnProperty("clickEvent")) return false;

                // Handle BS hide : Write Dirty Data
                if (!$(".ks_lvm_dd").has(event.clickEvent.target).length > 0) {
                    if (Object.keys(self.ks_fields_data_dirty).length > 0 && !self.ks_is_restore_flag) {
                        var ks_update_field_list = [];
                        _.map(self.ks_fields_data_dirty, function (value, key) {
                            ks_update_field_list.push(value);
                            self.ks_fields_data[key]['ks_columns_name'] = value['ks_columns_name'];
                        })
                        self.ks_update_field_data([], ks_update_field_list, true).then(function () {
                            self.ks_fields_data_dirty = {};
                        });
                    }
                    self.ks_is_restore_flag = false;
                }
                return !$(".ks_lvm_dd").has(event.clickEvent.target).length > 0;
            }
        },

        _ks_update_renderer: function (fields_view, viewParams) {
            if (this.ks_lvm_mode) {
                var self = this;
                fields_view.ks_lvm_user_data["default_fields"] = this.renderer.ks_lvm_data["default_fields"];
                var View = view_registry.get(this.viewType);
                var view = new View(fields_view, _.extend({}, viewParams));
                var rendererScrollTop = this.$el.scrollTop();
                var localState = false;
                if (this.renderer && this.renderer.getLocalState) {
                    localState = this.renderer.getLocalState();
                }

                var oldRenderer = this.renderer;
                if (viewParams.searchQuery.groupBy.length >0){
                for(var i=0; i < viewParams.searchQuery.groupBy.length; i++){
                    var group_by_field = viewParams.searchQuery.groupBy[i];
                    var group_by_field = group_by_field.split(':')[0];

                    if (!fields_view.fields[group_by_field]){
                        view.fields[group_by_field] = fields_view.ks_lvm_user_data["default_fields"][group_by_field];
                    }

                }
}

                return self._ks_init_renderer(view, this.model, fields_view).then(function (renderer) {
                    var fragment = document.createDocumentFragment();
                    return renderer.appendTo(fragment).then(function () {

                        dom.append(self.$('.o_content'), [fragment], {
                            in_DOM: self.isInDOM,
                            callbacks: [{
                                widget: renderer
                            }],
                        });
                        oldRenderer.destroy();
                        self.renderer = renderer;
                        self.update({
                            domain: self.renderer.state.domain
                        }, {
                            reload: false
                        });


                        // restore previous state
                        self.$el.scrollTop(rendererScrollTop);
                        if (localState) {
                            self.renderer.setLocalState(localState);
                        }

                        // TODO : Check if this can be ignored
                        self.renderer.on_attach_callback();
                    });
                });
            }
        },

        _ks_init_renderer: function (view, model, fields_view) {
            if (this.ks_lvm_mode) {
                var self = this;

                var Renderer = view.config.Renderer;
                return Promise.all([view._loadData(model), ajax.loadLibs(view)]).then(function (result) {
                    var state = result[0].state;
                    //                Monkey Patch
                    self.handle = state.id;
                    var params = _.extend({}, view.rendererParams, {
                        noContentHelp: undefined,
                        'ks_lvm_data': fields_view.ks_lvm_user_data || false,
                        'ks_lvm_mode': true,
                    });
                    var renderer = new Renderer(self, state, params);
                    return renderer;
                });
            }
        },

        _ks_init_sortable: function () {
            if (this.ks_lvm_mode) {
                var self = this;
                $(".ks_columns_list").sortable({
                    axis: 'y',
                    update: function (event, ui) {
                        self._ks_update_fields_order(event, ui);
                    }
                });
                if (session.ks_toggle_color) {
                    $("input:checked + .ks_slider").css("background-color", session.ks_toggle_color);
                }
            }
        },

        _ks_update_fields_order(event, ui) {
            if (this.ks_lvm_mode) {
                var self = this;
                var sort_counter = 0;
                _.map($(".ks_columns_list").children(), function ($field) {
                    self.ks_fields_data[$field.dataset.field_name].ks_field_order = sort_counter;
                    sort_counter += 1;
                })

                if (!self.ks_table_data){
                    return self.ks_initialize_lvm_data();
                }

                self.ks_update_field_data([], Object.values(self.ks_fields_data), true);
            }
        },

        _onKsDuplicateRecord: function () {
            if (this.ks_lvm_mode) {
                var self = this;
                this._rpc({
                    route: '/ks_lvm_control/ks_duplicate_list_records',
                    params: {
                        'ks_model': this.modelName,
                        'ks_record_ids': this.getSelectedIds() || [],
                    }
                }).then(function (res) {
                    $(".refresh_button").removeClass("d-none");
                    $(".toggle_button").removeClass("d-none");
                    $(".mode_button").removeClass("d-none");
                    $('.copy_button').hide();
                    self.reload();
                });
            }
        },

        // Duplicate Record button Hide/Active
        _onSelectionChanged: function (event) {
            if (this.ks_lvm_mode) {
                this._super.apply(this, arguments);
                var ks_button = $('.copy_button');
                this.renderer.selection.length !== 0 ? ks_button.show() : ks_button.hide();
                if (this.ks_list_view_data.ks_dynamic_list_show === false) {
                    $('.copy_button').hide();
                }
            } else {
                this._super.apply(this, arguments);
            }
        },

    });

    //  make suitable with BillsListView

//    ActionManager.include({
//        _pushController: function (controller) {
//            this._super.apply(this, arguments);
//            if(controller.widget.ks_lvm_mode){
//
//                controller.widget.ks_renderButtons();
//            }
//        }
//    });



    basic_model.include({
        _readGroup: function (list, options) {
            if(list.context.default_fields) list.fields = _.extend({},list.context.default_fields);
            return this._super.apply(this, arguments);
        },
    })
    return ListController;
});