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
	'libcredit',
	'css!paste-with-credit/css/paste-with-credit.css'
], function (
	jQuery,
	Aloha,
	Plugin,
	Commands,
	Block,
	BlockManager,
	CopyPaste,
        libcredit
) {
	'use strict';

	var idNum = 0; // counter for having unique IDs for #abouts


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
                                            var doc, credit, formatter, captionDiv;

                                            doc = new DOMParser().parseFromString(detail.rdfxml, 'text/xml');
                                            credit = libcredit.credit(libcredit.parseRDFXML(doc));

                                            formatter = libcredit.htmlCreditFormatter(document);
                                            credit.format(formatter, 2);

					    captionDiv = jQuery('<div/>');
                                            
					    // do we need to leave captions editable?
					    captionDiv.addClass('aloha-editable');
					    captionDiv.addClass('image-with-credit-caption');
                                            
                                            captionDiv.append(formatter.getRoot());

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