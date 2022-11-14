const EleventyPluginRss = require('@11ty/eleventy-plugin-rss')
const EleventyVitePlugin = require('@11ty/eleventy-plugin-vite')

const Image = require('@11ty/eleventy-img')

const rollupPluginCritical = require('rollup-plugin-critical').default

const filters = require('./utils/filters.js')
const transforms = require('./utils/transforms.js')
const shortcodes = require('./utils/shortcodes.js')

// const { resolve } = require('path')

module.exports = function (eleventyConfig) {
	// Plugins
	eleventyConfig.addPlugin(EleventyPluginRss)
	eleventyConfig.addPlugin(EleventyVitePlugin, {
		tempFolderName: '.11ty-vite', // Default name of the temp folder

		// Vite options (equal to vite.config.js inside project root)
		viteOptions: {
			publicDir: 'public',
			clearScreen: false,
			server: {
				mode: 'development',
				middlewareMode: true
			},
			appType: 'custom',
			assetsInclude: ['**/*.xml', '**/*.txt'],
			build: {
				mode: 'production',
				sourcemap: 'true',
				manifest: true,
				// This puts CSS and JS in subfolders – remove if you want all of it to be in /assets instead
				rollupOptions: {
					output: {
						assetFileNames: 'assets/css/main.[hash].css',
						chunkFileNames: 'assets/js/[name].[hash].js',
						entryFileNames: 'assets/js/[name].[hash].js'
					},
					plugins: [
						rollupPluginCritical({
							criticalUrl: './_site/',
							criticalBase: './_site/',
							criticalPages: [
								{ uri: 'index.html', template: 'index' },
								{ uri: '404.html', template: '404' }
							],
							criticalConfig: {
								inline: true,
								dimensions: [
									{
										height: 900,
										width: 375
									},
									{
										height: 720,
										width: 1280
									},
									{
										height: 1080,
										width: 1920
									}
								],
								penthouse: {}
							}
						})
					]
				}
			}
		}
	})

	// Filters
	Object.keys(filters).forEach((filterName) => {
		eleventyConfig.addFilter(filterName, filters[filterName])
	})

	// Transforms
	Object.keys(transforms).forEach((transformName) => {
		eleventyConfig.addTransform(transformName, transforms[transformName])
	})

	// Shortcodes
	Object.keys(shortcodes).forEach((shortcodeName) => {
		eleventyConfig.addShortcode(shortcodeName, shortcodes[shortcodeName])
	})

	/* Shortcodes */
	const imageShortcode = async (src, className, alt, sizes) => {
		let metadata = await Image(src, {
			widths: [600, 1200],
			formats: ['webp', 'jpeg'],
			outputDir: './_site/img/',
			urlPath: '/img/'
		})

		let imageAttributes = {
			class: className,
			alt,
			sizes,
			loading: 'lazy',
			decoding: 'async'
		}

		return Image.generateHTML(metadata, imageAttributes)
	}

	eleventyConfig.addNunjucksAsyncShortcode('image', imageShortcode)

	eleventyConfig.addShortcode('year', () => `${new Date().getFullYear()}`)

	// Layouts
	eleventyConfig.addLayoutAlias('base', 'base.njk')

	// Copy/pass-through files
	eleventyConfig.setServerPassthroughCopyBehavior('copy')
	eleventyConfig.addPassthroughCopy('public')
	eleventyConfig.addPassthroughCopy('src/assets/css')
	eleventyConfig.addPassthroughCopy('src/assets/js')

	return {
		templateFormats: ['html', 'liquid', 'njk'],
		htmlTemplateEngine: 'liquid',
		passthroughFileCopy: true,
		dir: {
			input: 'src',
			// better not use "public" as the name of the output folder (see above...)
			output: '_site',
			includes: '_includes',
			layouts: 'layouts',
			data: '_data'
		}
	}
}
