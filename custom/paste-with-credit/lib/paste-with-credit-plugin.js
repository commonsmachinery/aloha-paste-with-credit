// Aloha Editor plugin for pasting images with automatic attribution.
//
// Copyright 2013 Commons Machinery http://commonsmachinery.se/
//
// Authors: Peter Liljenberg <peter@commonsmachinery.se>
//          Artem Popov <artfwo@commonsmachinery.se>
//
// Distributed under GNU GPL v2, please see LICENSE in the top dir.

define([
	'jquery',
	'aloha',
	'aloha/plugin',
	'aloha/command',
	'block/block',
	'block/blockmanager',
	'aloha/copypaste',
	'paste-with-credit/vendor/rdflib',
	'css!paste-with-credit/css/paste-with-credit.css'
], function (
	jQuery,
	Aloha,
	Plugin,
	Commands,
	Block,
	BlockManager,
	CopyPaste
) {
	'use strict';

	var idNum = 0; // counter for having unique IDs for #abouts

	var CommonLicenses = {
		"http://creativecommons.org/licenses/by/3.0/": "Creative Commons Attribution 3.0 Unported License",
		"http://creativecommons.org/licenses/by-nc/3.0/": "Creative Commons Attribution-NonCommercial 3.0 Unported License",
		"http://creativecommons.org/licenses/by-nc-nd/3.0/": "Creative Commons Attribution-NonCommercial-NoDerivs 3.0 Unported License",
		"http://creativecommons.org/licenses/by-nc-sa/3.0/": "Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License",
		"http://creativecommons.org/licenses/by-nd/3.0/": "Creative Commons Attribution-NoDerivs 3.0 Unported License",
		"http://creativecommons.org/licenses/by-sa/3.0/": "Creative Commons Attribution-ShareAlike 3.0 Unported License",
	};

	// parseRDFXML, createSpan, createA and createAttribution
	// adapted from Peter Liljenberg's paste.js example,
	// http://brugd.ctrl-c.liu.se/~petli/examples/paste/paste.html

	var DC = $rdf.Namespace('http://purl.org/dc/elements/1.1/');
	var DCTERMS = $rdf.Namespace('http://purl.org/dc/terms/');
	var CC = $rdf.Namespace('http://creativecommons.org/ns#');
	var XHTML = $rdf.Namespace('http://www.w3.org/1999/xhtml/vocab#');
	var RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#"');

	// Parse the RDF/XML using https://github.com/linkeddata/rdflib.js
	function parseRDFXML(str) {
		var dom = new DOMParser().parseFromString(str, 'application/xml');

		var kb = new $rdf.IndexedFormula();
		var parser = new $rdf.RDFParser(kb);

		parser.parse(dom, '', null);

		return kb;
	};

	function createSpan(content, property) {
		var span = jQuery('<span/>');
		if (content.value)
			span.append(content.value);
		else
			span.append(content);

		if (property)
			span.attr('property', property);

		return span;
	}

	function createA(href, content, rel, property) {
		var a = jQuery('<a/>');
		a.attr('href', href);
		if (content.value)
			a.append(content.value);
		else
			a.append(content);

		if (rel)
			a.attr('rel', rel);
		if (property)
			a.attr('property', property);

		return a;
	}

	// Get CC-related properties about the work
	function createAttribution(kb, srcURI, targetURI) {
		var creditDiv = jQuery('<div/>', {
			about: targetURI,
		});
		
		var root = kb.sym(srcURI);

		// Could go look for different titles in an rdf:Alt node and
		// choose one based on language, and also look for dcterms:title.
		var title = kb.any(root, DC('title'));
		var creator = kb.any(root, DC('creator'));

		var attributionURL = kb.any(root, CC('attributionURL'));
		if (attributionURL != null)
			attributionURL = attributionURL.uri;

		var attributionName = kb.any(root, CC('attributionName'));
		if (!attributionName)
			if (creator)
				attributionName = creator;
			else
				attributionName = attributionURL;

		// Use the first of xhtml:license, dcterms:license and cc:license
		var license = kb.any(root, XHTML('license'));
		if (license == null)
			license = kb.any(root, DCTERMS('license'));
		if (license == null)
			license = kb.any(root, CC('license'));
		if (license != null)
			license = license.uri;

		// build attribution
		if (title) {
			creditDiv.append(createSpan(title, 'http://purl.org/dc/elements/1.1/title'));
		} else {
			creditDiv.append('Image');
		}

		if (attributionName) {
			creditDiv.append(' by ');

			if (attributionURL) {
				creditDiv.append(createA(attributionURL, attributionName,
					'http://creativecommons.org/ns#attributionURL',
					'http://creativecommons.org/ns#attributionName'));
			} else {
				 creditDiv.append(createSpan(attributionName,
				   'http://creativecommons.org/ns#attributionName'));
			}
		} else {
			// has no attribution
		}

		creditDiv.append('.');

		if (license) {
			var licenseLabel = license;
			if (CommonLicenses[license])
				licenseLabel = CommonLicenses[license];
				
			creditDiv.append(' Licensed under ');
			creditDiv.append(createA(license, licenseLabel, 'license', null));
			creditDiv.append('.');
		}

		// sources
		var sources = kb.each(root, DC('source'));
		if (sources.length > 0) {
			creditDiv.append(' Based on:');

			var sourceList = jQuery("<ul/>");
			creditDiv.append(sourceList);

			for (var i in sources) {
				var sourceUri = sources[i].uri;
				var sourceTitle = kb.any(sources[i], DC('title'));
				var sourceAuthor = kb.any(sources[i], CC('attributionName'));
				if (sourceAuthor == null)
					sourceAuthor = kb.any(sources[i], DC('creator'));
				var li = jQuery("<li/>");
				li.attr("about", sourceUri);

				if (sourceTitle == null)
					sourceTitle = sourceUri;

				li.append(createA(sourceUri, sourceTitle, 'http://purl.org/dc/elements/1.1/source', null));

				if (sourceAuthor) {
					li.append(" by ");
					li.append(createSpan(sourceAuthor, 'http://creativecommons.org/ns#attributionName'));
				}

				sourceList.append(li);
		    }

			//creditDiv.append('.');
		}
		
		return creditDiv;
	};


	var ImageWithCreditBlock = Block.AbstractBlock.extend({
		title: 'Image with credit'
	});


	var PasteRdfPlugin = Plugin.create('paste-with-credit', {

		init: function() {
			var self = this;

			BlockManager.registerBlockType('ImageWithCreditBlock', ImageWithCreditBlock);

			Aloha.bind('aloha-editable-created', function(e, editable) {
				editable.obj.addClass('x-enable-paste-image');
				editable.obj.on('x-onpaste-image', self._pasteHandler);
			});
		},

		_pasteHandler: function(event) {
			var self = this;
			var detail = event.originalEvent.detail;

			var range = CopyPaste.getRange();
			
			if (Aloha.queryCommandSupported('insertHTML')) {
				var range = Aloha.Selection.getRangeObject();

				if (range.isCollapsed()) {
					var blockDiv = jQuery('<div/>');
					blockDiv.addClass('image-with-credit-block');
					blockDiv.alohaBlock({
						'aloha-block-type': 'ImageWithCreditBlock'
					});

					var imgDiv = jQuery('<img/>', {
						id: "work" + idNum.toString(),
						src: detail.image
					});
					idNum++;

					imgDiv.addClass('image-with-credit-image');
					blockDiv.append(imgDiv);

					if (detail.rdfxml) {
						var kb = parseRDFXML(detail.rdfxml);
						var credit = createAttribution(kb, '', '#' + imgDiv.attr('id'));
						var captionDiv = jQuery('<div/>');

						// do we need to leave captions editable?
						captionDiv.addClass('aloha-editable');
						captionDiv.addClass('image-with-credit-caption');

						captionDiv.append(credit);
						blockDiv.append(captionDiv);
					}

					GENTICS.Utils.Dom.insertIntoDOM(blockDiv, range, jQuery(Aloha.activeEditable.obj), true);
				} else {
					// TODO: replace the selection?
				}
			}
		}
	});

	return PasteRdfPlugin;
});