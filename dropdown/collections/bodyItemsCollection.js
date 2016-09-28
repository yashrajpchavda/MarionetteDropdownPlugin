/**
 * Dropdown body items' collection. A collection that is used by the `{{#crossLink "DropdownBodyView"}}{{/crossLink}}`
 * composite view.
 *
 * @class DropdownBodyItemsCollection
 *
 * @constructor
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

        /**
         * Deselects all the items in the collection.
         *
         * @method deSelectAll
         *
         */
        deSelectAll: function () {
            this.each( function ( item ) {
                item.set( 'selected', false );
            } );
        },

        /**
         * Selects the model that has been passed as an argument.
         *
         * @method selectSingleSelectModel
         *
         * @param {DropdownSelectedTagItemModel} model A model to be selected
         */
        selectSingleSelectModel: function ( model ) {
            model.set( 'selected', true );

            // remove the strong tags to remove the search highlighted results
            this._removeHighlightTagsFromAll();
        },

        /**
         * Selects the multiSelect model that is passed as an argument, it actually toggles the state of the model, as
         * this method is used by the multiSelect dropdown to toggle the state. After selection, it removes the highlights
         * from the list items.
         *
         * @method selectMultiSelectModel
         *
         * @param {DropdownSelectedTagItemModel} model A model whose state needs to be toggled
         */
        selectMultiSelectModel: function ( model ) {
            // toggle the selection
            model.set( 'selected', !model.get( 'selected' ) );

            // remove the strong tags to remove the search highlighted results
            this._removeHighlightTagsFromAll();
        },

        /**
         * Removes the highlights from the model texts that are added while user had searched for those items.
         *
         * @method _removeHighlightTags
         *
         * @param {DropdownSelectedTagItemModel} model A model the highlights should be removed from.
         *
         * @private
         */
        _removeHighlightTags: function ( model ) {
            model.set( 'text', model.get( 'text' ).replace( /<strong>/gi, '' ) );
            model.set( 'text', model.get( 'text' ).replace( /<\/strong>/gi, '' ) );
        },

        /**
         * Removes highlights from all the models present in the collection.
         *
         * @method _removeHighlightTagsFromAll
         *
         * @private
         */
        _removeHighlightTagsFromAll: function () {

            var that = this;

            this.each( function ( model ) {
                that._removeHighlightTags( model );
            } );

        },

        /**
         * Shows all the items present in the collection by updating the attribute of the model.
         *
         * @method showAllItems
         *
         */
        showAllItems: function () {
            this.each( function ( item ) {
                item.set( 'visible', true );
            } );
        },

        /**
         * Filters the items of the dropdown.
         * * For non-ajax dropdown, it iterates through all the items present in the list, and either marks the item
         *   visible or invisible based on the text search. Executes the callback if specified.
         * * For ajax dropdown, makes and ajax call to the server on the specified `url`, by executing the `requestDataFormatter`
         *   callback to get the request parameters and executes the `responseDataFormatter` callback to format the response
         *   received from the server.
         *
         * @method filterItems
         *
         * @param {String} text A string that should be used to filter the items of the collection
         * @param {Array} selectedItems The list of selected items that gets used to select the items after they have been
         *      received from server to show them as selected. Used mostly in case of multiSelect mode.
         * @param {Object} config The dropdown config.
         * @param {Function} callback The callback function that gets executed after successful filtration happens on
         *      the items.
         *
         */
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

        /**
         * Method that gets executed by the `filterItems` on a successful ajax from the server. It finds if the returned
         * items from the server matches with the text specified and highlights them. It also sets the returned items as
         * selected if any of them matches with the items specified in selectedItems.
         *
         * @method _updateCollectionItemsPostResponse
         *
         * @param {String} text A text that was searched.
         * @param {Object} response Response from the server
         * @param {Array} selectedItems Existing selected items in the list.
         * @private
         */
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

        /**
         * Sets the default ajax config before making an ajax call to server to reload the items based on what user
         * searches in the dropdown.
         *
         * @method _processAjaxConfig
         *
         * @param {String} text A string that was searched by the user.
         * @param {Object} config dropdown configuration object.
         * @returns {Object}
         * @private
         */
        _processAjaxConfig: function ( text, config ) {

            // set the default requestDataFormatter if not specified
            if ( !config.requestDataFormatter ) {
                config[ 'requestDataFormatter' ] = function ( text ) {
                    return {
                        term: text
                    }
                };
            }

            // set the default responseDataFormatter if not specified
            if ( !config.responseDataFormatter ) {
                config[ 'responseDataFormatter' ] = function ( response ) {
                    return response;
                }
            }

            // set the default triggerChars if not specified
            if ( !config.triggerChars ) {
                config[ 'triggerChars' ] = 2;
            }

            return config;

        },

        /**
         * Deselects the model that has been received as argument. If id is available, it searches with id, or text
         * otherwise.
         *
         * @method deSelectItem
         *
         * @param {DropdownSelectedTagItemModel} removedModel A model that should be set as deselected.
         */
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
         *
         * @method selectItem
         *
         * @param {DropdownSelectedTagItemModel} modelParam A model that should be selected.
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

        /**
         * Returns the array of visible items from the collection.
         *
         * @method getVisibleItems
         *
         * @returns {Array}
         */
        getVisibleItems: function() {
            return this.where( {
                visible: true
            } );
        }
    } );

} );
