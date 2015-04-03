// TODO: Stop the spinner before the success/error callback?

var Core = {

    // The source of the data (defaults to DBO).
    source: null,

    // Is there any plugin data loaded?
    loaded: false,

    // The loading spinner.
    spinner: null,

    // Settings for the core.
    settings: {
        // Settings go here.
    },

    // Initialize the core.
    init: function () {

        // Set the source based on the default select option.
        this.setSource();

        // Create the spinner.
        this.spinner = new Spinner();

        // Bind events and such here.
        window.onload = function () {
            var params = Core.parseQueryString();
            if (params.search && params.type) {
                Core.search(params.search, params.type);
            }
        };

        // Don't allow empty searches.
        $("#search-form").submit(function () {
            var search = $("#input-plugin-name").val(), type = $("#input-server-type :selected").attr("value");
            if (!search || !type) {
                Core.error("Must not have empty parameters.");
                return false;
            }
        });

        // When the platform type is changed, update the source.
        $("#input-server-type").change(function () {
            this.setSource();
        });

        // Populate the search suggestions.
        this.source.populateSearchSuggestions();

    },

    parseQueryString: function () {

        var match,
            pl = /\+/g,
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) {
                return decodeURIComponent(s.replace(pl, " "));
            },
            query = window.location.search.substring(1);

        var urlParams = {};

        while (match = search.exec(query))
            urlParams[decode(match[1])] = decode(match[2]);

        return urlParams;

    },

    // Set the source of the data.
    setSource: function (src) {

        // The source of the data.
        var source = src || $('#input-server-type :selected').attr('value');

        // Set the appropriate source.
        switch (source) {
            case 'bukkit':
                this.source = DBO;
                break;
            default:
                this.source = null;
        }

        // Return the source.
        return this.source;

    },

    search: function (search, type) {

        // Do the pre-search steps.
        this.start();

        // Run the search.
        this.source.search(search, type);

    },

    clearData: function () {

        // Clear the name.
        $("#plugin-name").empty();

        // Clear the authors.
        $("#plugin-author").empty();

        // Clear the version.
        $("#plugin-latest-version").empty();

        // Clear the description.
        $("#plugin-description").empty();

        // Clear the website.
        $("#plugin-website").attr("href", "#");

        $("#plugin-repo-page").attr("href", "#");

        // Clear the latest download link.
        $("#plugin-latest-download").attr("href", "#");

        // Empty the downloads table.
        $("#download-table > tbody").empty();

    },

    start: function() {

        // Start the spinner.
        Core.spinner.spin(document.getElementById("spinner"));

    },

    // Successfully loaded plugin information.
    success: function () {

        // Data was loaded.
        this.loaded = true;

        // Stop the spinner.
        this.spinner.stop();

        // Fade in the plugin details.
        $('.plugin-details').fadeIn('slow');

    },

    // Error getting plugin information.
    error: function (msg) {

        // No data was loaded.
        this.loaded = false;

        // Stop the spinner.
        this.spinner.stop();

        // Need this?
        // $('.plugin-details').fadeOut('fast');

        // Need this?
        $('.alert').slice(0).remove();

        // Create the alert and add it to the page.
        $('<div>', {
            class: 'alert alert-danger',
            role: 'alert',
            html: msg + '<a href="#" class="close" data-dismiss="alert">&times;</a>'
        }).appendTo("#error");

    }

};