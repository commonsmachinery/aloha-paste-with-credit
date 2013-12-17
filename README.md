aloha-paste-with-credit
=======================

Aloha Editor plugin for pasting images with automatic attribution.

This plugin requires CopyRDF browser addon to work properly. Get it here:
https://github.com/commonsmachinery/copyrdf-addon

Installation
------------

1. Copy custom/paste-with-credit directory to the `aloha/plugins/custom` directory.

2. Copy
[libcredit.js](https://github.com/commonsmachinery/libcredit) to the
`aloha/lib` directory.

3. Copy [rdflib.js](https://github.com/linkeddata/rdflib.js) to the
`aloha/lib` directory.

4. Add plugin `custom/paste-with-credit` in your HTML.

5. Make sure you have `common/block` loaded before `custom/paste-with-credit`.

For additional useful features, such as image resizing, load other Aloha plugins
as required. For an example of plugin configuration and styling see `demo.html`.

License
-------

Copyright 2013 Commons Machinery http://commonsmachinery.se/

Author(s): Peter Liljenberg <peter@commonsmachinery.se>,
           Artem Popov <artfwo@commonsmachinery.se>,

Distributed under an GPLv2 license, please see the LICENSE file for details.


