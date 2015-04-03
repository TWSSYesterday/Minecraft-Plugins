var MinecraftPlugins = {

    // Status for data.
    loaded: false,

    // Data for the current plugin.
    data: null,

    // Default server type.
    default_server_type: "bukkit",

    website_base: "https://www.minecraft-plugins.com/",

    init: function () {

        MinecraftPlugins.bukget_base_url = "https://api.bukget.org/3/";
        MinecraftPlugins.spinner = new Spinner();

        // Populate searcg suggestions from our cached (and formatted) copy of the BukGet plugin list.
        MinecraftPlugins.populateSearchSuggestions(MinecraftPlugins.getServerType());

        // If passed some args, search based on those.
        window.onload = function () {
            var plugin_name = MinecraftPlugins.getParameterByName("plugin_name");
            var server_type = MinecraftPlugins.getParameterByName("server_type") || MinecraftPlugins.default_server_type;
            if (plugin_name) {
                $("#input-plugin-name").val(plugin_name);
                $("#input-server-type").val(server_type);
                MinecraftPlugins.search(plugin_name, server_type);
            }
        };

        $("#search-form").submit(function () {
            var name = $("#input-plugin-name").val();
            if (name === undefined || name === "") {
                MinecraftPlugins.loadError("Plugin must not be empty.");
                return false;
            }
        });

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

    getPluginData: function (slug, type, callback) {

        var url = MinecraftPlugins.bukget_base_url + "plugins/" + type + "/" + slug;

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {

            if (xhr.readyState === 4) {

                // Valid plugin.
                if (xhr.status === 200)
                    callback(JSON.parse(xhr.responseText));

                // Invalid plugin.
                if (xhr.status === 404)
                    MinecraftPlugins.loadError("Could not load plugin data.");

            }

        };

        xhr.open("GET", url, true);
        xhr.send();

    },

    getPluginSlug: function (name, type, callback) {

        var url = MinecraftPlugins.bukget_base_url + "search/plugin_name/like/" + name + "?fields=slug,plugin_name";

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {

            if (xhr.readyState === 4) {

                // Valid plugin.
                if (xhr.status === 200) {

                    var data = JSON.parse(xhr.responseText);

                    var slug = null;

                    // Match plugin names based on similar plugins, workaround for lack of case insensitive search.
                    for (var i in data) {
                        if (data[i].plugin_name.toLowerCase() === MinecraftPlugins.getPluginName().toLowerCase()) {
                            slug = data[i].slug;
                        }
                    }

                    if (typeof data[0] === "undefined") {
                        MinecraftPlugins.loadError("Plugin does not exist.");
                    } else {
                        callback(slug, type, MinecraftPlugins.populateData);
                    }

                }

                // Invalid plugin.
                if (xhr.status === 404)
                    MinecraftPlugins.loadError("Plugin does not exist.");

            }

        };

        xhr.open("GET", url, true);
        xhr.send();

    },

    getParameterByName: function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },

    getPluginName: function () {
        return $("#input-plugin-name").val();
    },

    getServerType: function () {
        return $("#input-server-type :selected").val();
    },

    populateData: function (data) {

        MinecraftPlugins.data = data;

        $("#plugin-name").html(data.plugin_name || "");
        $("#plugin-author").html(data.authors || "");
        $("#plugin-latest-version").html(data.versions[0].version || "");
        $("#plugin-description").html(data.description || "");
        $("#plugin-website").attr("href", data.website || "");
        $("#plugin-repo-page").attr("href", data.dbo_page || "");
        $("#plugin-latest-download").attr("href", data.versions[0].download || "");
        $("#plugin-logo").attr("href", data.logo_full || "resources/images/default.jpg");
        $("#plugin-logo img").attr("src", data.logo_full || "resources/images/default.jpg");

        for (var i = 0; i < data.versions.length; i++) {

            // Create the changlog button.
            var changelog_button = $("<a>", {
                class: "btn btn-primary btn-sm btn-block btn-changelog",
                text: "Changelog"
            });

            // Create the download button
            var download_button = $("<a>", {
                href: data.versions[i].download,
                class: "btn btn-primary btn-sm btn-block",
                html: "<i class='icon fa fa-download'></i>Download"
            });

            // Create the table entry for the version.
            $("#download-table").find("tbody")
                .append($("<tr id='trr-" + i + "'>")
                    .append($("<td>")
                        .text(data.versions[i].version))
                    .append($("<td>")
                        .text(data.versions[i].filename))
                    .append($("<td>")
                        .append(changelog_button))
                    .append($("<td>")
                        .append(download_button))
            );

        }

        // Show the modal when the changelog is clicked.
        $(".btn-changelog").click(function () {
            var index = $(this).closest('td').parent()[0].sectionRowIndex;
            $("#changelog-title").text(MinecraftPlugins.data.versions[index].version);
            $("#changelog-body").html(atob(MinecraftPlugins.data.versions[index].changelog));
            $("#changelog-modal").modal("show");
        });

        // Everything was a success.
        MinecraftPlugins.loadSuccess();

    },

    populateSearchSuggestions: function (server_type) {

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                $("#input-plugin-name").autocomplete({
                    lookup: data.suggestions,
                    autoSelectFirst: true,
                    deferRequestBy: 100
                });
            }
        };

        xhr.open("GET", MinecraftPlugins.website_base + server_type + "-plugins.json", true);
        xhr.send();

    },

    search: function (name, type) {

        // Start the loading.
        MinecraftPlugins.startLoading();

        var plugin_name = name || MinecraftPlugins.getPluginName();
        var server_type = type || MinecraftPlugins.getServerType().toLowerCase();

        if (plugin_name === undefined || plugin_name === "") {
            MinecraftPlugins.loadError("Plugin must not be empty.");
        } else if (server_type === undefined || server_type === "") {
            MinecraftPlugins.loadError("Server Type must not be empty.");
        } else {
            MinecraftPlugins.getPluginSlug(plugin_name, server_type, MinecraftPlugins.getPluginData);
        }

    },

    startLoading: function () {

        // Remove any old alerts.
        $(".alert").slice(0).remove();

        // If we have previously loaded data: fade out the details, clear the info, and set the old data to null..
        if (MinecraftPlugins.loaded) {
            $(".plugin-details").fadeOut("fast");
            MinecraftPlugins.clearData();
            MinecraftPlugins.data = null;
        }

        MinecraftPlugins.spinner.spin(document.getElementById("spinner"));

    },

    loadSuccess: function () {

        // Set that status to loaded.
        MinecraftPlugins.loaded = true;

        // Stop the spinner.
        MinecraftPlugins.spinner.stop();

        // Fade in the details.
        $(".plugin-details").fadeIn("fast");

    },

    loadError: function (msg) {

        // Set that status to false.
        MinecraftPlugins.loaded = false;

        // Stop the spinner.
        MinecraftPlugins.spinner.stop();

        // Fade out the plugin details, if present.
        $(".plugin-details").fadeOut("fast");

        // Create the alert HTML.
        var alert = $("<div>", {
            class: "alert alert-danger",
            role: "alert",
            html: "<a href='#' class='close' data-dismiss='alert'>&times;</a>" + msg
        });

        // Remove the previous alert, if any.
        $(".alert").slice(0).remove();

        // Display the alert.
        $("#error").append(alert);

    }

};