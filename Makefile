test: css js
	open -a WebKit index.html

css: BUILD/base.css

js: BUILD/base.js BUILD/super.js

BUILD/base.css: BUILD css/*.css
	cat css/*.css > BUILD/base.css

BUILD/base.js: BUILD ../gojs/go.js js/base.js
	cat ../gojs/go.js js/base.js > BUILD/base.js

BUILD/super.js: BUILD ../gojs/*.js js/base.js
	cat ../gojs/*.js gcjs/*.js js/*.js > BUILD/super.js

BUILD:
	mkdir -p BUILD
	(cd BUILD && ln -s ../i)

