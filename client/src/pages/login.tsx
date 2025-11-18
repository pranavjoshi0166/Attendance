import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useLocation } from 'wouter'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [, navigate] = useLocation()

  async function handleSignIn() {
    if (!supabase) {
      toast({ title: 'Auth disabled', description: 'Supabase is not configured', variant: 'destructive' })
      return
    }
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      navigate('/')
    } catch (e: any) {
      toast({ title: 'Sign in failed', description: e.message || 'Unknown error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp() {
    if (!supabase) return
    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      toast({ title: 'Check your email', description: 'Confirm your account to continue' })
    } catch (e: any) {
      toast({ title: 'Sign up failed', description: e.message || 'Unknown error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-full p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSignIn} disabled={loading}>Sign in</Button>
            <Button variant="outline" onClick={handleSignUp} disabled={loading}>Sign up</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}