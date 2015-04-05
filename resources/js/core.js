var Core = {

    // The source of the data (defaults to DBO).
    source: null,

    // Is there any plugin data loaded?
    loaded: false,

    // The loading spinner.
    spinner: null,

    // URL for our website.
    websiteUrl: '//www.minecraft-plugins.com/',

    // Settings for the core.
    settings: {},

    // Initialize the core.
    init: function () {

        // Set the source based on the default select option.
        this.setSource();

        // Create the spinner.
        this.spinner = new Spinner();

        // Link directly to a plugin, run the search and set the proper values in the search area.
        window.onload = function () {
            var params = Core.parseQueryString();
            if (params.search && params.type) {
                Core.search(params.search, params.type);
                $('#input-search-term').val(params.search);
                $('#input-server-type').val(params.type);
            }
        };

        // Don't allow empty searches.
        $('#search-form').submit(function () {
            var search = $('#input-search-term').val(), type = $('#input-server-type :selected').attr('value');
            if (!search || !type) {
                Core.error('Must not have empty parameters.');
                return false;
            }
        });

        // When the platform type is changed, update the source.
        $('#input-server-type').change(function () {
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
                return decodeURIComponent(s.replace(pl, ' '));
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
        $('#plugin-name').empty();

        // Clear the authors.
        $('#plugin-author').empty();

        // Clear the version.
        $('#plugin-latest-version').empty();

        // Clear the description.
        $('#plugin-description').empty();

        // Clear the website.
        $('#plugin-website').attr('href', '#');

        // Clear the repo page.
        $('#plugin-repo-page').attr('href', '#');

        // Clear the latest download link.
        $('#plugin-latest-download').attr('href', '#');

        // Empty the downloads table.
        $('#download-table > tbody').empty();

    },

    getSearchTerm: function () {
        return $('#input-search-term').val();
    },

    getServerType: function () {
        return $('#input-server-type :selected').val();
    },

    start: function () {

        // Start the spinner.
        Core.spinner.spin(document.getElementById('spinner'));

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
        $('.alert').slice(0).remove();

        // Create the alert and add it to the page.
        $('<div>', {
            class: 'alert alert-danger',
            role: 'alert',
            html: msg + '<a href="#" class="close" data-dismiss="alert">&times;</a>'
        }).appendTo('#error');

    },

    populateData: function (data) {

        Core.source.data = data;

        $('#plugin-name').html(data.plugin_name || '');
        $('#plugin-author').html(data.authors || '');
        $('#plugin-latest-version').html(data.versions[0].version || '');
        $('#plugin-description').html(data.description || '');
        $('#plugin-website').attr('href', data.website || '');
        $('#plugin-repo-page').attr('href', data.dbo_page || '');
        $('#plugin-latest-download').attr('href', data.versions[0].download || '');
        $('#plugin-logo').attr('href', data.logo_full || 'resources/images/default.png');
        $('#plugin-logo img').attr('src', data.logo_full || 'resources/images/default.png');

        for (var i = 0; i < data.versions.length; i++) {

            // Create the changlog button.
            var changelog_button = $('<a>', {
                class: 'btn btn-primary btn-sm btn-block btn-changelog',
                text: 'Changelog'
            });

            // Create the download button
            var download_button = $('<a>', {
                href: data.versions[i].download,
                class: 'btn btn-primary btn-sm btn-block',
                html: '<i class="icon fa fa-download"></i>Download'
            });

            // Create the table entry for the version.
            $('#download-table').find('tbody')
                .append($('<tr id="trr-' + i + '">')
                    .append($('<td>')
                        .text(data.versions[i].version))
                    .append($('<td>')
                        .text(data.versions[i].filename))
                    .append($('<td>')
                        .append(changelog_button))
                    .append($('<td>')
                        .append(download_button))
            );

        }

        // Show the modal when the changelog is clicked.
        $('.btn-changelog').click(function () {
            var index = $(this).closest('td').parent()[0].sectionRowIndex;
            $('#changelog-title').text(Core.source.data.versions[index].version);
            $('#changelog-body').html(atob(Core.source.data.versions[index].changelog));
            $('#changelog-modal').modal('show');
        });

        // Everything was a success.
        Core.success();

    }

};