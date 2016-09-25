## Dropdown

A dropdown plugin created using Marionette.

##### Initialize the dropdown view
```javascript
var view = new Dropdownview( options );
```

##### Options that can be passed to the Dropdown:
* `placeholder` ; type: `String` ; default: `'Please Select'`
    * String that gets used as a placeholder for the dropdown.
* `multiSelect` ; type: `boolean` ; default: `false`
    * Configuring dropdown as multi-select would let the user select multiple items from the list.
* `searchable` ; type: `boolean` ; default: `false`
    * Configuring dropdown as searchable would let the user search through the items available in the list. User would be able to type in the textbox and the plugin would highlight and filter the results displayed - containing the text that user has typed.
    * If not passed as `true` then the dropdown would act like a normal element ( non - textbox ) and would let the user click on the view to open the list of options.
* `searchTriggerDelay` ; type: `Number` ; default: `600`
    * Number of milliseconds that the delay would be added before the search inside the list of items would be triggered. If the ajax is configured the view will send an ajax request. 
* `showClearIcon` ; type: `boolean` ; default: `false`
    * Shows the clear icon next to the textbox of the dropdown.
    * Useful with `searchable` configured as `true`. 
* `data` ; type: `Array` ; default: `[]`
    * This config is useful if you want to pass a local pre-populated data source to the dropdown plugin.
    * The list of items the should be displayed as dropdown items in the view. The format of the items in the array should be:
```javascript
{ id: '', text: '' rawObject: { } }
```
    * `id` param can be either `String` or `Number` which identifies the item uniquely.
    * `text` param can be either `String` or `Number` that would be displayed to the user.
    * `rawObject` param is an object. It gets returned as a part of selected item whenever we want the selected items of the dropdown through `getSelectedItems()`. The purpose of this object is to pass extra metadata to the items of the dropdown which we might want to use later on while operation on the selected items.
* `ajax` ; type: `Object` ; default: `undefined`
    * This option is useful when the data source of the dropdown is remote and you want the items of the dropdown to be loaded as an when user types the characters.
    * The properties of the `ajax` config are defined below:
* `noDataMessage` ; type: `String` ; default: `No Data Found`
    * A string that would be displayed whenever user searches for an item and that item is not present in the list.
* `allowNew` ; type: `boolean` ; default: `false`
    * If you want to allow the user to type in and add new items - which are not present in the list, pass this options as `true`.
    * If passed as `true` user would get an option to add new items in the list.
* `allowNewText` ; type: `String` ; default: `'Add as New Item'`
    * If `allowNew` is set as `true` this text would be displayed to user an an option in the list, which user can click on to add the new item in.
    * Executes the `beforeNewItemAdd` callback defined under `callbacks` config, and adds the item only if the callback returns `true`.
* `footer` ; type: `Array` ; default: `null`
    * The list of items that should be shown as footer items to the list - like Open Codebook option - in ezCAC working page. 
    * The item in the list should be in the format of the following object:
    ```javascript
    { itemKey: '', html: '', footerClick: function( dropdownViewInstance ) {} }  
    ```
    * `itemKey` should be a `String` or `Number` which uniquely identifies the item.
    * `html` is the `String` that gets rendered in the DOM to display the footer item.
    * `footerClick` is the function that gets invoked whenever the footer item is clicked. The callback gets executed with one parameter - that is the instance of the dropdown view.
* `selectedItems` ; type: `Array` ; default: `null`
    * The list of items that should be selected by default. It should be of same format as `data` passed to the dropdown view. 
* 