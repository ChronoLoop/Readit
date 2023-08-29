#!/bin/bash

PACKAGES=(
    "github.com/sqlc-dev/sqlc/cmd/sqlc@v1.20.0"
)

# Loop through the packages and install them
for package in "${PACKAGES[@]}"; do
    go install "$package"
    if [ $? -eq 0 ]; then
        echo "Package '$package' installed successfully."
    else
        echo "Failed to install package '$package'."
    fi
done
