# NEA Portfolio Marker

## How to deploy

1. Upload ALL files in this zip to a new GitHub repository
   (keeping the folder structure exactly as it is)

2. Connect the repo to Netlify
   - netlify.com → Add new site → Import from GitHub
   - Build command: npm run build
   - Publish directory: dist

3. Add your API key in Netlify
   - Site configuration → Environment variables
   - Key: ANTHROPIC_API_KEY
   - Value: your key starting with sk-ant-...

4. Trigger a deploy — your site is live!
