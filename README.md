```
Structure
	admin/
		Promo Administration code that has it's own css, images and js although it leverages the js
		framework js/adf.js
	app/
		Index for the full page version of the FB app for logged in users.
	pagetab/
		Page tab version of the FB app.
	includes/
		Include files for footers, headers, and individual page components.
	images/
	css/
	js/
		See js/README.txt for more info
		From the JS optimizer (optimize.sh)
			URL Helpers
			To ease in development, there are two URL helpers you can use to force loading the pre-build
			scripts or the combined and non-minified scripts: dev-prebuild and dev-fullsrc respectively.
			By default, the minified script (js/script-built.min.js) is used. Just add either of those to
			the URL however you can.

			Examples
				http://socialflyer.url/pagetab?dev-fullsrc
				http://socialflyer.url/app#dev-prebuild

			RequireJS can react differently in different contexts, so if you require anything in your
			modules or plugins make sure to check that it works in prebuild, fullsrc and minified modes.

			Why so many versions?
				dev-prebuild is for development, no need to run the optimize script
				dev-fullsrc is for debugging problems encountered in the fully optimized script

	channel.html - Required by the FB JS SDK
	.htaccess - Adds Apache SSI support for multiple file extensions
	optimize.sh - CSS/JS Optimize script

Setup
	In order to run this code on your machine, create a virtual host and point it to the directory
	containing this README file. You will need Apache SSI capabilities which should be enabled by the
	.htaccess file in this directory.

	The different pages you can view:
		http://your-virtual-host.com/pagetab/index.html
			The public landing page with an animated teaser. After about 5 seconds the teaser will
			collapse to reveal a feature tile.

		http://your-virtual-host.com/pagetab/all-tiles.html
			No animated teaser and shows all existing promo tiles from the includes directory except for
			the promo detail.

		http://your-virtual-host.com/pagetab/promo-detail.html
			The public promo detail page

		http://your-virtual-host.com/app/index.html
			The logged in user landing page

		http://your-virtual-host.com/app/promo-detail.html
			The logged in user promo detail page.
```