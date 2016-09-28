/**
 * Created by Yashraj.C on 12/21/2015.
 */


define( [

    'jquery',
    'underscore',
    'backbone'

], function ( $, _, Backbone ) {

    return Backbone.Model.extend( {
        defaults: {
            visible: true,
            selected: false
        }
    } );

} );
