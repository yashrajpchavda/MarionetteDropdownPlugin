/**
 * Dropdown body item view.
 * The view for the dropdown item.
 *
 * @class DropdownBodyItemView
 * @constructor
 */

define( [
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'tpl!modules/dropdown2/templates/ddBodyItem.tmpl'
], function ( $, _, Backbone, Marionette, DropdownBodyItemTemplate ) {

    return Marionette.ItemView.extend( {

        template: DropdownBodyItemTemplate,

        className: 'bI',

        events: {
            'mouseover': '_handleMouseOverEvent',
            'mouseout': '_handleMouseOutEvent',
            'click': '_handleItemClick',
            'click .ddActItem': '_handleActionItemClick'
        },

        config: {},

        initialize: function ( options ) {

            this.config = {};

            // extend the config
            _.extend( this.config, options.config );

            this.model.set( 'config', this.config );
            this.listenTo( this.model, 'change:selected', this._toggleModelSelection );
            this.listenTo( this.model, 'change:visible', this._updateVisibility );
            this.listenTo( this.model, 'change:text', this.render );

        },

        onRender: function () {

            if ( this.model.get( 'selected' ) === true ) {
                this.$el.addClass( 'selected' );
            } else {
                this.$el.removeClass( 'selected' );
            }

            // update the visibility based on the value of model while rendering
            this._updateVisibility();

        },

        /**
         * Click handler for the body item.
         * Triggers the itemClick that gets listened by the parent view.
         *
         * @method _handleItemClick
         *
         * @private
         */
        _handleItemClick: function ( event ) {

            if ( event && event.originalEvent && event.originalEvent.origin === 'actionItem' ) {
                return;
            }

            this.trigger( 'itemClick' );
        },

        /**
         * Handler for the action item click.
         * Gets the item config for the clicked action and triggers the event being listened by the parent view.
         *
         * @method _handleActionItemClick
         *
         * @param {Object} event
         *      Event object for the event.
         * @private
         */
        _handleActionItemClick: function( event ) {
            event.originalEvent.origin = 'actionItem';

            var $currentTarget = $( event.currentTarget ),
                itemKey = $currentTarget.attr( 'data-item-key' ),
                actions = this.model.get( 'actions' ),
                itemConfig;

            itemConfig = _.findWhere( actions, { key: itemKey } );

            this.trigger( 'actionItemClick', this.model, itemConfig );

        },

        /**
         * A change attribute handler for the model.
         * Listening to the selected attribute of the model.
         * Updates the view whenever the model gets changed.
         *
         * @method _toggleModelSelection
         *
         * @private
         */
        _toggleModelSelection: function () {

            if ( this.model.get( 'selected' ) === true ) {
                this.$el.addClass( 'selected' );
            } else {
                this.$el.removeClass( 'selected' );
            }

        },

        /**
         * A change attribute handler for the model.
         * Listening to the visible attribute of the model.
         * Update the view whenever the view gets changed.
         *
         * @method _updateVisibility
         *
         * @private
         */
        _updateVisibility: function () {
            this.model.get( 'visible' ) ? this.$el.css( 'display', 'table-row' ) : this.$el.css( 'display', 'none' );
        },

        /**
         * Mouse over event handler for the view to manipulate the hover classes.
         *
         * @method _handleMouseOverEvent
         *
         * @private
         */
        _handleMouseOverEvent: function () {
            this._addHoverClass();
        },

        /**
         * Mouse out event handler for the view to manipulate the hover classes.
         *
         * @method _handleMouseOutEvent
         *
         * @private
         */
        _handleMouseOutEvent: function () {
            this._removeHoverClass();
        },

        /**
         * Adds the hover class to the view.
         *
         * @method _addHoverClass
         *
         * @private
         */
        _addHoverClass: function () {
            this.$el.addClass( 'hoverState' );
        },

        /**
         * Removes the hover class from the view.
         *
         * @method _removeHoverClass
         *
         * @private
         */
        _removeHoverClass: function () {
            this.$el.removeClass( 'hoverState' );
        }

    } );

} );
