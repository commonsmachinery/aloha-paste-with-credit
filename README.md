aloha-paste-with-credit
=======================

Aloha Editor plugin for pasting images with automatic attribution.

This plugin requires CopyRDF browser addon to work properly. Get it here:
https://github.com/commonsmachinery/copyrdf-addon

Installation
------------

1. Copy custom/paste-with-credit directory to the ```aloha/plugins/custom``` directory.

2. Copy
[libcredit.js](https://github.com/commonsmachinery/libcredit) to the
```aloha/lib``` directory.

3. Copy ```rdflib.js``` to the ```aloha/lib``` directory.  (This is a
[patched version](https://github.com/commonsmachinery/rdflib.js/tree/support-node-xmldom)
that supports Aloha's RequireJS environment.  When the
official rdflib.js supports this you should use a build from the
[official repository](https://github.com/linkeddata/rdflib.js).

4. Add plugin ```custom/paste-with-credit``` in your HTML.

5. Make sure you have ```common/block``` loaded before ```custom/paste-with-credit```.

For additional useful features, such as image resizing, load other Aloha plugins
as required. For an example of plugin configuration and styling see ```demo.html```.

License
-------

Copyright 2013 Commons Machinery http://commonsmachinery.se/

Author(s): Peter Liljenberg <peter@commonsmachinery.se>,
           Artem Popov <artfwo@commonsmachinery.se>,

Distributed under an GPLv2 license, please see the LICENSE file for details.


### rdflib.js:

Copyright 2000-2012 MIT and other contributors
http://dig.csail.mit.edu/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

