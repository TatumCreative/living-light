#!/bin/bash

poemName=$1

browserify                                   \
  poems/$poemName/public.js                  \
  -d -g [uglifyify -x .js]                   \
                                             \
| exorcist                                   \
  poems/$poemName/static/bundle.js.map       \
  > poems/$poemName/static/bundle.js