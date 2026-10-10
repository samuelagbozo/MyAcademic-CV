# AI Resume Builder

## DeepSeek AI features

1. Copy `.env.example` to `.env.local`.
2. Set `DEEPSEEK_API_KEY` to your Token Harbor key (starts with `thk_`). Keep it server-side: do not prefix it with `VITE_` or commit `.env.local`.
3. Run `npm run dev`. Restart the dev server after changing environment variables.

AI requests are sent from the local server to `https://tokenharbor.ai/v1/chat/completions`. The app uses `DEEPSEEK_MODEL` when set and defaults to `deepseek-v4.1-flash:free`. Choose a model supported by your Token Harbor key if this default is unavailable. The API key is never sent to the browser.

In the builder's Summary step, enter a draft to polish or provide a prompt to generate a summary. Generated text replaces the current summary and appears in the preview. Summary text is sent to Token Harbor for processing.

## Import an existing resume

From the Home page, choose **Upload your resume with AI**, select a PDF, DOC, or DOCX file up to 8 MB, then choose **Analyze and import**. The server extracts readable text locally and sends it to DeepSeek to identify available personal details, summary, education, experience, projects, skills, certifications, achievements, and references. The app creates a new resume with those fields prefilled and opens it in the builder for review. Image-only or scanned PDFs without extractable text cannot be imported; OCR is not performed. Uploaded files are not stored by this app.

The builder includes a **Certifications** form step immediately after **Skills**. Add certification names, issuing organizations, issue and expiry dates, credential IDs, and verification URLs; saved entries also appear in the resume preview.

The **Custom Sections** step appears immediately before **References**. Add, edit, reorder, or remove custom sections; their sanitized rich-text content supports bold formatting and is preserved in saved resumes and print output. Sections with no title and no content are omitted from the preview.

## Rate a resume

The Home page's **Rate your resume with AI** section accepts text-based PDF and DOCX files up to 8 MB. After selecting a file and choosing **Rate my CV**, the app analyzes it and navigates to a dedicated results page with a 0–100 score dial. The server extracts document text locally and scores it against `server/assets/Academic Cv guide.pdf`. The guide does not define numeric weights; the server uses a documented 100-point rubric based on its priorities and final checklist. The results explain the evidence earning points and why points were deducted for each category, summarize strengths, mistakes, and missing content, and provide prioritized next steps in an HR manager's voice. The review is generated as strict JSON and validated before the dashboard is shown. Image-only or scanned PDFs without extractable text are rejected with an explanation; OCR is not performed. Extracted text is sent to Token Harbor for processing. Successful review results are saved to the signed-in user's AI review history with a timestamp; the uploaded file and extracted source text are not saved.

## Save resumes to MongoDB

Resume data is stored in MongoDB and scoped to the signed-in Clerk user. The backend also records the user's Clerk ID, email, phone number, name, username, profile image, account creation time, last login, and last activity. Resume documents include creation and last-saved timestamps; the Home page lists the most recently saved resumes first.

1. Copy `Server/.env.example` to `Server/.env`.
2. Set `MONGODB_URI` and `MONGODB_DB_NAME` for your MongoDB deployment, and set `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` from the same Clerk instance as `VITE_CLERK_PUBLISHABLE_KEY`.
3. In `my-app/.env.local`, set `VITE_API_URL=http://localhost:3000` and your `VITE_CLERK_PUBLISHABLE_KEY`.
4. Keep the backend running from `Server` with `npm start`, then start the frontend from `my-app` with `npm run dev`. The API allows both `localhost` and `127.0.0.1` on the Vite development and preview ports.

The API creates the `users`, `resumes`, and `reviews` collections and their indexes on startup. Existing browser-only resumes are not automatically imported into a user account.

## Resume and AI review history

Use **My resumes** in the top navigation to open the full saved-resume history. Use **AI reviews** to browse previous resume scores and recommendations. Successful AI reviews are saved to MongoDB with the source file name, full rating result, and review timestamp. Select a review to reopen its saved result; review history is scoped to the signed-in Clerk user. If analysis finishes but saving fails, the result stays available on the Home page and **Retry saving review** sends it to the database without repeating the analysis.

## Scripts

- `npm run dev` starts the Vite development server and its local AI API endpoints.
- `npm run build` creates a static production build.
- `npm run preview` previews the build and includes the local AI API endpoints.
