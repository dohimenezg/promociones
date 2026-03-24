const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src', 'pages');

const replaceInFile = (filepath) => {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // grid-2 with mb 1.5rem
    content = content.replace(/style=\{\{\s*display:\s*'grid',\s*gridTemplateColumns:\s*'1fr\s+1fr',\s*gap:\s*'1\.5rem',\s*marginBottom:\s*'1\.5rem'\s*\}\}/g, 'className="grid-2" style={{ marginBottom: "1.5rem" }}');
    // grid-2 without mb
    content = content.replace(/style=\{\{\s*display:\s*'grid',\s*gridTemplateColumns:\s*'1fr\s+1fr',\s*gap:\s*'1\.5rem'\s*\}\}/g, 'className="grid-2"');
    // grid-3 with mb 2rem
    content = content.replace(/style=\{\{\s*display:\s*'grid',\s*gridTemplateColumns:\s*'repeat\(3,\s*1fr\)',\s*gap:\s*'1\.5rem',\s*marginBottom:\s*'2rem'\s*\}\}/g, 'className="grid-3" style={{ marginBottom: "2rem" }}');
    // grid-4 with mb 1.5rem
    content = content.replace(/style=\{\{\s*display:\s*'grid',\s*gridTemplateColumns:\s*'repeat\(4,\s*1fr\)',\s*gap:\s*'1\.5rem',\s*marginBottom:\s*'1\.5rem'\s*\}\}/g, 'className="grid-4" style={{ marginBottom: "1.5rem" }}');
    // grid-2 with gap 1rem, background etc (from Clientes.jsx line 77)
    content = content.replace(/style=\{\{\s*display:\s*'grid',\s*gridTemplateColumns:\s*'1fr\s+1fr',\s*gap:\s*'1rem',\s*marginTop:\s*'1rem',\s*background:\s*'#F9FAFB',\s*padding:\s*'1rem',\s*borderRadius:\s*'6px',\s*border:\s*'1px solid #EAEAEA'\s*\}\}/g, 'className="grid-2" style={{ marginTop: "1rem", background: "#F9FAFB", padding: "1rem", borderRadius: "6px", border: "1px solid #EAEAEA", gap: "1rem" }}');

    fs.writeFileSync(filepath, content, 'utf8');
};

const files = fs.readdirSync(directory).filter(f => f.endsWith('.jsx'));
for (const file of files) {
    replaceInFile(path.join(directory, file));
}
console.log('done');
