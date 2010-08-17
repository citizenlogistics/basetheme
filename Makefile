test: css
	open -a WebKit index.html

css: BUILD
	cat css/*.css > BUILD/base.css

js: BUILD
	cat gojs/go.js > BUILD/base.js

BUILD:
	mkdir -p BUILD
	(cd BUILD && ln -s ../i)

