# TODO: Fix Authentication Issues

## Issues to Resolve
- Sign-in fails with "invalid password or username" even when credentials exist in database (likely due to unverified email)
- Sign-up verification emails not working properly (hardcoded redirect URL)

## Tasks
- [ ] Update emailRedirectTo in Auth.tsx to use dynamic URL instead of hardcoded production URL
- [ ] Test sign-up flow to ensure verification email is sent and link works
- [ ] Verify sign-in works after email verification
- [ ] Ensure Supabase configuration supports the redirect URLs

## Files to Edit
- src/pages/Auth.tsx: Change emailRedirectTo from hardcoded 'https://freelit.in/auth' to `${window.location.origin}/auth`
