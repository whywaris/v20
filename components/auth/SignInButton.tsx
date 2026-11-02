'use client';

import React from 'react';
import { LogIn } from 'lucide-react';
import { signInWithGoogle } from '@/lib/supabase/client';

export default function SignInButton({ label = 'Sign in with Google', className = '' }: { label?: string; className?: string }) {
  return (
    <button type="button" onClick={signInWithGoogle} className={className}>
      <LogIn className="size-4" />
      {label}
    </button>
  );
}
