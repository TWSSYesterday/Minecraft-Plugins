var DBO = {

    // The current plugin data formatted as a 'details' object - see documentation.
    data: null,

    // Base URL for the BukGet API.
    baseUrl: "//api.bukget.org/3/",

    // Settings for DBO.
    settings: {},

    // Initialize the source.
    init: function () {
        console.log("dbo_init");
    },
    
    search: function (search, type) {
        this.getPluginSlug(search, type, this.getPluginData);
    },

    getPluginSlug: function (name, type, callback) {

        var url = DBO.baseUrl + "search/plugin_name/like/" + name + "?fields=slug,plugin_name";

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {

            if (xhr.readyState === 4) {

                // Valid plugin.
                if (xhr.status === 200) {

                    var data = JSON.parse(xhr.responseText);

                    var slug = null;

                    // Match plugin names based on similar plugins, workaround for lack of case insensitive search.
                    for (var i in data) {
                        if (data[i].plugin_name.toLowerCase() === name.toLowerCase()) {
                            slug = data[i].slug;
                        }
                    }

                    if (!data[0]) {
                        Core.error("Plugin does not exist.");
                    } else {
                        callback(slug, type, Core.populateData);
                    }

                }

                // Invalid plugin.
                if (xhr.status === 404)
                    Core.error("Plugin does not exist.");

            }

        };

        xhr.onerror = function () {
            Core.error("Error searching for plugin.");
        };

        xhr.open("GET", url, true);
        xhr.send();

    },

    getPluginData: function (slug, type, callback) {

        var url = DBO.baseUrl + "plugins/" + type + "/" + slug;

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {

            if (xhr.readyState === 4) {

                // Valid plugin.
                if (xhr.status === 200)
                    callback(JSON.parse(xhr.responseText));

                // Invalid plugin.
                if (xhr.status === 404)
                    Core.error("Could not load plugin data.");

            }

        };

        xhr.onerror = function () {
            Core.error("Error searching for plugin.");
        };

        xhr.open("GET", url, true);
        xhr.send();

    },

    populateSearchSuggestions: function () {

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                $("#input-search-term").autocomplete({
                    lookup: data.suggestions,
                    lookupLimit: 20
                });
            }
        };

        xhr.open("GET", Core.websiteUrl + "bukkit-plugins.json", true);
        xhr.send();

    }

};