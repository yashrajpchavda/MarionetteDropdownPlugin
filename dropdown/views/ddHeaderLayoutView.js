/**
 * The header layout view that gets rendered in the region in the `{{#crossLink "DropdownView"}}{{/crossLink}}`.
 * This view is responsible for rendering the `{{#crossLink "DropdownSelectedTagsView"}}{{/crossLink}}`.
 *
 * @class DropdownHeaderView
 * @extends Marionette.LayoutView
 * @constructor
 */

define( [
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'modules/dropdown2/views/selectedTagsCompView',
    'tpl!modules/dropdown2/templates/ddHeaderLayout.tmpl'
], function ( $, _, Backbone, Marionette, SelectedTagsCompositeView, DropdownHeaderTemplate ) {

    return Marionette.LayoutView.extend( {

        template: DropdownHeaderTemplate,

        className: 'hC user-no-select',

        /**
         * A property that holds the selected item
         * @property selectedItem
         * @type {Object}
         */
        selectedItem: {},

        ui: {
            selectedTagsContainer: '.selectedC',
            searchIco: '.searchIco'
        },

        regions: {
            selectedTagsContainer: '.selectedC'
        },

        events: {
            'click @ui.searchIco': '_handleSearchIcoClick'
        },

        initialize: function ( options ) {

            // create an instance variable
            this.config = {};

            // extend the confirm from the passed one
            _.extend( this.config, options.config );

            this.eventTriggers = options.eventTriggers;

            // create a model to make the config available to the template
            this.model = new Backbone.Model( {
                config: this.config
            } );

        },

        onRender: function () {

            this.selectedTagsView = new SelectedTagsCompositeView( {
                config: this.config,
                eventTriggers: this.eventTriggers
            } );

            // if dropdown is multiSelect, add a class for the css.
            // specified multiSelect behaviour related events
            if ( this.config.multiSelect === true ) {
                this.$el.addClass( 'mSel' );
                this.listenTo( this.selectedTagsView, this.eventTriggers.deselectItem, this._removeSelectedItemTag );
            }

            this.listenTo( this.selectedTagsView, this.eventTriggers.selectItem, this._addSelectedItemTag );
            this.listenTo( this.selectedTagsView, this.eventTriggers.toggleOptionsList, this._handleListToggle );
            this.listenTo( this.selectedTagsView, this.eventTriggers.traverseListOrSelectItem, this._handleTraverseListOrSelectItem );
            this.listenTo( this.selectedTagsView, this.eventTriggers.textSearch, this._handleTextSearch );
            this.listenTo( this.selectedTagsView, this.eventTriggers.hideOptionsList, this._handleHideOptionsList );
            this.listenTo( this.selectedTagsView, this.eventTriggers.clearSingleSelect, this._handleClearSingleSelect );
            this.listenTo( this.selectedTagsView, this.eventTriggers.clearView, this._handleClearView );

            this.getRegion( 'selectedTagsContainer' ).show( this.selectedTagsView );

        },

        /**
         * Returns the selected items array.
         * @method getSelectedItems
         * @returns {Array}
         *      Items that are selected.
         */
        getSelectedItems: function () {
            return this.selectedTagsView.getSelectedItems();
        },

        /**
         * Sets the items specified as selected items in the dropdown view.
         * @method setSelectedItems
         * @param {Array} items
         *      An array of items that should be set as selected.
         */
        setSelectedItems: function ( items ) {
            this.selectedTagsView.setSelectedItems( items );
        },

        /**
         * A function that returns the text that has been entered in the
         * input box of the dropdown while searching.
         * @method getEnteredText
         *
         * @returns {String} Entered text
         */
        getEnteredText: function () {
            return this.selectedTagsView.getEnteredText();
        },

        /**
         * Handler for the toggleOptionsList triggered by the selectedTagsView.
         * Triggers the event that is listened by the ddContainerLayoutView.
         *
         * @method _handleListToggle
         *
         * @private
         */
        _handleListToggle: function ( forceToggle ) {
            this.trigger( this.eventTriggers.toggleOptionsList, forceToggle );
        },

        /**
         * Invokes the selectedTagsView's method to update the view of the current selected items.
         *
         * @method updateHeaderView
         *
         * @param {Model} selectedItem
         *      A model representing the item that should be added to the selected items list.
         */
        updateHeaderView: function ( selectedItem ) {
            this.selectedTagsView.updateSelectedItem( selectedItem );
        },

        /**
         * Handler for the traverseListOrSelectItem triggered by the selectedTagsView.
         * Triggers the event that is listened by the ddContainerLayoutView.
         *
         * @method _handleTraverseListOrSelectItem
         *
         * @param {Number} eventCode
         *      A number indicating the eventCode for the key pressed.
         *
         * @private
         */
        _handleTraverseListOrSelectItem: function ( eventCode ) {
            this.trigger( this.eventTriggers.traverseListOrSelectItem, eventCode );
        },

        /**
         * Handler for the textSearch triggered by the selectedTagsView.
         * Triggers the event that is listened by the ddContainerLayoutView.
         *
         * @method _handleTextSearch
         *
         * @param {String} searchedText
         *      A string that should be used as a string to search in the item list.
         * @param {Array} selectedItems
         *      An array of selected items to be used by the body view to highlight the new results
         *      which have been returned from the server
         *
         * @private
         */
        _handleTextSearch: function ( searchedText, selectedItems ) {
            this.trigger( this.eventTriggers.textSearch, searchedText, selectedItems );
        },

        /**
         * Handler for the hideOptionsList triggered by the selectedTagsView.
         * Triggers the event that is listened by the ddContainerLayoutView.
         *
         * @method _handleHideOptionsList
         *
         * @private
         *
         */
        _handleHideOptionsList: function () {
            this.trigger( this.eventTriggers.hideOptionsList );
        },

        /**
         * Event handler for the search icon click.
         *
         * @method _handleSearchIcoClick
         *
         * @private
         */
        _handleSearchIcoClick: function () {
            this.selectedTagsView.focusInput();
        },

        /**
         * Adds a new item to the selected tags. Gets called by the parent view.
         *
         * @method addNewItem
         *
         */
        addNewItem: function () {
            this.selectedTagsView.addNewItem();
        },

        /**
         * Handler for the deselectItem triggered by the selectedTagsView.
         * Triggers the event that is listened by the ddContainerLayoutView.
         *
         * @method _removeSelectedItemTag
         *
         * @param {Model} removedModel
         *      A model representing the item that should be deselected.
         *
         * @private
         */
        _removeSelectedItemTag: function ( removedModel ) {
            this.trigger( this.eventTriggers.deselectItem, removedModel );
        },

        /**
         * Handler for the selectItem triggered by the selectedTagsView.
         * Triggers the event that is listened by the ddContainerLayoutView.
         *
         * @method _addSelectedItemTag
         *
         * @param {Model} model
         *      A model representing the item that should be deselected.
         *
         * @private
         */
        _addSelectedItemTag: function ( model ) {
            this.trigger( this.eventTriggers.selectItem, model );
        },


        /**
         * A method which focuses on the input text of the dropdown.
         *
         * @method focusInput
         */
        focusInput: function() {
            this.selectedTagsView.focusInput();
        },

        /**
         * A method to blur away from the input of the dropdown.
         *
         * @method blurInput
         *
         */
        blurInput: function() {
            this.selectedTagsView.blurInput();
        },

        /**
         * A method to clear the view.
         *
         * @method clearView
         *
         */
        clearView: function () {
            this.selectedTagsView.clearView();
        },

        /**
         * A method to search the item in the list.
         * It'll be called from parent view.
         *
         * @method searchTerm
         *
         * @param term
         *      A term represents text.
         */
        searchTerm : function( term ) {
            this.selectedTagsView.searchTerm( term );
        },

        /**
         * A handler for the clearView triggered by the tags view.
         *
         * @method _handleClearView
         *
         * @private
         */
        _handleClearView : function () {
            this.trigger( this.eventTriggers.clearView );
        },

        /**
         * Handler for the handleClearSingleSelect triggered by the selectedTagsView.
         * Triggers the event that is listened by the ddContainerLayoutView.
         *
         * @method _handleClearSingleSelect
         *
         * @private
         *
         */
        _handleClearSingleSelect : function () {
            this.trigger( this.eventTriggers.clearSingleSelect );
        },

        /**
         * This method is to disable dropdown programmatically.
         *
         * @method disableView
         *
         */
        disableView : function () {
            this.undelegateEvents();
            if( this.selectedTagsView ) {
                this.selectedTagsView.disableView();
            }
        },

        /**
         * This method is to enable dropdown programmatically.
         *
         * @method enableView
         *
         */
        enableView : function () {
            this.delegateEvents();
            if( this.selectedTagsView ) {
                this.selectedTagsView.enableView();
            }
        },

        onDestroy: function () {
            this.stopListening();
        }

    } );

} );
