#!/bin/bash

# Build all packages
yarn build

# Copy the packages we want to publish with desired url name
cp -R packages/name-service/build gh-pages-config/names
cp -R packages/wallet/build gh-pages-config/wallet
cp -R packages/cw20-wallet/build gh-pages-config/cw20-wallet