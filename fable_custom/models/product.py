#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
product.py

"""
from typing import Any

from odoo import models, api, fields, _, exceptions

from functools import reduce
from odoo.exceptions import ValidationError


class Product(models.Model):
    """
    [] 增加 Portal View
    [] 增加負責人欄位
    [] *選擇多張 Repair Order 可以產生一筆 Sale Order

    增加欄位
    -

    修改欄位
    -

    [product.template]
    """
    _inherit = 'product.template'

    skill_id = fields.Many2one('hr.skill', 'Skill')
    minimal_skill_level_progress = fields.Integer('Minimal Progress of Skill', default=60,
                                                  help="The minimal skill progress "
                                                       "from zero knowledge (0%) to "
                                                       "fully mastered (100%).")
    has_skill_user_ids = fields.Many2many('res.users', compute='_has_skill_user_ids')

    time_mode = fields.Selection([
        ('auto', 'Compute based on tracked time'),
        ('manual', 'Set duration manually')], string='Duration Computation',
        default='manual')
    time_mode_batch = fields.Integer('Based on', default=10)
    time_computed_on = fields.Char('Computed on last', compute='_compute_time_computed_on')
    time_cycle_manual = fields.Float(
        'Manual Duration', default=60,
        help="Time in minutes:"
             "- In manual mode, time used"
             "- In automatic mode, supposed first time when there aren't any work orders yet")
    time_cycle = fields.Float('Estimated Duration', compute="_compute_time_cycle")

    @api.depends('skill_id', 'minimal_skill_level_progress')
    def _has_skill_user_ids(self):
        for record in self:
            users = self.env['res.users'].search([('company_ids', 'in', self.env.user.company_id.id)])
            employee_skill_ids = self.env['hr.employee.skill'].search([
                ('employee_id.user_id', 'in', users.ids),
                ('skill_id', '=', record.skill_id.id),
                ('level_progress', '>=', record.minimal_skill_level_progress)
            ])
            record.has_skill_user_ids = employee_skill_ids.mapped('employee_id.user_id')

    @api.depends('time_mode', 'time_mode_batch')
    def _compute_time_computed_on(self):
        for operation in self:
            operation.time_computed_on = _(
                '%i tasks') % operation.time_mode_batch if operation.time_mode != 'manual' else False

    @api.depends('time_cycle_manual', 'time_mode', 'time_mode_batch')
    def _compute_time_cycle(self):
        manual_services = self.filtered(lambda service: service.time_mode == 'manual')

        for service in manual_services:
            service.time_cycle = service.time_cycle_manual

        for service in self - manual_services:
            products = service.mapped('product_variant_ids')
            repair_order_fees_ids = self.env['repair.fee'].search([('product_id', 'in', products.ids)])
            data = self.env['project.task'].search([('kanban_state', '=', 'done'), ('repair_order_fees_line_id', 'in', repair_order_fees_ids.ids)],
                                                   limit=service.time_mode_batch,
                                                   order="date_deadline desc, id desc")
            # To compute the time_cycle, we can take the total duration of previous operations
            # but for the quantity, we will take in consideration the qty_produced like if the capacity was 1.
            # So producing 50 in 00:10 with capacity 2, for the time_cycle, we assume it is 25 in 00:10
            # When recomputing the expected duration, the capacity is used again to divide the qty to produce
            # so that if we need 50 with capacity 2, it will compute the expected of 25 which is 00:10
            total_duration = 0  # Can be 0 since it's not an invalid duration for BoM
            cycle_number = len(data)

            total_duration = sum([sum(task.timesheet_ids.mapped('unit_amount')) for task in data])

            if cycle_number > 0:
                service.time_cycle = total_duration / cycle_number
            else:
                service.time_cycle = service.time_cycle_manual
