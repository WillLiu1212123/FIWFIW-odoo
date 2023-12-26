from odoo import models, fields, api, _
from odoo.exceptions import UserError, ValidationError
from datetime import datetime
from odoo.tools import DEFAULT_SERVER_DATE_FORMAT

from odoo.tools.misc import scan_languages


class ProjectWorkitem(models.Model):
    _name = 'project.workitem'
    _description = '專案服務項目'


    name = fields.Char('工作項目', required=True)
    lpoint = fields.Float(string="最小扣點數", required=False, )
    hpoint = fields.Float(string="最大扣點數",  required=False, )
    unit = fields.Char(string="計算基礎", required=False, )

