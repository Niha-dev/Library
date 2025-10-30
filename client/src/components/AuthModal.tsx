import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  registerUserSchema,
  loginUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type RegisterUser,
  type LoginUser,
} from "@shared/schema";
import { z } from "zod";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot' | 'reset';
  resetToken?: string;
}

export function AuthModal({ isOpen, onClose, initialMode = 'login', resetToken }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(initialMode);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginForm = useForm<LoginUser>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterUser>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', name: '', country: 'IN' },
  });

  const forgotForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: resetToken || '', password: '', confirmPassword: '' },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginUser) => apiRequest('POST', '/api/auth/login', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({ title: "Success", description: "Logged in successfully!" });
      onClose();
      loginForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Invalid credentials", 
        variant: "destructive" 
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterUser) => apiRequest('POST', '/api/auth/register', data),
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: "Account created! Please sign in." 
      });
      setMode('login');
      registerForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Registration failed", 
        variant: "destructive" 
      });
    },
  });

  const forgotMutation = useMutation({
    mutationFn: (data: z.infer<typeof forgotPasswordSchema>) => 
      apiRequest('POST', '/api/auth/forgot-password', data),
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: "Password reset link sent to your email!" 
      });
      forgotForm.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to send reset link", 
        variant: "destructive" 
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: (data: z.infer<typeof resetPasswordSchema>) => 
      apiRequest('POST', '/api/auth/reset-password', data),
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: "Password reset successful! Please sign in." 
      });
      setMode('login');
      resetForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to reset password", 
        variant: "destructive" 
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">
            {mode === 'login' && 'Sign In'}
            {mode === 'register' && 'Create Account'}
            {mode === 'forgot' && 'Reset Password'}
            {mode === 'reset' && 'New Password'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'login' && (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="you@example.com" 
                        data-testid="input-login-email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        data-testid="input-login-password"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="link"
                className="px-0 text-sm"
                onClick={() => setMode('forgot')}
                data-testid="link-forgot-password"
              >
                Forgot password?
              </Button>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
                data-testid="button-login-submit"
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Don't have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="px-0"
                  onClick={() => setMode('register')}
                  data-testid="link-register"
                >
                  Sign up
                </Button>
              </p>
            </form>
          </Form>
        )}

        {mode === 'register' && (
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your name" 
                        data-testid="input-register-name"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="you@example.com" 
                        data-testid="input-register-email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        data-testid="input-register-password"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        data-testid="input-register-confirm-password"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={registerMutation.isPending}
                data-testid="button-register-submit"
              >
                {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="px-0"
                  onClick={() => setMode('login')}
                  data-testid="link-login"
                >
                  Sign in
                </Button>
              </p>
            </form>
          </Form>
        )}

        {mode === 'forgot' && (
          <Form {...forgotForm}>
            <form onSubmit={forgotForm.handleSubmit((data) => forgotMutation.mutate(data))} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <FormField
                control={forgotForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="you@example.com" 
                        data-testid="input-forgot-email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={forgotMutation.isPending}
                data-testid="button-forgot-submit"
              >
                {forgotMutation.isPending ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setMode('login')}
                data-testid="link-back-to-login"
              >
                Back to sign in
              </Button>
            </form>
          </Form>
        )}

        {mode === 'reset' && (
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit((data) => resetMutation.mutate(data))} className="space-y-4">
              <FormField
                control={resetForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        data-testid="input-reset-password"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={resetForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        data-testid="input-reset-confirm-password"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={resetMutation.isPending}
                data-testid="button-reset-submit"
              >
                {resetMutation.isPending ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
