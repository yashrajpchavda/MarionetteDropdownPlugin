/**
 * Created by Yashraj.C on 12/4/2015.
 */

define( [
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'modules/dropdown2/views/selectedTagItemView',
    'tpl!modules/dropdown2/templates/selectedTagComp.tmpl',
    'modules/dropdown2/collections/selectedTags'
], function ( $, _, Backbone, Marionette, SelectedTagsItemView, selectedTagCompTemplate, SelectedTagsCollection ) {

    return Marionette.CompositeView.extend( {

        childView : SelectedTagsItemView,

        template : selectedTagCompTemplate,

        childViewContainer : '.tagsC',

        className : 'tagList',

        constants : {
            withClear : "withClear",
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

        templateHelpers : function () {
            return {
                config : this.config
            }
        },

        ui : {
            inputText        : '.ddInput',
            clearButton      : '.ddClear',
            listToggleButton : '.ddListToggle'
        },

        events : {
            'click @ui.listToggleButton' : 'handleListToggleClick',
            'click @ui.inputText'        : 'handleInputClick',
            'keyup @ui.inputText'        : 'handleInputKeyUp',
            'click @ui.clearButton'      : 'handleClearIconClick',
            'focus @ui.inputText'        : '_handleInputFocus'
        },

        childEvents : {
            'removeTag' : 'handleRemoveTag'
        },

        initialize : function ( options ) {

            this.config = {};

            _.extend( this.config, options.config );

            this.eventTriggers = options.eventTriggers;

            this.collection = new SelectedTagsCollection();

            if ( this.config.multiSelect && this.config.selectedItems && this.config.selectedItems.length > 0 ) {
                // handle multi select dropdown
                this._addTags( this.config.selectedItems );
            }

        },

        onRender : function () {

            // set the selected item if specified in the config
            if ( this.config.selectedItems && this.config.selectedItems.length > 0 ) {

                // handle single select dropdown
                if ( !this.config.multiSelect ) {
                    var selectedItemModel = new Backbone.Model( this.config.selectedItems[ 0 ] );
                    // update the raw object if it's not specified for the selected item and if the data source is local
                    if ( !selectedItemModel.get( 'rawObject' ) && this.config.data ) {
                        var itemInLocalList = _.findWhere( this.config.data, { id : this.config.selectedItems[ 0 ].id } );
                        if ( itemInLocalList ) {
                            selectedItemModel.set( 'rawObject', itemInLocalList.rawObject );
                        }
                    }
                    this.updateSelectedItem( selectedItemModel );
                    this.trigger( this.eventTriggers.selectItem, selectedItemModel );
                } else {
                    // TODO: Needs to be implemented for multiSelect as well
                }

            }

            // show the clear icon if specified in config
            if ( this.config.showClearIcon ) {
                this.$el.addClass( this.constants.withClear );
                this.ui.clearButton.show();
            }

        },

        /**
         * Click event handler for the list toggle button click.
         * Triggers the event that is listened by the parent view - ddHeaderLayoutView.
         */
        handleListToggleClick : function () {
            this.trigger( this.eventTriggers.toggleOptionsList, true );
        },

        /**
         * Click event handler for the input box present in the view.
         * Triggers the event that is listened by the parent view - ddHeaderLayoutView.
         * @param {Object} event
         *      Event object for event.
         */
        handleInputClick : function ( event ) {
            this.trigger( this.eventTriggers.toggleOptionsList );
            //event.stopPropagation();
        },

        /**
         * Key up event handler for the input box present in the view.
         * Checks the key that was pressed and triggers the respective event based on the key
         * pressed.
         * @param {Object} event
         *      Event object for the event.
         */
        handleInputKeyUp : function ( event ) {

            var $target = $( event.target ),
                eventCode = event.which;

            // if the key pressed is either up or down arrow, highlight the item in the list
            if ( eventCode === this.constants.keyCode.UP || eventCode === this.constants.keyCode.DOWN ||
                eventCode === this.constants.keyCode.ENTER ) {
                this.trigger( this.eventTriggers.traverseListOrSelectItem, eventCode );
            } else if ( eventCode === this.constants.keyCode.ESCAPE ) {
                this.trigger( this.eventTriggers.hideOptionsList );
            } else if ( ( this.config.searchable || this.config.multiSelect ) &&
                this.isSearchTriggerKey( event ) ) {

                // deselect the selected item if it's single select
                if ( !this.config.multiSelect ) {
                    this.updateSelectedItem( undefined );
                }

                this.trigger( this.eventTriggers.textSearch, $.trim( $target.val() ), this.getSelectedItems() );
                if ( this.config.callbacks && typeof this.config.callbacks.onKeyUp === 'function' ) {
                    this.config.callbacks.onKeyUp.call( null, $.trim( $target.val() ) );
                }
            }

        },

        isSearchTriggerKey : function ( eventObject ) {

            var eventCode = eventObject.which,
                isNumberKey = ( eventCode >= 48 && eventCode <= 57 ) || ( eventCode >= 96 && eventCode <= 105 ),
                isAlphabetKey = ( eventCode >= 65 && eventCode <= 90 ),
                isUtilityKey = ( eventCode == 8 || eventCode == 46 ),
                isCtrlKey = eventObject.ctrlKey,
                isAltKey = eventObject.altKey,
                isPasteEvent = isCtrlKey && ( eventCode === 86 );

            var isAlphabetWithoutCtrlOrAltKey = ( !isAlphabetKey || ( isAlphabetKey && !( isCtrlKey || isAltKey ) ) );

            /**
             * True
             *      if any of the number, alphabet or utility key is pressed
             *      if paste event is detected: ctrl + v key ( 86 )
             *
             * False
             *      if ctrl or alt is pressed with any of the alphabet keys
             */
            return isPasteEvent || ( ( isNumberKey || isAlphabetKey || isUtilityKey ) && isAlphabetWithoutCtrlOrAltKey );
        },

        /**
         * Updates selected item for the view.
         * If view is single select, updates the text box's value as the selected value, else
         * adds the selected item to the selected tags view.
         * @param {Backbone.Model} selectedItem
         *      A model representing the item that needs to be selected.
         */
        updateSelectedItem : function ( selectedItem ) {

            if ( selectedItem ) {
                if ( this.config.multiSelect === false ) {
                    this.selectedItem = selectedItem.clone();
                    this._setInputValue( selectedItem.get( 'text' ) );
                } else {
                    if ( selectedItem.get( 'selected' ) === true ) {
                        this._addTags( [ selectedItem.toJSON() ] );

                        // trigger this to clear out the searched text after the item has been added
                        this.ui.inputText.val( '' );
                        this.trigger( this.eventTriggers.textSearch, $.trim( this.ui.inputText.val() ), this.getSelectedItems() );

                    } else {
                        this.removeTag( selectedItem );
                    }
                    this.ui.inputText.focus();

                }
            } else {
                delete this.selectedItem;
            }

        },

        /**
         * Removes the item from the selected tags.
         * Finds the item that was passed from the collection and removes it from the collections.
         * View gets updated eventually.
         * @param {Backbone.Model} modelToRemove
         *      A model that needs to be removed from the view.
         */
        removeTag : function ( modelToRemove ) {

            var model = this.collection.findWhere( {
                id   : modelToRemove.get( 'id' ),
                text : modelToRemove.get( 'text' )
            } );

            if ( model ) {
                this.collection.remove( model );
            }

        },

        /**
         * Gets called whenever user wants to add an item that is not present in the list.
         * Invokes the beforeNewItemAdd handler if specified and adds only if the callback returns true.
         */
        addNewItem : function () {

            var validateInput = false,
                inputText = $.trim( this.ui.inputText.val() );

            // invoke the before callback if it's present
            if ( this.config.callbacks && this.config.callbacks.beforeNewItemAdd ) {

                validateInput = this.config.callbacks.beforeNewItemAdd.call( window, inputText );

                if ( validateInput ) {
                    this._addItemToCollection( inputText );
                } else {
                    this.ui.inputText.focus();
                }

            } else {
                this._addItemToCollection( inputText );
            }

        },

        /**
         * Adds the new item to the selected tags list.
         * @param {String} inputText
         *      A string indicating the item that should be added to the list.
         * @private
         */
        _addItemToCollection : function ( inputText ) {
            this.collection.addItemToCollection( inputText );
            this.ui.inputText.val( '' ).focus();
            this.trigger( this.eventTriggers.textSearch, '', this.getSelectedItems() );
            this.trigger( this.eventTriggers.hideOptionsList );
        },

        /**
         * Handles the removeTag event that gets triggered by the child view.
         * Triggers the event to deselect the item in the list of items.
         * @param {View} itemView
         *      A view that triggered the removeTag event.
         */
        handleRemoveTag : function ( itemView ) {
            this.collection.remove( itemView.model );
            this.ui.inputText.focus();
            this.trigger( this.eventTriggers.deselectItem, itemView.model );
        },

        /**
         * Returns the selected items in the view.
         * @returns {Array}
         *      An array of the items that are selected.
         */
        getSelectedItems : function () {

            var items;

            if ( this.config.multiSelect === false ) {

                items = [];

                if ( this.selectedItem ) {
                    items.push( {
                        id        : this.selectedItem.get( 'id' ),
                        text      : this.selectedItem.get( 'text' ),
                        rawObject : this.selectedItem.get( 'rawObject' )
                    } );
                }

                return items;

            } else {
                return this.collection.getSerializedItems();
            }
        },

        /**
         * Updates the selected items based on the items list provided.
         * @param {Array} items
         *      An array of items that should be set as selected.
         */
        setSelectedItems : function ( items ) {

            var selectedItemModel,
                that = this;

            this.clearView();

            // for single select
            if ( !this.config.multiSelect ) {
                selectedItemModel = new Backbone.Model( items[ 0 ] );
                this.updateSelectedItem( selectedItemModel );
            } else {

                _.each( items, function ( item ) {

                    selectedItemModel = new Backbone.Model( item );
                    selectedItemModel.set( 'selected', true );
                    that.trigger( that.eventTriggers.selectItem, selectedItemModel );
                    that.updateSelectedItem( selectedItemModel );

                } );

            }

        },

        /**
         * Handles the clear icon click for the input box.
         * Clears the input value and resets the selected item config
         * if the dropdown is single select.
         * @param event
         */
        handleClearIconClick : function ( event ) {

            if ( this.config.showClearIcon ) {

                this.ui.inputText.val( '' );

                // deselect the selected item if it's single select
                if ( !this.config.multiSelect ) {
                    this.trigger( this.eventTriggers.clearView );
                    this.trigger( this.eventTriggers.clearSingleSelect );
                    this.trigger( this.eventTriggers.textSearch, this.ui.inputText.val().trim(), this.getSelectedItems() );
                }

            }

        },

        /**
         * A focus event handler for the input box of the dropdown.
         * Checks the dropdown's config and selects the entire text of the input if needed.
         * @param {Object} event
         *      Event object of the event.
         * @private
         */
        _handleInputFocus : function ( event ) {
            // select the text only if the dropdown is single select and searchable
            if ( this.config && this.config.searchable && !this.config.multiSelect ) {
                this.ui.inputText.select();
            }
        },

        /**
         * A function that returns the text that has been entered in the
         * input box of the dropdown while searching.
         */
        getEnteredText : function () {
            return this.ui.inputText.val();
        },

        /**
         * A method which focuses on the input text of the dropdown.
         * Added a set timeout as the item may not have been rendered in the dom whenever
         * focus is immediately called after the render of dropdown.
         */
        focusInput : function () {
            var that = this;
            // added settimeout as just focus didn't work
            setTimeout( function () {
                that._focusInput();
            }, 500 );
        },

        /**
         * Sets the value for the input control.
         * @param {String} text
         *      A value that should be set for the input.
         * @private
         */
        _setInputValue : function ( text ) {
            this.ui.inputText.val( text );
        },

        /**
         * Adds the items to the collection.
         * @param {Array} items
         *      An array of the items that should be added in the collection.
         * @private
         */
        _addTags : function ( items ) {
            this.collection.add( items );
        },

        /**
         * Focuses the input control.
         * @private
         */
        _focusInput : function () {
            if ( this.ui.inputText && this.ui.inputText.length > 0 ) {
                !this.isDestroyed && this.ui.inputText.focus();
            }
        },

        /**
         * Clears the input text's value.
         * Clears the selected items collection to remove all the selected items.
         */
        clearView : function () {
            this.ui.inputText.val( '' );
            this.collection.reset();
            delete this.selectedItem;
        },

        /**
         * This method is to call search functionality programmatically.
         * It'll be called from parent view.
         * @param term
         *      A term represents text.
         */
        searchTerm : function ( text ) {
            if ( text.trim().length > 0 ) {
                this.ui.inputText.val( text );

                if ( ( this.config.searchable || this.config.multiSelect ) ) {

                    // deselect the selected item if it's single select
                    if ( !this.config.multiSelect ) {
                        this.updateSelectedItem( undefined );
                    }

                    this.trigger( this.eventTriggers.textSearch, text.trim(), this.getSelectedItems() );

                    this.focusInput();
                }
            }
        },

        /**
         * This method is to disable dropdown programmatically.
         */
        disableView : function () {
            this.ui.inputText.attr( "disabled", "disabled" );
            this.undelegateEvents();
            this.children.each( function ( view ) {
                view.disableView();
            } );
        },

        /**
         * This method is to enable dropdown programmatically.
         */
        enableView : function () {
            this.ui.inputText.removeAttr( "disabled" );
            this.delegateEvents();
            this.children.each( function ( view ) {
                view.enableView();
            } );
        }


    } );

} );
