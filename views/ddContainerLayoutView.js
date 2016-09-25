/**
 * Dropdown view.
 * This is the view that needs to be initialized whenever we want to use the dropdown.
 *
 * @class DropdownView
 * @constructor
 */

define( [
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'modules/dropdown2/views/ddBodyCompView',
    'modules/dropdown2/views/ddHeaderLayoutView',
    'tpl!modules/dropdown2/templates/ddContainerLayout.tmpl'
], function ( $, _, Backbone, Marionette, DropdownBodyCompositeView, DropdownHeaderLayoutView,
              DropdownContainerLayoutTemplate ) {

    return Marionette.LayoutView.extend( {

        template: DropdownContainerLayoutTemplate,

        className: 'ddC',

        eventTriggers: {
            toggleOptionsList: 'toggleOptionsList',
            textSearch: 'textSearch',
            bodyItemClick: 'bodyItemClick',
            traverseListOrSelectItem: 'traverseListOrSelectItem',
            deselectItem: 'deselectItem',
            clearSingleSelect : 'clearSingleSelect',
            selectItem: 'selectItem',
            hideOptionsList: 'hideOptionsList',
            addNewItem: 'addNewItem',
            footerClick: 'footerClick',
            convertCodeFooterClick: 'convertCodeFooterClick',
            clearView : 'clearView'
        },

        ui: {
            bodyContainer: '.ddBC',
            headerContainer: '.ddHC'
        },

        regions: {
            bodyContainer: '.ddBC',
            headerContainer: '.ddHC'
        },

        /**
         * The method that gets called whenever we instanciate the dropdown view.
         *
         * It takes the following parameters as the config to the view.
         *
         * @method initialize
         * @param {Object} config A config object
         * @param {String} [config.placeholder='Please Select'] String that gets used as a placeholder for the dropdown.
         * @param {Boolean} [config.multiSelect=false] Configuring dropdown as multi-select would let the user select
         *      multiple items from the list. If not passed as `true` then the dropdown would act like a normal
         *      element ( non - textbox ) and would let the user click on the view to open the list of options.
         * @param {Number} [config.searchTriggerDelay=600] Number of milliseconds that the delay would be added before
         *      the search inside the list of items would
         *      be triggered. If the ajax is configured the view will send an ajax request.
         * @param {String} [config.showClearIcon=false] Shows the clear icon next to the textbox of the dropdown.
         *      Useful with `searchable` configured as `true`.
         * @param {String} [config.data=[]] This config is useful if you want to pass a local pre-populated data
         *      source to the dropdown plugin. The list of items the should be displayed as dropdown items in the view.
         *      The format of the items in the array should be:
         * ```javascript
         *     {
         *         id: "",
         *         text: "",
         *         rawObject: { }
         *     }
         * ```
         * *    `id` param can be either `String` or `Number` which identifies the item uniquely.
         * *    `text` param can be either `String` or `Number` that would be displayed to the user.
         * *    `rawObject` param is an object. It gets returned as a part of selected item whenever we want the
         *       selected items of the dropdown through `getSelectedItems()`. The purpose of this object is to pass
         *       extra metadata to the items of the dropdown which we might want to use later on while operation on the
         *       selected items.
         *
         * @param {Object} config.ajax Option is useful when the data source of the dropdown is remote and you want the
         *      items of the dropdown to be loaded as an when user types the characters. The options of the
         *      `ajax` config are defined below:
         *
         * @param {String} config.ajax.url the url where the ajax request should be made to fetch the data
         * @param {String} config.ajax.type the type of the request to be made
         * @param {Function} config.ajax.requestDataFormatter The function that gets invoked before making an ajax call
         *       to the server. The returned value from this function gets passed as request data to the server for
         *       the request. The arguments that gets passed to this function are:
         *
         * @param {String} config.ajax.requestDataFormatter.text It gets passed to the `requestDataFormatter` function.
         *       It is the searched text that has been entered by the user.
         *
         * @param {Function} config.ajax.responseDataFormatter The function that gets invoked before setting the data
         *       that is sent by the server as a response of the dropdown request. You can use this function to process
         *       the data that is being sent by the server to accommodate into the dropdown format. This function must
         *       return an array of objects which will be shown as items in the list.
         *
         * @param {Object} config.ajax.responseDataFormatter.response The response object that is sent by the server.
         *
         * @param {String} [config.noDataMessage='No Data Found'] A string that would be displayed whenever user
         *       searches for an item and that item is not present in the list.
         *
         * @param {Boolean} [config.allowNew=false] If you want to allow the user to type in and add new items - which
         *       are not present in the list, pass this options as `true`. If passed as `true` user would get an
         *       option to add new items in the list.
         *
         * @param {String} [config.allowNewText='Add as New Item'] If `allowNew` is set as `true` this text would be
         *       displayed to user an an option in the list, which user can click on to add the new item in. Executes
         *       the `beforeNewItemAdd` callback defined under `callbacks` config, and adds the item only if the
         *       callback returns `true`.
         *
         * @param {Array} [config.footer=null] The list of items that should be shown as footer items to the list - like Open
         *       Codebook option - in ezCAC working page. The item in the list should be in the format of the
         *       following object:
         * ```javascript
         *     {
         *         itemKey: "",
         *         html: "",
         *         footerClick: function( dropdownViewInstance ) { }
         *     }
         * ```
         * *    `itemKey` should be a `String` or `Number` which uniquely identifies the item.
         * *    `html` is the `String` that gets rendered in the DOM to display the footer item.
         * *    `footerClick` is the function that gets invoked whenever the footer item is clicked. The callback gets
         *      executed with one parameter - that is the instance of the dropdown view.
         *
         * @param {Array} [config.selectedItems=null] The list of items that should be selected by default. It should
         *       be of same format as `data` passed to the dropdown view.
         *
         * @param {Function} [config.onItemSelect=null] The callback function that gets executed whenever user selects
         *       an item from the dropdown list. The method gets called with the following argument.
         *
         * @param {DropdownView} config.onItemSelect.view The instance of the dropdown view.
         */

        initialize: function ( options ) {

            // create the default config for the dropdown
            this._initDefaultConfig();

            this.constants = {
                disableClass : "disableDD",
                isDisable : false
            };

            // extend the config which is passed to the initialize
            _.extend( this.config, options );

            // create a model for the view
            this.model = new Backbone.Model( {
                config: this.config
            } );

        },

        onRender: function () {

            var headerContainerRegion = this.getRegion( 'headerContainer' ),
                bodyContainerRegion = this.getRegion( 'bodyContainer' );

            if ( this.headerView ) {
                headerContainerRegion.reset();
                this.stopListening( this.headerView );
            }

            // create the header layout view
            this.headerView = new DropdownHeaderLayoutView( {
                config: this.config,
                eventTriggers: this.eventTriggers
            } );

            if ( this.ddBodyView ) {
                bodyContainerRegion.reset();
                this.stopListening( this.ddBodyView );
            }

            // create the body view
            this.ddBodyView = new DropdownBodyCompositeView( {
                config: this.config,
                eventTriggers: this.eventTriggers
            } );

            this.listenTo( this.headerView, this.eventTriggers.toggleOptionsList, this._handleToggleList );
            this.listenTo( this.headerView, this.eventTriggers.textSearch, this._handleTextSearch );
            this.listenTo( this.headerView, this.eventTriggers.traverseListOrSelectItem, this._handleTraverseList );
            this.listenTo( this.headerView, this.eventTriggers.deselectItem, this._deselectItem );
            this.listenTo( this.headerView, this.eventTriggers.selectItem, this.selectItem );
            this.listenTo( this.headerView, this.eventTriggers.hideOptionsList, this.handleHideOptionsList );
            this.listenTo( this.headerView, this.eventTriggers.clearSingleSelect, this._handleClearSingleSelect );
            this.listenTo( this.headerView, this.eventTriggers.clearView, this.clearView );
            headerContainerRegion.show( this.headerView );

            this.listenTo( this.ddBodyView, this.eventTriggers.bodyItemClick, this._handleBodyItemClick );
            this.listenTo( this.ddBodyView, this.eventTriggers.addNewItem, this._handleAddNewItem );
            this.listenTo( this.ddBodyView, this.eventTriggers.footerClick, this._handleFooterClick );

            bodyContainerRegion.show( this.ddBodyView );

            if ( this.config.cssClass ) {
                this.$el.addClass( this.config.cssClass );
            }

        },

        /**
         * Handler for the toggleOptionsList triggered by the headerView.
         * Handles the show / hide for the dropdown body view.
         * @method _handleToggleList
         * @param {Boolean} forceToggle
         *      If passed as `true` the dropdown will be forcefully toggled.
         * @private
         */
        _handleToggleList: function ( forceToggle ) {

            // set the forceToggle to true if the dropdown is not searchable
            if ( this.config && !this.config.searchable ) {
                forceToggle = true;
            }

            // toggle unconditionally if forceToggle is true
            if ( forceToggle && typeof forceToggle === 'boolean' && forceToggle.toString() === 'true' ) {

                if ( this.ddBodyView.isVisible() ) {
                    this.ddBodyView.hideView();
                } else {
                    this.ddBodyView.showView();
                }

            } else if ( typeof forceToggle === 'undefined' ) {

                var searchedTerm = this.getSearchedTerm() || '';

                var visibleItemsCount = this.ddBodyView.getVisibleItems().length;

                if ( !( $.trim( searchedTerm ).length === 0 && visibleItemsCount === 0) ) {

                    if ( this.ddBodyView.isVisible() ) {
                        this.ddBodyView.hideView();
                    } else {
                        this.ddBodyView.showView();
                    }

                }

            }

        },

        /**
         * Initializes the default configuration for the dropdown.
         * @method _initDefaultConfig
         *
         * @private
         */
        _initDefaultConfig: function() {

            /**
             * A configuration for the dropdown.
             * @property config
             * @type {Object}
             */
            this.config = {
                multiSelect: false,
                searchable: false,
                height: 140
            };
        },

        /**
         * Returns the selected items for the dropdown.
         * @method getSelectedItems
         * @returns {Array}
         *      Returns the array of selected items in the dropdown. The item in the dropdown will have
         *      following properties:
         * *    `id` the unique id of the dropdown item
         * *    `text` the text of the dropdown
         * *    `rawObject` {Object} the raw object that was passed to the item - might contain some meta-data about
         *          the item.
         */
        getSelectedItems: function () {
            return this.headerView.getSelectedItems();
        },

        /**
         * Sets the items specified as selected items in the dropdown view.
         * @method setSelectedItems
         * @param {Array} items An array of items that should be set as selected. It should be of same format as `data`.
         */
        setSelectedItems: function ( items ) {
            this.ddBodyView.clearView();
            this.headerView.setSelectedItems( items );
        },

        /**
         * A function that returns the text that has been entered in the input box of the dropdown while searching.
         * @method getSearchedTerm
         * @returns {String} The text that has been typed by the user in the searchbox.
         */
        getSearchedTerm: function () {
            return this.headerView.getEnteredText();
        },

        /**
         * Handler for the `textSearch` triggered by the headerView.
         * @method _handleTextSearch
         * @param {String} text A string to search in the list.
         * @param {Array} selectedItems An array of selected items used by the body view to highlight the newly
         *      returned items from the server.
         *
         * @private
         */
        _handleTextSearch: function ( text, selectedItems ) {
            this.ddBodyView.filterResults( text, selectedItems );
        },

        /**
         * Handler for the `traverseListOrSelectItem` triggered by the headerView. Invokes body view's function to
         * traverse through the list.
         * @method _handleTraverseList
         * @param {Number} keyCode A number indicating the key pressed.
         *
         * @private
         */
        _handleTraverseList: function ( keyCode ) {
            this.ddBodyView.traverseListOrSelectItem( keyCode );
        },

        /**
         * Handler for the `bodyItemClick` triggered by the bodyView. Updates the header view to reflect the selection.
         * Invokes the onItemSelect method if specified.
         *
         * @method _handleBodyItemClick
         * @param {View} clickedItemView A view representing the item that was clicked.
         *
         * @private
         */
        _handleBodyItemClick: function ( clickedItemView ) {
            this.headerView.updateHeaderView( clickedItemView.model );

            if ( this.config.onItemSelect ) {
                this.config.onItemSelect.call( window, this );
            }
        },

        /**
         * Clears the headerView and bodyView. Removes all the selections that are done.
         *
         * @method clearView
         */
        clearView: function () {
            this.headerView.clearView();
            this.ddBodyView.clearView();
            if ( this.config.showClearIcon ) {
                this._handleClearSingleSelect();
            }
        },

        /**
         * Handler for the `addNewItem` triggered by the bodyView. Invokes the headerview's method for addition of new
         * item.
         *
         * @method _handleAddNewItem
         *
         * @private
         */
        _handleAddNewItem: function () {
            this.headerView.addNewItem();
        },

        /**
         * Handles the `footerClick` triggered by the dropdown body view.
         * Invokes the footer item click if specified in the `config`.
         *
         * @method _handleFooterClick
         *
         * @private
         */
        _handleFooterClick: function ( itemKey ) {

            var clickedItemConfig = _.findWhere( this.config.footer, { itemKey: itemKey } );

            if ( clickedItemConfig && typeof clickedItemConfig.footerClick === 'function' ) {
                clickedItemConfig.footerClick.call( window, this );
            }

        },

        /**
         * Handler for the `deselectItem` triggered by the headerView.
         * @param {Model} removedModel
         *      A model representing the item that should be deselected.
         *
         * @private
         */
        _deselectItem: function ( removedModel ) {
            this.ddBodyView.deselectItem( removedModel );
        },

        /**
         * Handler for the clearing single select. It'll invoke passed handler if there is any.
         *
         * @private
         */
        _handleClearSingleSelect : function () {
            if ( this.config.onClearSelectedItem ) {
                this.config.onClearSelectedItem.call( window, this );
            }
        },

        /**
         * Handler for the selectItem triggered by the headerView.
         * @param {Model} model
         *      A model representing the item that should be deselected.
         */
        selectItem: function ( model ) {
            this.ddBodyView.selectItem( model );
        },

        /**
         * Handler for the hideOptionsList triggered by the headerView.
         */
        handleHideOptionsList: function () {
            this.ddBodyView.hideView();
        },

        /**
         * This is to check view's status.
         * @returns {boolean|exports.constants.isDisable}
         */
        isDisabled : function () {
            return this.constants.isDisable;
        },

        /**
         * This method is to disable dropdown programmatically.
         */
        disableView : function () {
            if ( this.isDisabled() ) {
                return;
            }
            this.constants.isDisable = true;
            this.$el.addClass( this.constants.disableClass );
            this.undelegateEvents();
            if ( this.ddBodyView ) {
                this.ddBodyView.disableView();
            }
            if ( this.headerView ) {
                this.headerView.disableView();
            }

        },

        /**
         * This method is to enable dropdown programmatically.
         */
        enableView : function () {
            if ( !this.isDisabled() ) {
                return;
            }
            this.constants.isDisable = false;
            this.$el.removeClass( this.constants.disableClass );
            this.delegateEvents();
            if ( this.ddBodyView ) {
                this.ddBodyView.enableView();
            }
            if ( this.headerView ) {
                this.headerView.enableView();
            }
        },

        /**
         * A method which focuses on the input text of the dropdown.
         */
        focusInput: function() {
            this.headerView.focusInput();
        },

        /**
         * This method is to call search functionality programmatically.
         * It'll be used in ajax support mostly.
         * @param term
         *      A term represents text.
         */
        searchTerm : function( term ) {
            this.headerView.searchTerm( term );
        },

        resetDataSource: function(data) {
            this.ddBodyView.resetDataSource(data);
        },

        onDestroy: function () {
            this.stopListening();
        }

    } );

} );
