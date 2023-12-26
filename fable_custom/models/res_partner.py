# -*- coding: utf-8 -*-
from odoo import fields, models, api, _
from odoo.exceptions import AccessError, UserError, ValidationError
from datetime import datetime, timedelta
from odoo.tools import float_is_zero
from itertools import groupby


class ResPartner(models.Model):
    _inherit = "res.partner"

    # invoice_ids = fields.One2many('res.partner.invoic
    # principal = fields.Char(string='負責人')
    # principal_email = fields.Char(string='負責人E-MAIL')
    # fax = fields.Char(string='傳真')
    # phone_num = fields.Char(string='分機')
    #
    # safe_num = fields.Char(string='勞工保險證號')
    # health_num = fields.Char(string='健保投保單位代號')
    # retire_num = fields.Char(string='勞退提繳單位編號')
    # workblow_num = fields.Char(string='職災編號')
    #
    # employe_count = fields.Char(string="員工人數", required=False, )
    #
    # contract_type = fields.Char(string='顧問約/月費')
    # contract_num = fields.Char(string='合約編號')
    # contract_id = fields.Many2one(comodel_name="partner.contract", string="合約編號關聯", required=False, )
    # contract_master = fields.Char(string='主合約')
    #
    # isuse_fingerprint = fields.Boolean(string='安裝指紋機')
    # isuse_system = fields.Boolean(string='雲端系統')
    # system_admin = fields.Char(string='管理員員編')
    # system_memo = fields.Char(string='系統備註')



    # @api.model
    # def name_search(self, name='', args=None, operator='ilike', limit=100):
    #     args = args or []
    #     domain = []
    #     if name:
    #         domain = ['|', '|', ('ref', operator, name), ('name', operator, name), ('vat', operator, name)]
    #     records = self.search(domain + args, limit=limit)
    #     return records.name_get()
    #
    # def name_get(self):
    #     result = []
    #     for record in self:
    #         name = "[%s] %s" % (record.vat, record.name)
    #         result.append((record.id, name))
    #     return result

# class ResPartnerInvoice(models.Model):
#     _name = "res.partner.invoice"
#     _description = '發票明細'
#
#     name = fields.Text(string='發票抬頭', required=True)
#     code = fields.Char(string='發票統編', required=True)
#     partner_id = fields.Many2one(comodel_name="res.partner", string="所屬聯繫人", required=True, )

