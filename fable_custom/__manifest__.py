# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'fable客製',
    'version': '15.0',
    'summary': 'fable客製',
    'description': "1.透過HR,SASLE指定維護人員並派工",
    'depends': ['hr', 'hr_skills', 'sale', 'crm'],
    'data': [
        'security/fable_custom_security.xml',
        'security/ir.model.access.csv',
        # 'views/project_workitem_views.xml',
        # 'views/project_task_views.xml',
        #
        # 'views/res_partner.xml',
        'views/product_views.xml',
        'views/sale_order.xml',
        'views/sale_portal_templates.xml',

        'views/fable_sol_free.xml',
        'views/fable_sol_mo_free.xml',
        'views/fable_sol_accept.xml',
        'views/fable_sol_ship.xml',




        'views/menu.xml',

    ],
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
