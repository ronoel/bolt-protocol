import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Helper to get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function removeComments(content, network) {
    // Handle mainnet case for .sbtc-token
    if (network === 'mainnet') {
        content = content.replace(/\.sbtc-token/g, "'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token");
    }
    
    // Remove specific impl-trait line
    content = content.replace(/\(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE\.sip-010-trait-ft-standard\.sip-010-trait\)/g, '');
    content = content.replace(/\(impl-trait .*\.sip-009-nft-trait\.nft-trait\)/g, '');
    // Remove single-line comments
    content = content.replace(/;;.*/g, '');
    // Remove multi-line comments (if any)
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove empty lines and lines with only whitespace
    content = content.replace(/^\s*[\r\n]/gm, '');
    // Remove multiple consecutive empty lines
    content = content.replace(/\n\s*\n/g, '\n');
    return content;
}

function processContracts(inputFolder, outputFolder, network) {
    const inputPath = path.join(__dirname, inputFolder);
    const outputPath = path.join(__dirname, outputFolder);

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    fs.readdirSync(inputPath).forEach(filename => {
        if (filename.endsWith('.clar')) {
            const inputFilePath = path.join(inputPath, filename);
            const outputFilePath = path.join(outputPath, filename);

            const content = fs.readFileSync(inputFilePath, 'utf8');
            const websiteComment = ';; Website: https://boltproto.org\n';
            const cleanedContent = websiteComment + removeComments(content, network);

            fs.writeFileSync(outputFilePath, cleanedContent, 'utf8');
        }
    });
}

// Get network from command line arguments
const network = process.argv[2] || 'testnet';
processContracts('contracts', 'contracts-deployeable', network);
