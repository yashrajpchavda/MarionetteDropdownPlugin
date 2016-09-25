/**
 * Created by Yashraj.C on 1/1/2016.
 */

define( [
    'underscore',
    'backbone'
], function ( _, Backbone ) {

    return Backbone.Model.extend( {
        defaults: {
            selected: false,
            visible: true
        }
    } );

} );
