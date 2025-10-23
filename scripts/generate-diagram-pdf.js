#!/usr/bin/env node

/**
 * Generate PDF from Mermaid diagram using mermaid-cli with Playwright
 * Fallback to creating a standalone HTML file if browser not available
 */

import { run } from '@mermaid-js/mermaid-cli';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function generatePDF() {
	const inputFile = join(projectRoot, 'docs/sequence-diagram.mmd');
	const outputFile = join(projectRoot, 'docs/sequence-diagram.pdf');
	const fallbackFile = join(projectRoot, 'docs/sequence-diagram.html');

	try {
		console.log('Attempting to generate PDF with mermaid-cli...');

		// Try to use mermaid-cli
		await run(inputFile, outputFile, {
			parseMMDOptions: {
				backgroundColor: 'white',
				width: 1200,
				height: 'auto'
			}
		});

		console.log('✅ PDF generated successfully:', outputFile);
	} catch (error) {
		console.warn('⚠️  mermaid-cli failed (likely no browser available):', error.message);
		console.log('📄 Creating standalone HTML file as fallback...');

		// Create a standalone HTML file that can be opened in any browser
		const mermaidCode = readFileSync(inputFile, 'utf-8');

		const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Go Instagram Pipeline - Sequence Diagram</title>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            sequence: {
                diagramMarginX: 50,
                diagramMarginY: 10,
                actorMargin: 50,
                width: 150,
                height: 65,
                boxMargin: 10,
                boxTextMargin: 5,
                noteMargin: 10,
                messageMargin: 35
            }
        });
    </script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            background: #f5f5f5;
            max-width: 1400px;
            margin: 0 auto;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
        }
        .print-note {
            background: #fffbea;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin-bottom: 30px;
            border-radius: 4px;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .container {
                box-shadow: none;
                padding: 20px;
            }
            .print-note {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI-Powered Instagram Reels Pipeline</h1>
        <p class="subtitle">Learn Go Education Content - Sequence Diagram</p>

        <div class="print-note">
            <strong>💡 To save as PDF:</strong> Press Ctrl+P (or Cmd+P on Mac) and select "Save as PDF" as the destination.
        </div>

        <div class="mermaid">
${mermaidCode}
        </div>
    </div>
</body>
</html>`;

		writeFileSync(fallbackFile, html);
		console.log('✅ Standalone HTML file created:', fallbackFile);
		console.log('📝 Open this file in a browser and use "Print to PDF" to create a PDF');
		console.log('   Or run: chromium --headless --print-to-pdf=docs/sequence-diagram.pdf ' + fallbackFile);
	}
}

generatePDF().catch(console.error);
