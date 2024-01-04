# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models , _
from odoo.addons.base.models.res_partner import WARNING_MESSAGE, WARNING_HELP


class ResPartner(models.Model):
    _inherit = 'res.partner'

    uniform_invoice_count = fields.Integer(compute='_compute_uniform_invoice_count', string='電子發票數量')
    # uniform_invoice_ids = fields.One2many('sale.order', 'partner_id', 'Sales Order')
    ec_print = fields.Boolean(string="列印")
    ec_donate = fields.Boolean(string="捐贈")
    ec_donate_number = fields.Char(string="愛心碼")
    ec_print_address = fields.Char(string="發票寄送地址")
    ec_ident_name = fields.Char(string="發票抬頭")
    ec_ident = fields.Char(string="統一編號")
    ec_carrier_type = fields.Selection(string='載具類別',
                                       selection=[('1', '綠界科技電子發票載具'), ('2', '消費者自然人憑證'),
                                                  ('3', '消費者手機條碼')])
    ec_carrier_number = fields.Char(string="載具號碼")

    ec_monthly_customer = fields.Boolean(string="月結顧客")
    ec_birthday = fields.Date(string='生日')

    def _compute_uniform_invoice_count(self):
        uniform = self.env['uniform.invoice']
        self.uniform_invoice_count = len(uniform.search([
            ('partner_id', '=', self.id)
        ]))


    def action_view_uniform_invoice(self):
        self.ensure_one()
        return {
            'name': _('查看綠界電子發票'),
            'view_mode': 'tree,form',
            'res_model': 'uniform.invoice',
            'domain': [('partner_id', '=', self.id)],
            # 'res_id': self.id,
            'view_id': False,
            'type': 'ir.actions.act_window',
            # 'context': {'default_type': self.type}
        }
        # action = self.env['ir.actions.act_window']._for_xml_id('sale.act_res_partner_2_sale_order')
        # all_child = self.with_context(active_test=False).search([('id', 'child_of', self.ids)])
        # if self.is_company:
        #     action['domain'] = [('partner_id.commercial_partner_id.id', '=', self.id), ('partner_id', 'in', all_child.ids)]
        # else:
        #     action['domain'] = [('partner_id.id', '=', self.id), ('partner_id', 'in', all_child.ids)]
        # return action
