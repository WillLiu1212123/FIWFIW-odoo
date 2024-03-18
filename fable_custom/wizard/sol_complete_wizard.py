# -*- coding: utf-8 -*-
from odoo.exceptions import Warning
from odoo import models, fields, exceptions, api, _
from odoo.exceptions import UserError


class SaleOrderLineCompleteWizard(models.TransientModel):
    _name = 'sol.complete.wizard'
    _description = '接單完成'

    remark = fields.Text(string='備註')
    image_ids = fields.Many2many('ir.attachment', string='圖片上傳')

    def action_confirm(self):
        self.ensure_one()
        # sale_orders = self.env['sale.order'].browse(self._context.get('active_ids', []))
        active_ids = self._context.get('active_ids')
        sale_order_lines = self.env['sale.order.line'].browse(active_ids)
        sale_orders = sale_order_lines.mapped('order_id')

        if len(sale_orders) > 1:
            raise UserError(_('一次袛能選一張銷售訂單'))

        for order in sale_orders:
            message_body = f"Remark: {self.remark}"
            order.message_post(body=message_body, attachment_ids=self.image_ids.ids)

        for line in sale_order_lines:
            line.done_sol()

            # return {
            #     'type': 'ir.actions.act_window',
            #     'res_model': 'sale.order.commission',
            #     'view_mode': 'tree',
            #     'target': 'current',
            #     'tag': 'reload',
            # }



