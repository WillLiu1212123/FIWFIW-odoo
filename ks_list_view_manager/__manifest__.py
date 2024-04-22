# -*- coding: utf-8 -*-
{
	'name': 'List View Manager',

	'summary': """
List view search,Global Search,Quick Search,Search engine,advance filter,Field Search,
        advanced search,Tree view,document management system,Resize columns,Export Current View,
        auto suggestion,Hide column,show column,rename column,reorder column
""",

	'description': """
List View ,
	Advance Search ,
	Read/Edit Mode ,
	Dynamic List ,
	Hide/Show list view columns ,
	List View Manager ,
	Odoo List View ,
	Odoo Advanced Search ,
	Odoo Connector ,
	Odoo Manage List View ,
	Drag and edit columns ,
	Dynamic List View Apps , 
	Advance Dynamic Tree View ,
	Dynamic Tree View Apps ,
	Advance Tree View Apps ,
	List/Tree View Apps ,
	Tree/List View Apps  ,
	Freeze List View Header ,
	List view Advance Search ,
	Tree view Advance Search ,
	Best List View Apps ,
	Best Tree View Apps ,
	Tree View Apps ,
	List View Apps ,
	List View Management Apps ,
	Treeview ,
	Listview ,
	Tree View ,
	one2many view, 
        list one2many view, 
        sticky header, 
        report templates, 
        sale order lists, 
        approval check lists, 
        pos order lists, 
        orders list in odoo,
        top app, 
        best app, 
        best apps
""",

	'author': 'Ksolves India Ltd.',

	'sequence': 1,

	'website': 'https://store.ksolves.com',

	'live_test_url': 'http://lvm15.kappso.in/web/login',

	'category': 'Tools',

	'version': '15.0.1.1.4',

	'depends': ['base', 'base_setup'],

	'license': 'OPL-1',

	'currency': 'EUR',

	'price': 171,

	'maintainer': 'Ksolves India Ltd.',

	'support': 'sales@ksolves.com',

	'images': ['static/description/lvm_v15.gif'],

	'data': ['views/ks_res_config_settings.xml', 'security/ir.model.access.csv', 'security/ks_security_groups.xml'],

	'assets': {
		'web.assets_backend': [
			'ks_list_view_manager/static/lib/spectrum/spectrum.css',
			'ks_list_view_manager/static/lib/spectrum/spectrum.js',
			'ks_list_view_manager/static/lib/stickytableheaders/jquery.stickytableheaders.js',
			'ks_list_view_manager/static/lib/resizableColumns/jQuery.ksResizableColumns.js',
			'ks_list_view_manager/static/src/css/ks_list_view_manager.scss',
			'ks_list_view_manager/static/src/js/ks_lvm_view.js',
			'ks_list_view_manager/static/src/js/ks_list_view_manager_controller.js',
			'ks_list_view_manager/static/src/js/ks_list_view_manager_renderer.js',
			'ks_list_view_manager/static/src/js/ks_color_picker.js',
			'ks_list_view_manager/static/src/js/ks_inventory_controller.js',
			'ks_list_view_manager/static/src/js/ks_account_conroller.js',
			'ks_list_view_manager/static/src/js/ks_basic_renderer.js'
		],
		'web.assets_qweb': [
			'ks_list_view_manager/static/src/xml/**/*']
	},

	'post_init_hook': 'post_install_hook',

	'uninstall_hook': 'uninstall_hook',
}
