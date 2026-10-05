# AI Resume Builder

## Gemini summary generation

1. Copy `.env.example` to `.env.local`.
2. Set `GEMINI_API_KEY` in `.env.local` to your Google Gemini API key. Keep it server-side: do not prefix it with `VITE_` or commit `.env.local`.
3. Run `npm run dev`.

In the builder's Summary step, enter a draft to polish or provide a prompt to generate a summary. Generated text replaces the current summary and appears in the preview. Summary text is sent to Gemini for processing.

The API uses `GEMINI_MODEL` when set and defaults to `gemini-3.8-flash`.

## Import an existing resume

From the Home page, choose **Upload your resume with AI**, select a PDF, DOC, or DOCX file up to 8 MB, then choose **Analyze and import**. Gemini extracts the available personal details, summary, education, experience, projects, skills, achievements, and references. The app creates a new resume with those fields prefilled and opens it in the builder for review. PDF files are sent to Gemini; Word document text is extracted on the server and sent to Gemini. Uploaded file content is processed by Google Gemini and is not stored as a resume file by this app.

## Scripts

- `npm run dev` starts the Vite development server and its local Gemini API endpoint.
- `npm run build` creates a static production build.
- `npm run preview` previews the build and includes the local Gemini API endpoint.
