'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  LayoutDashboard, Users, Gamepad2, ShoppingCart, Server, Bug, FileText,
  LogOut, Menu, X, Moon, Sun, ChevronDown, Search, RefreshCw,
  TrendingUp, TrendingDown, Activity, DollarSign, AlertTriangle,
  CheckCircle, Clock, Eye, Edit, Trash2, Plus, Download, Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useTheme } from 'next-themes'
import { useToast } from '@/hooks/use-toast'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts'

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

// Login Page Component
function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const result = await login(email, password)
    
    if (result.success) {
      toast({
        title: 'Login Successful',
        description: 'Welcome to MIS Dashboard!'
      })
    } else {
      setError(result.error || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Gamepad2 className="h-12 w-12 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl">MIS Video Game</CardTitle>
          <CardDescription>Management Information System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-sm text-muted-foreground">
            <p className="font-medium mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs">
              <p><span className="font-medium">Admin:</span> admin@videogame.com / admin123</p>
              <p><span className="font-medium">Developer:</span> developer@videogame.com / dev123</p>
              <p><span className="font-medium">Manager:</span> manager@videogame.com / manager123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Dashboard Component
function Dashboard() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch dashboard overview
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/overview')
      if (!res.ok) throw new Error('Failed to fetch overview')
      return res.json()
    }
  })

  // Fetch player activity
  const { data: playerActivity } = useQuery({
    queryKey: ['dashboard', 'player-activity'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/player-activity?days=14')
      if (!res.ok) throw new Error('Failed to fetch player activity')
      return res.json()
    }
  })

  // Fetch revenue data
  const { data: revenueData } = useQuery({
    queryKey: ['dashboard', 'revenue'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/revenue?months=6')
      if (!res.ok) throw new Error('Failed to fetch revenue')
      return res.json()
    }
  })

  // Fetch players
  const { data: playersData, isLoading: playersLoading } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const res = await fetch('/api/players?limit=100')
      if (!res.ok) throw new Error('Failed to fetch players')
      return res.json()
    }
  })

  // Fetch games
  const { data: games, isLoading: gamesLoading } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const res = await fetch('/api/games')
      if (!res.ok) throw new Error('Failed to fetch games')
      return res.json()
    }
  })

  // Fetch purchases
  const { data: purchasesData, isLoading: purchasesLoading } = useQuery({
    queryKey: ['purchases'],
    queryFn: async () => {
      const res = await fetch('/api/purchases?limit=100')
      if (!res.ok) throw new Error('Failed to fetch purchases')
      return res.json()
    }
  })

  // Fetch servers
  const { data: servers, isLoading: serversLoading } = useQuery({
    queryKey: ['servers'],
    queryFn: async () => {
      const res = await fetch('/api/servers')
      if (!res.ok) throw new Error('Failed to fetch servers')
      return res.json()
    }
  })

  // Fetch bugs
  const { data: bugsData, isLoading: bugsLoading } = useQuery({
    queryKey: ['bugs'],
    queryFn: async () => {
      const res = await fetch('/api/bugs?limit=100')
      if (!res.ok) throw new Error('Failed to fetch bugs')
      return res.json()
    }
  })

  // Fetch reports
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await fetch('/api/reports?limit=50')
      if (!res.ok) throw new Error('Failed to fetch reports')
      return res.json()
    }
  })

  // Fetch users for assignee dropdown
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users')
      if (!res.ok) return []
      return res.json()
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
      case 'ACTIVE':
      case 'COMPLETED':
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-emerald-500'
      case 'MAINTENANCE':
      case 'PENDING':
      case 'IN_PROGRESS':
        return 'bg-amber-500'
      case 'OFFLINE':
      case 'INACTIVE':
      case 'FAILED':
      case 'BANNED':
        return 'bg-red-500'
      case 'OPEN':
        return 'bg-blue-500'
      case 'DEPRECATED':
      case 'REFUNDED':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500'
      case 'HIGH':
        return 'bg-orange-500'
      case 'MEDIUM':
        return 'bg-amber-500'
      case 'LOW':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'players', label: 'Players', icon: Users },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
    { id: 'servers', label: 'Servers', icon: Server },
    { id: 'bugs', label: 'Bug Reports', icon: Bug },
    { id: 'reports', label: 'Reports', icon: FileText },
  ]

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-card border-r transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-emerald-600" />
              <span className="font-bold text-lg">MIS</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
        
        <nav className="flex-1 p-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'secondary' : 'ghost'}
              className={`w-full justify-start mb-1 ${!sidebarOpen && 'px-2'}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="h-4 w-4" />
              {sidebarOpen && <span className="ml-2">{item.label}</span>}
            </Button>
          ))}
        </nav>

        <div className="p-2 border-t">
          <Button
            variant="ghost"
            className={`w-full justify-start ${!sidebarOpen && 'px-2'}`}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {sidebarOpen && <span className="ml-2">Toggle Theme</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-card border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">
              {menuItems.find(item => item.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => queryClient.invalidateQueries()}
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role?.toLowerCase()}</p>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {overviewLoading ? (
                      <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{overview?.players?.total?.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                          <span className="text-emerald-500">+{overview?.players?.recent}</span> in last 24h
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Active Games</CardTitle>
                    <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {overviewLoading ? (
                      <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{overview?.games?.active}</div>
                        <p className="text-xs text-muted-foreground">
                          of {overview?.games?.total} total games
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {overviewLoading ? (
                      <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">${overview?.revenue?.total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground">
                          <span className="text-emerald-500">+${overview?.revenue?.recent?.toFixed(2)}</span> today
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Server Status</CardTitle>
                    <Server className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {overviewLoading ? (
                      <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{overview?.servers?.online}/{overview?.servers?.total}</div>
                        <p className="text-xs text-muted-foreground">
                          {overview?.servers?.totalPlayers?.toLocaleString()} players online
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Player Activity Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Player Activity</CardTitle>
                    <CardDescription>New player registrations over the last 14 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {playerActivity?.dailyActivity && (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={playerActivity.dailyActivity}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(value) => value.slice(5)}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Area 
                              type="monotone" 
                              dataKey="newPlayers" 
                              stroke="#10b981" 
                              fill="#10b981" 
                              fillOpacity={0.3}
                              name="New Players"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Revenue</CardTitle>
                    <CardDescription>Revenue over the last 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {revenueData?.monthlyRevenue && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={revenueData.monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="month" 
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']} />
                            <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue by Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Item Type</CardTitle>
                  <CardDescription>Distribution of revenue across item categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="h-[250px]">
                      {revenueData?.revenueByType && (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={revenueData.revenueByType}
                              dataKey="revenue"
                              nameKey="type"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ type, percentage }) => `${type}: ${percentage.toFixed(1)}%`}
                            >
                              {revenueData.revenueByType.map((_: unknown, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                    <div className="space-y-2">
                      {revenueData?.revenueByType?.map((item: { type: string; revenue: number; percentage: number }, index: number) => (
                        <div key={item.type} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="capitalize">{item.type}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${item.revenue.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bug Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Bug Report Summary</CardTitle>
                  <CardDescription>Current status of bug reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-500">{overview?.bugs?.open || 0}</p>
                      <p className="text-sm text-muted-foreground">Open</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-500">{overview?.bugs?.critical || 0}</p>
                      <p className="text-sm text-muted-foreground">Critical</p>
                    </div>
                    <Button variant="outline" onClick={() => setActiveTab('bugs')}>
                      View All Bugs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Players Tab */}
          {activeTab === 'players' && (
            <PlayersTab 
              playersData={playersData} 
              isLoading={playersLoading}
              getStatusColor={getStatusColor}
            />
          )}

          {/* Games Tab */}
          {activeTab === 'games' && (
            <GamesTab 
              games={games} 
              isLoading={gamesLoading}
              getStatusColor={getStatusColor}
            />
          )}

          {/* Purchases Tab */}
          {activeTab === 'purchases' && (
            <PurchasesTab 
              purchasesData={purchasesData}
              isLoading={purchasesLoading}
              getStatusColor={getStatusColor}
              queryClient={queryClient}
            />
          )}

          {/* Servers Tab */}
          {activeTab === 'servers' && (
            <ServersTab 
              servers={servers}
              isLoading={serversLoading}
              getStatusColor={getStatusColor}
              queryClient={queryClient}
            />
          )}

          {/* Bugs Tab */}
          {activeTab === 'bugs' && (
            <BugsTab 
              bugsData={bugsData}
              isLoading={bugsLoading}
              getStatusColor={getStatusColor}
              getSeverityColor={getSeverityColor}
              games={games}
              users={users}
              queryClient={queryClient}
              toast={toast}
            />
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <ReportsTab 
              reportsData={reportsData}
              isLoading={reportsLoading}
              queryClient={queryClient}
              toast={toast}
            />
          )}
        </main>
      </div>
    </div>
  )
}

// Players Tab Component
function PlayersTab({ playersData, isLoading, getStatusColor }: {
  playersData: { players: unknown[]; total: number } | undefined
  isLoading: boolean
  getStatusColor: (status: string) => string
}) {
  const [search, setSearch] = useState('')

  const filteredPlayers = playersData?.players?.filter((player: { username: string; email: string }) =>
    (player as { username: string; email: string }).username.toLowerCase().includes(search.toLowerCase()) ||
    (player as { username: string; email: string }).email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Total: {playersData?.total || 0} players
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>XP</TableHead>
                  <TableHead>Play Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  filteredPlayers?.map((player: unknown) => {
                    const p = player as {
                      id: string
                      username: string
                      email: string
                      level: number
                      xp: number
                      totalPlayTime: number
                      status: string
                      createdAt: string
                    }
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.username}</TableCell>
                        <TableCell>{p.email}</TableCell>
                        <TableCell>{p.level}</TableCell>
                        <TableCell>{p.xp?.toLocaleString()}</TableCell>
                        <TableCell>{Math.floor(p.totalPlayTime / 60)}h {p.totalPlayTime % 60}m</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(p.status)} text-white`}>
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// Games Tab Component
function GamesTab({ games, isLoading, getStatusColor }: {
  games: unknown[] | undefined
  isLoading: boolean
  getStatusColor: (status: string) => string
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          games?.map((game: unknown) => {
            const g = game as {
              id: string
              title: string
              genre: string
              status: string
              playerCount: number
              releaseDate: string | null
              _count?: { purchases: number; bugReports: number }
            }
            return (
              <Card key={g.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{g.title}</CardTitle>
                      <CardDescription>{g.genre}</CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(g.status)} text-white`}>
                      {g.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Players</span>
                      <span className="font-medium">{g.playerCount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Purchases</span>
                      <span className="font-medium">{g._count?.purchases || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bug Reports</span>
                      <span className="font-medium">{g._count?.bugReports || 0}</span>
                    </div>
                    {g.releaseDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Released</span>
                        <span className="font-medium">{new Date(g.releaseDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

// Purchases Tab Component
function PurchasesTab({ purchasesData, isLoading, getStatusColor }: {
  purchasesData: { purchases: unknown[]; total: number } | undefined
  isLoading: boolean
  getStatusColor: (status: string) => string
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const [filterType, setFilterType] = useState('all')

  const filteredPurchases = purchasesData?.purchases?.filter((purchase: unknown) => {
    if (filterType === 'all') return true
    return (purchase as { itemType: string }).itemType === filterType
  })

  const totalRevenue = purchasesData?.purchases
    ?.filter((p: unknown) => (p as { status: string }).status === 'COMPLETED')
    .reduce((sum: number, p: unknown) => sum + (p as { amount: number }).amount, 0) || 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchasesData?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${purchasesData?.total ? (totalRevenue / purchasesData.total).toFixed(2) : '0.00'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Filter by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="skin">Skin</SelectItem>
                <SelectItem value="weapon">Weapon</SelectItem>
                <SelectItem value="currency">Currency</SelectItem>
                <SelectItem value="battle_pass">Battle Pass</SelectItem>
                <SelectItem value="character">Character</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
                <SelectItem value="emote">Emote</SelectItem>
                <SelectItem value="bundle">Bundle</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  filteredPurchases?.map((purchase: unknown) => {
                    const p = purchase as {
                      id: string
                      player: { username: string }
                      game: { title: string }
                      itemName: string
                      itemType: string
                      amount: number
                      currency: string
                      status: string
                      createdAt: string
                    }
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.player?.username || 'N/A'}</TableCell>
                        <TableCell>{p.game?.title || 'N/A'}</TableCell>
                        <TableCell>{p.itemName}</TableCell>
                        <TableCell className="capitalize">{p.itemType}</TableCell>
                        <TableCell>${p.amount.toFixed(2)} {p.currency}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(p.status)} text-white`}>
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// Servers Tab Component
function ServersTab({ servers, isLoading, getStatusColor }: {
  servers: unknown[] | undefined
  isLoading: boolean
  getStatusColor: (status: string) => string
  queryClient: ReturnType<typeof useQueryClient>
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          servers?.map((server: unknown) => {
            const s = server as {
              id: string
              name: string
              region: string
              status: string
              playerCount: number
              maxPlayers: number
              cpuUsage: number
              memoryUsage: number
              lastPing: string | null
            }
            const usagePercent = (s.playerCount / s.maxPlayers) * 100
            return (
              <Card key={s.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{s.name}</CardTitle>
                      <CardDescription>{s.region}</CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(s.status)} text-white`}>
                      {s.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Players</span>
                      <span>{s.playerCount}/{s.maxPlayers}</span>
                    </div>
                    <Progress value={usagePercent} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU</span>
                        <span>{s.cpuUsage.toFixed(1)}%</span>
                      </div>
                      <Progress value={s.cpuUsage} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory</span>
                        <span>{s.memoryUsage.toFixed(1)}%</span>
                      </div>
                      <Progress value={s.memoryUsage} className="h-2" />
                    </div>
                  </div>

                  {s.lastPing && (
                    <p className="text-xs text-muted-foreground">
                      Last ping: {new Date(s.lastPing).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

// Bugs Tab Component
function BugsTab({ bugsData, isLoading, getStatusColor, getSeverityColor, games, users, queryClient, toast }: {
  bugsData: { bugs: unknown[]; total: number } | undefined
  isLoading: boolean
  getStatusColor: (status: string) => string
  getSeverityColor: (severity: string) => string
  games: unknown[] | undefined
  users: unknown[] | undefined
  queryClient: ReturnType<typeof useQueryClient>
  toast: ReturnType<typeof useToast>['toast']
}) {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedBug, setSelectedBug] = useState<{
    id: string
    title: string
    description: string | null
    severity: string
    status: string
    gameId: string | null
    assignedTo: string | null
  } | null>(null)
  const [newBug, setNewBug] = useState({ title: '', description: '', severity: 'MEDIUM', gameId: '__none__', assignedTo: '__unassigned__' })

  const filteredBugs = bugsData?.bugs?.filter((bug: unknown) => {
    const b = bug as { status: string; severity: string }
    if (filterStatus !== 'all' && b.status !== filterStatus) return false
    if (filterSeverity !== 'all' && b.severity !== filterSeverity) return false
    return true
  })

  const createBugMutation = useMutation({
    mutationFn: async (data: typeof newBug) => {
      const payload = {
        ...data,
        gameId: data.gameId === '__none__' ? '' : data.gameId,
        assignedTo: data.assignedTo === '__unassigned__' ? '' : data.assignedTo
      }
      const res = await fetch('/api/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to create bug')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs'] })
      setCreateDialogOpen(false)
      setNewBug({ title: '', description: '', severity: 'MEDIUM', gameId: '__none__', assignedTo: '__unassigned__' })
      toast({ title: 'Bug created successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to create bug', variant: 'destructive' })
    }
  })

  const updateBugMutation = useMutation({
    mutationFn: async (data: { id: string; title?: string; description?: string; severity?: string; status?: string; assignedTo?: string | null; gameId?: string | null }) => {
      const res = await fetch(`/api/bugs/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update bug')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs'] })
      setEditDialogOpen(false)
      setSelectedBug(null)
      toast({ title: 'Bug updated successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to update bug', variant: 'destructive' })
    }
  })

  const updateBugStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/bugs/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!res.ok) throw new Error('Failed to update status')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs'] })
      toast({ title: 'Status updated' })
    }
  })

  const handleEditBug = (bug: unknown) => {
    const b = bug as {
      id: string
      title: string
      description: string | null
      severity: string
      status: string
      gameId: string | null
      assignedTo: string | null
    }
    setSelectedBug({
      id: b.id,
      title: b.title,
      description: b.description,
      severity: b.severity,
      status: b.status,
      gameId: b.gameId || '__none__',
      assignedTo: b.assignedTo || '__unassigned__'
    })
    setEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Bug Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Bug Report</DialogTitle>
              <DialogDescription>Report a new bug or issue</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={newBug.title}
                  onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
                  placeholder="Bug title"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newBug.description}
                  onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
                  placeholder="Describe the bug..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={newBug.severity} onValueChange={(v) => setNewBug({ ...newBug, severity: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Game</Label>
                  <Select value={newBug.gameId} onValueChange={(v) => setNewBug({ ...newBug, gameId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select game" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {games?.map((game: unknown) => {
                        const g = game as { id: string; title: string }
                        return (
                          <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select value={newBug.assignedTo} onValueChange={(v) => setNewBug({ ...newBug, assignedTo: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__unassigned__">Unassigned</SelectItem>
                    {users?.map((user: unknown) => {
                      const u = user as { id: string; name: string; email: string }
                      return (
                        <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => createBugMutation.mutate(newBug)} disabled={!newBug.title || createBugMutation.isPending}>
                {createBugMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredBugs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No bug reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBugs?.map((bug: unknown) => {
                    const b = bug as {
                      id: string
                      title: string
                      severity: string
                      status: string
                      game: { title: string } | null
                      reporter: { name: string | null; email: string } | null
                      assignee: { name: string | null; email: string } | null
                      createdAt: string
                    }
                    return (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">{b.title}</TableCell>
                        <TableCell>
                          <Badge className={`${getSeverityColor(b.severity)} text-white`}>
                            {b.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={b.status}
                            onValueChange={(v) => updateBugStatusMutation.mutate({ id: b.id, status: v })}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <Badge className={`${getStatusColor(b.status)} text-white`}>
                                {b.status.replace('_', ' ')}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OPEN">Open</SelectItem>
                              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                              <SelectItem value="RESOLVED">Resolved</SelectItem>
                              <SelectItem value="CLOSED">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{b.game?.title || 'N/A'}</TableCell>
                        <TableCell>{b.reporter?.name || b.reporter?.email || 'Unknown'}</TableCell>
                        <TableCell>{b.assignee?.name || b.assignee?.email || 'Unassigned'}</TableCell>
                        <TableCell>{new Date(b.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditBug(b)} title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Bug Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bug Report</DialogTitle>
            <DialogDescription>Update bug details</DialogDescription>
          </DialogHeader>
          {selectedBug && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={selectedBug.title}
                  onChange={(e) => setSelectedBug({ ...selectedBug, title: e.target.value })}
                  placeholder="Bug title"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={selectedBug.description || ''}
                  onChange={(e) => setSelectedBug({ ...selectedBug, description: e.target.value })}
                  placeholder="Describe the bug..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={selectedBug.severity} onValueChange={(v) => setSelectedBug({ ...selectedBug, severity: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={selectedBug.status} onValueChange={(v) => setSelectedBug({ ...selectedBug, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Game</Label>
                  <Select value={selectedBug.gameId || '__none__'} onValueChange={(v) => setSelectedBug({ ...selectedBug, gameId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select game" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {games?.map((game: unknown) => {
                        const g = game as { id: string; title: string }
                        return (
                          <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select value={selectedBug.assignedTo || '__unassigned__'} onValueChange={(v) => setSelectedBug({ ...selectedBug, assignedTo: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__unassigned__">Unassigned</SelectItem>
                      {users?.map((user: unknown) => {
                        const u = user as { id: string; name: string; email: string }
                        return (
                          <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => selectedBug && updateBugMutation.mutate({
                id: selectedBug.id,
                title: selectedBug.title,
                description: selectedBug.description,
                severity: selectedBug.severity,
                status: selectedBug.status,
                assignedTo: selectedBug.assignedTo === '__unassigned__' ? null : selectedBug.assignedTo || null,
                gameId: selectedBug.gameId === '__none__' ? null : selectedBug.gameId || null
              })}
              disabled={!selectedBug?.title || updateBugMutation.isPending}
            >
              {updateBugMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Reports Tab Component
function ReportsTab({ reportsData, isLoading, queryClient, toast }: {
  reportsData: { reports: unknown[]; total: number } | undefined
  isLoading: boolean
  queryClient: ReturnType<typeof useQueryClient>
  toast: ReturnType<typeof useToast>['toast']
}) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<{
    id: string
    title: string
    type: string
    format: string
    data: string
    User: { name: string; email: string }
    createdAt: string
  } | null>(null)
  const [newReport, setNewReport] = useState({ title: '', type: 'DAILY', format: 'PDF' })

  const createReportMutation = useMutation({
    mutationFn: async (data: typeof newReport) => {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, data: {} })
      })
      if (!res.ok) throw new Error('Failed to create report')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      setCreateDialogOpen(false)
      setNewReport({ title: '', type: 'DAILY', format: 'PDF' })
      toast({ title: 'Report generated successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to generate report', variant: 'destructive' })
    }
  })

  const handleExport = async (format: string, type: string, reportId?: string) => {
    try {
      const url = reportId 
        ? `/api/reports/export?reportId=${reportId}&format=${format}`
        : `/api/reports/export?format=${format}&type=${type}`
      
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to export')
      
      const blob = await res.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `${type.toLowerCase()}_report_${new Date().toISOString().split('T')[0]}.${format.toLowerCase() === 'pdf' ? 'html' : 'csv'}`
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      
      toast({ title: 'Report exported successfully' })
    } catch {
      toast({ title: 'Failed to export report', variant: 'destructive' })
    }
  }

  const handleViewReport = (report: unknown) => {
    const r = report as {
      id: string
      title: string
      type: string
      format: string
      data: string
      User: { name: string; email: string }
      createdAt: string
    }
    setSelectedReport(r)
    setViewDialogOpen(true)
  }

  const renderReportContent = (reportData: string, type: string) => {
    let data: Record<string, unknown> = {}
    try {
      data = JSON.parse(reportData)
    } catch {
      return <p className="text-muted-foreground">No data available</p>
    }

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.newPlayers !== undefined && (
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>New Players</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.newPlayers}</div>
              </CardContent>
            </Card>
          )}
          {data.totalPurchases !== undefined && (
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Purchases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalPurchases}</div>
              </CardContent>
            </Card>
          )}
          {data.revenue !== undefined && (
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${typeof data.revenue === 'number' ? data.revenue.toFixed(2) : data.revenue}</div>
              </CardContent>
            </Card>
          )}
          {data.newBugs !== undefined && (
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>New Bugs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{data.newBugs}</div>
              </CardContent>
            </Card>
          )}
          {data.resolvedBugs !== undefined && (
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Resolved Bugs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{data.resolvedBugs}</div>
              </CardContent>
            </Card>
          )}
          {data.period && (
            <Card className="col-span-2">
              <CardHeader className="pb-2">
                <CardDescription>Period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">{data.period as string}</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Players by Status Chart */}
        {Array.isArray(data.playersByStatus) && data.playersByStatus.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Players by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.playersByStatus.map((p: { status: string; _count: { id: number } }) => ({
                      name: p.status,
                      value: p._count.id
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {data.playersByStatus.map((_: unknown, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Purchases by Type Chart */}
        {Array.isArray(data.purchasesByType) && data.purchasesByType.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Purchases by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.purchasesByType.map((p: { itemType: string; _count: { id: number }; _sum: { amount: number | null } }) => ({
                  name: p.itemType,
                  count: p._count.id,
                  amount: p._sum.amount || 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10b981" name="Count" />
                  <Bar dataKey="amount" fill="#3b82f6" name="Amount ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Bugs by Severity Chart */}
        {Array.isArray(data.bugsBySeverity) && data.bugsBySeverity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Bugs by Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.bugsBySeverity.map((b: { severity: string; _count: { id: number } }) => ({
                  name: b.severity,
                  count: b._count.id
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" name="Bugs" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Games Table */}
        {Array.isArray(data.games) && data.games.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Games Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Game</TableHead>
                    <TableHead>Players</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.games.map((game: { title: string; playerCount: number; status: string }, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{game.title}</TableCell>
                      <TableCell>{game.playerCount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={game.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {game.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Raw Data Toggle */}
        <details className="group">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            View Raw Data
          </summary>
          <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleExport('CSV', 'DAILY')}>
            <Download className="h-4 w-4 mr-2" />
            Export Daily CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('PDF', 'WEEKLY')}>
            <Download className="h-4 w-4 mr-2" />
            Export Weekly PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('CSV', 'MONTHLY')}>
            <Download className="h-4 w-4 mr-2" />
            Export Monthly CSV
          </Button>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Report</DialogTitle>
              <DialogDescription>Create a new report with current data</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  placeholder="Report title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newReport.type} onValueChange={(v) => setNewReport({ ...newReport, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={newReport.format} onValueChange={(v) => setNewReport({ ...newReport, format: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="CSV">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => createReportMutation.mutate(newReport)} disabled={!newReport.title || createReportMutation.isPending}>
                {createReportMutation.isPending ? 'Generating...' : 'Generate'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>Click on a report to view details</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Generated By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : reportsData?.reports?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No reports yet. Click "Generate Report" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  reportsData?.reports?.map((report: unknown) => {
                    const r = report as {
                      id: string
                      title: string
                      type: string
                      format: string
                      data: string
                      User: { name: string; email: string }
                      createdAt: string
                    }
                    return (
                      <TableRow 
                        key={r.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewReport(r)}
                      >
                        <TableCell className="font-medium">{r.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{r.type}</Badge>
                        </TableCell>
                        <TableCell>{r.format}</TableCell>
                        <TableCell>{r.User?.name || r.User?.email}</TableCell>
                        <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewReport(r)}
                              title="View Report"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleExport(r.format, r.type, r.id)}
                              title="Download Report"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* View Report Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>
              {selectedReport?.type} Report • Generated on {selectedReport && new Date(selectedReport.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            {selectedReport && renderReportContent(selectedReport.data, selectedReport.type)}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            {selectedReport && (
              <Button onClick={() => handleExport(selectedReport.format, selectedReport.type, selectedReport.id)}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Main Page Component
export default function Page() {
  const { user, initialized } = useAuth()

  // Show loading spinner until auth state is initialized (prevents hydration mismatch)
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return <Dashboard />
}
