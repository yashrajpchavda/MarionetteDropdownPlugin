/**
 * Created by Yashraj.C on 12/4/2015.
 */

define( [
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'tpl!modules/dropdown2/templates/selectedTagItem.tmpl'
], function ( $, _, Backbone, Marionette, SelectedTagItemTemplate ) {

    return Marionette.ItemView.extend( {

        template: SelectedTagItemTemplate,

        className: 'tagItem',

        ui: {
            removeIco: '.removeIco'
        },

        events: {
            'click @ui.removeIco': 'handleRemoveIconClick'
        },

        /**
         * Click handler for the remove icon to remove the tag that is clicked.
         * @param {Object} event
         *      An event object for the item that needs to be removed.
         */
        handleRemoveIconClick: function () {
            this.trigger( 'removeTag' );
        },

        disableView : function () {
            this.undelegateEvents();
        },

        enableView : function () {
            this.delegateEvents();
        }

    } );

} );
