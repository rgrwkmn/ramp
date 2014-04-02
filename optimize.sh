#!/bin/sh
java -classpath build/rhino/js.jar:build/closure/compiler.jar org.mozilla.javascript.tools.shell.Main build/r.js -o build/buildconfig.js
java -classpath build/rhino/js.jar:build/closure/compiler.jar org.mozilla.javascript.tools.shell.Main build/r.js -o cssIn=css/style.css out=css/style-built.css
