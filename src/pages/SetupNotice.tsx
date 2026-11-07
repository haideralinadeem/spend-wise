import ThemeToggle from '../components/common/ThemeToggle'

export default function SetupNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="card w-full max-w-lg">
        <h1 className="text-xl font-semibold">Connect SpendWise to Supabase</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          The app cannot find your Supabase keys yet. To fix this:
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>Copy the file <code>.env.example</code> and name the copy <code>.env</code>.</li>
          <li>Paste your Project URL and anon key into it (Supabase, Project Settings, API).</li>
          <li>Stop the app, run <code>npm run dev</code> again, and refresh this page.</li>
        </ol>
      </div>
    </div>
  )
}
