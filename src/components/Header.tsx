import { Bell, Search } from 'lucide-react'

function Header() {
  return (
    <div className="h-20 bg-dev-surface border-b border-dev-border flex items-center justify-between px-8">
     
      <div>
        <h1 className="text-2xl font-bold text-dev-text-main">Projects</h1>
        <p className="text-sm text-dev-text-muted">Manage your tasks with clarity</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dev-text-muted" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="bg-dev-card border border-dev-border rounded-lg px-10 py-2 text-dev-text-main placeholder-dev-text-muted focus:outline-none focus:border-dev-primary"
          />
        </div>
        <button className="relative p-2 bg-dev-card rounded-lg hover:bg-dev-border">
          <Bell className="w-5 h-5 text-dev-text-muted" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-dev-accent rounded-full"></span>
        </button>
        <div className="w-10 h-10 bg-dev-primary rounded-full flex items-center justify-center">
          <span className="text-white font-bold">S</span>
        </div>
      </div>
    </div>
  )
}

export default Header
