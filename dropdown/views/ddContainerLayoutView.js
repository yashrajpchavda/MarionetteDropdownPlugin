/**
 * Dropdown Module.
 * A module which contains the files related to the dropdown component.
 *
 * @module Dropdown
 */

/**
 * This is the main base view for the dropdown component. If you want to use this plugin, following is the list of items that you
 * might be interested in knowing.
 *
 * * You need to copy the files into your application's module directory and require `ddContainerLayout` file from the
 *   dropdown module and create an instance of this view.
 *
 * * You need to attach the `dd2.css` provided with this codebase into your application. Plugin uses some of the font-awesome
 *   icons as well, hence please make sure you add that too.
 *
 * * The possible configurations that can be passed to the dropdown view, are available in the documentation of the
 *   `{{#crossLink "DropdownView/initialize:method"}}{{/crossLink}}` method of the same class.
 *
 * * A dropdown can be created as:
 *
 *       var dropdownViewInstance = new DropdownView( {
 *           ...
 *           config
 *           ...
 *       } );
 *
 * * The created dropdown view can be either shown into a region,
 *
 *       view.getRegion( 'dropdown' ).show( dropdownViewInstance );
 *
 * * or if you want to display it inside any existing block container which is present in the DOM, you can just do,
 *
 *       domElement.html( dropdownViewInstance.render().trigger( 'attach' ).$el )
 *
 * * We need to trigger the attach in order to do some processing that happens at the time when the view is attached
 *   to the DOM.
 *
 * * The dropdown view has two main regions, **header** and **body**. The `{{#crossLink "DropdownHeaderView"}}{{/crossLink}}` and
 *   `{{#crossLink "DropdownBodyView"}}{{/crossLink}}` are being rendered in respective regions and are available as
 *   `{{#crossLink "DropdownView/headerView:property"}}{{/crossLink}}` and `{{#crossLink "DropdownView/ddBodyView:property"}}{{/crossLink}}`
 *   properties on `dropdownViewInstance`.
 *
 * ##### The example with all the available configurations:
 * Not all of them can be used together, the documentation available at `{{#crossLink "DropdownView/initialize:method"}}{{/crossLink}}`
 * gives a better idea about all of them.
 *
 *     var dropdownViewInstance = new DropdownView( {
 *
 *         placeHolder: 'Please Select',
 *
 *         multiSelect: false,
 *
 *         searchTriggerDelay: 600,
 *
 *         showClearIcon: false,
 *
 *         data: [ {
 *             id: 1,
 *             text: 'item 1',
 *             rawObject: {
 *                 originalId: 1,
 *                 originalText: 'test',
 *                 someMetaData: {
 *                 }
 *             }
 *         }, {
 *             id: 2,
 *             text: 'item 2',
 *             rawObject: {
 *                 originalId: 2,
 *                 originalText: 'test',
 *                 someMetaData: {
 *                 }
 *             }
 *         } ],
 *
 *         ajax: {
 *             url: 'urlForTheAjax',
 *             type: 'get|post',
 *             triggerChars: 2,
 *             requestDataFormatter: function( text ) {
 *                 return {
 *                     key: text
 *                 };
 *             },
 *             responseDataFormatter: function( responseFromServer ) {
 *                 return [];
 *             }
 *         },
 *
 *         noDataMessage: 'No Data Found',
 *
 *         allowNew: false,
 *
 *         allowNewText: 'Add as New Item',
 *
 *         footer: [ {
 *             itemKey: 'btn1',
 *             html: 'Footer Item1',
 *             footerClick: function( dropdownViewInstance ) {
 *
 *             }
 *         }, {
 *             itemKey: 'btn2',
 *             html: 'Footer Item2',
 *             footerClick: function( dropdownViewInstance ) {
 *
 *             }
 *         }, ... ],
 *
 *         selectedItems: [ {
 *         } ],
 *
 *         callbacks: {
 *             beforeNewItemAdd: function( itemText ) {
 *
 *             },
 *             onKeyUp: function( itemText ) {
 *
 *             }
 *         },
 *
 *         onItemSelect: function( dropdownViewInstance ) {
 *
 *         }
 *
 *     } );
 *
 *
 *
 * @class DropdownView
 * @extends Marionette.LayoutView
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

        /**
         * Event triggers object that holds the keys for the events that are triggered within the view.
         * The same object gets passed to the header and body views and their children, just to have all the event
         * names available at just one place to avoid typos while development.
         * @property eventTriggers
         *
         * @type {Object}
         */
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
         * Whenever you create an instance of the `DropdownView`, by default Marionette framework calls the `initialize`
         * method of the view and passes whatever you have passed to the `DropdownView` constructor to the `initialize`
         * method. These are the possible configurations that we can pass whenever we create an instance of the dropdown.
         *
         * @method initialize
         *
         * @param {Object} config A config object
         *
         * @param {String} [config.placeholder='Please Select'] String that gets used as a placeholder for the dropdown.
         *
         * @param {Boolean} [config.multiSelect=false] Configuring dropdown as multi-select would let the user select
         *      multiple items from the list. If not passed as `true` then the dropdown would act like a normal
         *      dropdown with just single select facility and would let the user click on the it to open the list of options.
         *
         * @param {Number} [config.searchTriggerDelay=600] Number of milliseconds that the delay would be added before
         *      the search inside the list of items would be triggered. If the ajax is configured the request would
         *      be sent only after the specified milliseconds.
         *
         * @param {Boolean} [config.showClearIcon=false] Shows the clear icon next to the textbox of the dropdown. This
         *      clear icon lets the user clear the content of the dropdown view's textbox. It should only be used when
         *      the view is configured to be searchable by `searchable: true`.
         *
         * @param {Array} [config.data=[]] This config is useful if you want to pass a local pre-populated data
         *      source to the dropdown plugin. The dropdown will have the items that you speicify in the `data` array.
         *      The format of the items in the array should be:
         *
         *     {
         *         id: "",
         *         text: "",
         *         rawObject: { }
         *     }
         *
         * * `id` param can be either `String` or `Number` which identifies the item uniquely.
         * * `text` param can be either `String` or `Number` that would be displayed to the user.
         * * `rawObject` param is an object. It gets returned as a part of selected item whenever we want the
         *       selected items of the dropdown through `getSelectedItems()`. The purpose of this object is to pass
         *       extra metadata to the items of the dropdown which we might want to use later on while operating on the
         *       selected items.
         *
         * @param {Object} config.ajax Option is useful when the data source of the dropdown is remote and you want the
         *      items of the dropdown to be loaded as an when user types the characters. The options of the
         *      `ajax` config are defined below:
         *
         * @param {String} config.ajax.url the url where the ajax request should be made to fetch the data
         *
         * @param {String} config.ajax.type the type of the request to be made `post` / `get`
         *
         * @param {Number} [config.ajax.triggerChars=2] the number indicating the minimum characters required by the user to
         *      be typed to make an ajax call for the data.
         *
         * @param {Function} config.ajax.requestDataFormatter The function that gets invoked before making an ajax call
         *       to the server. The returned value from this function gets passed as request data to the server for
         *       the request. The arguments that gets passed to this function are:
         *
         * @param {String} config.ajax.requestDataFormatter.text It is the searched text that has been entered by the user.
         *
         * @param {Function} config.ajax.responseDataFormatter The function that gets invoked before setting the data
         *       for the dropdown that is sent by the server as a response of the dropdown request. You can use this function to process
         *       the data that is being sent by the server to accommodate into the dropdown format. This function must
         *       return an array of objects which will be shown as items in the list. And this objects must be in the same
         *       format as `data`.
         *
         * @param {Object} config.ajax.responseDataFormatter.response The response object that is sent by the server.
         *
         * @param {String} [config.noDataMessage='No Data Found'] A string that would be displayed whenever user
         *       searches for an item and that item is not present in the list.
         *
         * @param {Boolean} [config.allowNew=false] If you want to allow the user to type in and add new items - which
         *       are not present in the list, pass this option as `true`. This config is only useful with `multiSelect: true`.
         *       If passed as `true` user would get an option to add new items in the list for all those searches that
         *       did not match any item.
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
         * * `itemKey` should be a `String` or `Number` which uniquely identifies the item.
         * * `html` is the `String` that gets rendered in the DOM to display the footer item.
         * * `footerClick` is the function that gets invoked whenever the footer item is clicked. The callback gets
         *      executed with one parameter - that is the instance of the dropdown view.
         *
         * @param {Array} [config.selectedItems=null] The list of items that should be selected by default. It should
         *       be of same format as `data` passed to the dropdown view.
         *
         * @param {Function} [config.onItemSelect=null] The callback function that gets executed whenever user selects
         *       an item from the dropdown list. The method gets called with the following argument.
         *
         * @param {Object} [config.callbacks] The callbacks that can be passed to the view. There are two callbacks that
         *      we can pass.
         *
         * @param {Function} [config.callbacks.beforeNewItemAdd] The callback that gets fired for the multiSelect dropdown
         *      with `allowNew` set as `true`. Whenever user tries to add a new item, if specified, then this callback gets executed
         *      with the entered text as an argument. The newly item would only be added if the callback
         *      returns `true`. The purpose of this is to perform any necessary validation before adding new item. The function
         *      receives the following as its arguments.
         *
         * @param {String} config.callbacks.beforeNewItemAdd.itemText A string indicating the item text that has been
         *      entered by the user.
         *
         * @param {Function} [config.callbacks.onKeyUp] The callback that gets executed whenever user types something in
         *      the dropdown. Useful to perform any logic as and when user types in the input box. It receives the following
         *      arguments.
         *
         * @param {String} config.callbacks.onKeyUp.itemText The text that has been entered by the user.
         *
         * @param {DropdownView} config.onItemSelect.view The instance of the dropdown view.
         */

        initialize: function ( config ) {

            // create the default config for the dropdown
            this._initDefaultConfig();

            this.constants = {
                disableClass : "disableDD",
                isDisable : false
            };

            // extend the config which is passed to the initialize
            _.extend( this.config, config );

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
            /**
             * An instance of the dropdown header view rendered inside the **header** region.
             * @property headerView
             * @type {DropdownHeaderView}
             */
            this.headerView = new DropdownHeaderLayoutView( {
                config: this.config,
                eventTriggers: this.eventTriggers
            } );

            if ( this.ddBodyView ) {
                bodyContainerRegion.reset();
                this.stopListening( this.ddBodyView );
            }

            // create the body view
            /**
             * An instance of the dropdown header view rendered inside the **body** region.
             * @property ddBodyView
             * @type {DropdownBodyView}
             */
            this.ddBodyView = new DropdownBodyCompositeView( {
                config: this.config,
                eventTriggers: this.eventTriggers
            } );

            this.listenTo( this.headerView, this.eventTriggers.toggleOptionsList, this._handleToggleList );
            this.listenTo( this.headerView, this.eventTriggers.textSearch, this._handleTextSearch );
            this.listenTo( this.headerView, this.eventTriggers.traverseListOrSelectItem, this._handleTraverseList );
            this.listenTo( this.headerView, this.eventTriggers.deselectItem, this._deselectItem );
            this.listenTo( this.headerView, this.eventTriggers.selectItem, this._selectItem );
            this.listenTo( this.headerView, this.eventTriggers.hideOptionsList, this.hideOptionsList );
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
             * An instance variable of the view which holds all the configuration settings that were passed at the time
             * of initialization as well as some private configurations set by the view.
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
         * Returns the selected item(s) for the dropdown.
         * @method getSelectedItems
         * @returns {Array}
         * Method returns an array for single select dropdown as well - with just one item.
         * The item in the returned array will have following properties:
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
         * Handler for the `textSearch` event triggered by the headerView. Invokes the respective method of
         * the body view so that the items displayed in the body view can be filtered based on the text that has been
         * passed.
         * @method _handleTextSearch
         * @param {String} text A string to search in the list.
         * @param {Array} selectedItems Whenever ajax config is defined, this array is used to show the returned items
         *      from the server as selected.
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
         * Invokes the `config.onItemSelect` method if specified.
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
         * Handler for the `deselectItem` triggered by the headerView. Invokes bodyViews method to deselect the item
         * that is passed to the method.
         * @method _deselectItem
         * @param {Model} removedModel
         *      A model representing the item that should be deselected.
         *
         * @private
         */
        _deselectItem: function ( removedModel ) {
            this.ddBodyView.deselectItem( removedModel );
        },

        /**
         * Handler for the clearing single select. It'll invoke the passed `config.onClearSelectedItem` handler
         * if there is any.
         *
         * @method _handleClearSingleSelect
         * @private
         */
        _handleClearSingleSelect : function () {
            if ( this.config.onClearSelectedItem ) {
                this.config.onClearSelectedItem.call( window, this );
            }
        },

        /**
         * Handler for the selectItem triggered by the headerView. Invokes the body view's method passing the model.
         *
         * @method _selectItem
         *
         * @param {Model} model
         *      A model representing the item that should be deselected.
         *
         * @private
         */
        _selectItem: function ( model ) {
            this.ddBodyView.selectItem( model );
        },

        /**
         * Handler for the hideOptionsList triggered by the headerView. Invokes the body view's method to perform
         * action.
         *
         * @method hideOptionsList
         */
        hideOptionsList: function () {
            this.ddBodyView.hideView();
        },

        /**
         * A method which checks whether the dropdown view is disabled or not.
         *
         * @method isDisabled
         *
         * @returns {boolean|exports.constants.isDisable}
         */
        isDisabled : function () {
            return this.constants.isDisable;
        },

        /**
         * A method to disabled the dropdown view. Disabled the body and header views respectively.
         *
         * @method disableView
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
         * A method to enable a dropdown view. Invokes methods to enable the header and body views.
         *
         * @method enableView
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
         * A method to focus on the input text of the dropdown.
         *
         * @method focusInput
         */
        focusInput: function() {
            this.headerView.focusInput();
        },

        /**
         * A method to blur away from the input of the dropdown.
         *
         * @method blurInput
         *
         */
        blurInput: function() {
            this.headerView.blurInput();
        },

        /**
         * To invoke the search functionality of the dropdown through code.
         * It'll be used in ajax support mostly.
         *
         * @method searchTerm
         *
         * @param {String} term
         *      A term represents text.
         */
        searchTerm : function( term ) {
            this.headerView.searchTerm( term );
        },

        /**
         * A method to reset the data source of the dropdown with the newly passed data source. Resets the collection
         * of the items. It will not bring any impact on the header view, hence the selected item(s) will stay as is,
         * even if they don't exist in the new data source.
         *
         * @method resetDataSource
         *
         * @param {Array} data
         *      The list of items that should be displayed after reset. This data source will have to be of the same
         *      format as we have in the `data` in the coniguration of `initialize` method.
         */

        resetDataSource: function(data) {
            this.ddBodyView.resetDataSource(data);
        },

        onDestroy: function () {
            this.stopListening();
        }

    } );

} );
