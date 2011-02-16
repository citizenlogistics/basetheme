default: html css js

test: css js
	open -a WebKit index.html

css: BUILD/base.css

js: BUILD/base.js BUILD/super.js

html: BUILD/basetool.html

BUILD/base.css: BUILD css/*.css
	cat css/*.css > BUILD/base.css

BUILD/base.js: BUILD ../gojs/go.js js/site/*.js
	cat ../gojs/go.js js/site/*.js > BUILD/base.js

BUILD/super.js: BUILD js/gcjs/*.js
	cat js/foundation/*.js js/gcjs/*.js > BUILD/super.js

BUILD/basetool.html: BUILD tools/*.html tools
	cat tools/*.html > BUILD/basetool.html

BUILD:
	mkdir -p BUILD
	(cd BUILD && ln -s ../i)

