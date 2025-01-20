# Heather's personal website

A sandbox for Heather's personal projects.

# Development

## Local dev / deployment

Run `make local` to start the nginx server with built files mounted. The website will be accessible at localhost.

Since components are injected during build, we can't directly mount the src directory to the local image; instead, the `make local` step first runs `make build` to build the HTML files, and the `build` directory is mounted. To have fresh changes reflected at localhost, you must therefore run `make build` again to get changes pulled in to the `build` directory (you can run this in another terminal while the local image is running).

To have the build happen automatically on save rather than needing to run it in the terminal every time you make changes, it's recommended to install the "Run on Save" vscode extension, with the following profile:

```json
    "emeraldwalk.runonsave": {
        "commands": [
            {
                // Run whenever any file in the website repo
                "match": "website/.*",
                "cmd": "make build"
            }
        ]
    }
```

### Make commmands

```makefile
# Remove the build directory
make clean

# Rebuild files in the build directory
make build

# Build the docker image; wil be tagged to the latest git short hash
make docker-build

# Build and run the website locally
# Runs `build` and `docker-build` first
make local

# Push the image to the container registry
# Runs `docker-build` first
make docker-push
```

## Components

Components that are reused between pages can be stored in [src/html/components](src/html/components). Files should end in `.html` and contain a single top-level div in their body. 

To use a component, set the ID of a div in an HTML file outside of the components directory to the basename of the component file (e.g. `src/html/components/navbar.html` would be selected by `id="navbar"`); that element will be replaced by the corresponding component at build time.

## Adding a page / route

1. Create the page somewhere in src/; must end in `.html`
2. Add a link to the page in [the navbar](src/html/components/navbar.html). The href value will be what shows up in the navbar, and should start with a `/`. This is the `<href_value>`  used in step 3.
3. Add a route to the page you set in the navbar in [the nginx conf file](ehatherward.dev.conf) in the format:

```ini
    location <href_value> {
        rewrite ^<href_value>$ <path_to_html_file> break;
    }
```

Where:

- `<href_value>` is the path you set the href to in the navbar; for example, `/projects`
- `<path_to_html_file>` is the path to the HTML file to be loaded at that page, relative to the nginx root; for `src/html/pages/projects.html` for example this would be `/html/pages/projects.html`

## Scripts

Anything ending in `.js` will be automatitically added to all HTML pages (outside of the components directory). To instead specifically target a script to a subset of files, add the following comment at the top of the file:

```js
// targets index.html books.html
```

The relative path is not needed, only the HTML file basename will be checked.

## Colours

- rgb(57, 20, 116)
- rgb(154, 226, 72)
- rgb(97, 197, 151)
- rgb(112, 47, 218)
- rgb(75, 89, 193)
- rgb(104, 116, 204)
