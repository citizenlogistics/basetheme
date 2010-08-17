test: css
	open -a WebKit index.html

css: BUILD
	cat css/*.css > BUILD/base.css

BUILD:
	mkdir -p BUILD
	(cd BUILD && ln -s ../i)

