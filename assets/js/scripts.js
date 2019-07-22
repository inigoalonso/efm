
        // Simple solution to add additional text to the rectangle shape definition:
        (function () {
            var mxRectangleShapeIsHtmlAllowed = mxRectangleShape.prototype.isHtmlAllowed;
            mxRectangleShape.prototype.isHtmlAllowed = function () {
                return mxRectangleShapeIsHtmlAllowed.apply(this, arguments) && this.state == null;
            };

            mxRectangleShapePaintForeground = mxRectangleShape.prototype.paintForeground;
            mxRectangleShape.prototype.paintForeground = function (c, x, y, w, h) {
                if (this.state != null && this.state.cell.geometry != null && !this.state.cell.geometry
                    .relative) {
                    c.setFontColor('#a0a0a0');
                    c.text(x + 2, y, 0, 0, this.state.cell.id, 'left', 'top');
                }

                mxRectangleShapePaintForeground.apply(this, arguments);
            };
        })();

        // Program starts here. Creates a sample graph in the
        // DOM node with the specified ID. This function is invoked
        // from the onLoad event handler of the document (see below).
        function main(graphContainer) {
            // Checks if browser is supported
            if (!mxClient.isBrowserSupported()) {
                // Displays an error message if the browser is
                // not supported.
                mxUtils.error('Browser is not supported!', 200, false);
            } else {
                // Defines an icon for creating new connections in the connection handler.
                // This will automatically disable the highlighting of the source vertex.
                mxConnectionHandler.prototype.connectImage = new mxImage(
                    'assets/img/connector.gif', 16, 16);

                // Creates the div for the toolbar
                var tbContainer = document.createElement('div');
                tbContainer.style.position = 'absolute';
                tbContainer.style.overflow = 'hidden';
                tbContainer.style.padding = '2px';
                tbContainer.style.left = '0px';
                tbContainer.style.top = '0px';
                tbContainer.style.width = '24px';
                tbContainer.style.bottom = '0px';

                document.getElementById("graphContainer").appendChild(tbContainer);

				var outline = document.getElementById('outlineContainer');
                // Creates new toolbar without event processing
                var toolbar = new mxToolbar(tbContainer);
                toolbar.enabled = false

                // Creates the div for the graph
                var container = document.createElement('div');
                container.style.position = 'absolute';
                container.style.overflow = 'hidden';
                container.style.left = '24px';
                container.style.top = '0px';
                container.style.right = '0px';
                container.style.bottom = '0px';
                container.style.background = 'url("assets/img/grid.gif")';

                document.getElementById("graphContainer").appendChild(container);

                // Workaround for Internet Explorer ignoring certain styles
                if (mxClient.IS_QUIRKS) {
                    document.body.style.overflow = 'hidden';
                    new mxDivResizer(tbContainer);
                    new mxDivResizer(container);
					new mxDivResizer(outline);
                }
                
                // Creates the model and the graph inside the container
                // using the fastest rendering available on the browser
                var model = new mxGraphModel();
                var graph = new mxGraph(container, model);

				// Creates the outline (navigator, overview) for moving
				// around the graph in the top, right corner of the window.
				var outln = new mxOutline(graph, outline);

                // Optional disabling of sizing
                graph.setCellsResizable(true);

                // Enables new connections in the graph
                graph.setConnectable(true);
                graph.setMultigraph(false);

                // Stops editing on enter or escape keypress
                var keyHandler = new mxKeyHandler(graph);
                var rubberband = new mxRubberband(graph);

                var addVertex = function (icon, w, h, style) {
                    var vertex = new mxCell(null, new mxGeometry(0, 0, w, h), style);
                    vertex.setVertex(true);

                    var img = addToolbarItem(graph, toolbar, vertex, icon);
                    img.enabled = true;

                    graph.getSelectionModel().addListener(mxEvent.CHANGE, function () {
                        var tmp = graph.isSelectionEmpty();
                        mxUtils.setOpacity(img, (tmp) ? 100 : 20);
                        img.enabled = tmp;
                    });
                };

                addVertex('assets/img/rectangle.gif', 100, 60, 'rounded=0;fillColor=#FFF26D;strokeColor=#FFC928');
                addVertex('assets/img/rounded.gif', 100, 60, 'rounded=1;fillColor=#4286F4;strokeColor=#2E6CD1');
                addVertex('assets/img/rectangle.gif', 100, 60, 'rounded=0;fillColor=#EEEEEE;strokeColor=#333333');

                // Adds an option to view the XML of the graph
                document.getElementById("modelOptions").appendChild(mxUtils.button('View XML', function () {
                    var encoder = new mxCodec();
                    var node = encoder.encode(graph.getModel());
                    //mxUtils.popup(mxUtils.getPrettyXml(node), true);
                    console.log(mxUtils.getPrettyXml(node));
                    var pre = document.createElement("pre");
                    var textnode = document.createTextNode(mxUtils.getPrettyXml(node));
                    pre.appendChild(textnode);
                    document.getElementById("xmlContainer").removeChild(document.getElementById("xmlContainer").childNodes[0]);
                    document.getElementById("xmlContainer").appendChild(pre);
                }));

                // Reference to the transition checkbox
                var animate = document.getElementById('animate');

                // Reference to the Vertical checkbox
                var vertical = document.getElementById('vertical');

                // Creates a layout algorithm to be used
                // with the graph
                var layout = new mxCompactTreeLayout(graph);

                // Moves stuff wider apart than usual
                layout.forceConstant = 140;

                // Adds a button to execute the layout
                document.getElementById("modelOptions").appendChild(mxUtils.button('Arrange', function (evt) {
                    var parent = graph.getDefaultParent();
                    layout.execute(parent);
                    graph.getModel().beginUpdate();
                    try {
                        // Creates a layout algorithm to be used
                        // with the graph
                        var treeLayout = new mxCompactTreeLayout(graph);
                        // Moves stuff wider apart than usual
                        treeLayout.forceConstant = 140;
                        if (vertical.checked) {
                            treeLayout.horizontal = false
                        }
                        treeLayout.execute(parent);
                    } catch (e) {
                        throw e;
                    } finally {
                        if (animate.checked) {
                            var morph = new mxMorphing(graph);
                            morph.addListener(mxEvent.DONE, function () {
                                graph.getModel().endUpdate();
                            });

                            morph.startAnimation();
                        } else {
                            graph.getModel().endUpdate();
                        }
                    }
                }));
                
				graph.centerZoom = true;
				
				document.getElementById("modelOptions").appendChild(mxUtils.button('Zoom In', function()
				{
					graph.zoomIn();
				}));

				document.getElementById("modelOptions").appendChild(mxUtils.button('Zoom Out', function()
				{
					graph.zoomOut();
				}));

				document.getElementById("modelOptions").appendChild(mxUtils.button('Zoom Actual', function()
				{
					graph.zoomActual();
				}));

				document.getElementById("modelOptions").appendChild(mxUtils.button('Fit', function()
				{
					graph.fit();
				}));
            }
        }

        function addToolbarItem(graph, toolbar, prototype, image) {
            // Function that is executed when the image is dropped on
            // the graph. The cell argument points to the cell under
            // the mousepointer if there is one.
            var funct = function (graph, evt, cell, x, y) {
                graph.stopEditing(false);

                var vertex = graph.getModel().cloneCell(prototype);
                vertex.geometry.x = x;
                vertex.geometry.y = y;

                graph.addCell(vertex);
                graph.setSelectionCell(vertex);
            }

            // Creates the image which is used as the drag icon (preview)
            var img = toolbar.addMode(null, image, function (evt, cell) {
                var pt = this.graph.getPointForEvent(evt);
                funct(graph, evt, cell, pt.x, pt.y);
            });

            // Disables dragging if element is disabled. This is a workaround
            // for wrong event order in IE. Following is a dummy listener that
            // is invoked as the last listener in IE.
            mxEvent.addListener(img, 'mousedown', function (evt) {
                // do nothing
            });

            // This listener is always called first before any other listener
            // in all browsers.
            mxEvent.addListener(img, 'mousedown', function (evt) {
                if (img.enabled == false) {
                    mxEvent.consume(evt);
                }
            });

            mxUtils.makeDraggable(img, graph, funct);

            return img;
        }