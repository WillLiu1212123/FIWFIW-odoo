# -*- coding: utf-8 -*-
from odoo import models, api, fields, _, exceptions
from odoo.exceptions import ValidationError

from functools import reduce
from bs4 import BeautifulSoup
from datetime import timedelta


class SaleOrderLine(models.Model):
    _inherit = 'sale.order.line'

    def _get_customer_ref(self):
        default_display_type = self.env.context.get('default_display_type')
        if default_display_type == 'line_section':
            # 同樣安全地訪問 default_client_order_ref
            client_order_ref = self.env.context.get('default_client_order_ref')
            if client_order_ref:
                return client_order_ref
        return ''

    customer_ref = fields.Char(related='order_id.client_order_ref', string='顧客單號 請添加小節複寫', store=True)
    team_id = fields.Many2one(related='order_id.team_id', store=True)
    name = fields.Text(string='說明', required=True, default=_get_customer_ref)

    sales_delay = fields.Integer(string="前置時間")
    take_date = fields.Date(string="領件日")
    tobe_date = fields.Date(string="預計完成日")
    done_date = fields.Date(string="實際完成日")

    order_line_state = fields.Selection(
        [('1', '接收訂單'), ('2', '派案'), ('3', '維修中'), ('4', '維修完成'), ('5', '驗收完成'), ('6', '訂單出貨'),
         ('7', '訂單取消')],
        string='訂單狀態', default='1')
    test_state = fields.Selection(
        [('1', '未檢查'), ('2', '待檢查'), ('3', '通過'), ('4', '不通過'), ('5', '不通過待複檢'), ('6', '複檢後通過')],
        string='驗收狀態', default='1')

    # 負責人欄位
    user_id = fields.Many2one('res.users', string='Responsible', copy=False)

    suitable_user_ids = fields.Many2many('res.users', string='Suitable User')

    skill_ids = fields.Many2one('hr.skill', 'Skill', related='product_id.skill_id')

    product_kind_id = fields.Many2one(comodel_name="product.kind", string="類型", required=False, )
    product_servicetype_id = fields.Many2one(comodel_name="product.servicetype", string="類別", required=False, )
    product_servicecontent_id = fields.Many2one(comodel_name="product.servicecontent", string="材質",
                                                required=False, )
    product_property_id = fields.Many2one(comodel_name="product.property", string="內容", required=False, )
    product_size_id = fields.Many2one(comodel_name="product.size", string="尺吋", required=False, )
    # filtered_product_id = fields.Many2one(comodel_name="product.product", string="產品", required=False, )
    filtered_product_id = fields.Char(string="", required=False, )

    product_memo = fields.Text(string="備註", required=False, )
    tag_ids = fields.Many2many('crm.tag', 'sale_order_line_tag_rel', 'order_line_id', 'tag_id', string='品牌')
    product_color_id = fields.Many2one(comodel_name="product.color", string="顏色", required=False, )

    order_id_name = fields.Char(compute='_compute_order_id_name')

    def _compute_order_id_name(self):
        for record in self:
            record.order_id_name = record.order_id.name if record.order_id else ''

    @api.onchange('product_kind_id', 'product_servicetype_id', 'product_servicecontent_id', 'product_property_id',
                  'product_size_id')
    def _onchange_filtered_product(self):
        self.ensure_one()
        domain = []

        if self.product_kind_id:
            domain.append(('product_kind_id', '=', self.product_kind_id.id))
        if self.product_servicetype_id:
            domain.append(('product_servicetype_id', '=', self.product_servicetype_id.id))
        if self.product_servicecontent_id:
            domain.append(('product_servicecontent_id', '=', self.product_servicecontent_id.id))
        if self.product_property_id:
            domain.append(('product_property_id', '=', self.product_property_id.id))
        if self.product_size_id:
            domain.append(('product_size_id', '=', self.product_size_id.id))

        # found_products = self.env['product.product'].search(domain).ids
        found_products = self.env['product.product'].search(domain)

        if found_products:
            if len(found_products) == 1:
                self.product_id = found_products.id

            found_product_kind_id = found_products.mapped('product_kind_id')
            found_product_servicetype_id = found_products.mapped('product_servicetype_id')
            found_product_servicecontent_id = found_products.mapped('product_servicecontent_id')
            found_product_property_id = found_products.mapped('product_property_id')
            found_product_size_id = found_products.mapped('product_size_id')
            return {'domain': {'product_id': [('id', 'in', found_products.ids)],
                               'product_kind_id': [('id', 'in', found_product_kind_id.ids)],
                               'product_servicetype_id': [('id', 'in', found_product_servicetype_id.ids)],
                               'product_servicecontent_id': [('id', 'in', found_product_servicecontent_id.ids)],
                               'product_property_id': [('id', 'in', found_product_property_id.ids)],
                               'product_size_id': [('id', 'in', found_product_size_id.ids)]}}
        else:
            return {'domain': {'product_id': [('id', '=', False)],
                               'product_kind_id': [('id', '=', False)],
                               'product_servicetype_id': [('id', '=', False)],
                               'product_servicecontent_id': [('id', '=', False)],
                               'product_property_id': [('id', '=', False)],
                               'product_size_id': [('id', '=', False)]}}

    # def button_clear(self):
    #     self.product_id = False
    #     self.product_kind_id = False
    #     self.product_servicetype_id = False
    #     self.product_servicecontent_id = False
    #     self.product_property_id = False
    #     self.product_size_id = False

    def take_sol(self):
        self.order_line_state = '3'
        self.take_date = fields.Date.today()
        if self.sales_delay:
            self.tobe_date = fields.Date.today() + timedelta(days=self.sales_delay)
        else:
            self.tobe_date = fields.Date.today()

    # 維修完成
    def done_sol(self):
        # self.order_line_state = '4'
        # if self.test_state == '1': #未檢查
        #     self.test_state = '2' #待檢查
        # else:
        #     self.test_state = '5' #不通過待複檢
        # self.done_date = fields.Date.today()
        return {
            'type': 'ir.actions.act_window',
            'name': '維修批次完成',
            'res_model': 'sol.complete.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {
                'active_ids': self.id,  # 假设向导中有一个字段名为 order_line_id 用于存放当前订单行 ID
                'form_view_initial_mode': 'edit',  # 打开表单视图时默认处于编辑状态
            }
        }

    # 驗收通過
    def accept_sol(self):
        self.order_line_state = '5'
        if self.test_state == '2':  # 未檢查
            self.test_state = '3' #通過
        if self.test_state == '5':  # 不通過待複檢
            self.test_state = '6' #複檢後通過
        self.done_date = fields.Date.today()

    # 驗收不過通
    def accept_sol_return(self):
        self.order_line_state = '1'
        self.test_state = '4' #不通過
        # self.done_date = fields.Date.today()

    # 出貨完成
    def ship_sol(self):
        self.order_line_state = '6'
        self.done_date = fields.Date.today()

    # 優先順序
    priority = fields.Integer('Priority', default=10)

    def _find_responsible_user(self):
        self.ensure_one()

        # 取得同產品分類的工作者
        sibling_responsible_user_ids = self.env['sale.order.line'].search(
            [('product_id.categ_id', '=', self.product_id.categ_id.id), ('order_line_state', '<=', 6),
             ('id', '!=', self.id)]).mapped('user_id')
        # sibling_responsible_user_ids = self.mapped('order_id.order_line.user_id')
        # sibling_responsible_user_ids = self.user_id
        has_skill_user_ids = self.suitable_user_ids

        # 同產品分類有技能優先
        for user_id in sibling_responsible_user_ids:
            if user_id.id in has_skill_user_ids.ids:
                return user_id

        # 依 has_skill_user_ids 中的，assign_sol_ids 筆數，比對，取得 assign_sol_ids 最少的人員
        user_line_counts = {}
        for user_id in has_skill_user_ids:
            line_count = self.env['sale.order.line'].search_count([
                ('order_line_state', '<=', 6),
                ('user_id', '=', user_id.id)
            ])
            user_line_counts[user_id] = line_count
        if user_line_counts:
            min_line_user_id = min(user_line_counts, key=user_line_counts.get)
            return min_line_user_id
        else:
            if has_skill_user_ids:
                return has_skill_user_ids[0]
            else:
                return False

        # # # 有技能task最少者優先
        # return reduce(lambda return_user_id, next_user_id: return_user_id if return_user_id and len(
        #     return_user_id.assign_sol_ids) <= len(next_user_id.assign_sol_ids) else next_user_id, has_skill_user_ids,
        #               self.env['res.users'])

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
            # self.user_id = self._find_responsible_user()._origin
            list = []
            result = {}
            for line in self.product_id.has_skill_user_ids.filtered(
                lambda item: item.company_ids in self.company_id):
                list.append(line.id)
            result['domain'] = {'suitable_user_ids': [('id', 'in', list)]}
            return result

    @api.onchange('user_id')
    def _onchange_user_id(self):
        if self.product_id and self.user_id:
            check_result = self._check_responsible_user_should_have_skill()
            if (check_result):
                return check_result

    # @api.model
    # def create(self, vals):
    #     # 创建销售订单行
    #     new_line = super(SaleOrderLine, self).create(vals)
    #     # print(vals)
    #     # print(new_line)
    #     self._update_display_fields(False)
    #     return new_line
    #
    # @api.model
    # def write(self, vals):
    #     # print(f"on sale order line write vals :{vals}")
    #     result = super(SaleOrderLine, self).write(vals)
    #     # print(f"on sale order line write results:{result}")
    #     self._update_display_fields(False)
    #     # for line in self.order_id.order_line:
    #     #     print(f"all line id is {line.id}")
    #     #     product_kind_id = line.product_kind_id.id
    #     #     if product_kind_id:
    #     #         print(f"product kind id is {product_kind_id}")
    #     # for pid in self.order_id.order_line.product_kind_id:
    #     #     if pid:
    #     #         print(f"order lin product kind id is {pid}")
    #     return result
    #
    # @api.model
    # def unlink(self):
    #     # print(f"on sale order line unlink ")
    #     self._update_display_fields(True)
    #     result = super(SaleOrderLine, self).unlink()
    #     return result
    #
    # def _update_display_fields(self, is_from_unlink):
    #     product_kind_name = ''
    #     product_service_type_name = ''
    #     tag_name = ''
    #
    #     # 當 is_from_unlink 為 False，修改 sale order line 中有 product id 的第一筆資料
    #     # 當 is_from_unlink 為 True，修改 sale order line 中有 product id 且不是自身的第一筆資料
    #     for line in self.order_id.order_line:
    #         if (not is_from_unlink or (is_from_unlink and line.id != self.id)) and line.product_id:
    #             product_kind_id = line.product_kind_id.id
    #             product_service_type_id = line.product_servicetype_id.id
    #             tag_id = line.tag_ids.id
    #             if product_kind_id:
    #                 product_kind = self.env['product.kind'].browse(product_kind_id)
    #                 if product_kind:
    #                     product_kind_name = product_kind.name
    #
    #             if product_service_type_id:
    #                 product_service_type = self.env['product.servicetype'].browse(product_service_type_id)
    #                 if product_service_type:
    #                     product_service_type_name = product_service_type.name
    #
    #             if tag_id:
    #                 tag = self.env['crm.tag'].browse(tag_id)
    #                 if tag:
    #                     tag_name = tag.name
    #             break
    #
    #     # 將 product_kind_name 賦值給 self.order_id.product_kind_name
    #     self.order_id.product_kind_name = product_kind_name
    #     self.order_id.product_service_type_name = product_service_type_name
    #     self.order_id.tag_name = tag_name

    def open_order_fable_form(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Sales Order',
            'res_model': 'sale.order',
            'res_id': self.order_id.id,
            'view_mode': 'form',
            'view_id': self.env.ref('fable_custom.view_order_form_fable_custom').id,
            'target': 'current',
        }
