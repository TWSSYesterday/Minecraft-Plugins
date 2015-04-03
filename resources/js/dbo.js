var DBO = {

    // The current plugin data formatted as a 'details' object - see documentation.
    data: null,

    // Settings for DBO.
    settings: {

        // The base URL of the BukGet API.
        baseUrl: "http://api.bukget.org/3/"

    },

    // Initialize the source.
    init: function () {
        console.log("dbo_init");
    },
    
    search: function (search, type) {
        this.getPluginSlug(search, type, this.getPluginData);
    },

    getPluginSlug: function (name, type, callback) {

        var url = this.baseUrl + "search/plugin_name/like/" + name + "?fields=slug,plugin_name";

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

                    if (typeof data[0] === "undefined") {
                        Core.error("Plugin does not exist.");
                    } else {
                        callback(slug, type, MinecraftPlugins.populateData);
                    }

                }

                // Invalid plugin.
                if (xhr.status === 404)
                    Core.error("Plugin does not exist.");

            }

        };

        console.log(url);

        xhr.open("GET", url, true);
        xhr.send();

    },

    getPluginData: function (slug, type, callback) {

        var url = this.baseUrl + "plugins/" + type + "/" + slug;

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

        xhr.open("GET", url, true);
        xhr.send();

    },

    populateSearchSuggestions: function () {

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                $("#input-plugin-name").autocomplete({
                    lookup: data.suggestions,
                    lookupLimit: 20,
                    autoSelectFirst: true
                });
            }
        };

        xhr.open("GET", "bukkit-plugins.json", true);
        xhr.send();

    }

};