// Show the UI when the plugin is run
figma.showUI(__html__, { width: 400, height: 300 });

// Listen for selection changes and extract CSS
figma.on('selectionchange', () => {
    const selectedLayer = figma.currentPage.selection[0];

    if (selectedLayer) {
        const cssOutput = extractCSS(selectedLayer);
        figma.ui.postMessage({ type: 'css-output', css: cssOutput });
    } else {
        figma.ui.postMessage({ type: 'css-output', css: 'No layer selected.' });
    }
});

// Function to extract comprehensive CSS from the selected layer
function extractCSS(layer) {
    const css = [];

    css.push(`.${layer.name} {`);
    css.push(`  width: ${layer.width}px;`);
    css.push(`  height: ${layer.height}px;`);

    // Positioning
    if (layer.x !== undefined && layer.y !== undefined) {
        css.push(`  position: absolute;`);
        css.push(`  left: ${layer.x}px;`);
        css.push(`  top: ${layer.y}px;`);
    }

    // Flexbox properties (if applicable)
    if (layer.layoutMode) {
        css.push(`  display: flex;`);
        css.push(`  flex-direction: ${layer.layoutMode === 'HORIZONTAL' ? 'row' : 'column'};`);
        css.push(`  justify-content: ${getFlexJustify(layer)};`);
        css.push(`  align-items: ${getFlexAlign(layer)};`);
    }

    // Background color
    if (layer.fills && layer.fills.length > 0 && layer.fills[0].type === 'SOLID') {
        const fill = layer.fills[0].color;
        css.push(`  background-color: rgba(${Math.round(fill.r * 255)}, ${Math.round(fill.g * 255)}, ${Math.round(fill.b * 255)}, ${layer.fills[0].opacity});`);
    }

    // Border radius
    if (layer.cornerRadius) {
        css.push(`  border-radius: ${layer.cornerRadius}px;`);
    }

    // Display properties
    css.push(`  display: ${getDisplayType(layer)};`);

    // Shadow effects
    if (layer.effects) {
        layer.effects.forEach(effect => {
            if (effect.type === 'DROP_SHADOW') {
                css.push(`  box-shadow: ${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px rgba(${Math.round(effect.color.r * 255)}, ${Math.round(effect.color.g * 255)}, ${Math.round(effect.color.b * 255)}, ${effect.opacity});`);
            }
        });
    }

    css.push('}');
    return css.join('\n');
}

// Helper function to determine display type
function getDisplayType(layer) {
    return layer.layoutMode ? 'flex' : 'block';
}

// Helper functions for flexbox properties
function getFlexJustify(layer) {
    switch (layer.primaryAxisAlignItems) {
        case 'MIN': return 'flex-start';
        case 'MAX': return 'flex-end';
        case 'CENTER': return 'center';
        default: return 'flex-start';
    }
}

function getFlexAlign(layer) {
    switch (layer.counterAxisAlignItems) {
        case 'MIN': return 'flex-start';
        case 'MAX': return 'flex-end';
        case 'CENTER': return 'center';
        default: return 'stretch';
    }
}
