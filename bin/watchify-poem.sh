#!/bin/bash

poemName=$1

watchify poems/$poemName/public.js -o poems/$poemName/static/bundle.js -v -d