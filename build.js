const { marked } = require('marked');
const fs = require('fs');

const content = fs.readFileSync('index.md', 'utf-8');
const body = marked(content);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>rwsdk + AT Protocol Starter</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,600;1,400&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-cream: #f4eedf;
      --color-orange: #f47238;
      --color-orange-light: #ffad48;
      --font-playfair: "Playfair Display", serif;
      --font-noto: "Noto Sans", sans-serif;
      --text-color: #1a1a1a;
      --code-bg: #1b1b1b;
    }

    *, *::before, *::after { box-sizing: border-box; }

    body {
      background-color: var(--color-cream);
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 860px;
      margin: 0 auto;
      padding: 5rem 2rem;
      font-family: var(--font-noto);
      color: var(--text-color);
      min-height: 100vh;
    }

    h1 {
      font-family: var(--font-playfair);
      font-size: 4rem;
      font-weight: bold;
      line-height: 0.9;
      margin: 0 0 0.75rem;
    }

    h2 {
      font-family: var(--font-playfair);
      font-size: 2rem;
      font-weight: bold;
      margin: 3.5rem 0 0.75rem;
    }

    h3 {
      font-family: var(--font-playfair);
      font-size: 1.5rem;
      font-weight: bold;
      margin: 2rem 0 0.5rem;
    }

    p {
      font-size: 1.125rem;
      line-height: 1.7;
      margin: 0.5rem 0 1rem;
    }

    a {
      color: var(--color-orange);
      font-weight: bold;
      text-decoration: none;
    }

    a:hover {
      color: var(--color-orange-light);
    }

    ul, ol {
      padding-left: 1.5rem;
      font-size: 1.125rem;
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    li {
      margin-bottom: 0.4rem;
    }

    code {
      background-color: rgba(0, 0, 0, 0.08);
      padding: 0.1em 0.35em;
      border-radius: 3px;
      font-family: monospace;
      font-size: 0.9em;
    }

    pre {
      background-color: var(--code-bg);
      color: var(--color-orange-light);
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      font-family: monospace;
      font-size: 1rem;
      overflow-x: auto;
      margin-bottom: 1rem;
    }

    pre code {
      background: none;
      padding: 0;
      border-radius: 0;
      font-size: inherit;
      color: inherit;
    }
  </style>
</head>
<body>
  <div class="container">
    ${body}
  </div>
</body>
</html>`;

fs.writeFileSync('index.html', html);
console.log('Built index.html');
