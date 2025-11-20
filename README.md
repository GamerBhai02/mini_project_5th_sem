<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# New Horizon College of Engineering - AI Chatbot

An intelligent chatbot application for New Horizon College of Engineering built with React, TypeScript, Vite, Google Gemini AI, and Supabase.

View your app in AI Studio: https://ai.studio/apps/drive/1PQh5BUnx4HU0g3g_KM3cVbgijD-fttBa

## Features

- 🤖 AI-powered chatbot using Google Gemini 2.5 Flash
- 🎤 Voice input support (Speech Recognition)
- 🔊 Text-to-speech for bot responses
- 🌍 Multi-language support
- 📄 Document management system with Supabase
- 🔐 Admin authentication for knowledge base management
- 📱 Responsive design with Tailwind CSS
- 🎨 Modern UI with carousel banner

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))
- Supabase account ([Sign up here](https://supabase.com))

## Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GamerBhai02/mini_project_5th_sem.git
   cd mini_project_5th_sem
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Create a `.env` file in the root directory (or copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your keys:
   ```env
   API_KEY=your_gemini_api_key_here
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase:**
   
   Run these SQL commands in your Supabase SQL editor:
   
   ```sql
   -- Create documents table
   CREATE TABLE IF NOT EXISTS documents (
     id SERIAL PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT NOT NULL,
     storage_path TEXT NOT NULL,
     status TEXT NOT NULL DEFAULT 'ready',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create storage bucket
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('knowledge-base', 'knowledge-base', false)
   ON CONFLICT (id) DO NOTHING;

   -- Enable RLS
   ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

   -- RLS Policies for authenticated users
   CREATE POLICY "Authenticated users can view documents"
     ON documents FOR SELECT
     TO authenticated
     USING (true);

   CREATE POLICY "Authenticated users can insert documents"
     ON documents FOR INSERT
     TO authenticated
     WITH CHECK (true);

   CREATE POLICY "Authenticated users can delete documents"
     ON documents FOR DELETE
     TO authenticated
     USING (true);

   -- Storage policies
   CREATE POLICY "Authenticated users can upload files"
     ON storage.objects FOR INSERT
     TO authenticated
     WITH CHECK (bucket_id = 'knowledge-base');

   CREATE POLICY "Authenticated users can read files"
     ON storage.objects FOR SELECT
     TO authenticated
     USING (bucket_id = 'knowledge-base');

   CREATE POLICY "Authenticated users can delete files"
     ON storage.objects FOR DELETE
     TO authenticated
     USING (bucket_id = 'knowledge-base');
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to `http://localhost:5173`

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/GamerBhai02/mini_project_5th_sem)

### Manual Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set environment variables in Vercel:**
   - Go to your project in Vercel Dashboard
   - Navigate to Settings → Environment Variables
   - Add the following variables:
     - `API_KEY`: Your Gemini API key
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_ANON_KEY`: Your Supabase anon key

5. **Redeploy:**
   ```bash
   vercel --prod
   ```

## Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Project Structure

```
.
├── components/          # React components
│   ├── ChatWidget.tsx   # Main chat interface
│   ├── AdminModal.tsx   # Admin panel for document management
│   └── icons.tsx        # SVG icon components
├── lib/                 # Library code
│   └── supabaseClient.ts # Supabase configuration
├── App.tsx             # Main App component
├── index.tsx           # Entry point
├── types.ts            # TypeScript type definitions
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── vercel.json         # Vercel deployment configuration
```

## Technologies Used

- **Frontend:** React 18, TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **AI:** Google Gemini 2.5 Flash
- **Backend:** Supabase (Database + Storage + Auth)
- **Deployment:** Vercel

## Admin Features

- Login to access admin panel (click the settings icon in the chatbot)
- Upload documents to the knowledge base
- Manage existing documents
- Documents are automatically processed and made available to the AI

## Security Notes

- Never commit your `.env` file
- Keep your API keys secure
- Use Supabase RLS policies to protect your data
- Admin accounts must be created in Supabase Dashboard

## Contributing

Feel free to submit issues and pull requests.

## License

This project is part of a 5th semester mini-project for New Horizon College of Engineering.
