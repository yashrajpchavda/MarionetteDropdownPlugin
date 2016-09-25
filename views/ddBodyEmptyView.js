/**
 * Created by Yashraj.C on 12/7/2015.
 */

define( [
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'tpl!modules/dropdown2/templates/emptyView.tmpl'
], function ( $, _, Backbone, Marionette, emptyViewTmpl ) {

    return Marionette.ItemView.extend( {
        template: emptyViewTmpl,
        className: 'bI',

        config: {},

        events: {
            'click': 'handleItemClick'
        },

        initialize: function ( options ) {

            this.config = {};
            _.extend( this.config, options.config );
            this.model.set( 'config', this.config );

        },

        /**
         * Click handler for the add new item.
         * Triggers the add new item if the config is set to allow add new items.
         * @param {Object} event
         *      Event object for the click event.
         */
        handleItemClick: function () {

            if ( this.config.allowNew ) {
                this.trigger( 'addNewItem' );
            }

        }
    } );

} );
