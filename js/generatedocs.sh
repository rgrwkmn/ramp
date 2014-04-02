#!/bin/sh
#Generates documentation from the js directory using code comments and jsdoc-toolkit

#docs are part of version control now so they can't be removed like this without craziness
rm -rf ./docs
cd jsdoc-toolkit
java -jar jsrun.jar app/run.js -E=".*built.*" -p -a -t=templates/jsdoc -d=../docs ../ ../modules
#svn add --force ../docs
