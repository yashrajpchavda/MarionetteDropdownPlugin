/**
 * Created by Yashraj.C on 1/1/2016.
 */

define( [
    'underscore',
    'backbone',
    'modules/dropdown2/models/selectedTag'
], function ( _, Backbone, SelectedTagModel ) {

    return Backbone.Collection.extend( {
        model: SelectedTagModel,
        comparator: 'id',

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
