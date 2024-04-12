# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models, _, exceptions
from odoo.exceptions import UserError
import re


# from odoo.exceptions import UserError

class SaleOrder(models.Model):
    _inherit = 'sale.order'

    # # 二進制字段
    # avatar_image = fields.Binary(string="頭像")
    #
    # # 一對多關係字段
    # sale_order_line_ids_01036 = fields.One2many('sale.order.line', 'order_id', string="新行")
    # sale_order_line_ids_93682 = fields.One2many('sale.order.line', 'order_id', string="品牌記錄")
    #
    # # 布林字段
    # 是否已附原廠零件 = fields.Boolean(string="是否已附原廠零件")
    #
    # # 更多二進制字段
    # binary_field_28F5v = fields.Binary(string="IQC正面")
    # binary_field_3vbW5 = fields.Binary(string="右側（產品正面朝右）")
    # binary_field_5mDAO = fields.Binary(string="完成細部記錄-2")
    # binary_field_7b5lT = fields.Binary(string="IQC需修改細部記錄-1")
    # binary_field_Ckr2P = fields.Binary(string="New 簽名")
    # binary_field_Giy2J = fields.Binary(string="左側（產品正面對向自己）")
    # binary_field_ILhaI = fields.Binary(string="品牌維修單")
    # binary_field_KXkcS = fields.Binary(string="New 簽名")
    # binary_field_NuDph = fields.Binary(string="IQC頂部")
    # binary_field_T2NRc = fields.Binary(string="正面")
    # binary_field_VBGBr = fields.Binary(string="New Signature")
    # binary_field_VPIZH = fields.Binary(string="New Image")
    # binary_field_WReK6 = fields.Binary(string="IQC右側（產品正面朝右）")
    # binary_field_aTfrc = fields.Binary(string="IQC左側（產品正面朝左）")
    # binary_field_bqgbc = fields.Binary(string="IQC底部")
    # binary_field_cyunb = fields.Binary(string="背面")
    # binary_field_dLC1V = fields.Binary(string="Main Image")
    # binary_field_g955u = fields.Binary(string="New Image")
    # binary_field_gjKI2 = fields.Binary(string="IQC背面")
    # binary_field_hXXMv = fields.Binary(string="IQC需修改細部記錄-2")
    # binary_field_hrxmE = fields.Binary(string="零件照片")
    # binary_field_k0Ang = fields.Binary(string="請託件寄件紀錄")
    # binary_field_nx2FC = fields.Binary(string="底部")
    # binary_field_q3JSK = fields.Binary(string="頂部")
    # binary_field_r8D1I = fields.Binary(string="完成細部記錄-1")
    #
    # # 更多布林字段
    is_outsourcing = fields.Boolean(string="需外包")
    is_waiting_materials = fields.Boolean(string="待料")
    # boolean_field_Aulid = fields.Boolean(string="急件")
    is_original_parts = fields.Boolean(string="是否已附原廠零件？")
    #
    # # 字元字段
    brands = fields.Char(string="Brands")
    consumable_cost = fields.Char(string="耗材費用")
    part_remarks = fields.Char(string="零件備註")
    # repair_note_2 = fields.Char(string="維修筆記2")
    # repair_note_3 = fields.Char(string="維修筆記3")
    customer_name = fields.Char(string="顧客姓名")
    # dyeing = fields.Char(string="染整")
    # cleaning = fields.Char(string="清潔")
    # repair_note_4 = fields.Char(string="維修筆記4")
    # repair = fields.Char(string="維修")
    repair_details = fields.Char(string="維修細節(舊)")
    tracking_number = fields.Char(string="物流單號")

    # char_field_Nx6ii = fields.Char(string="耗材費用")
    # char_field_Pmjs9 = fields.Char(string="零件備註")
    # char_field_UBiiC = fields.Char(string="維修筆記2")
    # char_field_UeN4P = fields.Char(string="維修筆記3")
    # char_field_VDBns = fields.Char(string="顧客姓名")
    # char_field_htSlp = fields.Char(string="染整")
    # char_field_jfKvJ = fields.Char(string="清潔")
    # char_field_rm6N6 = fields.Char(string="維修筆記4")
    # char_field_uJ1zE = fields.Char(string="維修")
    # char_field_wTDut = fields.Char(string="維修細節")
    # char_field_yySX0 = fields.Char(string="物流單號")
    #
    # # 更多二進制字段
    # check1 = fields.Binary(string="CHECK1")
    # check2 = fields.Binary(string="CHECK2")
    # check3 = fields.Binary(string="CHECK3")
    # check4 = fields.Binary(string="CHECK4")
    #
    # # 日期字段
    receipt_date = fields.Date(string="收貨日期")
    entry_date = fields.Date(string="進件日期")
    delivery_date = fields.Date(string="出貨日期")
    outsourcing_date = fields.Date(string="外包日期")
    urgent_delivery_date = fields.Date(string="急件交貨日")

    #
    # # 更多字元字段
    description = fields.Char(string="顧客/品牌指示需求")
    #
    # # 更多二進制字段
    # ff = fields.Binary(string="FF")
    main_image = fields.Binary(string="圖")
    #
    # # 貨幣字段
    outsourcing_quote = fields.Float(string="外包報價")
    brand_repair_quote = fields.Float(string="品牌維修報價")
    # monetary_field_Fg9rE = fields.Float(string="外包報價")
    # monetary_field_QDvXe = fields.Float(string="品牌維修報價")
    #
    # # 日期時間字段
    rqc_date = fields.Datetime(string="RQC 日期")
    #
    # # 更多一對多關係字段
    # section_and_note_one2many = fields.One2many('your.model', 'reference_field', string="New One2many")
    #
    # # 選擇字段
    shipping_method = fields.Selection(selection=[('GBG 全球', 'GBG 全球快遞'), ('便利袋', '便利箱'), ('匯宇', '匯宇'),
                                                  ('大榮', 'KTJ嘉里大榮'), ('快遞', 'STYLUX 行得利'),
                                                  ('迪', '迪生 行得利'), ('郵局', '郵局'), ('顧客', '顧客親取'),
                                                  ('馥馥', '馥馥親送'), ('黑貓宅急便', '黑貓宅急便')
                                                  ], string="寄件方式")
    cost_category = fields.Selection(
        selection=[('新品', '新品'), ('保固', '保固'), ('倉庫', '倉庫'), ('客修', '客修自費')],
        string="費用類別", required=True)
    item_type = fields.Selection(
        selection=[('CRM', 'CRM'), ('FUR皮草', 'FUR皮草'), ('FRN 家具', 'FRN 家具'), ('LUG 行李箱', 'LUG 旅箱'),
                   ('RTW 服飾', 'RTW 服飾'),
                   ('SOX 鞋履', 'SOX 鞋履'), ('GLS眼鏡', 'GLS眼鏡'), ('ACC 飾品', 'ACC 飾品'), ('背帶', 'STRAP 背帶'),
                   ('BELT 皮帶', 'BELT 皮帶'),
                   ('小皮件', 'SLG 小皮件'), ('BKP背包', 'BKP背包'), ('手袋', 'LLG 手袋')],
        string="項目類型")
    repair_item = fields.Selection(
        selection=[('風衣防水服務', '風衣防水服務'), ('服裝修改', '服裝修改'), ('邊油+染整', '邊油+染整'),
                   ('維修+染整', '維修+染整'), ('清潔+染整', '清潔+染整'), ('清潔+維修', '清潔+維修'),
                   ('清潔+維修+染整', '清潔+維修+染整'),
                   ('維修+邊油', '維修+邊油'), ('邊油', '邊油'), ('維修', '維修'), ('整染', '染整'), ('清潔', '清潔')],
        string="維修項目")
    repair_detail = fields.Selection(selection=[('釦子', '釦子'), ('拉座', '拉座'), ('拉練', '拉練'),
                                                ('皮帶改短', '皮帶改短'), ('背帶改短', '背帶改短'),
                                                ('皮(背)帶打洞', '皮(背)帶打洞'), ('手把', '手把'),
                                                ('皮耳', '皮耳'), ('皮蓋', '皮蓋'), ('其他', '其他')],
                                     string="維修細節")

    # is_urgent = fields.Selection(selection=[('yes', '是'), ('no', '否')], string="是否為急件？")
    # internal_communication = fields.Selection(selection=[('option1', '選項1'), ('option2', '選項2')], string="內部溝通")
    # new_priority = fields.Selection(selection=[('option1', '選項1'), ('option2', '選項2')], string="新優先級")
    # cost_category = fields.Selection(selection=[('option1', '選項1'), ('option2', '選項2')], string="費用類別")
    # item_type = fields.Selection(selection=[('option1', '選項1'), ('option2', '選項2')], string="項目類型")
    # repair_detail = fields.Selection(selection=[('option1', '選項1'), ('option2', '選項2')], string="維修細節")
    # difficulty_level = fields.Selection(selection=[('option1', '選項1'), ('option2', '選項2')], string="處理難度")
    # repair_item = fields.Selection(selection=[('option1', '選項1'), ('option2', '選項2')], string="維修項目")
    # logistics = fields.Selection(selection=[('option1', '選項1'), ('option2', '選項2')], string="物流")

    # selection_field_2xe0B = fields.Selection(selection=[('option1', '選項1'), ('option2', '選項2')], string="是否為急件？")
    # selection_field_8g58L = fields.Selection(selection=[('option1', '選項1'), ('option2', '選項2')], string="內部溝通")
    # selection_field_HKG8f = fields.Selection(selection=[('option1', '選項1'), ('option2', '選項2')], string="New Priority")
    # selection_field_chPV6 = fields.Selection(selection=[('option1', '選項1'), ('option2', '選項2')], string="費用類別")
    # selection_field_hzgtw = fields.Selection(selection=[('option1', '選項1'), ('option2', '選項2')], string="項目類型")
    # selection_field_kikjs = fields.Selection(selection=[('option1', '選項1'), ('option2', '選項2')], string="寄件方式")
    # selection_field_mSMug = fields.Selection(selection=[('option1', '選項1'), ('option2', '選項2')], string="維修細節")
    # selection_field_qD9iN = fields.Selection(selection=[('option1', '選項1'), ('option2', '選項2')], string="處理難度")
    # selection_field_xgNed = fields.Selection(selection=[('option1', '選項1'), ('option2', '選項2')], string="維修項目")
    # selection_field_z1wtg = fields.Selection(selection=[('option1', '選項1'), ('option2', '選項2')], string="物流")
    #
    # # 文字字段
    # repair_note_1 = fields.Text(string="維修筆記1")
    workshop_advice = fields.Text(string="工坊維修建議")
    dispatch_communication = fields.Text(string="OP派件溝通紀錄")

    # text_field_dQehx = fields.Text(string="維修筆記1")
    # text_field_lgQch = fields.Text(string="工坊維修建議")
    # text_field_vENCT = fields.Text(string="OP派件溝通紀錄")
    product_kind_name = fields.Char(string="產品分類")
    product_service_type_name = fields.Char(string="服務類別")
    tag_name = fields.Char(string="品牌")

    is_order_line_state_4 = fields.Boolean(string='待驗收', compute='_compute_is_order_line_state_4')

    order_line_4 = fields.One2many('sale.order.line', 'order_id', string='待驗收',
                                   domain=[('display_type', '=', False)],
                                   states={'cancel': [('readonly', True)], 'done': [('readonly', True)]}, copy=False,
                                   auto_join=True)

    @api.depends('order_line.order_line_state')
    def _compute_is_order_line_state_4(self):
        for order in self:
            order.is_order_line_state_4 = any(line.order_line_state == '4' for line in order.order_line)

    def action_confirm(self):
        for line in self.order_line:
            user_id = line._find_responsible_user()
            if user_id:
                line.user_id = user_id.id
        return super(SaleOrder, self).action_confirm()

    # # 計算欄位來篩選包含圖片的訊息
    # filtered_message_ids = fields.One2many(
    #     comodel_name='mail.message',
    #     compute='_compute_filtered_message_ids',
    #     string='Filtered Messages'
    # )
    #
    # @api.depends('message_ids')
    # def _compute_filtered_message_ids(self):
    #     for record in self:
    #         # record.filtered_message_ids = record.message_ids.filtered(lambda m: re.search(r'<img[^>]*>', m.body))
    #         record.filtered_message_ids = record.message_ids.filtered(lambda m: m.attachment_ids)

    # @api.model
    # def write(self, vals):
    #     # Perform your custom logic here before updating the sale order
    #     # For example, modify the values passed to the write method
    #     # or perform additional checks/validation
    #     product_kind_name = self._update_product_kind_name(vals)
    #     if product_kind_name:
    #         # 在vals中設置產品分類名稱
    #         vals['product_kind_name'] = product_kind_name
    #
    #     return super(SaleOrder, self).write(vals)

    # @api.model
    # def create(self, vals):
    #     # Perform your custom logic here before creating the sale order
    #     # For example, modify the values passed to the create method
    #     # or perform additional checks/validation
    #     product_kind_name = self._update_product_kind_name(vals)
    #     if product_kind_name:
    #         # 在vals中設置產品分類名稱
    #         vals.setdefault('product_kind_name', product_kind_name)
    #     print(vals)
    #     return super(SaleOrder, self).create(vals)

    # @api.model
    # def _update_product_kind_name(self, vals):
    #     if 'order_line' in vals:
    #         order_line_id_to_check = -1
    #         for first_order_line in self.order_line:
    #             if first_order_line.product_kind_id:
    #                 order_line_id_to_check = first_order_line.id
    #                 break
    #
    #         for operation, line_id, line_data in vals.get('order_line', []):
    #             if line_id == order_line_id_to_check and line_data:
    #                 product_kind_id = line_data.get('product_kind_id')
    #                 if product_kind_id:
    #                     # 透過product_kind_id找到對應的product_kind記錄
    #                     product_kind = self.env['product.kind'].browse(product_kind_id)
    #                     if product_kind:
    #                         # 返回產品分類名稱
    #                         return product_kind.name
    #                     else:
    #                         raise UserError('找不到指定的產品分類記錄！')
    #     return False
