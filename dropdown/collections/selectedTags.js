/**
 * Dropdown selected tag items' collection.
 *
 * @class DropdownSelectedTagItemsCollection
 *
 * @constructor
 */

define( [
    'underscore',
    'backbone',
    'modules/dropdown2/models/selectedTag'
], function ( _, Backbone, SelectedTagModel ) {

    return Backbone.Collection.extend( {

        model: SelectedTagModel,

        /**
         * Specified the comparator so that selected item tags always appear in the sorted manner
         */
        comparator: 'id',

        /**
         * A method which adds the item to the collection by the text that is passed as an argument.
         * First the method checks if the item is not already available in the collection, if not only then it adds.
         *
         * @method addItemToCollection
         *
         * @param {String} itemText
         */
        addItemToCollection: function ( itemText ) {

            var existingItem = this.findWhere( {
                text: itemText
            } );

            if ( !existingItem ) {

                this.add( {
                    text: itemText,
                    id: undefined
                } );

            }

        },

        /**
         * A method that serializes the collection items in the array and in the correct format that is needed and
         * returns it.
         *
         * @returns {Array}
         */
        getSerializedItems: function () {

            var items = [];

            this.each( function ( item ) {
                items.push( {
                    id: item.get( 'id' ),
                    text: item.get( 'text' ),
                    rawObject: item.get( 'rawObject' )
                } );
            } );

            return items;

        }
    } );

} );
