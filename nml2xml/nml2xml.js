/* NAMELIST file name and display area */
var nmlInFile = document.getElementById("nmlInFile");
var nmlDisplay = document.getElementById("nmlDisplay");

/* XML file name and display area */
var xmlInFile = document.getElementById("xmlInFile");
var xmlDisplay = document.getElementById("xmlDisplay");

/* Template XML file name and display area */
var templateInFile = document.getElementById("templateInFile");
var templateDisplay = document.getElementById("templateDisplay");

/* Embedded display area for XSLT for pretty print */
var xslt4IndentDisplay = document.getElementById("xslt4IndentDisplay");
var xslt4AltIndentDisplay = document.getElementById("xslt4AltIndentDisplay");

/* Embedded display area for XSLT for XML to NAMELIST conversion */
var xslt4NmlDisplay = document.getElementById("xslt4NmlDisplay");
var xslt4HtmlDisplay = document.getElementById("xslt4HtmlDisplay");

/* Generated web input form */
var htmlDisplay = document.getElementById("htmlDisplay");

/* Embedded display area for XSLT for HTML to XML conversion and display area for distilled XML */
var xslt4HtmlToXmlDisplay = document.getElementById("xslt4HtmlToXmlDisplay");
var distilledXmlDisplay = document.getElementById("distilledXmlDisplay");

/*
 * Add event handlers to file inputs to catch input change
 * and to text panes to load files that are dragged onto them.
 */
window.onload = function() {

	nmlInFile.addEventListener('change', function(e) {
		var file = nmlInFile.files[0];
		loadText( file, nmlDisplay );
	}, false);

	nmlInFile.addEventListener('change', function(e) {
		var file = nmlInFile.files[0];
		loadText( file, nmlDisplay );
	}, false);

	xmlInFile.addEventListener('change', function(e) {
		var file = xmlInFile.files[0];
		loadText( file, xmlDisplay );
	}, false);
	
	templateInFile.addEventListener('change', function(e) {
		var file = templateInFile.files[0];
		loadText( file, templateDisplay );
	}, false);

	nmlDisplay.addEventListener('dragover', function(e) {
		e.preventDefault();
	},false);

	xmlDisplay.addEventListener('dragover', function(e) {
		e.preventDefault();
	},false);

	nmlDisplay.addEventListener('drop', function(e) {
		e.preventDefault();
		var file = e.dataTransfer.files[0];
		loadText( file, nmlDisplay );
	},false);
	
	xmlDisplay.addEventListener('drop', function(e) {
		e.preventDefault();
		var file = e.dataTransfer.files[0];
		loadText( file, xmlDisplay );
	},false);

}

/*
 * Reset form to clear the cache for some browsers.
 */
function resetForm( fileSelectId, displayId ) {
	document.getElementById( fileSelectId ).reset();
	document.getElementById( displayId ).value = "";
}

/*
 * Load file and display its contents to displayTarget.
 */
function loadText( file, displayTarget ) {
	var reader = new FileReader();
	reader.onload = function( event ) {
		displayTarget.value = reader.result;
	}
	reader.readAsText( file );
}

/*
 * Reload the previously selected file in inputFileId and display
 * its contents to displayTargetId.
 */
function reloadText( inputFileId, displayTargetId ) {
	var file = document.getElementById( inputFileId ).files[0];	
	var displayTarget = document.getElementById( displayTargetId );		
	loadText( file, displayTarget );
}

/*
 * Save the contents of displayedText to outputFile.
 */
function saveText( displayedText, outputFile )
{
	var textToWrite = document.getElementById( displayedText ).value;
	var textAsBlob = new Blob([textToWrite], {type:'text/plain'});
	var fileToSaveAs = document.getElementById( outputFile ).value;
	
	if ( window.navigator.msSaveBlob != null ) {
		window.navigator.msSaveBlob( textAsBlob, fileToSaveAs );
	}
	else {
		var downloadLink = document.createElement("a");
		downloadLink.download = fileToSaveAs;
		if (window.webkitURL != null) {
			downloadLink.href = window.webkitURL.createObjectURL( textAsBlob );
		}
		else {
			downloadLink.href = window.URL.createObjectURL( textAsBlob );
			downloadLink.style.display = "none";
			document.body.appendChild( downloadLink );
		}
		downloadLink.click();
	}
}

/*
 * Toggle between detailId's show and hide, and change the icon of foldId.
 */
function toggleFold( foldId, detailId ) {
	var foldId = document.getElementById( foldId );
	var foldState = foldId.getAttribute("data-fold");
	var detailId = document.getElementById( detailId );

	if( foldState == "fold" ) {
		//foldId.innerHTML = "&triangledown;";
		foldId.innerHTML = "&#x25bd;";
		detailId.setAttribute("style","display: inline;");
		foldId.setAttribute("data-fold","unfold");
	}
	else
	{
		//foldId.innerHTML = "&triangleright;";
		foldId.innerHTML = "&#x25b7;";
		detailId.setAttribute("style", "display: none;");
		foldId.setAttribute("data-fold","fold");
	}
}

/*
 * Get the currently selected item of selectId pulldown menu
 * and save the result into selectId's data-type attribute.
 * Also change the data-type of descendant input elements to the above type.
 */
function setSelected( selectId ) {
	var selectId = document.getElementById( selectId );
	var selectValue = selectId.value;
	selectId.setAttribute("data-type", selectValue);
	var valueListId = "valueList-" + selectId.getAttribute("id").replace("dataType-", "");

	var valueList = document.getElementById( valueListId );
	var len = valueList.cells.length;
	
	for( var i=0; i<len; i++ ) {
		/* Select 2nd row in value list, i.e. input with text type */
		var lst = locateTableElement( valueList.cells[i] ).tBodies[0].rows[1].cells[0];

		for( var j=0; j<lst.childNodes.length; j++ ) {
			var itm = lst.childNodes[j];
			if( itm.nodeType == 1 ) {
				if ( itm.nodeName == "INPUT" ) {
					if( itm.getAttribute( "data-class" ) == "value" ) {
						/* If complex, set data-type of value cells to real */
						if ( selectValue == "complex" ) {
							itm.setAttribute( "data-type", "real" );
						}
						else {
							itm.setAttribute( "data-type", selectValue);
						}
					}
				}					
			}
		}
		
	}
	
}

/*
 * Toggle between displayId's show and hide, and change the text of buttonId.
 */
function toggleDisplay( buttonId, displayId ) {
	var button = document.getElementById( buttonId );
	var display = document.getElementById( displayId ).style;
	var buttonText = button.value;
	if ( button.value.match( /^Show/ ) ) {
		display.display = "inline";
		button.value = button.value.replace( "Show", "Hide" );
	}
	else {
		display.display = "none";
		button.value  = button.value.replace( "Hide", "Show" );
	}		
}

/*
 * Join valueListId's selected value cells to a single cell and add shade.
 */
function contract( valueListId ) {
	var sequential, repeat, checked, cellStart, sequentialStart;
	var checkedStart = false;
	var repeatTotal = 0;
	var cellToDel = 0;
	var valueList = document.getElementById( valueListId );
	var len = valueList.cells.length;
	
	for( var i=0; i<len; i++ ) {
		var lst = locateTableElement( valueList.cells[i] ).tBodies[0].rows[0].cells[0];
		
		for( var j=0; j<lst.childNodes.length; j++ ) {
			var itm = lst.childNodes[j];
			if( itm.nodeType == 1 ) {
				if( itm.nodeName == "SPAN" ) {
					var datcls = itm.getAttribute( "data-class" );
					if( datcls == "sequential" ) {
						sequential = Number( itm.textContent );
					} else if( datcls == "repeat" ) {
						repeat = Number( itm.textContent );
					}
				} else if( itm.nodeName == "INPUT" ) {
						checked = Number( itm.checked );
				}
			}
		}
		
		if( ( !checkedStart ) && ( checked ) ) {
			checkedStart = true;
			cellStart = i;
			sequentialStart = sequential;
			repeatTotal += repeat;
		} else if( (!checked) && ( checkedStart ) ) {
			break;
		} else if( checkedStart && checked ) {
			repeatTotal += repeat;
			cellToDel++;
		}
	}

	if( repeatTotal > 1 ) {
		for( var j=cellStart+cellToDel; j>cellStart; j--) {
			valueList.deleteCell( j );
		}
		valueList.cells[cellStart].setAttribute("style","border: solid thin;box-shadow: 10px 10px 5px #888888;");
		var lst = locateTableElement( valueList.cells[cellStart] ).tBodies[0].rows[0].cells[0];

		for( var j=0; j<lst.childNodes.length; j++ ) {
			var itm = lst.childNodes[j];
			if( itm.nodeType == 1 ) {
				if( itm.nodeName == "SPAN" ) {
					var datcls = itm.getAttribute( "data-class" );
					if( datcls == "sequential" ) {
						//itm.textContent = sequential + k;
					} else if( datcls == "repeat" ) {
						itm.textContent = repeatTotal;
					}
				} else if( itm.nodeName == "INPUT" ) {
					itm.checked = false;
				}
			}
		}				
	}
}

/*
 * Disjoin valueListId's selected cell aggregation to unit cells and remove shade.
 */
function expand( valueListId ) {
	var sequential, repeat, checked;
	var valueList = document.getElementById( valueListId );
	var len = valueList.cells.length;
	
	for( var i=0; i<len; i++ ) {
		var lst = locateTableElement( valueList.cells[i] ).tBodies[0].rows[0].cells[0];

		for( var j=0; j<lst.childNodes.length; j++ ) {
			var itm = lst.childNodes[j];
			if( itm.nodeType == 1 ) {
				if( itm.nodeName == "SPAN" ) {
					var datcls = itm.getAttribute( "data-class" );
					if( datcls == "sequential" ) {
						sequential = Number( itm.textContent );
					} else if( datcls == "repeat" ) {
						repeat = Number( itm.textContent );
					}
				} else if( itm.nodeName == "INPUT" ) {
						checked = Number( itm.checked );
				}
			}
		}
		
		if( checked && ( repeat > 1 ) ) {
			valueList.cells[i].setAttribute("style","border: solid thin;");

			for( var j=1; j<repeat; j++ ) {
				var clone = valueList.cells[i].cloneNode( true );
				valueList.insertCell(i+1);
				valueList.cells[i+1].setAttribute("style","border: solid thin;");
				valueList.cells[i+1].appendChild( locateTableElement( clone ) );

			}
			for( var k=0; k<repeat; k++ ) {
				var lst = locateTableElement( valueList.cells[i+k] ).tBodies[0].rows[0].cells[0];

				for( var j=0; j<lst.childNodes.length; j++ ) {
					var itm = lst.childNodes[j];
					if( itm.nodeType == 1 ) {
						if( itm.nodeName == "SPAN" ) {
							var datcls = itm.getAttribute( "data-class" );
							if( datcls == "sequential" ) {
								itm.textContent = sequential + k;
							} else if( datcls == "repeat" ) {
								itm.textContent = 1;
							}
						} else if( itm.nodeName == "INPUT" ) {
							itm.checked = false;
						}
					}
				}		
			}	
			break;
		}
	}
}

/*
 * Find the child node tdElm that has name TABLE.
 */
function locateTableElement( tdElem ) {
	var len = tdElem.childNodes.length;
	for( var j=0; j<len; j++ ) {
		var child = tdElem.childNodes[j];
		if( child.nodeType == 1 ) {
			if( child.nodeName == "TABLE" ) {
				return child;
			}
		}
	}
}

/*
 * Convert NAMELIST into XML.
 */
function nmlToXml() {
	var namelistString = nmlDisplay.value;
	var tokens = parseNamelist( namelistString );
	var xmlString = tokensToXml( tokens );
	xmlDisplay.value = xmlString;
}	

/*
 * Convert XML back to NAMELIST.
 */
function xmlToNml() {
	var xmlString = xmlDisplay.value;
	var xsltString = xslt4NmlDisplay.value;
	nmlDisplay.value = applyXslt( xmlString, xsltString );
}	

/*
 * Generate HTML form from XML.
 */
function xmlToHtml() {
	var xmlString = xmlDisplay.value;
	var xsltString = xslt4HtmlDisplay.value;
	htmlDisplay.innerHTML = applyXslt( xmlString, xsltString );
	if( document.getElementById("templateCheckbox").checked ) {
		applyXmlToHtml();
	}
}

/*
 * Serialize and pretty print HTML document.
 */
function generateHtmlSource() {
	/* 2016.09.30 Safari 10.0 stalls with "Entity 'nbsp' not defined". */
	/*
	 It seems, as of v10.0, in serialization, Safari replaces the space before closing tag
	 </span> with &nbsp; which causes an error.  To prevent this, replace this entity
	 with simple space.
	 */ 
	//var xmlString = serializeXml( htmlDisplay );
	var xmlStringOrg = serializeXml( htmlDisplay );
	var xmlString = xmlStringOrg.replace( /&nbsp;/gi, " " );
	htmlSourceDisplay.value = prettyPrint( xmlString );
}

/*
 * Check whether automatic indentation works for XSLT of the current browser.
 */
function isIndentEffective() {
	var testString = "<a><b><c></c></b></a>";
	xsltString = xslt4IndentDisplay.value;
	var testOut = applyXslt(testString, xsltString);
	console.log("testOut: "+testOut);
	var isIndentEffective = testOut.match( /<a>\n\s+<b>\n\s+<c/ );
	if( isIndentEffective ) {
		console.log("xsl:output indent works");
	} else {
		console.log("xsl:output indent does not work");
	}
	return isIndentEffective;
}

/*
 * Add indentations to xmlString.
 */
function prettyPrint( xmlString ) {
	/* xsl:output indent works for Safari, Chrome, Opera (WebKit) */

	var xsltString;

	if( isIndentEffective() ) {
		xsltString = xslt4IndentDisplay.value;
	} else {
		xsltString = xslt4AltIndentDisplay.value;
	}

	return applyXslt( xmlString, xsltString );
}
/*
 * Extract NAMELIST-related data from HTML and save in the form of XML.
 */
function htmlToXml() {
	/* 2016.09.30 For the same reason as generateHtmlSource, to prevent an error for
	Safari 10.0, replace &nbsp; with simple space before pretty print */
	//var xmlString = serializeXml( htmlDisplay );
	var xmlStringOrg = serializeXml( htmlDisplay );
	var xmlString = xmlStringOrg.replace( /&nbsp;/gi, " " );

	var xsltString = xslt4HtmlToXmlDisplay.value;

	if( isIndentEffective() ) {
		distilledXmlDisplay.value = applyXslt( xmlString, xsltString );
	} else {
		distilledXmlDisplay.value = prettyPrint( applyXslt( xmlString, xsltString ) );
	}

}

/*
 * Copy the contents of sourceId to destId.
 */
function copyTextArea( sourceId, destId ) {
	var sourceId = document.getElementById( sourceId );
	var destId = document.getElementById( destId );
	destId.value = sourceId.value;
}

/*
 * Parse xmlStringOrg and xsltString, and apply the latter XSLT to former XML.
 */
function applyXslt( xmlStringOrg, xsltString ) {
/* Internet Explorer (Microsoft Edge works fine) emits an extraneous tbody closing tag when transforming XML to HTML with XSLT, but complains that the tbody it emits does not have a matching tag in the consecutive XSLT transformation.  To work around this problem, remove this extra tag anyway. */ 
	var xmlString = xmlStringOrg.replace( /<\/tbody>\s*<\/tbody>/gi, "</tbody>" );
	var xmlDom = parseXml( xmlString );
	var xsltDom = parseXml( xsltString );

	if ( window.ActiveXObject || "ActiveXObject" in window ) {
	/*
		var xslDoc = new ActiveXObject("Msxml2.FreeThreadedDOMDocument");
		xslDoc.loadXML( xsltString );
		var xsltTemplate = new ActiveXObject("Msxml2.XSLTemplate");
		xsltTemplate.stylesheet = xslDoc;
		var xsltProcessor = xsltTemplate.createProcessor();
		xsltProcessor.input = xmlDom;
		xsltProcessor.transform();
		return xsltProcessor.output;
	*/
		/* Another possibility */
		var stylesheet = new ActiveXObject("Msxml2.DOMDocument");
		stylesheet.loadXML( xsltString );
		var source = new ActiveXObject("Msxml2.DOMDocument");
		source.loadXML( xmlString );
		return source.transformNode( stylesheet )

		/* May work? */
		//return xmlDom.transformNode( xsltDom );

	}
	else {

		var output = xsltDom.getElementsByTagNameNS("http://www.w3.org/1999/XSL/Transform", "output")[0];
		var method = output.getAttribute("method");
		console.log("method: "+method);
		var xsltProcessor = new XSLTProcessor();
		xsltProcessor.importStylesheet( xsltDom );
		var fragment = xsltProcessor.transformToFragment( xmlDom, document );
		if ( method == "text" ) {
			return fragment.firstChild.nodeValue;
		}
		else if ( method == "html" || method == "xml" ) {
			return serializeXml ( fragment );
		}
		
	}
}

/*
 * Parse xmlString and return a DOM document.
 */
function parseXml( xmlString ) {
	var xmlDom = null;
	// if ( typeof ActiveXObject != "undefined" ) {
	if ( window.ActiveXObject || "ActiveXObject" in window ) {
		// xmlDom = createDocument();
		/* Another possibility */
		xmlDom = new ActiveXObject("Msxml2.DOMDocument");
		
		xmlDom.loadXML( xmlString );
		if ( xmlDom.parseError != 0 ) {
			throw new Error ( "XML parsing error: " + xmlDom.parseError.reason );
		}
	}
	else if ( typeof DOMParser != "undefined" ) {
		var parser = new DOMParser();
		xmlDom = parser.parseFromString( xmlString, "text/xml" );
		var errors = xmlDom.getElementsByTagName( "parsererror" );
		if ( errors.length ) {
			throw new Error ( "XML parsing error: " + errors[0].textContent );
		}
	}
	else {
		throw new Error ( "No XML parser available.");
	}
	return xmlDom;
}
/*
 * Serialize xmlDom and return a string.
 */
function serializeXml( xmlDom ) {
	if ( typeof XMLSerializer != "undefined" ) {
		var serializer = new XMLSerializer;
		return serializer.serializeToString( xmlDom );
	}
	else if ( typeof xmlDom.xml != "undefined" ) {
		return xmlDom.xml;
	}
	else {
		throw new Error("Could not serialize XML DOM." );
	}
}

/*
 * Translate special characters in anyString to HTML entities.
 */
function escapeSpecial( anyString ) {
	var xmlValidString = "";
	for( var i = 0; i < anyString.length; i++ ){
		var chr = anyString[i];
		switch ( chr ) {
			case "<":
				chr = "&lt;";
				break;
			case ">":
				chr = "&gt;";
				break;
			case "&":
				chr = "&amp;";
				break;
			case "'":
				chr = "&apos;";
				break;
			case '"':
				chr = "&quot;";
				break;
			default:
		}
		xmlValidString += chr;
	}
	return xmlValidString;
}


/* 
 * Tokenize namelist and return as JavaScript object
 * tokens { pos: position in namelist string
 *              name: category of item, i.e. group, object, value
 *              value: name of item
 *              index: index for array
 *             }
 */
function parseNamelist(string)
{		
	var tokens = [];
	
	function addElement(pos, name, value, index) {
		index = typeof index !== 'undefined' ?  index : null;
		tokens.push({
			pos: pos,
			name: name,
			value: value,
			index: index
		});
	}
		
	var cur;
	var curstr;
	var prev = "initial";
	var str;
	var subst;
	var i = 0;

	// regular expression for each item	
	var re_comment = /(!.*)\n\s*/;
	
	var re_group = /(?:&|\$)\s*([a-zA-Z_][\w]*)\s*/;

	var re_array = /([a-zA-Z_][\w]*)\s*(\(\s*((\s*:\s*(\-|\+)?\d*){1,2}|((\-|\+)?\d+(\s*:\s*(\-|\+)?\d*){0,2}))(\s*,\s*(((\-|\+)?\d*(\s*:\s*(\-|\+)?\d*){0,2})))*\s*\)(\s*\(\s*(:\s*\d*|\d+(\s*:\s*\d*)?)\s*\))?)\s*=\s*/;

	var re_object = /([a-zA-Z_][\w]*)\s*=\s*/;
	
	var re_repeat = /([0-9]+)\s*\*\s*/;
	
	var re_complex_start = /\(\s*/;
	var re_complex_end = /\)\s*,?\s*/;
	
	var re_string = /('((?:[^']+|'')*)'|"((?:[^"]+|"")*)")\s*,?\s*/;

	var re_nondelimited_c = /([^'"\*\s,\/!&\$(=%\.][^\*\s,\/!&\$(=%\.]*)\s*,?\s*/;
	var re_nondelimited_d = /(\d+[^\*\s\d,\/!&\$\(=%\.][^\s,\/!&\$\(=%\.]*)\s*,?\s*/;

	var re_real = /(((-|\+)?\d*\.\d*([eEdDqQ](-|\+)?\d+)?)|((-|\+)?\d+[eEdDqQ](-|\+)?\d+))\s*,?\s*/;

	var re_integer = /((-|\+)?\d+)\b\s*,?\s*/;
	
	var re_logical_c = /([tT][rR][uU][eE]|[tT]|[fF][aA][lL][sS][eE]|[fF])\s*,?\s*/;
	var re_logical_p = /(\.(([tT][rR][uU][eE]|[fF][aA][lL][sS][eE])\.?|[tTfF]\w*))\s*,?\s*/;
	
	var re_null = /\s*\b|\s*,\s*/;
	
	var re_orphan = /[^&]*/;
	
	while( i < string.length ) {
		cur = string[i];
		curstr = string.substr(i);
		// [1] EXCLAMATION MARK
		// (1-1) a comment
		if ( cur.match(/!/) ) {
			// COMMENT
			str = re_comment.exec(curstr);
			if( str && ( str.index == 0 ) ) {
				console.log("found comment: " + str[1]);
				addElement(i, "comment", str[1]);

				i += str[0].length;
				prev = "comment";
			}
			else {
				console.log("error at exclamation");
				alert( "Error in comment: " + curstr.substr(1,15) );
				break;
			}
		}
		// [2] SINGLE OR DOUBLE QUOTATION MARK
		// (2-1) a character constant
		else if ( cur.match(/['"]/) ) {
			// CHARACTER CONSTANT
			str = re_string.exec(curstr);
			if( str && ( str.index == 0 ) && string[i+str[1].length].match(/[,\s\)\/]/) ) {
				console.log("found character: " + str[1]);
				addElement(i,  "character", str[1] );
				i += str[0].length;
				prev = "character";
			}
			else {
				console.log("error at quotation");
				alert( "Error in character: " + curstr.substr(1,15) );
				break;
			}
		}
		// [3] SLASH
		// (3-1) the end of a group
		else if( cur.match(/\//) ){
			// GROUP END
			if ( prev == "object" ) {
				console.log("found null #1");
				addElement(i-1, "null", "");
			}
			addElement(i, "group", "end");
			console.log("found group: end");
			i++;
			prev = "group_end";
		}
		// [4] DOLLAR MARK OR AMPERSAND
		// (4-1) the start or the end of a group
		else if( cur.match(/[$&]/) ){
			// GROUP
			str = re_group.exec(curstr);
			if ( str && ( str.index == 0 ) ) {
				if ( str[1].match(/^end$/i) ) {
					if ( prev == "object" ) {
						console.log("found null #2");
						addElement(i-1, "null", "");
					}
					prev = "group_end";
				}
				else {
					prev = "group_start";
				}
				console.log("found group: " + str[1]);
				addElement(i, "group", str[1]);
				i += str[0].length;				
			}
			else {
				console.log("error at ampersand");
				alert( "Error in group: " + curstr.substr(1,15) );
				break;
			}
		}
		// [5] PERIOD
		// (5-1) a logical constant
		// (5-2) a real constant
		else if ( cur.match(/\./) ) {				
			// LOGICAL CONSTANT
			str = re_logical_p.exec(curstr);
			if( str && ( str.index == 0 ) ) {
				console.log("found logical: " + str[1]);
				addElement(i,  "logical", str[1] );
				i += str[0].length;
				prev = "logical";				
			}
			else {				
				// REAL			
				str = re_real.exec(curstr);
				if( str && ( str.index == 0 ) && string[i+str[1].length].match(/[,\s\)\/]/) ) {
					console.log("found real: " + str[1]);
					addElement(i, "real", str[1]);
					i += str[0].length;
					prev = "real";											
				}
				else {
					console.log("error at period");
					alert( "Error in logical or real: " + curstr.substr(1,15) );
					break;
				}
			}
		} 
		// [6] ALPHABET OR UNDERSCORE
		// (6-1) an object
		// (6-2) an array
		// (6-3) a logical constant
		// (6-4) a nondelimited character constant
		
		else if( cur.match(/[[a-zA-Z_]/) ){
			if( prev == "group_end" || prev == "initial" ) {
				str = re_orphan.exec(curstr);
				if( str && ( str.index == 0 ) ) {
					console.log("found orphan: " + str[0]);
					addElement(i, "orphan", str[0]);
					i += str[0].length;
					prev = "orphan";
				}
			}
			else
			{
				// OBJECT
				str = re_object.exec(curstr);
				if( str && ( str.index == 0 ) ) {
					if ( prev == "object" ) {
						addElement(i-1, "null", "");
						console.log("found null #3");
					}
					console.log("found object: " + str[1]);
					addElement(i, "object", str[1]);
					i += str[0].length;
					prev = "object";
				}
				else
				{
					// ARRAY
					str = re_array.exec(curstr);
					if( str && ( str.index == 0 ) ) {
						console.log("found array: " + str[1] + " index: " + str[2]);
						addElement(i, "array", str[1], str[2]);
						i += str[0].length;
						prev = "array";
					}
					else
					{				
						// LOGICAL CONSTANT
						str = re_logical_c.exec(curstr);
						if ( str && ( str.index == 0 ) && string[i+str[1].length].match(/[,\s\)\/]/) ) {
							console.log("found logical: " + str[1]);
							addElement(i, "logical", str[1]);
							i += str[0].length;
							prev = "logical";
						}
						else {				
							// NONDELIMITED CHARACTER CONSTANT
							str = re_nondelimited_c.exec(curstr);
							if( str && ( str.index == 0 ) && string[i+str[1].length].match(/[,\s\)\/]/) ) {
								console.log("found nondelimited: " + str[1]);
								addElement(i, "nondelimited", str[1]);
								i += str[0].length;
								prev = "nondelimited";
							}
							else
							{
								console.log("found unknown");
								addElement(i, "unknown",null);
								i++;
							}
						}
					}
				}
			}
		}
		// [7] LEFT PARENTHESIS
		// (7-1) the start of a complex number
		else if( cur.match(/\(/) ) {
			str = re_complex_start.exec(curstr);
			if( str && ( str.index == 0 ) ) {
				// COMPLEX START
				console.log("found complex start");
				addElement(i,"complex","start");
				i += str[0].length;
				prev = "complex_start";
			}
			else {
				console.log("error at complex start");
				alert( "Error in complex: " + curstr.substr(1,15) );
				break;
			}
		}
		// [8] RIGHT PARENTHESIS
		// (8-1) the end of a complex number
		else if( cur.match(/\)/) ) {
			str = re_complex_end.exec(curstr);
			if( str && ( str.index == 0 ) ) {
				// COMPLEX END
				console.log("found complex end");
				addElement(i, "complex", "end");
				i += str[0].length;
				prev = "complex_end";
			}
			else {
				console.log("error at complex end");
				alert( "Error in complex: " + curstr.substr(1,15) );
				break;
			}
		}
		// [9] PLUS OR MINUS SIGN
		// (9-1) a real constant
		// (9-2) an integer constant
		else if( cur.match(/[\+\-]/) ) {
			str = re_real.exec(curstr);
			if( str && ( str.index == 0 ) && string[i+str[1].length].match(/[,\s\)\/]/) ) {
				// REAL
				console.log("found real: " + str[1]);
				addElement(i, "real", str[1]);
				i += str[0].length;
				prev = "real";
			}
			else {
				str = re_integer.exec(curstr);
				if( str && ( str.index == 0 ) && string[i+str[1].length].match(/[,\s\)\/]/) ) {
					// INTEGER
					console.log("found integer: " + str[1]);
					addElement(i, "integer", str[1]);
					i += str[0].length;
					prev = "integer";
				}
				else {
					console.log("error at +-.");
					alert( "Error in real or integer: " + curstr.substr(1,15) );
					break;
				}
			}
		}
		// [10] DECIMAL
		// (10-1) a nondelimited character constant
		// (10-2) a repetition
		// (10-3) a real constant
		// (10-4) an integer constant
		else if( cur.match(/[\d]/) ) {			
			str = re_repeat.exec(curstr);
			if( str && ( str.index == 0 ) ) {
				// REPEAT
				console.log("found repeat: " + str[1]);
				addElement(i, "repeat", str[1]);
				i += str[0].length;
				prev = "repeat";
			}			
			else {	
				str = re_real.exec(curstr);
				if( str && ( str.index == 0 ) && string[i+str[1].length].match(/[,\s\)\/]/) ) {
					// REAL
					console.log("found real: " + str[1]);
					addElement(i, "real", str[1]);
					i += str[0].length;
					prev = "real";
				}
				else {
					str = re_integer.exec(curstr);
					if( str && ( str.index == 0 ) && string[i+str[1].length].match(/[,\s\)\/]/) ) {
						// INTEGER
						console.log("found integer: " + str[1]);
						addElement(i, "integer", str[1]);
						i += str[0].length;
						prev = "integer";
					}
					else {
						str = re_nondelimited_d.exec(curstr);
						if( str && ( str.index == 0 ) && string[i+str[1].length].match(/[,\s\)\/]/) ) {
							// NONDELIMITED CHARACTER CONSTANT
							console.log("found nondelimited: " + str[1]);
							addElement(i, "nondelimited", str[1]);
							i += str[0].length;
							prev = "nondelimited";
						}
						else {
							console.log("error at digit");
							alert( "Error in real or integer or repeat: " + curstr.substr(1,15) );
							break;
						}
					}				
				}
			}
		}
		// [11] BLANK OR CONSECUTIVE COMMAS
		// (11-1) null
		else {
			// NULL
			str = re_null.exec(curstr);
			if( str && ( str.index == 0 ) ) {
				console.log("found null #4");
				addElement(i, "null", "");
				i += str[0].length;
				prev = "null";
			}
			else {
				i++;
			}
		}
	}
	return tokens;
}

function indent( n ) {
	var str = "";
	for ( var i = 0; i < n; i++ ) {
		str += "  ";
	}
	return str;
}

/*
 * Transform namelist tokens to XML
 */
function tokensToXml( tokens ) {
	var xmlString = "";
	var prev = null;
	var ind = 0;
	var cmplx = null;
	var numOfVals = 0;
	
	xmlString += "<namelist>\n";
	ind++;
	
	for ( var i = 0; i < tokens.length; i++ ) {
		var name = tokens[i].name;
		var value = tokens[i].value;
		var index = tokens[i].index;
		var pos = tokens[i].pos;
		
		if ( name == "orphan" ) {
			xmlString += indent(ind) + "<orphan>\n" + value + "\n" + indent(ind) + "</orphan>\n";
		}
		else if ( name == "group" ) {
			if ( !value.match(/^end$/i) ) {
				xmlString += indent(ind) + "<group name=\"" + value + "\">\n";
				ind++;
			}
			else {
				if ( numOfVals == 0 ) {
					ind++;
					xmlString += indent(ind) + "<value type=\"null\"></value>\n";
					ind--;
				}
				ind--;
				xmlString += indent(ind) + "</object>\n"
				ind--;
				xmlString += indent(ind) + "</group>\n";
			}
		}
		else if ( name == "object" ) {
			if ( prev != "group" && prev != "comment" ) {
				if ( numOfVals == 0 ) {
					ind++;
					xmlString += indent(ind) + "<value type=\"null\"></value>\n";
					ind--;
				}
				ind--;
				xmlString += indent(ind) + "</object>\n";
			}
			xmlString += indent(ind) +"<object name=\"" + value + "\">\n";
			ind++;
			numOfVals = 0;
		}
		else if ( name == "array" ) {
			if ( prev != "group" ) {
				if ( numOfVals == 0 ) {
					ind++;
					xmlString += indent(ind) + "<value type=\"null\"></value>\n";
					ind--;
				}
				ind--;
				xmlString += indent(ind) + "</object>\n";
			}
			xmlString += indent(ind) +"<object name=\"" + value 
				+ "\" index=\"" + index +  "\">\n";
			ind++;
			name = "object";
			numOfVals = 0;
		}
		else if ( name == "repeat" ) {
			xmlString += indent(ind) + "<repeat times=\"" + value + "\">\n";
			ind++;
		}
		else if ( name == "comment" ) {
			// Wrap comment in quotes to prevent decoding XML escaping characters
			xmlString += indent(ind) + "<comment>" + escapeSpecial( '"' + value + '"' ) + "</comment>\n";
		}
		else if ( name == "complex" ) {
			if ( value == "start" ) {
				xmlString += indent(ind) + "<complex>\n";
				ind++;
				cmplx = "re";
				numOfVals++;
			}
			else {
				ind--;
				xmlString += indent(ind) + "</complex>\n";
				if ( ind == 4 ) {
					ind--;
					xmlString += indent(ind) + "</repeat>\n";
				}
			}
		}
		else {
			if ( name == "character" || name == "nondelimited" ) {
				xmlString += indent(ind) + "<value type=\"" + name + "\">" 
				+ escapeSpecial(value) + "</value>\n";
				numOfVals++;
			}
			else {
				if ( cmplx == null ) {
					xmlString += indent(ind) + "<value type=\"" + name + "\">" 
					+ value + "</value>\n";
					numOfVals++;
				}
				else if ( cmplx == "re" ) {
					xmlString += indent(ind) + "<re>\n";
					ind++;
					xmlString += indent(ind) + "<value type=\"" + name + "\">" 
					+ value + "</value>\n";
					ind--;
					xmlString += indent(ind) + "</re>\n";
					cmplx = "im";
				}
				else {
					xmlString += indent(ind) + "<im>\n";
					ind++;
					xmlString += indent(ind) + "<value type=\"" + name + "\">" 
					+ value + "</value>\n";
					ind--;
					xmlString += indent(ind) + "</im>\n";
					cmplx = null;				
				}
			}
			
			if ( prev == "repeat" ) {
				ind--;
				xmlString += indent(ind) + "</repeat>\n";
			}
			
		}
		if ( name != "comment" ) {
			prev = name;
		}
	}
	ind--;
	xmlString += "</namelist>";
	return xmlString;
}

/* 
 * Check input value.
 * If input is invalid, show an alert box and revert to the original value.
 */
function checkInput( obj ) {

	var newInput = obj.value;
	var curValue = obj.getAttribute("value");
	var rgex = null;
	//var type = obj.getAttribute("data-type");
	var str = null;
	var parentObject = findParentObject( obj );
	var parentObjectName = parentObject.getAttribute("id").replace("object-","");
	var dataTypeId = "dataType-" + parentObjectName;
	var type = document.getElementById( dataTypeId ).getAttribute("data-type");
	
	if ( type == "character" ) {
		rgex = /^('((?:[^']+|'')*)'|"((?:[^"]+|"")*)")$/;
	}
	else if ( type == "nondelimited" ) {
		rgex = /^(([^'"\*\s,\/!&\$(=%\.][^\*\s,\/!&\$(=%\.]*)|(\d+[^\*\s\d,\/!&\$\(=%\.][^\s,\/!&\$\(=%\.]*))$/;
	}
	else if ( type == "real" | type == "complex" ) {
		rgex = /^(((-|\+)?\d*\.\d*([eEdDqQ](-|\+)?\d+)?)|((-|\+)?\d+[eEdDqQ](-|\+)?\d+))$/;
	}
	else if ( type == "integer" ) {
		rgex = /^((-|\+)?\d+)$/;
	}
	else if ( type == "logical" ) {
		rgex = /^(([tT][rR][uU][eE]|[tT]|[fF][aA][lL][sS][eE]|[fF])|(\.(([tT][rR][uU][eE]|[fF][aA][lL][sS][eE])\.?|[tTfF]\w*)))$/;
	}

	str = rgex.exec( newInput );

	if ( !str ) {
		alert("Object '" + parentObjectName + "' must be " + type + ": " + newInput );
		obj.value = curValue;
	}
	else {
		obj.setAttribute("value", newInput);
	}
	
}


function applyXmlToHtml() {
/* > Check DOM Level 3 XPath availability */
//	var supportsXPath = document.implementation.hasFeature("XPath", "3.0");
	//console.log("DOM Level 3 supports: " + supportsXPath);
//	if( supportsXPath ) {
		var xmlString = templateDisplay.value;
		var xmlDom = parseXml( xmlString );
		scanXmlAndChangeHtml( xmlDom );
//	}
//	else {
//		alert("Cannot proceed because DOM Level 3 is not supported in this browser.");
//	}
 }

 
/*
 * Node types of DOM document
 */
/*
nodeType                  % nodeName              % nodeValue       % possible children
 1 element                % element name          % null            % element, text, comment, processing instruction, CDATA section, entity reference
 2 attribute              % attribute name        % attribute value % text, entity reference
 3 text                   % #text                 % node content    % none
 4 CDATA section          % #cdata-section        % node content    % none
 5 entity reference       % entity reference name % null            % element, processing instruction, comment, text, CDATA section, entity reference
 6 entity                 % entity name           % null            % element, processing instruction, comment, text, CDATA section, entity reference
 7 processing instruction % target                % null            % none
 8 comment                % #comment              % node content    % none
 9 document (DOM root)    % #document             % null            % element, processing instruction, comment, document type
10 document type          % doctype name          % null            % none
11 document fragment      % #document fragment    % null            % element, processing instruction, comment, text, CDATA section, entity reference
12 notation               % notation name         % null            % none
*/


/*
 * Scan template XML and change the following contents of HTML to those of the template
 *   groupSummary, groupDetail,
 *   objectSummary, objectDetail, numberOfElements, dataType, dataSize, unit.
 * Though the properties of each value element can be accessed, they are not used in this implementation.
 */
function scanXmlAndChangeHtml( xmlDom ) {

	var groups = xmlDom.documentElement.getElementsByTagName("group");
	
	for ( var i=0; i < groups.length; i++ ) {
		var group = groups[i];
			
		var groupName = group.getAttribute("name");
		console.log( "group: " + groupName );

		var groupSummary = group.getElementsByTagName("groupSummary");
		if( groupSummary.length !== 0 ) {
			//var groupSummaryValue = groupSummary[0].textContent; Does not work in IE
			var groupSummaryValue = groupSummary[0].childNodes[0].nodeValue;
			console.log( "  groupSummary: " + groupSummaryValue );
			var groupSummaryId = "groupSummary-" + groupName;
			var groupSummaryElement = document.getElementById( groupSummaryId );
			if( groupSummaryElement !== null ) {
				groupSummaryElement.textContent = groupSummaryValue;
			}
			else {
				alert( "Group summary for '" + groupName + "' not found." );
			}
		}
			
		var groupDetail = group.getElementsByTagName("groupDetail");
		if( groupDetail.length !== 0 ) {
			var groupDetailValue = groupDetail[0].childNodes[0].nodeValue;
			console.log( "  groupDetail: " + groupDetailValue );
			var groupDetailId = "groupDetail-" + groupName;
			var groupDetailElement = document.getElementById( groupDetailId );
			if( groupDetailElement !== null ) {
				groupDetailElement.textContent = groupDetailValue;
			}
			else {
				alert( "Group detail for '" + groupName + "' not found." );
			}
		}
						
		var objects = group.getElementsByTagName("object");

		for ( var j=0; j < objects.length; j++ ) {
			var object = objects[j];				
			var objectName = object.getAttribute("name");
			var objectIndex = object.getAttribute("index");
			console.log( "  object: " + objectName + " index: " + objectIndex );
			
			var objectNameIndex = objectName;
			if( objectIndex !== null ) {
				objectNameIndex += objectIndex;
			}

			var objectSummary = object.getElementsByTagName("objectSummary");
			if( objectSummary.length !== 0 ) {
				var objectSummaryValue = objectSummary[0].childNodes[0].nodeValue;
				console.log( "  objectSummary: " + objectSummaryValue );
				var objectSummaryId = "objectSummary-" + objectNameIndex;
				var objectSummaryElement = document.getElementById( objectSummaryId );
				if( objectSummaryElement !== null ) {
					objectSummaryElement.textContent = objectSummaryValue;
				}
				else {
					alert( "Object summary for '" + objectNameIndex + "' not found." );
				}
			}
			
			var objectDetail = object.getElementsByTagName("objectDetail");
			if( objectDetail.length !== 0 ) {
				var objectDetailValue = objectDetail[0].childNodes[0].nodeValue;
				console.log( "  objectDetail: " + objectDetailValue );
				var objectDetailId = "objectDetail-" + objectNameIndex;
				var objectDetailElement = document.getElementById( objectDetailId );
				if( objectDetailElement !== null ) {
					objectDetailElement.textContent = objectDetailValue;
				}
				else {
					alert( "Object detail for '" + objectNameIndex + "' not found." );
				}
			}

			var numberOfElements = object.getElementsByTagName("numberOfElements");
			if( numberOfElements.length !== 0 ) {
				var numberOfElementsValue = numberOfElements[0].childNodes[0].nodeValue;
				console.log( "    numberOfElements: " + numberOfElementsValue );
				var numberOfElementsId = "numberOfElements-" + objectNameIndex;
				var numberOfElementsElement = document.getElementById( numberOfElementsId );
				if( numberOfElementsElement !== null ) {
					numberOfElementsElement.textContent = numberOfElementsValue;
				}
				else {
					alert( "Number of elements for '" + objectNameIndex + "' not found." );
				}
			}

			var dataType = object.getElementsByTagName("dataType");
			if( dataType.length !== 0 ) {
				var dataTypeValue = dataType[0].childNodes[0].nodeValue;
				console.log( "    dataType: " + dataTypeValue );
				var dataTypeId = "dataType-" + objectNameIndex;
				var dataTypeElement = document.getElementById( dataTypeId );
				if( dataTypeElement !== null ) {
					dataTypeElement.setAttribute( "data-type", dataTypeValue );
					dataTypeElement.value = dataTypeValue;
				}
				else {
					alert( "Data type for '" + objectNameIndex + "' not found." );
				}
			}

			var dataSize = object.getElementsByTagName("dataSize");
			if( dataSize.length !== 0 ) {
				var dataSizeValue = dataSize[0].childNodes[0].nodeValue;
				console.log( "    dataSize: " + dataSizeValue );
				var dataSizeId = "dataSize-" + objectNameIndex;
				var dataSizeElement = document.getElementById( dataSizeId );
				if( dataSizeElement !== null ) {
					dataSizeElement.textContent = dataSizeValue;
				}
				else {
					alert( "Data size for '" + objectNameIndex + "' not found." );
				}
			}

			var unit = object.getElementsByTagName("unit");
			if( unit.length !== 0 ) {
				var unitValue = unit[0].childNodes[0].nodeValue;
				console.log( "    unit: " + unitValue );
				var unitId = "unit-" + objectNameIndex;
				var unitElement = document.getElementById( unitId );
				if( unitElement !== null ) {
					unitElement.textContent = unitValue;
				}
				else {
					alert( "Unit for '" + objectNameIndex + "' not found." );
				}
			}

/* >>> Individual values can be accessed, but not used in this implementation */
/* Does not work in IE
			var elements = xmlDom.evaluate("value|repeat|complex", object, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
			if( elements !== null ) {
				var element = elements.iterateNext();
				while (element) {
					var elementName = element.nodeName;
					console.log("      element: " + elementName );
					
					if( elementName == "repeat" ) {
						var times = element.getAttribute("times");
						console.log( "        times: " + times );
						var complex = element.getElementsByTagName("complex");
						if( complex.length == 0 ) {
							var value = element.getElementsByTagName("value");
							var valueType = value[0].getAttribute("type");
							console.log("          value[" + valueType + "]: " + value[0].textContent);
						}
						else {
							console.log("          complex");
							var reValue = complex[0].getElementsByTagName("re")[0].getElementsByTagName("value");
							console.log("            re: " + reValue[0].textContent);
							var imValue = complex[0].getElementsByTagName("im")[0].getElementsByTagName("value");
							console.log("            im: " + imValue[0].textContent);
						}
					}
					else if( elementName == "complex" ) {
						var reValue = element.getElementsByTagName("re")[0].getElementsByTagName("value");
						console.log("        re: " + reValue[0].textContent);
						var imValue = element.getElementsByTagName("im")[0].getElementsByTagName("value");
						console.log("        im: " + imValue[0].textContent);
					} 
					else {
						var valueType = element.getAttribute("type");
						console.log("        value[" + valueType + "]: " + element.textContent );
					}
					
					element = elements.iterateNext();
				} //element loop
			} // if elements exist
*/			
/* <<< Not used in this implementation */			
			
		} //object loop
	} //group loop
}

/*
 * Find the parent object-element of obj
 */
function findParentObject( obj ) {
	//console.log("nodeName: " + obj.nodeName );
	var dataClass = obj.getAttribute("data-class");
	if( dataClass == "object") {
		//console.log("dataName: " + obj.getAttribute("data-name") );
		//return obj.getAttribute("data-name");
		return obj;
	}
	else {
		 return findParentObject( obj.parentNode );
	}
}

/*
 * Check data types of input values after NAMELIST is loaded.
 */
function checkValues() {
	var values = document.getElementsByTagName("input");
	for( var i=0; i < values.length; i++) {
		//console.log(i + " value: " + values[i].textContent);
		if( values[i].getAttribute("data-class") == "value" ) {
			checkInput( values[i] );
		}
	}
}