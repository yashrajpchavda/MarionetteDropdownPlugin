/**
 * Created by Yashraj.C on 12/21/2015.
 */

define( [

    'jquery',
    'underscore',
    'backbone',
    'modules/dropdown2/models/bodyItemModel'

], function ( $, _, Backbone, BodyItemModel ) {

    return Backbone.Collection.extend( {

        model: BodyItemModel,

        // removed comparator as it didn't make sense to sort the items by the id
        // as sometimes we just want to display the items as - is, because they are already sorted by the server
//        comparator: 'id',

        deSelectAll: function () {
            this.each( function ( item ) {
                item.set( 'selected', false );
            } );
        },

        selectSingleSelectModel: function ( model ) {
            model.set( 'selected', true );

            // remove the strong tags to remove the search highlighted results
            this._removeHighlightTagsFromAll();
        },

        selectMultiSelectModel: function ( model ) {
            // toggle the selection
            model.set( 'selected', !model.get( 'selected' ) );

            // remove the strong tags to remove the search highlighted results
            this._removeHighlightTagsFromAll();
        },

        _removeHighlightTags: function ( model ) {
            model.set( 'text', model.get( 'text' ).replace( /<strong>/gi, '' ) );
            model.set( 'text', model.get( 'text' ).replace( /<\/strong>/gi, '' ) );
        },

        _removeHighlightTagsFromAll: function () {

            var that = this;

            this.each( function ( model ) {
                that._removeHighlightTags( model );
            } );

        },

        showAllItems: function () {
            this.each( function ( item ) {
                item.set( 'visible', true );
            } );
        },

        filterItems: function ( text, selectedItems, config, callback ) {

            var ajaxConfig = config.ajax,
                that = this;

            if ( !ajaxConfig || ( ajaxConfig && Object.keys( ajaxConfig ).length === 0 ) ) {

                this.each( function ( item ) {

                    // deselect the item for single select
                    if ( !config.multiSelect ) {
                        item.set( 'selected', false );
                    }

                    if ( item.get( 'text' ) && item.get( 'text' ).toLowerCase().indexOf( text.toLowerCase() ) !== -1 ) {
                        item.set( 'visible', true );
                    } else {
                        item.set( 'visible', false );
                    }

                }, this );

                if ( callback ) {
                    callback();
                }

            } else {

                // process the ajax config first
                ajaxConfig = this._processAjaxConfig( text, ajaxConfig );

                // deselect the already selected item if the dropdown is single select
                if ( !config.multiSelect ) {
                    this.deSelectAll();
                }

                // only in the case of ajax dropdown
                // return if the searched text is empty
                if ( typeof text !== 'undefined' && text.length === 0 ) {
                    this._removeHighlightTagsFromAll();
                    if ( callback ) {
                        callback();
                    }
                    return;
                } else if ( typeof text !== 'undefined' && text.length < ajaxConfig.triggerChars ) {
                    // return if the characters entered are less than minimum characters required to trigger
                    // the search
                    return;
                }

                this.trigger( 'showLoader' );

                if ( this.dataLoadRequest && this.dataLoadRequest.readyState !== 4 ) {
                    this.dataLoadRequest.abort();
                }

                this.dataLoadRequest = $.ajax( {
                    url: ajaxConfig.url,
                    type: ajaxConfig.type || 'get',
                    data: ajaxConfig.requestDataFormatter( text ),
                    success: function ( response ) {

                        var processedResponse;

                        if( typeof ajaxConfig.responseDataFormatter == "function" ){
                            processedResponse = ajaxConfig.responseDataFormatter( response ) || [];
                        }else {
                            processedResponse = response || [];
                        }

                        that._updateCollectionItemsPostResponse( text, processedResponse, selectedItems );

                        if ( callback ) {
                            callback();
                        }

                        that.trigger( 'hideLoader' );

                    },
                    error: function () {
                        that.trigger( 'hideLoader' );
                    }
                } );

            }

        },

        _updateCollectionItemsPostResponse: function ( text, response, selectedItems ) {

            selectedItems = selectedItems || [];

            // get the ids of the existing selected items
            var selectedIds = _.pluck( selectedItems, 'id' );

            _.each( response, function ( responseItem ) {

                // highlight the item
                var regex = new RegExp( text, 'gi' );
                responseItem.text = responseItem.text.replace( regex, function ( match ) {
                    return '<strong>' + match + '</strong>';
                } );

                // check if the item is already selected
                if ( selectedIds.indexOf( responseItem.id ) !== -1 ) {
                    responseItem.selected = true;
                }

            } );

            this.reset( response );

        },

        _processAjaxConfig: function ( text, config ) {

            if ( !config.requestDataFormatter ) {
                config[ 'requestDataFormatter' ] = function ( text ) {
                    return {
                        term: text
                    }
                };
            }

            if ( !config.responseDataFormatter ) {
                config[ 'responseDataFormatter' ] = function ( response ) {
                    return response;
                }
            }

            if ( !config.triggerChars ) {
                config[ 'triggerChars' ] = 2;
            }

            return config;

        },

        deSelectItem: function ( removedModel ) {

            var model;

            // find model from id if id is available
            if ( removedModel.get( 'id' ) ) {
                model = this.findWhere( {
                    id: removedModel.get( 'id' )
                } );
            } else {
                // get from the text otherwise
                model = this.findWhere( {
                    text: removedModel.get( 'text' )
                } );
            }

            if ( model ) {
                model.set( 'selected', false );
            }

        },

        /**
         * Searches the item in the collection and marks it as selected.
         * @param {Backbone.Model} modelParam
         *      A model which should be searched in the list.
         */
        selectItem: function ( modelParam ) {

            var model;

            // find model from id if id is available
            if ( modelParam.get( 'id' ) ) {
                model = this.findWhere( {
                    id: modelParam.get( 'id' )
                } );
            } else {
                // get from the text otherwise
                model = this.findWhere( {
                    text: modelParam.get( 'text' )
                } );
            }

            if ( model ) {
                model.set( 'selected', true );
            }

        },
        getVisibleItems: function() {
            return this.where( {
                visible: true
            } );
        }
    } );

} );
