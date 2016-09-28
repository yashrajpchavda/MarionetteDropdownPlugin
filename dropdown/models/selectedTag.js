/**
 * Dropdown selected tag item's model.
 *
 * @class DropdownSelectedTagItemModel
 *
 * @constructor
 */

define( [
    'underscore',
    'backbone'
], function ( _, Backbone ) {

    return Backbone.Model.extend( {

        /**
         * The defaults property that comes along with the backbone models.
         *
         * @property defaults
         */
        defaults: {
            selected: false,
            visible: true
        }
    } );

} );
