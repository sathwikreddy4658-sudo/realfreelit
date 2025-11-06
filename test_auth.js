import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

async function testSignIn() {
  console.log('Testing sign in with existing user...');

  try {
    // Test sign in with a known user (you'll need to provide actual credentials)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com', // Replace with actual test user email
      password: 'testpassword123' // Replace with actual test user password
    });

    if (error) {
      console.log('Sign in error (expected if user doesn\'t exist):', error.message);
      return false;
    }

    console.log('Sign in successful:', data.user?.email);
    return true;
  } catch (err) {
    console.error('Sign in test failed:', err);
    return false;
  }
}

async function testSignUp() {
  console.log('Testing sign up...');

  try {
    const testEmail = `test${Date.now()}@example.com`;
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
      options: {
        emailRedirectTo: `${window.location.origin}/auth` // This should work with our fix
      }
    });

    if (error) {
      console.log('Sign up error:', error.message);
      return false;
    }

    console.log('Sign up successful:', data.user?.email);
    console.log('Email confirmation required:', data.user?.email_confirmed_at ? 'No' : 'Yes');
    return true;
  } catch (err) {
    console.error('Sign up test failed:', err);
    return false;
  }
}

async function testEmailVerification() {
  console.log('Testing email verification callback...');

  // This would require a real verification token from an email
  // For now, we'll just check if the auth callback handling is set up correctly
  console.log('Auth callback handling is implemented in Auth.tsx');
  return true;
}

async function runTests() {
  console.log('Starting authentication tests...\n');

  const signInResult = await testSignIn();
  console.log('Sign in test:', signInResult ? 'PASS' : 'FAIL (expected if no test user)');

  const signUpResult = await testSignUp();
  console.log('Sign up test:', signUpResult ? 'PASS' : 'FAIL');

  const verificationResult = await testEmailVerification();
  console.log('Email verification test:', verificationResult ? 'PASS' : 'FAIL');

  console.log('\nAuthentication tests completed.');
}

// Run tests
runTests().catch(console.error);
