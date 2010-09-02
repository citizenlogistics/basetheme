test: css js
	open -a WebKit index.html

css: BUILD/base.css

js: BUILD/base.js

BUILD/base.css: BUILD css/*.css
	cat css/*.css > BUILD/base.css

BUILD/base.js: BUILD gcjs/*.js gojs/*.js js/base.js
	cat gojs/*.js gcjs/*.js js/base.js > BUILD/base.js

BUILD:
	mkdir -p BUILD
	(cd BUILD && ln -s ../i)

