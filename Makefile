default: html css js

test: css js
	open -a WebKit index.html

css: BUILD/base.css

js: BUILD/base.js BUILD/super.js

html: BUILD/basetool.html

BUILD/base.css: BUILD css/*.css
	cat css/*.css > BUILD/base.css

BUILD/base.js: BUILD ../gojs/go.js js/*.js
	cat ../gojs/go.js js/*.js > BUILD/base.js

BUILD/super.js: BUILD ../gojs/*.js gcjs/*.js js/base.js
	cat ../gojs/*.js gcjs/*.js js/*.js > BUILD/super.js

BUILD/basetool.html: BUILD tools/*.html tools
	cat tools/*.html > BUILD/basetool.html

BUILD:
	mkdir -p BUILD
	(cd BUILD && ln -s ../i)

