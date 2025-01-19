# Heather's personal website

A sandbox for Heather's personal projects.

## Components

Components that are reused between pages can be stored in [src/html/components](src/html/components). Files should end in `.html` and contain a single top-level div in their body. The ID of this `div` should match the basename of the component (e.g. the ID for navbar.html would be `navbar`). If the ID of any element in an HTML file outside of the components directory is set to that same ID, that element will be replaced by the corresponding component at build time.

## Local dev

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

## Make commmands

```bash
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

## Colours

- rgb(57, 20, 116)
- rgb(154, 226, 72)
- rgb(97, 197, 151)
- rgb(112, 47, 218)
- rgb(75, 89, 193)
- rgb(104, 116, 204)
