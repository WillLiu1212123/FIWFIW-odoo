#!/usr/bin/env python3
# -*- coding: utf-8 -*-
{
    'name': "Portal Chatter Image Preview",
    'summary': 'Make image attachments available for preview.',
    'author': "RichSoda",
    'maintainer': 'RichSoda <service@richsoda.com>',
    'website': "https://richsoda.com",
    'category': 'Hidden',
    'version': '15.0.0.2',
    'license': 'AGPL-3',
    'depends': [
        'portal',
        'portal_rating',
    ],
    'assets': {
        'web.assets_frontend': [
            'portal_chatter_image_preview/static/src/js/portal_chatter.js',
        ],
    },
    'data': [
    ],
    'demo': [
    ],
    'application': False,
    'installable': True,
}

