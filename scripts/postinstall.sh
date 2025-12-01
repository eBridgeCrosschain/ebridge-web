#!/bin/bash

set -e

husky install
echo "husky install success"

node scripts/fix-web-login.js
echo "fix fix-web-login success"

