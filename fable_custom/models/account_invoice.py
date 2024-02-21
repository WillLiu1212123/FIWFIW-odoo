# -*- coding: utf-8 -*-
# License LGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

from odoo.addons.ecpay_invoice_tw.sdk.ecpay_main import *
from odoo import models, fields, api, _
from odoo.exceptions import UserError
from odoo.tools.float_utils import float_round


class AccountMove(models.Model):
    _inherit = "account.move"
    fc_invoice_number = fields.Char(string='手動輸入發票號碼', copy=False, tracking=True)
