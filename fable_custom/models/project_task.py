
from odoo import fields, models, api, _
from odoo.exceptions import ValidationError 

class ProjectTask(models.Model):
    _inherit = 'project.task'

    workitem_id = fields.Many2one('project.workitem', string='服務項目', ondelete='restrict')

    @api.onchange('workitem_id')
    def _onchange_workitem_id(self):
        self.name = self.workitem_id.name


    # calendar_event_ids = fields.One2many('calendar.event', 'opportunity_id', string='Meetings')
    # calendar_event_count = fields.Integer('# Meetings', compute='_compute_calendar_event_count')
    #
    # def _compute_calendar_event_count(self):
    #     if self.ids:
    #         meeting_data = self.env['calendar.event'].sudo().read_group([
    #             ('opportunity_id', 'in', self.ids)
    #         ], ['opportunity_id'], ['opportunity_id'])
    #         mapped_data = {m['opportunity_id'][0]: m['opportunity_id_count'] for m in meeting_data}
    #     else:
    #         mapped_data = dict()
    #     for lead in self:
    #         lead.calendar_event_count = mapped_data.get(lead.id, 0)
    #
    # def action_schedule_meeting(self, smart_calendar=True):
    #     """ Open meeting's calendar view to schedule meeting on current opportunity.
    #
    #         :param smart_calendar: boolean, to set to False if the view should not try to choose relevant
    #           mode and initial date for calendar view, see ``_get_opportunity_meeting_view_parameters``
    #         :return dict: dictionary value for created Meeting view
    #     """
    #     self.ensure_one()
    #     action = self.env["ir.actions.actions"]._for_xml_id("calendar.action_calendar_event")
    #     partner_ids = self.env.user.partner_id.ids
    #     if self.partner_id:
    #         partner_ids.append(self.partner_id.id)
    #     current_opportunity_id = self.id if self.type == 'opportunity' else False
    #     action['context'] = {
    #         'search_default_opportunity_id': current_opportunity_id,
    #         'default_opportunity_id': current_opportunity_id,
    #         'default_partner_id': self.partner_id.id,
    #         'default_partner_ids': partner_ids,
    #         'default_team_id': self.team_id.id,
    #         'default_name': self.name,
    #     }
    #
    #     # 'Smart' calendar view : get the most relevant time period to display to the user.
    #     if current_opportunity_id and smart_calendar:
    #         mode, initial_date = self._get_opportunity_meeting_view_parameters()
    #         action['context'].update({'default_mode': mode, 'initial_date': initial_date})
    #
    #     return action

class ProjectProject(models.Model):
    _inherit = 'project.project'

    code = fields.Char(string="合約編號", required=False, )
    date_1 = fields.Char(string="初訪日期", required=False, )
    date_2 = fields.Char(string="勞動契約", required=False, )
    date_3 = fields.Char(string="工作規則", required=False, )

    project_task_template_id = fields.Many2one('project.task.template', string='專案範本', ondelete='set null')

    def update_project_task_templete(self):
        template_id = self.project_task_template_id
        for item in template_id.task_ids:
            vals = {'project_id': self.id,
                    'name': item.name,
                    # 'parent_id': parent,
                    # 'stage_id': self.env['project.task.type'].search([('sequence', '=', 1)], limit=1).id,
                    'user_ids': item.user_ids,
                    'description': item.description
                    }
            task_id = self.env['project.task'].create(vals).id

        return True