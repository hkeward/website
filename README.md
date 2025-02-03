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

## Icons

To use an icon:

1. Create an SVG file in [src/assets/icons](src/assets/icons) named `{icon_name}.svg`.
2. Add an svg tag in your HTML and select the icon you want by setting the class to `icon-{icon_name}`:

```html
<svg class="icon-swords"></svg>
```

The svg's contents will be inserted during build.

Some things to note:

- The classes of the element to be replaced will be preserved
- If the `icon` class does not exist on the element, it will be added
- Other attributes of the element will _not_ be preserved when the icon's content replaces it

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
- rgb(250, 197, 52)

# Tarot cards

Tarot cards are handled specially, since there are so many of them and I didn't want to repeat the same styling 100 times. They are part component, part fake-jinja-template.

-  The card data (text, card name, description, keywords, img url etc.) is stored in [src/data/tarot.json](src/data/tarot.json)
- The component that is used for each card's template is located at [src/html/components/tarot-card.html](src/html/components/tarot-card.html). This component file contains templating that looks like `{{ var_name }}`. The `var_name` in the template should match a field in the `tarot.json` data file.

An individual card's description can be selected like other components by setting the `id` of a component to `tarot-card`. The _class_ of that element should be set to _the name of the tarot card whose data you want to insert_, and the key there corresponds to a key in the `tarot.json` data ile.

For example, to select The Magician, insert this element into a page:

```html
<div id="tarot-card" class="the-magician"></div>
```

The data from `the-magician` in `tarot.json` will be injected into the `tarot-card.html` component, and that component will be added in place of that div. The ID will be set to the class (so you won't end up with many divs with the same ID in the final built HTML -- unless you select the same card several times).

## Steps to add a tarot card to your page

1. Define the card's data in [src/data/tarot.json](src/data/tarot.json). The structure should look like this:

```json
// The card's key will be used to select this card by setting it to the class
"the-magician": {
    "card_name": "This is a pretty version of the name, e.g. The Magician",
    "suit": "",
    "elements": [], // these will be added as icons
    "img": "/assets/images/tarot/...",
    "keywords": [],
    "keywords_reversed": [],
    "description": "",
    "description_reversed": ""
  }
```

2. Add a div with id=`tarot-card` and the `card-name` as the class to an HTML file where you want this component to be displayed.

```html
<div id="tarot-card" class="the-magician"></div>
```

## Tarot card images

The tarot card images found [here](src/assets/images/tarot) are from the 1909 edition of the Rider-Waite-Smith tarot, illustrated by the fantastic Pamela Colman Smith ("Pam A" version of the cards).
