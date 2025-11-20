# Testing Checklist

Use this checklist to verify that the application works correctly before and after deployment.

## Pre-Deployment Testing (Local)

### Environment Setup
- [ ] `.env` file created with all required variables
- [ ] `npm install` completed successfully
- [ ] No missing dependencies

### Build Testing
- [ ] `npm run build` completes without errors
- [ ] TypeScript compilation succeeds
- [ ] No critical warnings in build output
- [ ] `dist` folder created with correct files

### Development Server
- [ ] `npm run dev` starts successfully
- [ ] Server runs on http://localhost:5173
- [ ] No console errors on page load
- [ ] Hot module replacement works

### UI Components
- [ ] Main page loads correctly
- [ ] Banner images display and carousel works
- [ ] Navigation menu displays properly
- [ ] Page is responsive on mobile devices
- [ ] Chatbot button visible in bottom right corner

### Chatbot Functionality
- [ ] Chatbot opens when button is clicked
- [ ] Initial greeting message appears
- [ ] Can type and send messages
- [ ] Bot responds to messages
- [ ] Message history is maintained
- [ ] Scroll works correctly in chat
- [ ] Can close chatbot

### Voice Features (if browser supports)
- [ ] Microphone button is visible
- [ ] Voice input starts when mic clicked
- [ ] Voice is transcribed correctly
- [ ] Can stop voice input
- [ ] Language selector works
- [ ] Text-to-speech button appears on bot messages
- [ ] TTS speaks the message correctly
- [ ] Can stop TTS playback

### Admin Panel (requires Supabase setup)
- [ ] Settings icon visible in chatbot header
- [ ] Admin modal opens when settings clicked
- [ ] Login form displays
- [ ] Can login with valid credentials
- [ ] Error shown for invalid credentials
- [ ] Documents list loads after login
- [ ] Can upload new documents
- [ ] Upload progress indicates
- [ ] Document appears in list after upload
- [ ] Can delete documents
- [ ] Confirmation dialog shows before delete
- [ ] Can logout successfully

### Document Retrieval (requires documents uploaded)
- [ ] Bot can access uploaded documents
- [ ] Bot provides accurate answers from documents
- [ ] Bot handles "document not found" gracefully
- [ ] File types supported (PDF, TXT, DOCX, etc.)

### Error Handling
- [ ] Graceful error if Gemini API key missing
- [ ] Graceful error if Supabase connection fails
- [ ] Network errors handled properly
- [ ] Invalid input handled correctly
- [ ] Browser compatibility warnings (if needed)

### Security
- [ ] `.env` file not committed to git
- [ ] No API keys visible in browser console
- [ ] No sensitive data in network requests (check DevTools)
- [ ] HTTPS used for all external requests
- [ ] Supabase RLS policies working

## Post-Deployment Testing (Vercel)

### Deployment Verification
- [ ] Deployment completed successfully on Vercel
- [ ] No build errors in Vercel logs
- [ ] Environment variables set in Vercel
- [ ] Production URL accessible

### Basic Functionality
- [ ] Site loads at production URL
- [ ] All static assets load correctly (images, styles)
- [ ] No 404 errors in browser console
- [ ] Page title correct
- [ ] Favicon displays (if set)

### Chatbot on Production
- [ ] Chatbot button works
- [ ] Can send and receive messages
- [ ] Gemini API connection works
- [ ] Response times acceptable
- [ ] No CORS errors in console

### Admin Panel on Production
- [ ] Can access admin panel
- [ ] Can login to admin
- [ ] Supabase connection works
- [ ] No CORS errors from Supabase
- [ ] Can upload documents
- [ ] Storage upload works
- [ ] Can view and delete documents

### Performance
- [ ] Page loads in < 3 seconds
- [ ] Chatbot responds in < 5 seconds
- [ ] No memory leaks (check DevTools)
- [ ] Smooth animations and transitions
- [ ] Large bundle size warning acceptable

### Mobile Testing
- [ ] Site works on mobile browsers
- [ ] Touch interactions work
- [ ] Chatbot usable on mobile
- [ ] No horizontal scrolling
- [ ] Text readable on small screens
- [ ] Buttons large enough to tap

### Cross-Browser Testing
- [ ] Works in Chrome/Edge
- [ ] Works in Firefox
- [ ] Works in Safari (if available)
- [ ] Works in mobile browsers

### Edge Cases
- [ ] Long messages display correctly
- [ ] Multiple rapid messages handled
- [ ] Large file uploads work
- [ ] Network interruption handled
- [ ] Browser refresh maintains state (or resets gracefully)

## Monitoring (Ongoing)

### After Launch
- [ ] Check Vercel analytics (if enabled)
- [ ] Monitor error logs in Vercel
- [ ] Check Supabase usage stats
- [ ] Monitor Gemini API quota
- [ ] Review user feedback
- [ ] Check performance metrics

### Weekly Checks
- [ ] Review security alerts
- [ ] Check for package updates
- [ ] Review access logs
- [ ] Test core functionality
- [ ] Verify backups (Supabase)

### Monthly Checks
- [ ] Update dependencies (if needed)
- [ ] Review and rotate API keys
- [ ] Check Supabase storage usage
- [ ] Review RLS policies
- [ ] Update documentation

## Issue Reporting Template

When you find an issue, document it:

**Issue Title**: [Brief description]

**Environment**: Local / Production

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**: [What should happen]

**Actual Behavior**: [What actually happens]

**Screenshots**: [If applicable]

**Browser/Device**: [e.g., Chrome 120 on Windows 11]

**Console Errors**: [Copy any errors from console]

**Priority**: Low / Medium / High / Critical

---

## Sign-Off

**Tested by**: _______________

**Date**: _______________

**Environment**: Local / Staging / Production

**Result**: ☐ Pass  ☐ Fail  ☐ Pass with minor issues

**Notes**:
