# Fix 401 Unauthorized on /api/problems in Dashboard

## Steps:
- [x] 1. Update Dashboard.tsx: Fix `getToken()` → `getToken({ template: "default" })` and add debug logging for token/response/error
- [ ] 2. Test locally: cd bytebin-client && bun dev, check browser console/network tab
- [ ] 3. If local fix works: Deploy frontend to Render, verify production
- [ ] 4. Check backend Render logs for auth errors / verify CLERK_SECRET_KEY set
- [ ] 5. Optional: Refactor Dashboard to use ProblemsContext instead of duplicate logic
- [ ] 6. Test complete flow: Login → Dashboard → see problems load without 401
- [ ] 7. attempt_completion
