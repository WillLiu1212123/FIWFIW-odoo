# -*- coding: utf-8 -*-
from odoo import models, api, fields, _, exceptions
from odoo.exceptions import ValidationError

from functools import reduce
from bs4 import BeautifulSoup
from datetime import timedelta



class SaleOrderLine(models.Model):
    _inherit = 'sale.order.line'

    customer_ref = fields.Char(related='order_id.client_order_ref', string='顧客單號 請添加小節複寫',store=True)
    team_id = fields.Many2one(related='order_id.team_id', store=True)

    sales_delay = fields.Integer(string="前置時間")
    take_date = fields.Date(string="領件日")
    tobe_date = fields.Date(string="預計完成日")
    done_date = fields.Date(string="實際完成日")

    order_line_state = fields.Selection(
        [('1', '接收訂單'), ('2', '派案'), ('3', '接案'), ('4', '維修完成'), ('5', '驗收完成'), ('6', '訂單出貨'), ('7', '訂單取消')],
        string='訂單狀態', default='1')
    test_state = fields.Selection(
        [('1', '尚未檢查'), ('2', '通過'), ('3', '不通過'), ('4', '複檢後通過')],
        string='驗收狀態', default='1')

    # 負責人欄位
    user_id = fields.Many2one('res.users', string='Responsible')

    suitable_user_ids = fields.Many2many('res.users', string='Suitable User')

    skill_ids = fields.Many2one('hr.skill', 'Skill', related='product_id.skill_id')

    def take_sol(self):
        self.order_line_state = '3'
        self.take_date = fields.Date.today()
        if self.sales_delay:
            self.tobe_date = fields.Date.today() + timedelta(days=self.sales_delay)
        else:
            self.tobe_date = fields.Date.today()
    #維修完成
    def done_sol(self):
        self.order_line_state = '4'
        self.done_date = fields.Date.today()
    #驗收完成
    def accept_sol(self):
        self.order_line_state = '5'
        self.done_date = fields.Date.today()
    #出貨完成
    def ship_sol(self):
        self.order_line_state = '6'
        self.done_date = fields.Date.today()

    # 優先順序
    priority = fields.Integer('Priority', default=10)

    def _find_responsible_user(self):
        self.ensure_one()

        sibling_responsible_user_ids = self.mapped('order_id.order_line.user_id')
        # sibling_responsible_user_ids = self.user_id
        has_skill_user_ids = self.suitable_user_ids

        # 同工單有技能優先
        for user_id in sibling_responsible_user_ids:
            if user_id.id in has_skill_user_ids.ids:
                return user_id

        # # 有技能task最少者優先
        return reduce(lambda return_user_id, next_user_id: return_user_id if return_user_id and len(
            return_user_id.assign_sol_ids) <= len(next_user_id.assign_sol_ids) else next_user_id, has_skill_user_ids,
                      self.env['res.users'])

    def _check_responsible_user_should_have_skill(self):
        if self.user_id.id in self.suitable_user_ids.ids:
            return
        else:
            return {
                'warning': {
                    'title': _('Warning'),
                    'message': _('The responsible doesn\'t have the skill %s for %s!', self.product_id.skill_id.name,
                                 self.product_id.display_name),
                }
            }


    @api.onchange('product_id')
    def _onchange_product_id(self):
        if self.product_id:
            self.suitable_user_ids = self.product_id.has_skill_user_ids.filtered(
                lambda item: item.company_ids in self.company_id)
            self.user_id = self._find_responsible_user()._origin

    @api.onchange('user_id')
    def _onchange_user_id(self):
        if self.product_id and self.user_id:
            check_result = self._check_responsible_user_should_have_skill()
            if (check_result):
                return check_result



