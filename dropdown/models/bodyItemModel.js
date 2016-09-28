/**
 * Dropdown body item's model.
 *
 * @class DropdownBodyItemModel
 *
 * @constructor
 */


define( [

    'jquery',
    'underscore',
    'backbone'

], function ( $, _, Backbone ) {

    return Backbone.Model.extend( {

        /**
         * The defaults property that comes along with the backbone models.
         *
         * @property defaults
         */
        defaults: {
            visible: true,
            selected: false
        }
    } );

} );
