import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircle, Lock, User as UserIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/store/authStore'
import { ThemeToggle } from '@/components/ThemeToggle'
export function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const handleAuth = async (mode: 'login' | 'register') => {
    if (!username.trim() || !password.trim()) return
    setIsLoading(true)
    try {
      const authFn = mode === 'login' ? login : register
      await authFn({ username, password })
      const from = location.state?.from || '/'
      navigate(from, { replace: true })
    } catch (error) {
      // Error is already toasted in the store
      console.error(`${mode} failed:`, error)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="dark:bg-[rgb(23,24,28)] bg-[rgb(250,250,250)] text-foreground min-h-screen flex items-center justify-center p-4 relative">
      <ThemeToggle className="absolute top-6 right-6" />
      <div className="absolute inset-0 bg-grid-black/[0.05] dark:bg-grid-white/[0.05]" />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-primary text-primary-foreground w-16 h-16 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
            <MessageCircle size={32} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">EchoCrypt</h1>
          <p className="text-muted-foreground mt-2">Secure, minimalist, end-to-end encrypted chat.</p>
        </div>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Card className="border-0 shadow-none">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleAuth('login'); }} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signin-username">Username</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signin-username" placeholder="your_username" required className="pl-9" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isLoading} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signin-password" type="password" placeholder="••••••••" required className="pl-9" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className="border-0 shadow-none">
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>Choose a username and password to get started.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleAuth('register'); }} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-username" placeholder="choose_username" required className="pl-9" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isLoading} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-password" type="password" placeholder="••••••••" required className="pl-9" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}