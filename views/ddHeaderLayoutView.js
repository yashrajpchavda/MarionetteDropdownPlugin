/**
 * Created by Yashraj.C on 12/4/2015.
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

        selectedItem: {},

        ui: {
            selectedTagsContainer: '.selectedC',
            searchIco: '.searchIco'
        },

        regions: {
            selectedTagsContainer: '.selectedC'
        },

        events: {
            'click @ui.searchIco': 'handleSearchIcoClick'
        },

        initialize: function ( options ) {

            this.config = {};

            _.extend( this.config, options.config );

            this.eventTriggers = options.eventTriggers;

            this.model = new Backbone.Model( {
                config: this.config
            } );

        },

        onRender: function () {

            this.selectedTagsView = new SelectedTagsCompositeView( {
                config: this.config,
                eventTriggers: this.eventTriggers
            } );

            if ( this.config.multiSelect === true ) {
                this.$el.addClass( 'mSel' );
                this.listenTo( this.selectedTagsView, this.eventTriggers.deselectItem, this.removeSelectedItemTag );
            }

            this.listenTo( this.selectedTagsView, this.eventTriggers.selectItem, this.addSelectedItemTag );
            this.listenTo( this.selectedTagsView, this.eventTriggers.toggleOptionsList, this.handleListToggle );
            this.listenTo( this.selectedTagsView, this.eventTriggers.traverseListOrSelectItem, this.handleTraverseListOrSelectItem );
            this.listenTo( this.selectedTagsView, this.eventTriggers.textSearch, this.handleTextSearch );
            this.listenTo( this.selectedTagsView, this.eventTriggers.hideOptionsList, this.handleHideOptionsList );
            this.listenTo( this.selectedTagsView, this.eventTriggers.clearSingleSelect, this.handleClearSingleSelect );
            this.listenTo( this.selectedTagsView, this.eventTriggers.clearView, this.handleClearView );

            this.getRegion( 'selectedTagsContainer' ).show( this.selectedTagsView );

        },

        /**
         * Returns the selected items array.
         * @returns {Array}
         *      Items that are selected.
         */
        getSelectedItems: function () {
            return this.selectedTagsView.getSelectedItems();
        },

        /**
         * Sets the items specified as selected items in the dropdown view.
         * @param {Array} items
         *      An array of items that should be set as selected.
         */
        setSelectedItems: function ( items ) {
            this.selectedTagsView.setSelectedItems( items );
        },

        /**
         * A function that returns the text that has been entered in the
         * input box of the dropdown while searching.
         */
        getEnteredText: function () {
            return this.selectedTagsView.getEnteredText();
        },

        /**
         * Handler for the toggleOptionsList triggered by the selectedTagsView.
         * Triggers the event that is listened by the ddContainerLayoutView.
         */
        handleListToggle: function ( forceToggle ) {
            this.trigger( this.eventTriggers.toggleOptionsList, forceToggle );
        },

        /**
         * Invokes the selectedTagsView's method to update the view of the current selected items.
         * @param {Model} selectedItem
         *      A model representing the item that should be added to the selected items list.
         */
        updateHeaderView: function ( selectedItem ) {
            this.selectedTagsView.updateSelectedItem( selectedItem );
        },

        /**
         * Handler for the traverseListOrSelectItem triggered by the selectedTagsView.
         * Triggers the event that is listened by the ddContainerLayoutView.
         * @param {Number} eventCode
         *      A number indicating the eventCode for the key pressed.
         */
        handleTraverseListOrSelectItem: function ( eventCode ) {
            this.trigger( this.eventTriggers.traverseListOrSelectItem, eventCode );
        },

        /**
         * Handler for the textSearch triggered by the selectedTagsView.
         * Triggers the event that is listened by the ddContainerLayoutView.
         * @param {String} searchedText
         *      A string that should be used as a string to search in the item list.
         * @param {Array} selectedItems
         *      An array of selected items to be used by the body view to highlight the new results
         *      which have been returned from the server
         */
        handleTextSearch: function ( searchedText, selectedItems ) {
            this.trigger( this.eventTriggers.textSearch, searchedText, selectedItems );
        },

        /**
         * Handler for the hideOptionsList triggered by the selectedTagsView.
         * Triggers the event that is listened by the ddContainerLayoutView.
         */
        handleHideOptionsList: function () {
            this.trigger( this.eventTriggers.hideOptionsList );
        },

        /**
         * Event handler for the search icon click.
         */
        handleSearchIcoClick: function () {
            this.selectedTagsView.focusInput();
        },

        /**
         * Adds a new item to the selected tags. Gets called by the parent view.
         */
        addNewItem: function () {
            this.selectedTagsView.addNewItem();
        },

        /**
         * Handler for the deselectItem triggered by the selectedTagsView.
         * Triggers the event that is listened by the ddContainerLayoutView.
         * @param {Model} removedModel
         *      A model representing the item that should be deselected.
         */
        removeSelectedItemTag: function ( removedModel ) {
            this.trigger( this.eventTriggers.deselectItem, removedModel );
        },

        /**
         * Handler for the selectItem triggered by the selectedTagsView.
         * Triggers the event that is listened by the ddContainerLayoutView.
         * @param {Model} model
         *      A model representing the item that should be deselected.
         */
        addSelectedItemTag: function ( model ) {
            this.trigger( this.eventTriggers.selectItem, model );
        },


        /**
         * A method which focuses on the input text of the dropdown.
         */
        focusInput: function() {
            this.selectedTagsView.focusInput();
        },

        /**
         * A method to clear the view.
         */
        clearView: function () {
            this.selectedTagsView.clearView();
        },
        /**
         * This method is to call search functionality programmatically.
         * It'll be called from parent view.
         * @param term
         *      A term represents text.
         */
        searchTerm : function( term ) {
            this.selectedTagsView.searchTerm( term );
        },

        handleClearView : function () {
            this.trigger( this.eventTriggers.clearView );
        },

        /**
         * Handler for the handleClearSingleSelect triggered by the selectedTagsView.
         * Triggers the event that is listened by the ddContainerLayoutView.
         */
        handleClearSingleSelect : function () {
            this.trigger( this.eventTriggers.clearSingleSelect );
        },

        /**
         * This method is to disable dropdown programmatically.
         */
        disableView : function () {
            this.undelegateEvents();
            if( this.selectedTagsView ) {
                this.selectedTagsView.disableView();
            }
        },

        /**
         * This method is to enable dropdown programmatically.
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
