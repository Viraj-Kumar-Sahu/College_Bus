import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bus, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import api from '@/utils/api';
import heroImage from '@/assets/hero-image.jpg';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'driver' | 'admin'
  });

  const [errors, setErrors] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validateForm = (): boolean => {
    const newErrors = {
      full_name: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    let isValid = true;

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
      isValid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);
  try {
    const { data, status } = await api.post('/auth/signup', {
      name: formData.full_name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    });

    // If backend returns token+user, auto-login; otherwise go to login
    if (data?.token && data?.user) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast({ title: 'Welcome!', description: 'Account created and signed in.' });
      navigate('/');
      return;
    }

    toast({ title: 'Registration Successful', description: 'Please sign in to continue.' });
    setTimeout(() => navigate('/login'), 600);
  } catch (error: any) {
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail || error?.response?.data?.message;

    if (status === 400 && /email already registered/i.test(String(detail))) {
      toast({ title: 'Account exists', description: 'Email is already registered. Please sign in.' });
      navigate('/login');
      return;
    }

    toast({
      title: 'Registration Failed',
      description: detail || 'Registration failed. Please try again.',
      variant: 'destructive'
    });
  } finally {
    setLoading(false);
  }
};


  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen flex bg-gradient-dashboard">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={heroImage} alt="College Bus Management System" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 flex items-center justify-center">
          <div className="text-center text-primary-foreground p-8">
            <div className="p-4 bg-white/20 rounded-full inline-block mb-6">
              <Bus className="h-16 w-16" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Join Our Community</h2>
            <p className="text-xl opacity-90 max-w-md">
              Create your account to access our modern transportation management system with real-time tracking and comprehensive features.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>

          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>Enter your information to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    required
                  />
                  {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="driver">Driver</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password (min. 6 characters)"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    required
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>

                <Button type="submit" className="w-full btn-primary" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign In
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

export default Register;
