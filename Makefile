.PHONY: build var node

# repository name
REPO = get-own-property-symbols

# make var files
VAR = src/$(REPO).js

# make node files
NODE = $(VAR)

# default build task
build:
	make var
	make node

# build generic version
var:
	cat template/var.before $(VAR) template/var.after >build/no-copy.$(REPO).max.js
	node node_modules/uglify-js/bin/uglifyjs --verbose build/no-copy.$(REPO).max.js >build/no-copy.$(REPO).js
	cat template/license.before LICENSE.txt template/license.after build/no-copy.$(REPO).max.js >build/$(REPO).max.js
	cat template/copyright build/no-copy.$(REPO).js >build/$(REPO).js
	rm build/no-copy.$(REPO).max.js
	rm build/no-copy.$(REPO).js

# build node.js version
node:
	cat template/license.before LICENSE.txt template/license.after template/node.before $(NODE) template/node.after >build/$(REPO).node.js
	cp src/*.d.ts build/
