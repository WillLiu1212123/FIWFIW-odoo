odoo.define('image.portal.chatter', function (require) {
'use strict';

var core = require('web.core');
var portalChatter = require('portal.chatter');
var utils = require('web.utils');
var time = require('web.time');

var _t = core._t;
var PortalChatter = portalChatter.PortalChatter;
var qweb = core.qweb;

/**
 * PortalChatter
 *
 * Extends Frontend Chatter to handle rating
 */
PortalChatter.include({
    events: _.extend({
    }, PortalChatter.prototype.events, {
    }),
    xmlDependencies: (PortalChatter.prototype.xmlDependencies || [])
        .concat([
            '/portal_chatter_image_preview/static/src/xml/portal_chatter.xml'
        ]),

    /**
     * @constructor
     */
    init: function (parent, options) {
        this._super.apply(this, arguments);
        // options
    },
    /**
     * @override
     */
    start: function () {
        this._super.apply(this, arguments);

        var style = $(`
            <style>
                .o_portal_chatter_attachments .row:not(.row__custom) .col-lg-2:has([data-mimetype*="image"])
                {
                    display: none;
                }
                .button-box {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: absolute;
                    top: 0;
                    background-color: rgba(0,0,0,0.8);
                    height: 100%;
                    width: 64px;
                    cursor: pointer;
                    color: #fff;
                }
                .button-box span {
                    opacity: 0.5;
                }
                .button-box-prev {
                    left: -4px;
                }
                .button-box-next {
                    right: -4px;
                }
                .rs-close {
                    position: absolute;
                    right: 8px;
                    top: 4px;
                    color: #fff;
                    z-index: 10;
                }
            </style>
        `);
        $('body').append(style);
        $('.o_portal_chatter_attachments .row:not(.row__custom) [data-mimetype*="image"]').parent().hide();
        $('.rs-image').each((index, item) => {
            item.setAttribute('data-rs-image-id', index);
        });
        $('.rs-image').click(function ($event) {
            $event.preventDefault();
            let imageUrl = $event.currentTarget.href;
            const $modalImage = $('#modal-image');
            $modalImage.attr('src', imageUrl);

            const imageModal = document.getElementById('image-modal');
            $(imageModal).modal();
            imageModal.dataset.rscurrentid = $event.currentTarget.dataset['rsImageId'];
        });
        function prevImage() {
            const currentRsImageId = document.getElementById('image-modal').dataset.rscurrentid;

            if (currentRsImageId == 0) {
                return;
            } else {
                const nextRsImageId = Number(currentRsImageId) - 1;
                const nextImageItem = document.querySelector('.rs-image[data-rs-image-id="' + nextRsImageId + '"] img');

                if (nextImageItem) {
                    document.getElementById('modal-image').src = nextImageItem.src;
                    document.getElementById('image-modal').dataset.rscurrentid = nextRsImageId;
                }
            }
        }
        function nextImage() {
            const currentRsImageId = document.getElementById('image-modal').dataset.rscurrentid;

            if (currentRsImageId >= $('.rs-image').length) {
                return;
            } else {
                const nextRsImageId = Number(currentRsImageId) + 1;
                const nextImageItem = document.querySelector('.rs-image[data-rs-image-id="' + nextRsImageId + '"] img');

                if (nextImageItem) {
                    document.getElementById('modal-image').src = nextImageItem.src;
                    document.getElementById('image-modal').dataset.rscurrentid = nextRsImageId;
                }
            }
        }
        window.prevImage = prevImage;
        window.nextImage = nextImage;

        document.addEventListener('keyup', function (event) {
            switch (event.key) {
                case 'ArrowLeft':
                    prevImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
            }
        })
    },

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * Update the messages format
     *
     * @param {Array<Object>} messages
     * @returns {Array}
     */
    preprocessMessages: function (messages) {
        var self = this;
        messages = this._super.apply(this, arguments);
        // save messages in the widget to process correctly the publisher comment templates
        this.messages = messages;
        return messages;
    },
    /**
     * Round the given value with a precision of 0.5.
     *
     * Examples:
     * - 1.2 --> 1.0
     * - 1.7 --> 1.5
     * - 1.9 --> 2.0
     *
     * @param {Number} value
     * @returns Number
     **/

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

     /**
     * preprocess the rating data comming from /website/rating/comment or the chatter_init
     * Can be also use to have new rating data for a new publisher comment
     * @param {JSON} rawRating
     * @returns {JSON} the process rating data
     */
    _preprocessCommentData: function (rawRating, messageIndex) {
        var ratingData = {
            id: rawRating.id,
            mes_index: messageIndex,
            publisher_datetime: rawRating.publisher_datetime ? moment(time.str_to_datetime(rawRating.publisher_datetime)).format('MMMM Do YYYY, h:mm:ss a') : "",
            publisher_comment: rawRating.publisher_comment ? rawRating.publisher_comment : '',
        };

        // split array (id, display_name) of publisher_id into publisher_id and publisher_name
        if (rawRating.publisher_id && rawRating.publisher_id.length >= 2) {
            ratingData.publisher_id = rawRating.publisher_id[0];
            ratingData.publisher_name = rawRating.publisher_id[1];
            ratingData.publisher_avatar = _.str.sprintf('/web/image/res.partner/%s/avatar_128/50x50', ratingData.publisher_id);
        }
        var commentData = _.extend(this._newPublisherCommentData(messageIndex), ratingData);
        return commentData;
    },

    //--------------------------------------------------------------------------
    // Handlers
    //--------------------------------------------------------------------------

});
});
