#!/usr/bin/env bash
# Dev helper: start server with nodemon
# Usage: ./scripts/start.sh

export NODE_ENV=${NODE_ENV:-development}
nodemon src/server.js



