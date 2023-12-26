#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
user.py

"""

from odoo import models, api, fields, _, exceptions


class ResUser(models.Model):
    """
    [] 增加 skill 的 computed 欄位

    [res.users]
    """
    _inherit = 'res.users'

    skill_ids = fields.Many2many('hr.skill', 'employee_skill', compute='_user_skills')
    assign_sol_ids = fields.One2many(comodel_name="sale.order", inverse_name="user_id", string="Assign sale order", required=False, )

    def _user_skills(self):
        for user in self:
            user.skill_ids = self.mapped('employee_ids.employee_skill_ids.skill_id')
