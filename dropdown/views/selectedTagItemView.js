/**
 * This view renders the individual item in the selected tags collection.
 *
 * @class DropdownSelectedTagItemView
 *
 * @constructor
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
            'click @ui.removeIco': '_handleRemoveIconClick'
        },

        /**
         * Click handler for the remove icon to remove the tag that is clicked.
         *
         * @method _handleRemoveIconClick
         *
         * @private
         */
        _handleRemoveIconClick: function () {
            this.trigger( 'removeTag' );
        },

        /**
         * A method to disable the view.
         *
         * @method disableView
         */
        disableView : function () {
            this.undelegateEvents();
        },

        /**
         * A method to enable the view.
         *
         * @method enableView
         */
        enableView : function () {
            this.delegateEvents();
        }

    } );

} );
