'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';

type Metrics = {
  totalUsers: number;
  frontEnd: number;
  platinum: number;
  agenticPro: number;
  studio: number;
  reseller: number;
  whitelabel: number;
};

type UserProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  package: string;
  credits: number;
};

type UserOption = {
  id: string;
  email: string;
};

export default function AdminDashboard() {
  const [tab, setTab] = useState<
    'dashboard' |
    'users' |
    'create' |
    'topup' |
    'reset'
  >('dashboard');

  // ---------------- METRICS ----------------
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  // ---------------- USER SEARCH ----------------
  const [searchEmail, setSearchEmail] = useState('');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // ---------------- CREATE USER ----------------
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
    packageType: 'AI-Front End',
    credits: 0,
  });

  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ---------------- TOPUP USER ----------------
  const [usersList, setUsersList] = useState<UserOption[]>([]);

  const [topupEmail, setTopupEmail] = useState('');
  const [topupPackage, setTopupPackage] =
    useState('AI-Front End');

  const [topupCredits, setTopupCredits] = useState(0);

  const [topupLoading, setTopupLoading] =
    useState(false);

  const [topupMessage, setTopupMessage] =
    useState('');

  // ---------------- PASSWORD RESET ----------------
  const [resetEmail, setResetEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // ---------------- LOAD METRICS ----------------
  useEffect(() => {
    const fetchMetrics = async () => {
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      setMetrics(data);
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/all-users');
        const data = await res.json();
        setUsersList(data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchMetrics();
    fetchUsers();
  }, []);

  // ---------------- SEARCH USER ----------------
  const handleSearch = async () => {
    if (!searchEmail) return;

    setLoadingUser(true);
    setUser(null);

    try {
      const res = await fetch('/api/admin/user-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: searchEmail }),
      });

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUser(false);
    }
  };

  // ---------------- CREATE USER ----------------
  const handleCreateUser = async () => {
    setCreating(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setMessage('User created successfully 🚀');

      setForm({
        email: '',
        password: '',
        username: '',
        firstName: '',
        lastName: '',
        packageType: 'AI-Front End',
        credits: 0,
      });
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setCreating(false);
    }
  };

  // ---------------- TOPUP USER ----------------
  const handleTopup = async () => {
    setTopupLoading(true);
    setTopupMessage('');

    try {
      const res = await fetch(
        '/api/admin/topup-user',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            email: topupEmail,
            packageType: topupPackage,
            credits: topupCredits,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setTopupMessage(
        `Credits added successfully. New balance: ${data.newCredits}`
      );

      setTopupCredits(0);
    } catch (err: any) {
      setTopupMessage(err.message);
    } finally {
      setTopupLoading(false);
    }
  };

  // ---------------- PASSWORD RESET ----------------
  const handlePasswordReset = async () => {
    setResetLoading(true);
    setResetMessage('');

    try {
      const res = await fetch(
        '/api/admin/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            email: resetEmail,
            newPassword: resetPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setResetMessage(
        'Password reset successfully!'
      );

      setResetPassword('');
    } catch (err: any) {
      setResetMessage(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-white text-slate-900 p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 border-b border-purple-500/20 pb-4">
        <h1 className="text-2xl font-bold text-purple-400">
          Vivafy AI Admin Panel
        </h1>

        <Button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = '/admin/login';
          }}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Logout
        </Button>
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-6">
        {[
          'dashboard',
          'users',
          'create',
          'topup',
          'reset',
        ].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-4 py-2 rounded-lg border ${
              tab === t
                ? 'bg-purple-600 border-purple-500'
                : 'border-purple-500/20'
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ================= DASHBOARD ================= */}
      {tab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Total Users" value={metrics?.totalUsers ?? 0} />
          <Card title="Vivafy AI - Front End" value={metrics?.frontEnd ?? 0} />
          <Card title="Vivafy AI - Platinum Edition" value={metrics?.platinum ?? 0} />
          <Card title="Vivafy AI - Agentic PRO" value={metrics?.agenticPro ?? 0} />
          <Card title="Vivafy AI Studio" value={metrics?.studio ?? 0} />
          <Card title="Vivafy AI - Reseller" value={metrics?.reseller ?? 0} />
          <Card title="Vivafy AI - Whitelabel" value={metrics?.whitelabel ?? 0} />
        </div>
      )}

      {/* ================= USERS ================= */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex gap-2 max-w-xl">
            <Input
              placeholder="Enter email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="bg-white border-purple-500/20"
            />

            <Button onClick={handleSearch} className="bg-purple-600">
              Search
            </Button>
          </div>

          {loadingUser && (
            <p className="text-gray-400">Searching...</p>
          )}

          {user && (
            <div className="overflow-x-auto border border-purple-500/20 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-purple-600/20">
                  <tr>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Username</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Package</th>
                    <th className="text-left p-3">Credits</th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-t border-purple-500/20">
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.username}</td>
                    <td className="p-3">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="p-3">{user.package}</td>
                    <td className="p-3">{user.credits}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= CREATE USER ================= */}
      {tab === 'create' && (
        <div className="max-w-xl space-y-3">
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <div className="relative">
            <Input
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <Input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <Input
            placeholder="First Name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />

          <Input
            placeholder="Last Name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />

          {/* PACKAGE */}
          <Select
            value={form.packageType}
            onValueChange={(value) =>
              setForm({ ...form, packageType: value })
            }
          >
            <SelectTrigger className="w-full bg-white border-purple-500/20">
              <SelectValue placeholder="Select Package" />
            </SelectTrigger>

            <SelectContent className="bg-purple-100">
              <SelectItem value="AI-Front End">
                Vivafy AI - Front End
              </SelectItem>

              <SelectItem value="Vivafy AI - Platinum Edition">
                Vivafy AI - Platinum Edition
              </SelectItem>

              <SelectItem value="Vivafy AI - Agentic PRO">
                Vivafy AI - Agentic PRO
              </SelectItem>

              <SelectItem value="Vivafy AI Studio">
                Vivafy AI Studio
              </SelectItem>

              <SelectItem value="Vivafy AI - Reseller">
                Vivafy AI - Reseller
              </SelectItem>

              <SelectItem value="Vivafy AI - Whitelabel">
                Vivafy AI - Whitelabel
              </SelectItem>
            </SelectContent>
          </Select>

          {/* CREDITS */}
          <Input
            type="number"
            placeholder="Credits"
            value={form.credits}
            onChange={(e) =>
              setForm({ ...form, credits: Number(e.target.value) })
            }
          />

          <Button
            onClick={handleCreateUser}
            disabled={creating}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {creating ? 'Creating...' : 'Create User'}
          </Button>

          {message && (
            <p className="text-sm text-green-400">{message}</p>
          )}
        </div>
      )}

      {tab === 'topup' && (
        <div className="max-w-xl space-y-4">

          {/* USER SELECT */}
          <Select
            value={topupEmail}
            onValueChange={setTopupEmail}
          >
            <SelectTrigger className="w-full bg-white border-purple-500/20">
              <SelectValue placeholder="Select User" />
            </SelectTrigger>

            <SelectContent className="bg-purple-100 border-purple-500/30">
              {usersList.map((user) => (
                <SelectItem
                  key={user.id}
                  value={user.email}
                >
                  {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* PACKAGE */}
          <Select
            value={topupPackage}
            onValueChange={setTopupPackage}
          >
            <SelectTrigger className="w-full bg-white border-purple-500/20">
              <SelectValue />
            </SelectTrigger>

            <SelectContent className="bg-purple-100 border-purple-500/30">
              <SelectItem value="AI-Front End">
                Vivafy AI - Front End
              </SelectItem>

              <SelectItem value="Vivafy AI - Platinum Edition">
                Vivafy AI - Platinum Edition
              </SelectItem>

              <SelectItem value="Vivafy AI - Agentic PRO">
                Vivafy AI - Agentic PRO
              </SelectItem>

              <SelectItem value="Vivafy AI Studio">
                Vivafy AI Studio
              </SelectItem>

              <SelectItem value="Vivafy AI - Reseller">
                Vivafy AI - Reseller
              </SelectItem>

              <SelectItem value="Vivafy AI - Whitelabel">
                Vivafy AI - Whitelabel
              </SelectItem>
            </SelectContent>
          </Select>

          {/* CREDITS */}
          <Input
            type="number"
            placeholder="Credits To Add"
            value={topupCredits}
            onChange={(e) =>
              setTopupCredits(
                Number(e.target.value)
              )
            }
            className="bg-white border-purple-500/20"
          />

          <Button
            onClick={handleTopup}
            disabled={topupLoading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {topupLoading
              ? 'Adding Credits...'
              : 'Add Credits'}
          </Button>

          {topupMessage && (
            <p className="text-green-400">
              {topupMessage}
            </p>
          )}
        </div>
      )}

      {tab === 'reset' && (
        <div className="max-w-xl space-y-4">

          {/* USER SELECT */}
          <Select
            value={resetEmail}
            onValueChange={setResetEmail}
          >
            <SelectTrigger className="w-full bg-white border-purple-500/20">
              <SelectValue placeholder="Select User" />
            </SelectTrigger>

            <SelectContent className="bg-purple-100 border-purple-500/30">
              {usersList.map((user) => (
                <SelectItem
                  key={user.id}
                  value={user.email}
                >
                  {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* NEW PASSWORD */}
          <div className="relative">
            <Input
              placeholder="New Password"
              type={showResetPassword ? 'text' : 'password'}
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowResetPassword(!showResetPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400"
            >
              {showResetPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <Button
            onClick={handlePasswordReset}
            disabled={resetLoading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {resetLoading
              ? 'Resetting...'
              : 'Reset Password'}
          </Button>

          {resetMessage && (
            <p className="text-green-400">
              {resetMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- CARD COMPONENT ---------------- */
function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="p-4 rounded-xl border border-purple-500/20 bg-white">
      <p className="text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-purple-400">{value}</p>
    </div>
  );
}
