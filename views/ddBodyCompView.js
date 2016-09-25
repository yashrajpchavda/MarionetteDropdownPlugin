/**
 * Created by Yashraj.C on 12/4/2015.
 */

define( [
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'tpl!modules/dropdown2/templates/ddBodyComp.tmpl',
    'modules/dropdown2/views/ddBodyItemView',
    'modules/dropdown2/views/ddBodyEmptyView',
    'modules/dropdown2/collections/bodyItemsCollection',
    'modules/ajaxLoader/ajaxLoader'
], function ( $, _, Backbone, Marionette, dropdownBodyTemplate, DropdownBodyItemView, DropdownBodyEmptyView,
              DropdownBodyItemsCollection, AjaxLoader ) {

    return Marionette.CompositeView.extend( {

        childView: DropdownBodyItemView,
        childViewContainer: '.bC',

        emptyView: DropdownBodyEmptyView,

        template: dropdownBodyTemplate,

        className: 'bV user-no-select',

        collectionReset: false,

        constants : {
            keyCode   : {
                BACKSPACE : 8,
                COMMA     : 188,
                DELETE    : 46,
                DOWN      : 40,
                END       : 35,
                ENTER     : 13,
                ESCAPE    : 27,
                HOME      : 36,
                LEFT      : 37,
                PAGE_DOWN : 34,
                PAGE_UP   : 33,
                PERIOD    : 190,
                RIGHT     : 39,
                SPACE     : 32,
                TAB       : 9,
                UP        : 38
            }
        },

        ui: {
            bodyContainer: '.bC',
            footerContainer: '.footC'
        },

        tooltipOptions: {
            animation: true,
            container: 'body',
            trigger: "hover focus"
        },

        initialize: function ( options ) {

            var that = this;

            this.config = {};

            // extend the config
            _.extend( this.config, options.config );

            this.model = new Backbone.Model( {
                config: this.config
            } );

            this.collection = new DropdownBodyItemsCollection( this.config.data );

            this.listenTo( this.collection, 'showLoader', function () {
                that.showLoader();
            } );

            this.listenTo( this.collection, 'hideLoader', function () {
                that.hideLoader();
            } );

            this.eventTriggers = options.eventTriggers;

            // used while triggering search, not to fire multiple requests to server
            this.debouncedSearchHandler = _.debounce( (function ( text, selectedItems ) {
                // show the view if not already visible
                if ( !this.isVisible() ) {
                    this.showView();
                }

                // filters the items in the collection based on the text
                this.collection.filterItems( text, selectedItems, this.config, this._postProcessCollectionSearch.bind( this ) );
            } ).bind( this ), this.config.searchTriggerDelay || 600 );

        },

        childViewOptions: function () {

            // pass the config to the child views without data.
            var config = $.extend( true, {}, this.config );
            delete config.data;

            return {
                config: config
            };

        },

        emptyViewOptions: function () {

            // pass the config to the child views without data.
            var config = $.extend( true, {}, this.config );
            delete config.data;

            return {
                config: config
            };

        },

        events: {
            'click': function ( event ) {
                event.stopPropagation();
            },
//            'click @ui.footerContainer': 'handleFooterClick',
            'click .footer-item': '_handleFooterItemClick',
            'click @ui.convertCodeFooterContainer': 'handleConvertCodeFooterClick'
        },

        childEvents: {
            'itemClick': '_handleBodyItemClick',
            'actionItemClick': '_handleActionItemClick',
            'addNewItem': '_handleAddNewItem'
        },

        onRender: function () {

            var footerConfig, convertCodeFooterConfig;

            if ( this.config.multiSelect === true ) {
                this.$el.addClass( 'mSel' );
            }

            footerConfig = this.config.footer;

            if ( footerConfig && Object.keys( footerConfig ).length !== 0 ) {
                this._renderFooterItems();
                /*this.ui.footerContainer
                    .html( footerConfig.html )
                    .show();*/
            }

            this._applyTooltipForDDItems();

            /*convertCodeFooterConfig = this.config.convertCodeFooter;

            if ( convertCodeFooterConfig && Object.keys( convertCodeFooterConfig ).length !== 0 ) {
                this.ui.convertCodeFooterContainer
                    .html( convertCodeFooterConfig.html )
                    .show();
            }*/

        },

        onRenderCollection: function() {
            this._applyTooltipForDDItems();
        },

        _applyTooltipForDDItems: function() {
            this._applyTooltip( this.$( '.ddActItem' ) );
        },

        _applyTooltip: function ( element, options ) {

            var _options = $.extend( true, options, this.tooltipOptions );
            try {
                element.tooltip( 'destroy' );
                element.tooltip( _options );
            } catch ( e ) {
                console.log( e );
            }

        },

        _renderFooterItems: function() {

            var footerItems = this.config.footer,
                footerHtmlElements = [];

            _.each( footerItems, function( footerItem ) {

                footerHtmlElements.push(
                    $( footerItem.html )
                        .attr( 'data-key', footerItem.itemKey )
                        .addClass( 'footer-item' )
                );

            }, this );

            this.ui.footerContainer
                .empty()
                .show()
                .append( footerHtmlElements );

        },

        _handleFooterItemClick: function( event ) {

            var $currentTarget = $( event.currentTarget ),
                itemKey = $currentTarget.attr( 'data-key' );

            this.trigger( this.eventTriggers.footerClick, itemKey );

        },

        /**
         * Click handler for the footer item click.
         * Checks if the footer config was provided and if yes, triggers the click event of the footer.
         * @param {Object} event
         *      An event object for the handler
         */
        handleFooterClick: function ( event ) {

            var footerConfig = this.config.footer;

            if ( footerConfig && Object.keys( footerConfig ).length !== 0 && footerConfig.footerClick ) {
                this.trigger( this.eventTriggers.footerClick );
            }

        },
        /**
         * Click handler for the footer item click.
         * Checks if the footer config was provided and if yes, triggers the click event of the footer.
         * @param {Object} event
         *      An event object for the handler
         */
        handleConvertCodeFooterClick: function ( event ) {

            var convertCodeFooterConfig = this.config.convertCodeFooter;

            if ( convertCodeFooterConfig && Object.keys( convertCodeFooterConfig ).length !== 0 && convertCodeFooterConfig.convertCodeFooterClick ) {
                this.trigger( this.eventTriggers.convertCodeFooterClick );
            }

        },

        /**
         * Deselects all the items in the collection.
         */
        deselectAll: function () {
            this.collection.deSelectAll();
            this.trigger( this.eventTriggers.deselectItem );
        },

        /**
         * Handles the bodyItemClick which is triggered by the child view.
         * Performs the selection logic for the item based on the config - multiSelect | singleSelect
         * Triggers the event that is listened by the parent view.
         * @param {View} itemView
         *      A view representing the item that was clicked.
         * @private
         */
        _handleBodyItemClick: function ( itemView ) {

            if ( this.config.multiSelect === false ) {
                this.deselectAll();
                this.hideView();
                this.collection.selectSingleSelectModel( itemView.model );
            } else {
                this.collection.selectMultiSelectModel( itemView.model );
            }

            this.trigger( this.eventTriggers.bodyItemClick, itemView );

        },

        /**
         * Handles the child event triggered by the action item click.
         * Invokes the action item click callback specified in the configuration.
         * @param {View} view
         *      Item view which triggered the event.
         * @param {Model} itemModel
         *      Model representing the view that triggered the event.
         * @param {Object} itemConfig
         *      Object representing the item action that was clicked.
         * @private
         */
        _handleActionItemClick: function( view, itemModel, itemConfig ) {
            var actionItemClick = this.config && this.config.onActionItemClick;

            actionItemClick.call( null, itemModel, itemConfig );
        },

        /**
         * Handles the add new item event that gets triggered by the child view.
         * Triggers the event that is listened by the parent view to act on the same.
         * @private
         */
        _handleAddNewItem: function () {
            this.trigger( this.eventTriggers.addNewItem );
        },

        /**
         * Filters the results in the collection based on the text that is passed to the view.
         * @param {String} text
         *      A string used to filter the items in the collection.
         * @param {Array} selectedItems
         *      An array of selected items to highlight the newly returned items by the server.
         */
        filterResults: function ( text, selectedItems ) {

            this.debouncedSearchHandler( text, selectedItems );

        },

        /**
         * Shows the loader in the view.
         */
        showLoader: function () {
            AjaxLoader.showMask( {
                container: this.$el
            } );
        },

        /**
         * Hides the loader in the view.
         */
        hideLoader: function () {
            AjaxLoader.hideMask( {
                container: this.$el
            } );
        },

        /**
         * A handler that gets passed to the filter item method of the collection
         * to be invoked whenever the data in the collection has been refreshed based on
         * whatever user has typed
         * @private
         */
        _postProcessCollectionSearch: function () {

            // find the visible items
            var visibleItems = this.collection.where( {
                visible: true
            } );

            // reset the collection if visible items are zero - to show the empty view
            if ( visibleItems.length === 0 ) {
                this.collectionReset = true;
                this.collection.trigger( 'reset' );
            } else if ( this.collectionReset ) {
                // if the collection was reset, only then the below code should be executed
                this.collection.reset( this.collection.toJSON() );
                this.collectionReset = false;
            }

        },

        /**
         * Returns true of false based on the visible items present in the collection.
         * @param {Collection} collection
         *      A collection whose items should be verified.
         * @returns {boolean}
         */
        isEmpty: function ( collection ) {

            return collection.where( {
                visible: true
            } ).length === 0;

        },

        /**
         * Traverses through the list based on the keyCode number that is passed.
         * Preforms various logic based on the key that was pressed.
         * For the navigation in the list keys, highlights and scrolls to the items that should be shown
         * as selected.
         * @param {Number} keyCode
         *      A number indicating the key that was pressed.
         */
        traverseListOrSelectItem: function ( keyCode ) {

            var hoverClass = 'hoverState',
                currentHighlight,
                itemToHighlight,
                $prevElement,
                $nextElement;

            if ( !this.isVisible() ) {
                this.showView();
            }

            currentHighlight = this.$( '.' + hoverClass );

            if ( keyCode === this.constants.keyCode.ENTER ) {

                if ( currentHighlight.length > 0 ) {
                    currentHighlight.trigger( 'click' );
                }

                return;

            } else if ( keyCode === this.constants.keyCode.UP ) {

                if ( currentHighlight.length === 0 ) {
                    itemToHighlight = this.$( '.bI:visible' ).last();
                } else {

                    $prevElement = currentHighlight.prevAll( ':visible:first' );

                    if ( $prevElement.length === 0 ) {
                        itemToHighlight = this.$( '.bI:visible' ).last();
                    } else {
                        itemToHighlight = $prevElement;
                    }
                }

            } else if ( keyCode === this.constants.keyCode.DOWN ) {

                if ( currentHighlight.length === 0 ) {
                    itemToHighlight = this.$( '.bI:visible' ).first();
                } else {

                    $nextElement = currentHighlight.nextAll( ':visible:first' );

                    if ( $nextElement.length === 0 ) {
                        itemToHighlight = this.$( '.bI:visible' ).first();
                    } else {
                        itemToHighlight = $nextElement;
                    }
                }

            }

            currentHighlight.removeClass( hoverClass );
            itemToHighlight.addClass( hoverClass );
            this._scrollToItem( itemToHighlight );

        },

        /**
         * Deselects the item in the collection that is passed.
         * @param {Model} removedModel
         *      A model that should be deselected.
         */
        deselectItem: function ( removedModel ) {
            this.collection.deSelectItem( removedModel );
        },

        /**
         * Selects the item in the collection that is passed.
         * @param {Model} model
         *      A model that should be deselected.
         */
        selectItem: function ( model ) {
            this.collection.selectItem( model );
        },

        /**
         * Returns the visibility of the view.
         * @returns {boolean}
         */
        isVisible: function () {
            return this.$el.is( ':visible' );
        },

        /**
         * Shows the list view. Binds the event to hide the view if user clicks anywhere else.
         */
        showView: function () {

            if ( !this.isVisible() ) {

                // commented the code below as it was resetting the view when user has typed something for the search
                // and the dropdown is toggled
                /*if ( this.config.multiSelect === false ) {
                    this.collection.showAllItems();
                }*/

                this.$el.show();

                setTimeout( this._bindHideEvent.bind( this ), 0 );

            }

        },

        /**
         * Hides the view and unbinds the events that were bound while showing the view.
         */
        hideView: function () {
            this.$el.hide();
            this._unbindHideEvent();
        },

        /**
         * Binds the hide events to hide the dropdown list whenever user clicks somewhere else.
         * @private
         */
        _bindHideEvent: function () {

            var that = this;

            $( document ).on( 'click.hideDD', function () {
                that.hideView();
            } );

        },

        /**
         * Unbinds the event that was bound on the document while showing the list.
         * @private
         */
        _unbindHideEvent: function () {
            $( document ).off( 'click.hideDD' );
        },

        /**
         * Scrolls to the items that should be shown as highlighted whenever user is traversing
         * in the list.
         * @param {Model} item
         *      A model representing the item where the view should be scrolled.
         * @private
         */
        _scrollToItem: function ( item ) {

            var containerHeight,
                itemTop,
                $scrollContainerEl = this.$el.find( '.bCWrap' );

            if ( !item ) {
                item = this.$( '.hoverState' );
            }

            if ( item.length !== 0 ) {

                itemTop = item.position().top;
                containerHeight = $scrollContainerEl.height();

                var top = $scrollContainerEl.scrollTop() + itemTop - containerHeight + item.height();

                if ( top <= 0 ) {
                    $scrollContainerEl.scrollTop( 0 );
                } else if ( ( $scrollContainerEl.scrollTop() + itemTop ) >= containerHeight ) {
                    $scrollContainerEl.scrollTop( top );
                }

            }

        },

        getVisibleItems: function() {
            return this.collection.getVisibleItems();
        },

        /**
         * Deselects all the items in the collection.
         */
        clearView: function () {
            if ( this.config && this.config.ajax ) {
                this.collection.reset();
            } else {
                this.collection.deSelectAll();
            }
        },

        disableView : function () {
            this.undelegateEvents();
        },

        enableView : function () {
            this.delegateEvents();
        },

        resetDataSource: function(data) {
            this.collection.reset(data);
        },

        onDestroy: function () {
            this.stopListening( this.collection );
        }

    } );

} );
