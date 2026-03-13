import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bus } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const success = await login(email, password);

      if (success) {
        toast({
          title: "Login Successful",
          description: "Redirecting to dashboard...",
          variant: "default"
        });
        
        // Small delay to allow context to update
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials!",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.response?.data?.detail || "Invalid credentials!",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-dashboard">
      {/* Left Hero Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={heroImage}
          alt="College Bus Management System"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 flex items-center justify-center">
          <div className="text-center text-primary-foreground p-8">
            <div className="p-4 bg-white/20 rounded-full inline-block mb-6">
              <Bus className="h-16 w-16" />
            </div>
            <h2 className="text-4xl font-bold mb-4">College Bus Management</h2>
            <p className="text-xl opacity-90 max-w-md">
              Manage attendance, live bus tracking, and admin dashboards in one platform.
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Login to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
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

                <Button
                  type="submit"
                  className="w-full btn-primary"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Don’t have an account?{" "}
                  <Link
                    to="/register"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
